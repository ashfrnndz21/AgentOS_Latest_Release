#!/usr/bin/env python3
"""
Database Agent Service
Port: 5041
Purpose: Convert natural language descriptions to SQL databases
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
import re
import requests
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class DatabaseAgentService:
    def __init__(self):
        self.port = 5041
        self.databases_path = "backend/utility_databases"
        self.available_models = []
        self.primary_model = None
        self.fallback_models = []
        self.ensure_databases_directory()
        self.discover_available_models()
        logger.info(f"Database Agent Service initialized on port {self.port}")
    
    def ensure_databases_directory(self):
        """Ensure the databases directory exists"""
        os.makedirs(self.databases_path, exist_ok=True)
        logger.info(f"Databases directory: {self.databases_path}")
    
    def discover_available_models(self):
        """Discover available Ollama models and select optimal ones for database tasks"""
        try:
            response = requests.get('http://localhost:11434/api/tags', timeout=10)
            if response.status_code == 200:
                data = response.json()
                models = data.get('models', [])
                
                # Extract model names
                self.available_models = [model['name'] for model in models]
                
                # Intelligent model selection based on capabilities
                self.primary_model = self._select_primary_model(models)
                self.fallback_models = self._select_fallback_models(models)
                
                logger.info(f"Available models: {self.available_models}")
                logger.info(f"Primary model: {self.primary_model}")
                logger.info(f"Fallback models: {self.fallback_models}")
                
            else:
                logger.warning("Failed to discover models, using defaults")
                self._set_default_models()
                
        except Exception as e:
            logger.error(f"Model discovery failed: {str(e)}, using defaults")
            self._set_default_models()
    
    def _select_primary_model(self, models):
        """Select the best model for database schema generation"""
        # Priority order for database tasks (structured, technical tasks)
        preferred_models = [
            'qwen3:1.7b',      # Good for structured tasks
            'qwen3:latest',    # Latest version
            'llama3.1:latest', # Good for technical tasks
            'llama3:latest',   # Alternative
            'codellama:latest', # Code-focused models
            'mistral:latest',   # Good general model
        ]
        
        for preferred in preferred_models:
            if preferred in self.available_models:
                return preferred
        
        # If no preferred models found, use the first available
        return self.available_models[0] if self.available_models else 'qwen3:1.7b'
    
    def _select_fallback_models(self, models):
        """Select fallback models for redundancy"""
        fallbacks = []
        
        # Add different model families for diversity
        fallback_candidates = [
            'llama3.1:latest', 'llama3:latest',
            'mistral:latest', 'codellama:latest',
            'qwen3:latest', 'phi3:latest'
        ]
        
        for candidate in fallback_candidates:
            if candidate in self.available_models and candidate != self.primary_model:
                fallbacks.append(candidate)
                if len(fallbacks) >= 2:  # Limit to 2 fallbacks
                    break
        
        return fallbacks
    
    def _set_default_models(self):
        """Set default models when discovery fails"""
        self.primary_model = 'qwen3:1.7b'
        self.fallback_models = ['llama3.1:latest', 'mistral:latest']
        logger.warning("Using default models due to discovery failure")
    
    def get_optimal_model_for_task(self, task_type="schema_generation"):
        """Get the best model for a specific task type"""
        if task_type == "schema_generation":
            # For schema generation, prefer models good at structured output
            return self.primary_model
        elif task_type == "data_generation":
            # For data generation, might prefer creative models
            return self.primary_model  # Could be different in future
        else:
            return self.primary_model
    
    def parse_table_sql(self, sql: str):
        """Parse CREATE TABLE SQL into structured format"""
        try:
            # Extract table name
            table_name_match = re.search(r'CREATE TABLE\s+(\w+)', sql, re.IGNORECASE)
            if not table_name_match:
                return None
            
            table_name = table_name_match.group(1)
            
            # Extract columns (simplified parsing)
            columns_match = re.search(r'\((.*)\)', sql, re.DOTALL)
            if not columns_match:
                return None
            
            columns_str = columns_match.group(1)
            
            # Parse individual columns
            columns = []
            for line in columns_str.split(','):
                line = line.strip()
                if not line or line.upper().startswith('FOREIGN KEY'):
                    continue
                
                # Extract column name and type
                parts = line.split()
                if len(parts) >= 2:
                    col_name = parts[0]
                    col_type = parts[1]
                    
                    constraints = []
                    if 'PRIMARY KEY' in line.upper():
                        constraints.append('PRIMARY KEY')
                    if 'NOT NULL' in line.upper():
                        constraints.append('NOT NULL')
                    if 'UNIQUE' in line.upper():
                        constraints.append('UNIQUE')
                    if 'AUTOINCREMENT' in line.upper():
                        constraints.append('AUTOINCREMENT')
                    
                    columns.append({
                        "name": col_name,
                        "type": col_type,
                        "constraints": constraints
                    })
            
            return {
                "table_name": table_name,
                "columns": columns,
                "sql": sql.strip()
            }
            
        except Exception as e:
            logger.error(f"Error parsing table SQL: {str(e)}")
            return None
    
    def generate_schema_from_description(self, description: str, user_selected_model: str = None):
        """Convert natural language description to SQL schema using LLM ONLY"""
        # Use user-selected model if provided, otherwise use optimal model
        if user_selected_model and user_selected_model in self.available_models:
            model = user_selected_model
            logger.info(f"Using user-selected model: {model}")
        else:
            model = self.get_optimal_model_for_task("schema_generation")
            logger.info(f"Using auto-selected model: {model}")
        
        try:
            # Optimized prompt for better LLM response
            llm_prompt = f"""You are a database architect. Analyze this request and create appropriate SQLite database tables:

