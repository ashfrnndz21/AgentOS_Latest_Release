#!/usr/bin/env python3
"""
Real-time RAG Pipeline Monitor
Monitors the complete document processing and query pipeline
Shows exactly what happens when you upload a PDF and ask questions
"""

import requests
import json
import time
import threading
from datetime import datetime
import subprocess
import sys

class RAGPipelineMonitor:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.monitoring = False
        self.last_document_count = 0
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        colors = {
            "INFO": "\033[36m",    # Cyan
            "SUCCESS": "\033[32m", # Green
            "ERROR": "\033[31m",   # Red
            "WARN": "\033[33m",    # Yellow
            "DEBUG": "\033[35m"    # Magenta
        }
        reset = "\033[0m"
        color = colors.get(level, "")
        print(f"{color}[{timestamp}] {level}: {message}{reset}")
    
    def check_backend_status(self):
        """Check if backend is running and ready"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                self.log("✅ Backend is running and healthy", "SUCCESS")
                return True
            else:
                self.log(f"❌ Backend health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Cannot connect to backend: {e}", "ERROR")
            return False
    
    def check_rag_status(self):
        """Check RAG service status and get current stats"""
        try:
            response = requests.get(f"{self.backend_url}/api/rag/status", timeout=5)
            if response.status_code == 200:
                status = response.json()
                self.log(f"📊 RAG Status: {status['status']}", "SUCCESS")
                
                stats = status.get('stats', {})
                self.log(f"📈 Current Stats:", "INFO")
                self.log(f"   - Documents: {stats.get('total_documents', 0)}", "INFO")
                self.log(f"   - Chunks: {stats.get('total_chunks', 0)}", "INFO")
                self.log(f"   - Vector Stores: {stats.get('vector_stores', 0)}", "INFO")
                self.log(f"   - Active Chains: {stats.get('active_chains', 0)}", "INFO")
                
                return stats.get('total_documents', 0)
            else:
                self.log(f"❌ RAG status check failed: {response.status_code}", "ERROR")
                return 0
        except Exception as e:
            self.log(f"❌ RAG status check error: {e}", "ERROR")
            return 0
    
    def get_available_models(self):
        """Get available Ollama models"""
        try:
            response = requests.get(f"{self.backend_url}/api/ollama/models", timeout=5)
            if response.status_code == 200:
                models = response.json()
                model_list = models.get('models', [])
                self.log(f"🤖 Available Models: {', '.join(model_list)}", "INFO")
                
                if 'phi3' in model_list:
                    self.log("✅ phi3 model is available for testing", "SUCCESS")
                else:
                    self.log("⚠️ phi3 model not found, will use available model", "WARN")
                
                return model_list
            else:
                self.log(f"⚠️ Could not get models: {response.status_code}", "WARN")
                return []
        except Exception as e:
            self.log(f"⚠️ Model check error: {e}", "WARN")
            return []
    
    def monitor_document_changes(self):
        """Monitor for new document uploads"""
        while self.monitoring:
            try:
                current_count = self.check_rag_status()
                
                if current_count > self.last_document_count:
                    self.log(f"🆕 NEW DOCUMENT DETECTED! Count: {self.last_document_count} → {current_count}", "SUCCESS")
                    self.analyze_latest_document()
                    self.last_document_count = current_count
                
                time.sleep(2)  # Check every 2 seconds
                
            except Exception as e:
                self.log(f"❌ Monitoring error: {e}", "ERROR")
                time.sleep(5)
    
    def analyze_latest_document(self):
        """Analyze the most recently uploaded document"""
        try:
            response = requests.get(f"{self.backend_url}/api/rag/documents", timeout=5)
            if response.status_code == 200:
                data = response.json()
                documents = data.get('documents', [])
                
                if documents:
                    # Get the most recent document (last in list)
                    latest_doc = documents[-1]
                    
                    self.log("📄 DOCUMENT ANALYSIS:", "SUCCESS")
                    self.log(f"   📋 Document ID: {latest_doc.get('document_id', 'N/A')}", "INFO")
                    self.log(f"   📄 Filename: {latest_doc.get('filename', 'N/A')}", "INFO")
                    self.log(f"   📊 Pages Processed: {latest_doc.get('pages_processed', 'N/A')}", "INFO")
                    self.log(f"   ✂️ Chunks Created: {latest_doc.get('chunks_created', 'N/A')}", "INFO")
                    self.log(f"   🤖 Model Used: {latest_doc.get('model_name', 'N/A')}", "INFO")
                    self.log(f"   🧮 Vector Store: {latest_doc.get('vector_store_type', 'N/A')}", "INFO")
                    self.log(f"   📅 Ingested At: {latest_doc.get('ingested_at', 'N/A')}", "INFO")
                    
                    # Test query with the document
                    self.test_document_query(latest_doc.get('document_id'))
                    
        except Exception as e:
            self.log(f"❌ Document analysis error: {e}", "ERROR")
    
    def test_document_query(self, document_id):
        """Test querying the document with phi3 model"""
        if not document_id:
            return
            
        test_queries = [
            "What is this document about?",
            "Summarize the main points",
            "What are the key details?"
        ]
        
        # Try to use phi3, fallback to available model
        available_models = self.get_available_models()
        model_to_use = "phi3" if "phi3" in available_models else (available_models[0] if available_models else "mistral")
        
        self.log(f"🔍 TESTING QUERIES with model: {model_to_use}", "SUCCESS")
        
        for i, query in enumerate(test_queries, 1):
            self.log(f"❓ Query {i}: {query}", "INFO")
            
            try:
                query_data = {
                    "query": query,
                    "document_ids": [document_id],
                    "model_name": model_to_use
                }
                
                start_time = time.time()
                response = requests.post(
                    f"{self.backend_url}/api/rag/query",
                    json=query_data,
                    timeout=30
                )
                query_time = time.time() - start_time
                
                if response.status_code == 200:
                    result = response.json()
                    
                    self.log(f"✅ Query completed in {query_time:.2f}s", "SUCCESS")
                    self.log(f"📊 RETRIEVAL DETAILS:", "DEBUG")
                    self.log(f"   🎯 Status: {result.get('status', 'N/A')}", "DEBUG")
                    self.log(f"   📦 Chunks Retrieved: {result.get('chunks_retrieved', 'N/A')}", "DEBUG")
                    self.log(f"   📍 Sources: {result.get('sources', [])}", "DEBUG")
                    
                    # Show retrieved chunks
                    chunks = result.get('relevant_chunks', [])
                    if chunks:
                        self.log(f"🔍 RETRIEVED CHUNKS:", "DEBUG")
                        for j, chunk in enumerate(chunks[:2], 1):  # Show first 2 chunks
                            self.log(f"   Chunk {j}: {chunk[:100]}...", "DEBUG")
                    
                    # Show response preview
                    response_text = result.get('response', '')
                    if response_text:
                        self.log(f"💬 RESPONSE: {response_text[:150]}...", "SUCCESS")
                    
                else:
                    self.log(f"❌ Query failed: {response.status_code}", "ERROR")
                    
            except Exception as e:
                self.log(f"❌ Query error: {e}", "ERROR")
            
            print()  # Add spacing between queries
    
    def start_monitoring(self):
        """Start the monitoring process"""
        self.log("🚀 Starting RAG Pipeline Monitor", "SUCCESS")
        self.log("=" * 60, "INFO")
        
        # Initial checks
        if not self.check_backend_status():
            self.log("❌ Backend not available. Please start the backend first.", "ERROR")
            return
        
        self.last_document_count = self.check_rag_status()
        self.get_available_models()
        
        self.log("👀 Monitoring for document uploads...", "INFO")
        self.log("📝 Instructions:", "INFO")
        self.log("   1. Go to http://localhost:8080/#/document-workspace", "INFO")
        self.log("   2. Upload a PDF document", "INFO")
        self.log("   3. Select phi3 model (or any available model)", "INFO")
        self.log("   4. Watch this monitor for real-time pipeline analysis", "INFO")
        self.log("   5. Press Ctrl+C to stop monitoring", "INFO")
        self.log("=" * 60, "INFO")
        
        # Start monitoring in background
        self.monitoring = True
        monitor_thread = threading.Thread(target=self.monitor_document_changes)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        try:
            # Keep main thread alive
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.log("🛑 Stopping monitor...", "WARN")
            self.monitoring = False

def main():
    monitor = RAGPipelineMonitor()
    monitor.start_monitoring()

if __name__ == "__main__":
    main()