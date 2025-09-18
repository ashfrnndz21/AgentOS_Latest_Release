#!/usr/bin/env python3
"""
Real-time RAG processing monitor
Run this script to see detailed backend processing when you upload documents
"""

import requests
import time
import json
from datetime import datetime

def monitor_rag_processing():
    """Monitor RAG processing in real-time"""
    
    base_url = "http://localhost:8000"
    last_doc_count = 0
    last_chunk_count = 0
    
    print("🔍 RAG Processing Monitor - Real-Time")
    print("=" * 60)
    print("📋 Upload a document in the browser to see processing details...")
    print("🔄 Monitoring every 2 seconds...")
    print()
    
    while True:
        try:
            # Get current status
            response = requests.get(f"{base_url}/api/rag/status", timeout=2)
            if response.ok:
                status = response.json()
                stats = status.get('stats', {})
                
                current_docs = stats.get('total_documents', 0)
                current_chunks = stats.get('total_chunks', 0)
                
                # Check for changes
                if current_docs != last_doc_count or current_chunks != last_chunk_count:
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    
                    if current_docs > last_doc_count:
                        print(f"[{timestamp}] 📄 NEW DOCUMENT DETECTED!")
                        print(f"   Documents: {last_doc_count} → {current_docs}")
                    
                    if current_chunks > last_chunk_count:
                        new_chunks = current_chunks - last_chunk_count
                        print(f"[{timestamp}] ✂️  NEW CHUNKS CREATED: +{new_chunks}")
                        print(f"   Total chunks: {last_chunk_count} → {current_chunks}")
                    
                    # Get document details
                    docs_response = requests.get(f"{base_url}/api/rag/documents", timeout=2)
                    if docs_response.ok:
                        docs_data = docs_response.json()
                        documents = docs_data.get('documents', [])
                        
                        if documents:
                            latest_doc = documents[-1]  # Get most recent
                            print(f"   📋 Latest Document Details:")
                            print(f"      - Filename: {latest_doc.get('filename', 'Unknown')}")
                            print(f"      - Chunks: {latest_doc.get('chunks_created', 0)}")
                            print(f"      - Pages: {latest_doc.get('pages_processed', 0)}")
                            print(f"      - Model: {latest_doc.get('model_name', 'Unknown')}")
                            print(f"      - Embeddings: {stats.get('embeddings_type', 'Unknown')}")
                            print(f"      - Vector DB: {stats.get('vector_db_type', 'Unknown')}")
                    
                    print()
                    last_doc_count = current_docs
                    last_chunk_count = current_chunks
                
                # Show current status (compact)
                if current_docs > 0:
                    print(f"\r📊 Status: {current_docs} docs, {current_chunks} chunks", end="", flush=True)
                else:
                    print(f"\r⏳ Waiting for documents...", end="", flush=True)
            
            else:
                print(f"\r❌ Backend not responding", end="", flush=True)
        
        except requests.exceptions.RequestException:
            print(f"\r🔌 Backend offline", end="", flush=True)
        except KeyboardInterrupt:
            print("\n\n👋 Monitoring stopped")
            break
        except Exception as e:
            print(f"\r❌ Error: {e}", end="", flush=True)
        
        time.sleep(2)

def show_current_state():
    """Show detailed current state"""
    base_url = "http://localhost:8000"
    
    print("\n" + "=" * 60)
    print("📊 CURRENT RAG SYSTEM STATE")
    print("=" * 60)
    
    try:
        # Get status
        response = requests.get(f"{base_url}/api/rag/status")
        if response.ok:
            status = response.json()
            stats = status.get('stats', {})
            
            print(f"🎯 RAG Status: {status.get('status', 'Unknown')}")
            print(f"📄 Total Documents: {stats.get('total_documents', 0)}")
            print(f"✂️  Total Chunks: {stats.get('total_chunks', 0)}")
            print(f"🗄️  Vector Stores: {stats.get('vector_stores', 0)}")
            print(f"🔗 Active Chains: {stats.get('active_chains', 0)}")
            print(f"🧮 Embeddings: {stats.get('embeddings_type', 'Unknown')}")
            print(f"💾 Vector DB: {stats.get('vector_db_type', 'Unknown')}")
            
            # Get documents
            docs_response = requests.get(f"{base_url}/api/rag/documents")
            if docs_response.ok:
                docs_data = docs_response.json()
                documents = docs_data.get('documents', [])
                
                if documents:
                    print(f"\n📚 PROCESSED DOCUMENTS:")
                    for i, doc in enumerate(documents, 1):
                        print(f"   {i}. {doc.get('filename', 'Unknown')}")
                        print(f"      - ID: {doc.get('document_id', 'Unknown')}")
                        print(f"      - Chunks: {doc.get('chunks_created', 0)}")
                        print(f"      - Pages: {doc.get('pages_processed', 0)}")
                        print(f"      - Model: {doc.get('model_name', 'Unknown')}")
                        print(f"      - Processed: {doc.get('ingested_at', 'Unknown')}")
                else:
                    print(f"\n📝 No documents processed yet")
        
        else:
            print("❌ Could not connect to RAG service")
    
    except Exception as e:
        print(f"❌ Error getting status: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        show_current_state()
    else:
        monitor_rag_processing()