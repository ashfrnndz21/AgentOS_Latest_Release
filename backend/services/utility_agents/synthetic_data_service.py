#!/usr/bin/env python3
"""
Synthetic Data Agent Service
Port: 5042
Purpose: Generate realistic synthetic data for databases
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import random
import json
import os
import re
import requests
from datetime import datetime, timedelta
from faker import Faker
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize Faker
fake = Faker()

class SyntheticDataService:
    def __init__(self):
        self.port = 5042
        self.databases_path = "backend/utility_databases"
        self.available_models = []
        self.primary_model = None
        self.discover_available_models()
        logger.info(f"Synthetic Data Agent Service initialized on port {self.port}")
    
    def discover_available_models(self):
        """Discover available Ollama models"""
        try:
            response = requests.get('http://localhost:11434/api/tags', timeout=10)
            if response.status_code == 200:
                data = response.json()
                models = data.get('models', [])
                self.available_models = [model['name'] for model in models]
                
                # Select primary model for data generation
                preferred_models = ['qwen3:1.7b', 'llama3.1:latest', 'phi3:latest']
                for preferred in preferred_models:
                    if preferred in self.available_models:
                        self.primary_model = preferred
                        break
                
                if not self.primary_model and self.available_models:
                    self.primary_model = self.available_models[0]
                
                logger.info(f"Available models: {self.available_models}")
                logger.info(f"Primary model for data generation: {self.primary_model}")
            else:
                self.primary_model = 'qwen3:1.7b'
        except Exception as e:
            logger.error(f"Model discovery failed: {str(e)}")
            self.primary_model = 'qwen3:1.7b'
    
    def generate_realistic_data_with_llm(self, schema: list, count: int, table_name: str, model: str = None):
        """Generate synthetic data using LLM to understand schema context"""
        try:
            # Use user-selected model or default
            selected_model = model if model and model in self.available_models else self.primary_model
            
            # Build schema description for LLM
            schema_description = f"Table: {table_name}\nColumns:\n"
            for col in schema:
                schema_description += f"- {col['name']} ({col['type']})"
                if col.get('not_null'):
                    schema_description += " NOT NULL"
                if col.get('primary_key'):
                    schema_description += " PRIMARY KEY"
                schema_description += "\n"
            
            # Create intelligent prompt for LLM
            llm_prompt = f"""Generate {min(count, 10)} realistic sample data entries for this database table:

{schema_description}

Analyze the table name and column names to understand the data context, then generate appropriate realistic data.

Return ONLY a JSON array of objects, where each object has the column names as keys. Example format:
[{{"id": 1, "name": "value1", "email": "test@example.com"}}, {{"id": 2, "name": "value2", "email": "test2@example.com"}}]