"{description}"

Generate complete CREATE TABLE statements with:
- Appropriate table names based on the description
- Relevant columns with correct data types
- Primary keys and constraints
- Foreign key relationships if needed

IMPORTANT: 
- Return ONLY the SQL statements, one complete statement per line
- Do NOT include any explanations, comments, or thinking tags
- Do NOT use <think> tags or any other formatting
- Start directly with CREATE TABLE statements

Example:
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE);
CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, total DECIMAL(10,2), FOREIGN KEY(user_id) REFERENCES users(id));"""
            
            # Call Ollama LLM
            response = requests.post('http://localhost:11434/api/generate', 
                json={
                    "model": model,
                    "prompt": llm_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "num_predict": 800,
                        "top_p": 0.95,
                        "repeat_penalty": 1.1
                    }
                },
                timeout=120  # Longer timeout for LLM
            )
            
            if response.status_code == 200:
                llm_response = response.json()
                sql_statements = llm_response.get('response', '').strip()
                
                # Clean the LLM response - remove think tags and other unwanted content
                sql_statements = re.sub(r'<think>.*?</think>', '', sql_statements, flags=re.DOTALL)
                sql_statements = re.sub(r'<think>.*', '', sql_statements, flags=re.DOTALL)
                sql_statements = re.sub(r'```.*?```', '', sql_statements, flags=re.DOTALL)
                sql_statements = re.sub(r'```', '', sql_statements)
                sql_statements = sql_statements.strip()
                
                # Parse the LLM response into individual CREATE TABLE statements
                tables = []
                
                # Handle multi-line CREATE TABLE statements
                current_table = []
                in_create_statement = False
                
                for line in sql_statements.split('\n'):
                    line = line.strip()
                    
                    if line.upper().startswith('CREATE TABLE'):
                        in_create_statement = True
                        current_table = [line]
                    elif in_create_statement:
                        current_table.append(line)
                        # Check if this line ends the statement (contains semicolon or closing parenthesis)
                        if ';' in line or (')' in line and '(' not in line):
                            full_sql = ' '.join(current_table)
                            # Remove any markdown or code formatting
                            full_sql = re.sub(r'```.*?```', '', full_sql, flags=re.DOTALL)
                            full_sql = re.sub(r'```', '', full_sql)
                            full_sql = full_sql.strip()
                            if full_sql.upper().startswith('CREATE TABLE'):
                                tables.append(full_sql)
                            current_table = []
                            in_create_statement = False
                    elif line.upper().startswith('CREATE TABLE'):
                        # Single-line CREATE TABLE
                        clean_sql = line.strip()
                        clean_sql = re.sub(r'```.*?```', '', clean_sql, flags=re.DOTALL)
                        clean_sql = re.sub(r'```', '', clean_sql)
                        if clean_sql.upper().startswith('CREATE TABLE'):
                            tables.append(clean_sql)
                
                if tables:
                    logger.info(f"LLM ({model}) generated {len(tables)} tables for description: {description[:50]}...")
                    return {
                        "tables": tables,
                        "description": description,
                        "generated_by": "llm",
                        "model_used": model,
                        "raw_response": sql_statements
                    }
                else:
                    logger.warning(f"LLM ({model}) response didn't contain valid CREATE TABLE statements")
                    # Return error instead of fallback
                    raise Exception(f"LLM generated invalid schema. Response: {sql_statements[:200]}")
            else:
                logger.error(f"LLM call failed with status {response.status_code}")
                raise Exception(f"LLM service returned status code {response.status_code}")
                
        except Exception as e:
            logger.error(f"LLM schema generation failed: {str(e)}")
            # Return error to user instead of silent fallback
            raise Exception(f"Failed to generate schema with {model}: {str(e)}")
    
    def _try_fallback_models(self, prompt, description):
        """Try fallback models if primary model fails"""
        for fallback_model in self.fallback_models:
            try:
                logger.info(f"Trying fallback model: {fallback_model}")
                response = requests.post('http://localhost:11434/api/generate', 
                    json={
                        "model": fallback_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            "num_predict": 1000
                        }
                    },
                    timeout=60
                )
                
                if response.status_code == 200:
                    llm_response = response.json()
                    sql_statements = llm_response.get('response', '').strip()
                    
                    tables = []
                    for line in sql_statements.split('\n'):
                        line = line.strip()
                        if line.startswith('CREATE TABLE'):
                            clean_sql = re.sub(r'^[^C].*', '', line)
                            if clean_sql.startswith('CREATE TABLE'):
                                tables.append(clean_sql)
                    
                    if tables:
                        logger.info(f"Fallback LLM ({fallback_model}) generated {len(tables)} tables")
                        return {
                            "tables": tables,
                            "description": description,
                            "generated_by": "llm_fallback",
                            "model_used": fallback_model
                        }
                        
            except Exception as e:
                logger.warning(f"Fallback model {fallback_model} failed: {str(e)}")
                continue
        
        logger.warning("All fallback models failed, using rule-based approach")
        return self._generate_schema_fallback(description)
    
    def _generate_schema_fallback(self, description: str):
        """Fallback rule-based schema generation"""
        description_lower = description.lower()
        
        schema = {
            "tables": [],
            "description": description,
            "generated_by": "rules"
        }
        
        # Customer/User tables
        if any(word in description_lower for word in ['customer', 'user', 'client', 'person']):
            schema["tables"].append("""
                CREATE TABLE customers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    phone TEXT,
                    address TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
        
        # Product tables
        if any(word in description_lower for word in ['product', 'item', 'inventory', 'goods']):
            schema["tables"].append("""
                CREATE TABLE products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    price DECIMAL(10,2) NOT NULL,
                    stock_quantity INTEGER DEFAULT 0,
                    category TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
        
        # Order tables
        if any(word in description_lower for word in ['order', 'purchase', 'transaction', 'sale']):
            schema["tables"].append("""
                CREATE TABLE orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id INTEGER,
                    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status TEXT DEFAULT 'pending',
                    FOREIGN KEY (customer_id) REFERENCES customers (id)
                )
            """)
        
        # Default table if no specific pattern matches
        if not schema["tables"]:
            schema["tables"].append("""
                CREATE TABLE data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    value TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
        
        return schema
    
    def create_database_from_description(self, description: str, database_name: str, model: str = None):
        """Create SQLite database from natural language description"""
        try:
            # Generate schema with optional user-selected model
            schema = self.generate_schema_from_description(description, model)
            
            # Create database file
            db_path = os.path.join(self.databases_path, f"{database_name}.db")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Execute schema creation
            for table_sql in schema["tables"]:
                cursor.execute(table_sql)
                logger.info(f"Created table in {database_name}.db")
            
            conn.commit()
            conn.close()
            
            logger.info(f"Database created successfully: {db_path}")
            
            return {
                "database_name": database_name,
                "database_path": db_path,
                "schema": schema,
                "created_at": datetime.now().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Error creating database: {str(e)}")
            return {
                "database_name": database_name,
                "error": str(e),
                "status": "error"
            }
    
    def list_databases(self):
        """List all created databases"""
        databases = []
        
        if os.path.exists(self.databases_path):
            for file in os.listdir(self.databases_path):
                if file.endswith('.db'):
                    db_path = os.path.join(self.databases_path, file)
                    databases.append({
                        "name": file.replace('.db', ''),
                        "path": db_path,
                        "size": os.path.getsize(db_path),
                        "created_at": datetime.fromtimestamp(os.path.getctime(db_path)).isoformat()
                    })
        
        return databases
    
    def query_database(self, database_name: str, query: str):
        """Execute SQL query on specified database"""
        try:
            db_path = os.path.join(self.databases_path, f"{database_name}.db")
            
            if not os.path.exists(db_path):
                return {"error": f"Database {database_name} not found", "status": "error"}
            
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row  # Enable column access by name
            cursor = conn.cursor()
            
            cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                results = [dict(row) for row in cursor.fetchall()]
                return {
                    "results": results,
                    "row_count": len(results),
                    "status": "success"
                }
            else:
                conn.commit()
                return {
                    "message": "Query executed successfully",
                    "status": "success"
                }
            
            conn.close()
            
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            return {
                "error": str(e),
                "status": "error"
            }

# Initialize service
db_service = DatabaseAgentService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Database Agent Service",
        "port": db_service.port,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/models/status', methods=['GET'])
def get_model_status():
    """Get information about available models and selection strategy"""
    return jsonify({
        "available_models": db_service.available_models,
        "primary_model": db_service.primary_model,
        "fallback_models": db_service.fallback_models,
        "model_selection_strategy": "intelligent_dynamic_selection",
        "task_specific_selection": True,
        "fallback_enabled": True
    })

@app.route('/api/database/preview-schema', methods=['POST'])
def preview_schema():
    """Preview database schema before creation using LLM"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided", "status": "error"}), 400
        
        description = data.get('description')
        model = data.get('model')  # User-selected model
        
        if not description:
            return jsonify({
                "error": "Description is required",
                "status": "error"
            }), 400
        
        # ALWAYS use LLM for schema generation (no rule-based fallback)
        schema = db_service.generate_schema_from_description(description, model)
        
        # Parse schema into user-friendly format
        parsed_tables = []
        for table_sql in schema.get("tables", []):
            # Extract table name and columns
            table_info = db_service.parse_table_sql(table_sql)
            if table_info:
                parsed_tables.append(table_info)
        
        return jsonify({
            "success": True,
            "schema": schema,
            "parsed_tables": parsed_tables,
            "generated_by": schema.get("generated_by", "llm"),
            "model_used": schema.get("model_used", model),
            "description": description
        })
        
    except Exception as e:
        logger.error(f"Error previewing schema: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/database/create', methods=['POST'])
def create_database():
    """Create a new database from description"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided", "status": "error"}), 400
        
        description = data.get('description')
        database_name = data.get('name')
        model = data.get('model')  # Optional user-selected model
        
        if not description or not database_name:
            return jsonify({
                "error": "Both 'description' and 'name' are required",
                "status": "error"
            }), 400
        
        # Sanitize database name
        database_name = re.sub(r'[^a-zA-Z0-9_]', '_', database_name)
        
        # Create database with optional user-selected model
        result = db_service.create_database_from_description(description, database_name, model)
        
        if result["status"] == "success":
            return jsonify({
                "success": True,
                "database": result,
                "message": f"Database '{database_name}' created successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Unknown error"),
                "status": "error"
            }), 500
            
    except Exception as e:
        logger.error(f"Error in create_database endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/database/list', methods=['GET'])
def list_databases():
    """List all created databases"""
    try:
        databases = db_service.list_databases()
        return jsonify({
            "success": True,
            "databases": databases,
            "count": len(databases)
        })
    except Exception as e:
        logger.error(f"Error listing databases: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/database/<database_name>/query', methods=['POST'])
def query_database(database_name):
    """Execute SQL query on specified database"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "error": "Query is required",
                "status": "error"
            }), 400
        
        query = data['query']
        result = db_service.query_database(database_name, query)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error querying database: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/database/<database_name>/schema', methods=['GET'])
def get_database_schema(database_name):
    """Get database schema information"""
    try:
        db_path = os.path.join(db_service.databases_path, f"{database_name}.db")
        
        if not os.path.exists(db_path):
            return jsonify({
                "error": f"Database {database_name} not found",
                "status": "error"
            }), 404
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema_info = {}
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            schema_info[table] = [
                {
                    "name": col[1],
                    "type": col[2],
                    "not_null": bool(col[3]),
                    "primary_key": bool(col[5])
                }
                for col in columns
            ]
        
        conn.close()
        
        return jsonify({
            "success": True,
            "database_name": database_name,
            "tables": schema_info
        })
        
    except Exception as e:
        logger.error(f"Error getting database schema: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/database/<database_name>/delete', methods=['DELETE'])
def delete_database(database_name):
    """Delete a database"""
    try:
        # Sanitize database name to prevent path traversal
        if not database_name or '..' in database_name or '/' in database_name:
            return jsonify({
                "success": False,
                "error": "Invalid database name",
                "status": "error"
            }), 400
        
        db_path = os.path.join(db_service.databases_path, f"{database_name}.db")
        
        if not os.path.exists(db_path):
            return jsonify({
                "success": False,
                "error": f"Database {database_name} not found",
                "status": "error"
            }), 404
        
        # Delete the database file
        os.remove(db_path)
        
        logger.info(f"Database deleted successfully: {db_path}")
        
        return jsonify({
            "success": True,
            "message": f"Database '{database_name}' deleted successfully",
            "database_name": database_name,
            "status": "deleted"
        })
        
    except Exception as e:
        logger.error(f"Error deleting database: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    logger.info(f"🚀 Starting Database Agent Service on port {db_service.port}")
    app.run(host='0.0.0.0', port=db_service.port, debug=True)
