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
        self.ensure_databases_directory()
        self.discover_available_models()
        logger.info(f"Database Agent Service initialized on port {self.port}")
    
    def ensure_databases_directory(self):
        """Ensure the databases directory exists"""
        os.makedirs(self.databases_path, exist_ok=True)
        logger.info(f"Databases directory: {self.databases_path}")
    
    def discover_available_models(self):
        """Discover available Ollama models for user selection"""
        try:
            response = requests.get('http://localhost:11434/api/tags', timeout=10)
            if response.status_code == 200:
                data = response.json()
                models = data.get('models', [])
                
                # Extract model names for user selection
                self.available_models = [model['name'] for model in models]
                
                logger.info(f"Available models for user selection: {self.available_models}")
                
            else:
                logger.warning("Failed to discover models")
                self.available_models = []
                
        except Exception as e:
            logger.error(f"Model discovery failed: {str(e)}")
            self.available_models = []
    
    def _select_primary_model(self, models):
        """Select the best model for database schema generation"""
        # Priority order for database tasks (structured, technical tasks)
        preferred_models = [
            'qwen2.5:latest',       # Best qwen model for SQL generation
            'qwen3:1.7b',          # Original qwen model (with fixes)
            'phi3:latest',          # Fast and reliable for SQL generation
            'llama3.1:latest',     # Reliable but slower
            'phi4-mini-reasoning:latest', # Good reasoning model
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
    
    
    def generate_proposed_schema(self, description: str, user_selected_model: str) -> dict:
        """Generate proposed schema for user confirmation"""
        if not user_selected_model:
            raise Exception("No model selected. User must select a model.")
        
        if user_selected_model not in self.available_models:
            raise Exception(f"Selected model '{user_selected_model}' is not available. Available models: {self.available_models}")
        
        logger.info(f"Generating proposed schema with model: {user_selected_model}")
        
        try:
            # First call: Generate proposed schema for user review
            llm_prompt = f"""Generate a proposed SQLite database schema for: {description}

Requirements:
- Create meaningful table names and column names
- Include PRIMARY KEY constraints
- Use appropriate data types (INTEGER, TEXT, REAL, DATETIME)
- Add FOREIGN KEY relationships where logical
- Each CREATE TABLE statement must end with semicolon

Format your response as:
PROPOSED SCHEMA:
[CREATE TABLE statements here]

RATIONALE:
[Brief explanation of the design choices]

Generate the proposed schema:"""
            
            # Call Ollama LLM with user-selected model
            response = requests.post('http://localhost:11434/api/generate', 
                json={
                    "model": user_selected_model,
                    "prompt": llm_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "num_predict": 500,
                        "top_p": 0.8,
                        "repeat_penalty": 1.1,
                        "stop": ["```", "Example:", "Explanation:", "Note:", "<think>"]
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                llm_response = result.get('response', '').strip()
                
                if not llm_response:
                    raise Exception("LLM returned empty response")
                
                logger.info(f"LLM proposed schema response: {llm_response[:200]}...")
                
                # Parse the proposed schema
                proposed_sql = self._extract_proposed_sql(llm_response)
                rationale = self._extract_rationale(llm_response)
                
                return {
                    "status": "proposed",
                    "proposed_sql": proposed_sql,
                    "rationale": rationale,
                    "full_response": llm_response,
                    "model_used": user_selected_model
                }
            else:
                raise Exception(f"LLM API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"LLM schema generation failed: {str(e)}")
            raise Exception(f"Schema generation failed: {str(e)}")
    
    def _extract_proposed_sql(self, response: str) -> str:
        """Extract SQL statements from proposed schema response"""
        try:
            # Look for PROPOSED SCHEMA section
            if "PROPOSED SCHEMA:" in response:
                schema_section = response.split("PROPOSED SCHEMA:")[1]
                if "RATIONALE:" in schema_section:
                    schema_section = schema_section.split("RATIONALE:")[0]
                return schema_section.strip()
            else:
                # Fallback: extract all CREATE TABLE statements
                lines = response.split('\n')
                sql_lines = []
                in_sql_section = False
                for line in lines:
                    line = line.strip()
                    if line.upper().startswith('CREATE TABLE'):
                        in_sql_section = True
                    if in_sql_section:
                        sql_lines.append(line)
                        if line.endswith(';'):
                            break
                return '\n'.join(sql_lines)
        except Exception as e:
            logger.error(f"Error extracting proposed SQL: {str(e)}")
            return response
    
    def _extract_rationale(self, response: str) -> str:
        """Extract rationale from proposed schema response"""
        try:
            if "RATIONALE:" in response:
                rationale_section = response.split("RATIONALE:")[1]
                return rationale_section.strip()
            else:
                return "No rationale provided"
        except Exception as e:
            logger.error(f"Error extracting rationale: {str(e)}")
            return "Error extracting rationale"
    
    def _validate_and_fix_sql_syntax(self, sql_statements: str) -> str:
        """Validate and fix common SQL syntax issues"""
        try:
            # Fix invalid foreign key references
            fixed_sql = sql_statements
            
            # Remove invalid foreign key references that reference functions or invalid tables
            invalid_fk_patterns = [
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+datetime\([^)]+\)[^;]*',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+\w+\([^)]*\)[^;]*AND[^;]*',
                r'FOREIGN KEY\s+\(datetime\)\s+REFERENCES\s+\w+\([^)]+\)',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+\w+\(hour\(\)\)',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+datetime\([^)]+\)\s+AND\s+hour\(\)',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+\w+\([^)]*\)[^;]*hour\(\)[^;]*',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+DATETIME\([^)]*\)',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+DATETIME\b',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+TIME\b',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+INTEGER\b',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+TEXT\b',
                r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+REAL\b'
            ]
            
            for pattern in invalid_fk_patterns:
                fixed_sql = re.sub(pattern, '', fixed_sql, flags=re.IGNORECASE)
            
            # Clean up extra commas that might be left after removing foreign keys
            fixed_sql = re.sub(r',\s*,', ',', fixed_sql)  # Remove double commas
            fixed_sql = re.sub(r',\s*\)', ')', fixed_sql)  # Remove trailing commas before closing paren
            
            # Validate remaining foreign key references
            fk_matches = re.findall(r'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+(\w+)\(([^)]+)\)', fixed_sql)
            for table_ref, column_ref in fk_matches:
                # Check if referenced table exists
                if not re.search(rf'CREATE TABLE\s+{table_ref}\s*\(', fixed_sql, re.IGNORECASE):
                    logger.warning(f"Removing foreign key to non-existent table: {table_ref}")
                    # Remove this foreign key
                    fk_pattern = rf'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+{table_ref}\([^)]+\)'
                    fixed_sql = re.sub(fk_pattern, '', fixed_sql, flags=re.IGNORECASE)
                    continue
                
                # Check if referenced column exists in the table
                table_pattern = rf'CREATE TABLE\s+{table_ref}\s*\(([^)]+)\)'
                table_match = re.search(table_pattern, fixed_sql, re.IGNORECASE | re.DOTALL)
                if table_match:
                    table_content = table_match.group(1)
                    if column_ref not in table_content:
                        logger.warning(f"Removing foreign key to non-existent column: {table_ref}.{column_ref}")
                        # Remove this foreign key
                        fk_pattern = rf'FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+{table_ref}\({column_ref}\)'
                        fixed_sql = re.sub(fk_pattern, '', fixed_sql, flags=re.IGNORECASE)
            
            # Clean up any remaining syntax issues
            fixed_sql = re.sub(r',\s*,', ',', fixed_sql)  # Remove double commas
            fixed_sql = re.sub(r',\s*\)', ')', fixed_sql)  # Remove trailing commas
            
            # Fix invalid table names (SQLite doesn't allow table names starting with numbers)
            # Pattern now catches: 3G_networks, 3GNetworks, 4g_oss_networks, etc.
            invalid_table_pattern = r'CREATE TABLE\s+(\d+[a-zA-Z_][a-zA-Z0-9_]*)\s*\('
            table_renames = {}  # Track table name changes
            
            def fix_table_name(match):
                table_name = match.group(1)
                # Convert to valid name by adding prefix
                fixed_name = f"table_{table_name}"
                table_renames[table_name] = fixed_name
                return f"CREATE TABLE {fixed_name} ("
            
            fixed_sql = re.sub(invalid_table_pattern, fix_table_name, fixed_sql, flags=re.IGNORECASE)
            
            # Update foreign key references to use the new table names
            for old_name, new_name in table_renames.items():
                # Update REFERENCES in foreign keys
                fixed_sql = re.sub(
                    rf'REFERENCES\s+{re.escape(old_name)}\b', 
                    f'REFERENCES {new_name}', 
                    fixed_sql, 
                    flags=re.IGNORECASE
                )
            
            # Fix invalid column names that start with numbers (like 3G_network_id)
            # This is a comprehensive fix for all column name patterns
            
            # Pattern 1: Column definition in CREATE TABLE (e.g., "3G_network_id INTEGER")
            invalid_column_def_pattern = r'(\d+[a-zA-Z_][a-zA-Z0-9_]*)\s+(INTEGER|TEXT|REAL|DATETIME)'
            def fix_column_def(match):
                column_name = match.group(1)
                column_type = match.group(2)
                fixed_column = f"col_{column_name}"
                return f"{fixed_column} {column_type}"
            
            fixed_sql = re.sub(invalid_column_def_pattern, fix_column_def, fixed_sql, flags=re.IGNORECASE)
            
            # Pattern 2: Column in FOREIGN KEY (e.g., "FOREIGN KEY (3G_network_id)")
            invalid_column_fk_pattern = r'FOREIGN KEY\s*\((\d+[a-zA-Z_][a-zA-Z0-9_]*)\)'
            def fix_column_fk(match):
                column_name = match.group(1)
                fixed_column = f"col_{column_name}"
                return f"FOREIGN KEY ({fixed_column})"
            
            fixed_sql = re.sub(invalid_column_fk_pattern, fix_column_fk, fixed_sql, flags=re.IGNORECASE)
            
            # Pattern 3: Column in REFERENCES (e.g., "REFERENCES table(id)" - this should be fine)
            # But we need to make sure the referenced column also gets fixed if it starts with digits
            # This is handled by the foreign key validation above
            
            logger.info(f"SQL fixed: {fixed_sql[:200]}...")
            return fixed_sql
            
        except Exception as e:
            logger.error(f"SQL fixing error: {str(e)}")
            return sql_statements
    
    def generate_schema_from_description(self, description: str, user_selected_model: str):
        """Convert natural language description to SQL schema using user-selected LLM ONLY"""
        if not user_selected_model:
            raise Exception("No model selected. User must select a model.")
        
        if user_selected_model not in self.available_models:
            raise Exception(f"Selected model '{user_selected_model}' is not available. Available models: {self.available_models}")
        
        logger.info(f"Using user-selected model: {user_selected_model}")
        
        try:
            # Optimized prompt for database schema generation - prevents <think> tags
            llm_prompt = f"""Generate SQLite CREATE TABLE statements for: {description}

Rules:
- Output ONLY CREATE TABLE statements
- Each statement ends with semicolon
- Use INTEGER PRIMARY KEY for IDs
- Use TEXT, REAL, DATETIME for other columns
- Add FOREIGN KEY constraints where logical
- No explanations, comments, or thinking tags

IMPORTANT SQLite Constraints:
- FOREIGN KEY must reference existing table.column
- Column names cannot contain parentheses or special characters
- Use proper SQLite data types: INTEGER, TEXT, REAL, DATETIME
- Foreign keys must reference PRIMARY KEY columns

Example format:
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL, FOREIGN KEY (user_id) REFERENCES users(id));

Generate the SQL:"""
            
            # Call Ollama LLM with user-selected model
            response = requests.post('http://localhost:11434/api/generate', 
                json={
                    "model": user_selected_model,
                    "prompt": llm_prompt,
                    "stream": False,
                "options": {
                    "temperature": 0.1,
                    "num_predict": 800,
                    "top_p": 0.7,
                    "repeat_penalty": 1.2,
                    "stop": ["```", "Example:", "Explanation:", "Note:"]
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
                
                # Log the raw response for debugging
                logger.info(f"Raw LLM response: {sql_statements[:300]}...")
                
                # Extract only CREATE TABLE statements - more precise approach
                create_table_pattern = r'CREATE\s+TABLE\s+[^;]+;'
                create_statements = re.findall(create_table_pattern, sql_statements, re.IGNORECASE | re.DOTALL)
                
                if create_statements:
                    sql_statements = '\n'.join(create_statements)
                else:
                    # Fallback: try to find CREATE TABLE without strict semicolon requirement
                    create_table_pattern = r'CREATE\s+TABLE\s+[^;]+'
                    create_statements = re.findall(create_table_pattern, sql_statements, re.IGNORECASE | re.DOTALL)
                    if create_statements:
                        sql_statements = '\n'.join([stmt + ';' for stmt in create_statements])
                
                sql_statements = sql_statements.strip()
                
                # Log the cleaned response for debugging
                logger.info(f"Cleaned LLM response: {sql_statements[:200]}...")
                
                # Fix SQL syntax issues before parsing
                sql_statements = self._validate_and_fix_sql_syntax(sql_statements)
                
                # Parse the LLM response into individual CREATE TABLE statements
                tables = []
                
                # Split by semicolons and process each statement
                statements = sql_statements.split(';')
                
                for statement in statements:
                    statement = statement.strip()
                    if not statement:
                        continue
                    
                    # Clean up the statement
                    statement = re.sub(r'```.*?```', '', statement, flags=re.DOTALL)
                    statement = re.sub(r'```', '', statement)
                    statement = statement.strip()
                    
                    # Check if it's a CREATE TABLE statement
                    if statement.upper().startswith('CREATE TABLE'):
                        # Ensure it has proper structure
                        if '(' in statement and ')' in statement:
                            tables.append(statement + ';')
                        else:
                            # Try to complete incomplete statements
                            logger.warning(f"Incomplete CREATE TABLE statement: {statement}")
                            # Skip incomplete statements for now
                            continue
                
                # If no tables found with semicolon splitting, try line-by-line parsing
                if not tables:
                    logger.info("No tables found with semicolon splitting, trying line-by-line parsing")
                    current_table = []
                    in_create_statement = False
                    
                    for line in sql_statements.split('\n'):
                        line = line.strip()
                        
                        if line.upper().startswith('CREATE TABLE'):
                            in_create_statement = True
                            current_table = [line]
                        elif in_create_statement:
                            current_table.append(line)
                            # Check if this line ends the statement
                            if ')' in line:
                                full_sql = ' '.join(current_table)
                                full_sql = re.sub(r'```.*?```', '', full_sql, flags=re.DOTALL)
                                full_sql = re.sub(r'```', '', full_sql)
                                full_sql = full_sql.strip()
                                if full_sql.upper().startswith('CREATE TABLE') and '(' in full_sql and ')' in full_sql:
                                    tables.append(full_sql + ';')
                                current_table = []
                                in_create_statement = False
                
                if tables:
                    logger.info(f"LLM ({user_selected_model}) generated {len(tables)} tables for description: {description[:50]}...")
                    return {
                        "tables": tables,
                        "description": description,
                        "generated_by": "llm",
                        "model_used": user_selected_model,
                        "raw_response": sql_statements
                    }
                else:
                    logger.warning(f"LLM ({user_selected_model}) response didn't contain valid CREATE TABLE statements")
                    raise Exception(f"LLM generated invalid schema. Response: {sql_statements[:200]}")
            else:
                logger.error(f"LLM call failed with status {response.status_code}")
                raise Exception(f"LLM service returned status code {response.status_code}")
                
        except Exception as e:
            logger.error(f"LLM schema generation failed: {str(e)}")
            raise Exception(f"Failed to generate schema with {user_selected_model}: {str(e)}")
    
    
    
    def create_database_from_description(self, description: str, database_name: str, model: str):
        """Create SQLite database from natural language description using user-selected model"""
        if not model:
            raise Exception("No model selected. User must select a model.")
        
        try:
            # Generate schema with user-selected model
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
    """Get information about available models for user selection"""
    return jsonify({
        "available_models": db_service.available_models,
        "model_selection_strategy": "user_driven_only",
        "user_must_select": True,
        "no_automatic_fallback": True
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
        
        if not model:
            return jsonify({
                "error": "Model selection is required. Please select an LLM model.",
                "status": "error"
            }), 400
        
        # Use user-selected model for schema generation
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

@app.route('/api/database/propose-schema', methods=['POST'])
def propose_schema():
    """Generate proposed schema for user confirmation"""
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
        
        if not model:
            return jsonify({
                "error": "Model selection is required. Please select an LLM model.",
                "status": "error"
            }), 400
        
        # Generate proposed schema for user review
        proposal = db_service.generate_proposed_schema(description, model)
        
        return jsonify({
            "success": True,
            "proposal": proposal,
            "description": description,
            "model_used": model
        })
        
    except Exception as e:
        logger.error(f"Error proposing schema: {str(e)}")
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
        model = data.get('model')  # Required user-selected model
        
        if not description or not database_name:
            return jsonify({
                "error": "Both 'description' and 'name' are required",
                "status": "error"
            }), 400
        
        if not model:
            return jsonify({
                "error": "Model selection is required. Please select an LLM model.",
                "status": "error"
            }), 400
        
        # Sanitize database name
        database_name = re.sub(r'[^a-zA-Z0-9_]', '_', database_name)
        
        # Create database with user-selected model
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