Generate realistic, contextually appropriate data based on what the table represents."""

            # Call LLM
            response = requests.post('http://localhost:11434/api/generate',
                json={
                    "model": selected_model,
                    "prompt": llm_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,  # Higher temperature for variety
                        "num_predict": 2000
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                llm_response = response.json()
                response_text = llm_response.get('response', '').strip()
                
                # Try to extract JSON from response
                try:
                    # Remove markdown code blocks if present
                    response_text = re.sub(r'```json\s*', '', response_text)
                    response_text = re.sub(r'```\s*', '', response_text)
                    response_text = response_text.strip()
                    
                    # Parse JSON
                    sample_data = json.loads(response_text)
                    
                    if isinstance(sample_data, list) and len(sample_data) > 0:
                        # Use LLM samples as templates and generate more using Faker
                        logger.info(f"LLM generated {len(sample_data)} sample entries, expanding to {count} with variations")
                        return self._expand_llm_samples(sample_data, schema, count, table_name)
                    
                except json.JSONDecodeError as e:
                    logger.warning(f"LLM response wasn't valid JSON: {str(e)}, using Faker fallback")
            
            # Fallback to Faker-based generation
            return self._generate_with_faker(schema, count, table_name)
            
        except Exception as e:
            logger.error(f"LLM data generation failed: {str(e)}, using Faker")
            return self._generate_with_faker(schema, count, table_name)
    
    def _expand_llm_samples(self, samples: list, schema: list, count: int, table_name: str):
        """Expand LLM samples to desired count using variations"""
        data = []
        
        for i in range(count):
            # Use LLM samples as templates
            template = samples[i % len(samples)]
            record = {}
            
            for col in schema:
                col_name = col['name']
                
                # Skip auto-increment IDs
                if col.get('primary_key') and col_name.lower() == 'id':
                    continue
                
                # Skip timestamp fields
                if col_name.lower() in ['created_at', 'updated_at', 'timestamp']:
                    continue
                
                # Use template value with variations
                if col_name in template:
                    base_value = template[col_name]
                    record[col_name] = self._create_variation(base_value, col['type'], i)
                else:
                    # Generate using Faker if not in template
                    record[col_name] = self._generate_faker_value(col_name, col['type'])
            
            data.append(record)
        
        return data
    
    def _create_variation(self, base_value, col_type, index):
        """Create variations of LLM-generated values"""
        if isinstance(base_value, (int, float)) and 'INTEGER' in col_type.upper():
            return base_value + random.randint(-10, 10)
        elif isinstance(base_value, (int, float)) and 'DECIMAL' in col_type.upper():
            return round(base_value + random.uniform(-5.0, 5.0), 2)
        elif isinstance(base_value, str):
            # Add variation to strings
            return f"{base_value}_{index}" if index > 0 else base_value
        return base_value
    
    def _generate_faker_value(self, col_name: str, col_type: str):
        """Generate a single value using Faker based on column name and type"""
        col_type_upper = col_type.upper()
        col_name_lower = col_name.lower()
        
        if col_type_upper == 'TEXT':
            if 'email' in col_name_lower:
                return fake.email()
            elif 'name' in col_name_lower:
                return fake.name()
            elif 'address' in col_name_lower:
                return fake.address()
            elif 'phone' in col_name_lower:
                return fake.phone_number()
            elif 'node' in col_name_lower or 'cell' in col_name_lower:
                return f"NODE_{random.randint(1000, 9999)}"
            else:
                return fake.word()
        elif col_type_upper == 'INTEGER':
            return random.randint(1, 1000)
        elif 'DECIMAL' in col_type_upper:
            return round(random.uniform(1.0, 100.0), 2)
        elif col_type_upper == 'DATE':
            return fake.date_between(start_date='-1y', end_date='today').isoformat()
        elif col_type_upper == 'DATETIME':
            return fake.date_time_between(start_date='-30d', end_date='now').isoformat()
        else:
            return fake.word()
    
    def _generate_with_faker(self, schema: list, count: int, table_name: str):
        """Generate data using Faker library (fallback)"""
        data = []
        
        for i in range(count):
            record = {}
            
            for col in schema:
                col_name = col['name']
                col_type = col['type']
                
                # Skip auto-increment IDs and timestamps
                if col.get('primary_key') and col_name.lower() == 'id':
                    continue
                if col_name.lower() in ['created_at', 'updated_at', 'timestamp']:
                    continue
                
                record[col_name] = self._generate_faker_value(col_name, col_type)
            
            data.append(record)
        
        return data
    
    def generate_realistic_data(self, schema: dict, count: int, table_name: str = "data"):
        """Legacy method - redirect to LLM-powered generation"""
        # Get table schema
        table_schema = schema.get("tables", {})
        if isinstance(table_schema, dict) and table_name in table_schema:
            columns = table_schema[table_name]
        else:
            # Default schema if not found
            columns = [
                {"name": "name", "type": "TEXT"},
                {"name": "email", "type": "TEXT"},
                {"name": "age", "type": "INTEGER"},
                {"name": "created_at", "type": "DATETIME"}
            ]
        
        # Use LLM-powered generation
        return self.generate_realistic_data_with_llm(columns, count, table_name)
    
    def populate_database(self, data: list, database_path: str, table_name: str):
        """Populate database with generated synthetic data"""
        try:
            conn = sqlite3.connect(database_path)
            cursor = conn.cursor()
            
            if not data:
                conn.close()
                return {"status": "error", "message": "No data to insert"}
            
            # Get column names from first record
            columns = list(data[0].keys())
            columns_str = ', '.join(columns)
            placeholders = ', '.join(['?' for _ in columns])
            
            # Insert data
            for record in data:
                values = [record.get(col) for col in columns]
                sql = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
                cursor.execute(sql, values)
            
            conn.commit()
            conn.close()
            
            logger.info(f"Successfully inserted {len(data)} records into {table_name}")
            return {
                "status": "success",
                "records_inserted": len(data),
                "table_name": table_name,
                "database_path": database_path
            }
            
        except Exception as e:
            logger.error(f"Error populating database: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "records_inserted": 0
            }
    
    def get_table_names(self, database_path: str):
        """Get list of table names from database"""
        try:
            conn = sqlite3.connect(database_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            conn.close()
            return tables
        except Exception as e:
            logger.error(f"Error getting table names: {str(e)}")
            return []
    
    def get_table_schema(self, database_path: str, table_name: str):
        """Get schema information for a specific table"""
        try:
            conn = sqlite3.connect(database_path)
            cursor = conn.cursor()
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            conn.close()
            
            schema = []
            for col in columns:
                schema.append({
                    "name": col[1],
                    "type": col[2],
                    "not_null": bool(col[3]),
                    "primary_key": bool(col[5])
                })
            
            return schema
            
        except Exception as e:
            logger.error(f"Error getting table schema: {str(e)}")
            return []

# Initialize service
synthetic_service = SyntheticDataService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Synthetic Data Agent Service",
        "port": synthetic_service.port,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/models/status', methods=['GET'])
def get_model_status():
    """Get information about available models"""
    return jsonify({
        "available_models": synthetic_service.available_models,
        "primary_model": synthetic_service.primary_model,
        "model_selection_strategy": "intelligent_dynamic_selection"
    })

@app.route('/api/synthetic-data/generate', methods=['POST'])
def generate_data():
    """Generate synthetic data based on schema (preview only, no database insertion)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided", "status": "error"}), 400
        
        database_name = data.get('database_name')
        table_name = data.get('table_name', 'data')
        count = data.get('count', 10)
        model = data.get('model')
        
        if count <= 0 or count > 10000:
            return jsonify({
                "error": "Count must be between 1 and 10000",
                "status": "error"
            }), 400
        
        # Get table schema from database
        if database_name:
            database_path = os.path.join(synthetic_service.databases_path, f"{database_name}.db")
            if not os.path.exists(database_path):
                return jsonify({
                    "error": f"Database {database_name} not found",
                    "status": "error"
                }), 404
            
            table_schema = synthetic_service.get_table_schema(database_path, table_name)
            if not table_schema:
                return jsonify({
                    "error": f"Table {table_name} not found",
                    "status": "error"
                }), 404
        else:
            return jsonify({
                "error": "Database name is required",
                "status": "error"
            }), 400
        
        # Generate data using LLM
        logger.info(f"Generating preview data for {table_name} using LLM: {model or 'default'}")
        generated_data = synthetic_service.generate_realistic_data_with_llm(table_schema, count, table_name, model)
        
        return jsonify({
            "success": True,
            "data": generated_data,
            "count": len(generated_data),
            "table_name": table_name,
            "model_used": model or synthetic_service.primary_model
        })
        
    except Exception as e:
        logger.error(f"Error generating data: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/synthetic-data/populate', methods=['POST'])
def populate_database():
    """Populate database with synthetic data using LLM"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided", "status": "error"}), 400
        
        database_name = data.get('database_name')
        table_name = data.get('table_name', 'data')
        record_count = data.get('count', 100)
        model = data.get('model')  # User-selected LLM model
        
        if not database_name:
            return jsonify({
                "error": "Database name is required",
                "status": "error"
            }), 400
        
        # Check if database exists
        database_path = os.path.join(synthetic_service.databases_path, f"{database_name}.db")
        if not os.path.exists(database_path):
            return jsonify({
                "error": f"Database {database_name} not found",
                "status": "error"
            }), 404
        
        # Get table schema
        table_schema = synthetic_service.get_table_schema(database_path, table_name)
        if not table_schema:
            return jsonify({
                "error": f"Table {table_name} not found in database {database_name}",
                "status": "error"
            }), 404
        
        # Generate data using LLM
        logger.info(f"Generating {record_count} records for {table_name} using LLM: {model or 'default'}")
        generated_data = synthetic_service.generate_realistic_data_with_llm(table_schema, record_count, table_name, model)
        
        # Populate database
        result = synthetic_service.populate_database(generated_data, database_path, table_name)
        
        return jsonify({
            "success": result["status"] == "success",
            "result": result,
            "database_name": database_name,
            "table_name": table_name,
            "records_generated": len(generated_data)
        })
        
    except Exception as e:
        logger.error(f"Error populating database: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/synthetic-data/database/<database_name>/tables', methods=['GET'])
def get_database_tables(database_name):
    """Get list of tables in database"""
    try:
        database_path = os.path.join(synthetic_service.databases_path, f"{database_name}.db")
        
        if not os.path.exists(database_path):
            return jsonify({
                "error": f"Database {database_name} not found",
                "status": "error"
            }), 404
        
        tables = synthetic_service.get_table_names(database_path)
        
        # Get schema for each table
        tables_info = []
        for table in tables:
            schema = synthetic_service.get_table_schema(database_path, table)
            tables_info.append({
                "name": table,
                "columns": len(schema),
                "schema": schema
            })
        
        return jsonify({
            "success": True,
            "database_name": database_name,
            "tables": tables_info,
            "table_count": len(tables)
        })
        
    except Exception as e:
        logger.error(f"Error getting database tables: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/synthetic-data/database/<database_name>/table/<table_name>/schema', methods=['GET'])
def get_table_schema(database_name, table_name):
    """Get schema for specific table"""
    try:
        database_path = os.path.join(synthetic_service.databases_path, f"{database_name}.db")
        
        if not os.path.exists(database_path):
            return jsonify({
                "error": f"Database {database_name} not found",
                "status": "error"
            }), 404
        
        schema = synthetic_service.get_table_schema(database_path, table_name)
        
        if not schema:
            return jsonify({
                "error": f"Table {table_name} not found in database {database_name}",
                "status": "error"
            }), 404
        
        return jsonify({
            "success": True,
            "database_name": database_name,
            "table_name": table_name,
            "schema": schema,
            "column_count": len(schema)
        })
        
    except Exception as e:
        logger.error(f"Error getting table schema: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    logger.info(f"🚀 Starting Synthetic Data Agent Service on port {synthetic_service.port}")
    app.run(host='0.0.0.0', port=synthetic_service.port, debug=True)
