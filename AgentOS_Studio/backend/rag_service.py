"""
Real RAG Service Implementation
Based on the reference article: https://medium.com/@vndee.huynh/build-your-own-rag-and-run-it-locally-langchain-ollama-streamlit-181d42805895

This implements proper RAG functionality with:
- Real PDF processing using PyPDFLoader
- Proper text chunking with RecursiveCharacterTextSplitter
- Vector embeddings using FastEmbedEmbeddings
- Vector storage using Chroma
- Semantic similarity search
- LangChain pipeline with Ollama
"""

import os
import tempfile
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

try:
    # LangChain imports for real RAG functionality
    from langchain_community.vectorstores import Chroma
    from langchain_community.chat_models import ChatOllama
    from langchain_community.embeddings import FastEmbedEmbeddings
    from langchain.schema.output_parser import StrOutputParser
    from langchain_community.document_loaders import PyPDFLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.schema.runnable import RunnablePassthrough
    from langchain.prompts import PromptTemplate
    from langchain.vectorstores.utils import filter_complex_metadata
    LANGCHAIN_AVAILABLE = True
except ImportError as e:
    LANGCHAIN_AVAILABLE = False
    IMPORT_ERROR = str(e)

logger = logging.getLogger(__name__)

class RealRAGService:
    """Real RAG Service implementing the reference article's functionality"""
    
    def __init__(self, ollama_host: str = "http://localhost:11434"):
        self.ollama_host = ollama_host
        self.vector_stores: Dict[str, Any] = {}  # document_id -> vector_store
        self.retrievers: Dict[str, Any] = {}     # document_id -> retriever
        self.chains: Dict[str, Any] = {}         # document_id -> chain
        self.documents_metadata: Dict[str, Dict] = {}  # document_id -> metadata
        
        if not LANGCHAIN_AVAILABLE:
            logger.error(f"❌ LangChain dependencies not available: {IMPORT_ERROR}")
            raise ImportError(f"Required dependencies not installed: {IMPORT_ERROR}")
        
        # Initialize components
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1024, 
            chunk_overlap=100
        )
        
        self.embeddings = FastEmbedEmbeddings()
        
        # RAG prompt template optimized for document analysis
        self.prompt = PromptTemplate.from_template("""You are a helpful document analysis assistant. Answer the question based ONLY on the provided context from the uploaded documents.

CONTEXT FROM DOCUMENTS:
{context}

QUESTION: {question}

INSTRUCTIONS:
- Use ONLY the information provided in the context above
- If the context contains relevant information, provide a detailed answer
- If the context does not contain relevant information, say "The provided documents do not contain information about this topic"
- Do not make up information that is not in the context
- Quote specific parts of the documents when relevant

ANSWER:""")

        # Agent-enhanced RAG prompt template
        self.agent_prompt = PromptTemplate.from_template("""You are {agent_name}, a {agent_role} with expertise in {agent_expertise}.

PERSONALITY & STYLE:
{agent_personality}

DOCUMENT CONTEXT:
{context}

CONVERSATION MEMORY:
{agent_memory}

QUESTION: {question}

INSTRUCTIONS:
- Respond as {agent_name} would, using your expertise in {agent_role}
- Analyze the document context from your professional perspective
- Use ONLY the information provided in the document context
- Apply your specialized knowledge to interpret and explain the content
- Maintain your personality and communication style
- Reference specific parts of the documents when relevant
- If the context lacks information, explain what additional documents or information would be helpful from your professional perspective

RESPONSE AS {agent_name}:""")
        
        logger.info("✅ Real RAG Service initialized with LangChain components")
    
    def check_dependencies(self) -> Dict[str, Any]:
        """Check if all required dependencies are available"""
        return {
            "langchain_available": LANGCHAIN_AVAILABLE,
            "import_error": IMPORT_ERROR if not LANGCHAIN_AVAILABLE else None,
            "required_packages": [
                "langchain",
                "langchain-community", 
                "chromadb",
                "fastembed",
                "pypdf"
            ]
        }
    
    async def ingest_document(self, file_path: str, document_id: str, model_name: str = "mistral", log_callback=None) -> Dict[str, Any]:
        """
        Ingest a PDF document using real RAG pipeline
        Matches the reference article's ingest method
        """
        try:
            logger.info(f"🔄 Starting real RAG ingestion for document: {document_id}")
            
            # Validate file exists and is readable
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            if not os.access(file_path, os.R_OK):
                raise PermissionError(f"Cannot read file: {file_path}")
            
            file_size = os.path.getsize(file_path)
            logger.info(f"📄 File validation passed: {file_path} ({file_size} bytes)")
            
            # Validate PDF format
            try:
                with open(file_path, 'rb') as f:
                    header = f.read(8)
                    if not header.startswith(b'%PDF-'):
                        raise ValueError(f"File is not a valid PDF. Header: {header[:20]}")
                logger.info(f"📄 PDF format validation passed")
            except Exception as e:
                raise ValueError(f"PDF validation failed: {str(e)}. Please ensure the file is a valid, non-corrupted PDF.")
            
            # Step 1: Load PDF using PyPDFLoader (real PDF processing)
            logger.info(f"📄 Loading PDF with PyPDFLoader: {file_path}")
            if log_callback:
                log_callback("info", "loading", f"📄 Loading PDF with PyPDFLoader", document_id, file_path.split('/')[-1])
            
            try:
                docs = PyPDFLoader(file_path=file_path).load()
                if not docs:
                    raise ValueError("PDF contains no readable content")
                logger.info(f"📄 Loaded {len(docs)} pages from PDF")
                if log_callback:
                    log_callback("success", "loading", f"📄 Loaded {len(docs)} pages from PDF", document_id, file_path.split('/')[-1])
            except Exception as e:
                if log_callback:
                    log_callback("error", "loading", f"❌ PDF loading failed: {str(e)}", document_id, file_path.split('/')[-1])
                raise ValueError(f"PDF loading failed: {str(e)}. This could be due to: corrupted PDF, password-protected PDF, or unsupported PDF format")
            
            # Step 2: Split documents into chunks (real chunking)
            logger.info("✂️ Splitting documents into chunks...")
            if log_callback:
                log_callback("info", "chunking", f"✂️ Splitting documents into chunks...", document_id, file_path.split('/')[-1])
            
            try:
                chunks = self.text_splitter.split_documents(docs)
                chunks = filter_complex_metadata(chunks)
                if not chunks:
                    raise ValueError("No text chunks could be created from the PDF")
                logger.info(f"✂️ Created {len(chunks)} chunks with overlap")
                if log_callback:
                    log_callback("success", "chunking", f"✂️ Created {len(chunks)} text chunks with overlap", 
                               document_id, file_path.split('/')[-1], 
                               {"chunks": len(chunks), "chunkSize": 1024, "overlap": 100})
            except Exception as e:
                if log_callback:
                    log_callback("error", "chunking", f"❌ Text chunking failed: {str(e)}", document_id, file_path.split('/')[-1])
                raise ValueError(f"Text chunking failed: {str(e)}")
            
            # Step 3: Create vector store with embeddings (real vector storage)
            logger.info("🧮 Creating vector embeddings with FastEmbed...")
            if log_callback:
                log_callback("info", "embedding", f"🧠 Generating embeddings with FastEmbed...", document_id, file_path.split('/')[-1])
            
            try:
                # Create isolated vector store for this document using document_id as collection name
                collection_name = f"doc_{document_id.replace('-', '_')}"
                logger.info(f"🧮 Creating isolated collection: {collection_name}")
                
                vector_store = Chroma.from_documents(
                    documents=chunks, 
                    embedding=self.embeddings,
                    collection_name=collection_name
                )
                logger.info(f"🧮 Vector embeddings created and stored in isolated Chroma collection: {collection_name}")
                if log_callback:
                    log_callback("success", "embedding", f"🧠 Generated embeddings for all chunks", document_id, file_path.split('/')[-1])
            except Exception as e:
                if log_callback:
                    log_callback("error", "embedding", f"❌ Vector embedding failed: {str(e)}", document_id, file_path.split('/')[-1])
                raise ValueError(f"Vector embedding creation failed: {str(e)}. This could be due to: FastEmbed model not available, insufficient memory, or ChromaDB issues")
            
            # Step 4: Create retriever with similarity search (real semantic search)
            logger.info("🔍 Setting up semantic similarity retriever...")
            if log_callback:
                log_callback("info", "indexing", f"🗄️ Storing vectors in Chroma database...", document_id, file_path.split('/')[-1])
            
            try:
                retriever = vector_store.as_retriever(
                    search_type="similarity_score_threshold",
                    search_kwargs={
                        "k": 3,
                        "score_threshold": 0.5,
                    },
                )
                if log_callback:
                    log_callback("success", "indexing", f"🗄️ Vector database indexing completed", document_id, file_path.split('/')[-1])
            except Exception as e:
                if log_callback:
                    log_callback("error", "indexing", f"❌ Retriever setup failed: {str(e)}", document_id, file_path.split('/')[-1])
                raise ValueError(f"Retriever setup failed: {str(e)}")
            
            # Step 5: Test Ollama model availability
            logger.info(f"🤖 Testing Ollama model availability: {model_name}")
            try:
                test_model = ChatOllama(model=model_name, base_url=self.ollama_host)
                # Test with a simple query to verify model works
                test_response = test_model.invoke("Test")
                logger.info(f"🤖 Ollama model {model_name} is available and responding")
            except Exception as e:
                raise ValueError(f"Ollama model '{model_name}' not available: {str(e)}. Please ensure the model is downloaded in Ollama")
            
            # Step 6: Create RAG chain with Ollama (real LangChain pipeline)
            logger.info(f"🤖 Creating RAG chain with Ollama model: {model_name}")
            model = ChatOllama(model=model_name, base_url=self.ollama_host)
            
            chain = (
                {"context": retriever, "question": RunnablePassthrough()}
                | self.prompt
                | model
                | StrOutputParser()
            )
            
            # Store components
            self.vector_stores[document_id] = vector_store
            self.retrievers[document_id] = retriever
            self.chains[document_id] = chain
            
            # Store metadata
            self.documents_metadata[document_id] = {
                "file_path": file_path,
                "model_name": model_name,
                "chunks_count": len(chunks),
                "pages_count": len(docs),
                "ingested_at": datetime.utcnow().isoformat(),
                "vector_store_type": "chroma",
                "embeddings_type": "fastembed",
                "chunk_size": 1024,
                "chunk_overlap": 100
            }
            
            logger.info(f"✅ Real RAG ingestion completed for document: {document_id}")
            if log_callback:
                log_callback("success", "ready", f"✅ Document ready for chat: {file_path.split('/')[-1]}", document_id, file_path.split('/')[-1])
            
            return {
                "status": "success",
                "document_id": document_id,
                "chunks_created": len(chunks),
                "pages_processed": len(docs),
                "model_name": model_name,
                "vector_store": "chroma",
                "embeddings": "fastembed",
                "message": f"Document ingested successfully with {len(chunks)} chunks"
            }
            
        except Exception as e:
            logger.error(f"❌ RAG ingestion failed for {document_id}: {str(e)}")
            return {
                "status": "error",
                "document_id": document_id,
                "error": str(e),
                "message": f"Failed to ingest document: {str(e)}"
            }
    
    async def query_documents(self, query: str, document_ids: List[str], model_name: str = "mistral") -> Dict[str, Any]:
        """
        Query documents using real RAG pipeline with enhanced debugging
        """
        try:
            logger.info(f"🔍 Processing RAG query: {query[:100]}...")
            
            # If no document IDs specified, use all available documents
            if not document_ids:
                document_ids = list(self.chains.keys())
                if not document_ids:
                    return {
                        "status": "error",
                        "error": "No documents available",
                        "message": "No documents have been ingested yet"
                    }
                logger.info(f"🔍 No document IDs specified, using all available: {document_ids}")
            
            # Check if documents are ingested
            available_docs = [doc_id for doc_id in document_ids if doc_id in self.chains]
            if not available_docs:
                logger.error(f"❌ No ingested documents found. Available chains: {list(self.chains.keys())}")
                return {
                    "status": "error",
                    "error": "No ingested documents found",
                    "message": "Please ingest documents first before querying"
                }
            
            # Query each document separately and combine results
            all_relevant_docs = []
            best_document_id = None
            best_score = float('inf')
            
            for document_id in available_docs:
                logger.info(f"🔍 Querying document: {document_id}")
                retriever = self.retrievers[document_id]
                
                try:
                    # Get documents with similarity scores from this specific document
                    relevant_docs_with_scores = retriever.vectorstore.similarity_search_with_score(query, k=3)
                    logger.info(f"🔍 Found {len(relevant_docs_with_scores)} chunks in document {document_id[:8]}...")
                    
                    for i, (doc, score) in enumerate(relevant_docs_with_scores):
                        logger.info(f"  Chunk {i+1}: Score={score:.3f}, Content: {doc.page_content[:80]}...")
                        all_relevant_docs.append((doc, score, document_id))
                        
                        # Track the best scoring document
                        if score < best_score:
                            best_score = score
                            best_document_id = document_id
                            
                except Exception as e:
                    logger.error(f"❌ Retrieval failed for document {document_id}: {str(e)}")
            
            if not all_relevant_docs:
                logger.error("❌ No relevant documents found in any document")
                return {
                    "status": "error",
                    "error": "No relevant content found",
                    "message": "No relevant content found for the query"
                }
            
            # Use the best scoring document for the response
            logger.info(f"🎯 Best match from document: {best_document_id[:8]}... (score: {best_score:.3f})")
            
            # Get relevant docs from the best document only
            relevant_docs = [doc for doc, score, doc_id in all_relevant_docs if doc_id == best_document_id and score < 1.0]
            
            if not relevant_docs:
                # Fallback to top scoring chunks regardless of threshold
                relevant_docs = [doc for doc, score, doc_id in sorted(all_relevant_docs, key=lambda x: x[1])[:3]]
            
            relevant_chunks = [doc.page_content for doc in relevant_docs]
            sources = [f"Page {doc.metadata.get('page', 'unknown')}" for doc in relevant_docs]
            
            logger.info(f"🔍 Retrieved {len(relevant_chunks)} chunks for context")
            
            # Step 2: Prepare context
            context = "\n\n".join(relevant_chunks)
            logger.info(f"🔍 Context length: {len(context)} characters")
            logger.info(f"🔍 Context preview: {context[:200]}...")
            
            # Debug: Check if context is actually empty
            if not context.strip():
                logger.error("❌ Context is empty after joining chunks!")
                for i, chunk in enumerate(relevant_chunks):
                    logger.error(f"  Chunk {i}: '{chunk[:100]}...'")
            else:
                logger.info(f"✅ Context contains {len(context.split())} words")
            
            # Step 3: Execute the model with explicit context
            logger.info(f"🤖 Executing model with context from document: {best_document_id[:8]}...")
            
            # Create model instance for this query
            model = ChatOllama(model=model_name, base_url=self.ollama_host)
            
            # Manually format the prompt with our retrieved context
            formatted_prompt = self.prompt.format(question=query, context=context)
            logger.info(f"🔍 Formatted prompt preview: {formatted_prompt[:300]}...")
            
            # Execute the model directly with the formatted prompt
            response = model.invoke(formatted_prompt)
            
            # Extract content from AIMessage if needed
            if hasattr(response, 'content'):
                response_text = response.content
            else:
                response_text = str(response)
            
            logger.info(f"✅ RAG query completed")
            logger.info(f"🔍 Response preview: {response_text[:200]}...")
            
            # Verify the response uses the context
            context_keywords = set(context.lower().split()[:50])  # First 50 words from context
            response_keywords = set(response_text.lower().split())
            overlap = len(context_keywords.intersection(response_keywords))
            
            logger.info(f"🔍 Context-response overlap: {overlap} keywords")
            
            if overlap < 3:
                logger.warning(f"⚠️ Low context overlap detected. Response may not be using document content.")
            
            # Get document metadata for additional context
            doc_metadata = self.documents_metadata.get(best_document_id, {})
            
            return {
                "status": "success",
                "response": response_text,
                "relevant_chunks": relevant_chunks,
                "sources": sources,
                "document_id": best_document_id,
                "model_name": model_name,
                "chunks_retrieved": len(relevant_chunks),
                "chunks_available": doc_metadata.get('chunks_created', 0),
                "context_length": len(context),
                "context_overlap": overlap,
                "document_metadata": {
                    "filename": doc_metadata.get('filename', 'unknown'),
                    "pages_processed": doc_metadata.get('pages_processed', 0),
                    "chunks_created": doc_metadata.get('chunks_created', 0),
                    "ingested_at": doc_metadata.get('ingested_at', 'unknown')
                },
                "debug_info": {
                    "query": query,
                    "context_preview": context[:500],
                    "model_used": model_name,
                    "best_match_score": best_score
                },
                "message": "Query processed successfully with real RAG pipeline"
            }
            
        except Exception as e:
            logger.error(f"❌ RAG query failed: {str(e)}")
            import traceback
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            return {
                "status": "error",
                "error": str(e),
                "message": f"Failed to process query: {str(e)}"
            }
    
    async def query_documents_with_agent(self, query: str, document_ids: List[str], agent_config: Dict[str, Any], model_name: str = "mistral") -> Dict[str, Any]:
        """
        Query documents using an agent-enhanced RAG pipeline
        """
        try:
            logger.info(f"🤖 Processing agent-enhanced RAG query with {agent_config.get('name', 'Unknown Agent')}")
            
            # First, get the document context using the regular RAG pipeline
            base_result = await self.query_documents(query, document_ids, model_name)
            
            if base_result["status"] != "success":
                return base_result
            
            # Extract context and metadata from base result
            context = "\n\n".join(base_result["relevant_chunks"])
            sources = base_result["sources"]
            
            # Prepare agent-specific variables
            agent_name = agent_config.get('name', 'AI Assistant')
            agent_role = agent_config.get('role', 'Document Analyst')
            agent_expertise = agent_config.get('expertise', 'document analysis')
            agent_personality = agent_config.get('personality', 'Professional and analytical')
            agent_memory = agent_config.get('memory', 'No previous conversation context')
            
            logger.info(f"🤖 Agent: {agent_name} ({agent_role}) analyzing documents...")
            
            # Create model instance for agent query
            model = ChatOllama(model=model_name, base_url=self.ollama_host)
            
            # Format the agent-enhanced prompt
            formatted_prompt = self.agent_prompt.format(
                agent_name=agent_name,
                agent_role=agent_role,
                agent_expertise=agent_expertise,
                agent_personality=agent_personality,
                context=context,
                agent_memory=agent_memory,
                question=query
            )
            
            logger.info(f"🤖 Agent prompt preview: {formatted_prompt[:300]}...")
            
            # Execute the model with agent-enhanced prompt
            response = model.invoke(formatted_prompt)
            
            # Extract content from response
            if hasattr(response, 'content'):
                response_text = response.content
            else:
                response_text = str(response)
            
            logger.info(f"✅ Agent-enhanced RAG query completed")
            logger.info(f"🤖 Agent response preview: {response_text[:200]}...")
            
            # Return enhanced result with agent information
            return {
                "status": "success",
                "response": response_text,
                "relevant_chunks": base_result["relevant_chunks"],
                "sources": sources,
                "document_id": base_result["document_id"],
                "model_name": model_name,
                "chunks_retrieved": base_result["chunks_retrieved"],
                "chunks_available": base_result["chunks_available"],
                "context_length": base_result["context_length"],
                "document_metadata": base_result["document_metadata"],
                "agent_info": {
                    "name": agent_name,
                    "role": agent_role,
                    "expertise": agent_expertise,
                    "personality": agent_personality
                },
                "agent_enhanced": True,
                "message": f"Query processed by {agent_name} with real RAG pipeline"
            }
            
        except Exception as e:
            error_msg = f"Failed to process agent-enhanced query: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                "status": "error",
                "error": error_msg,
                "message": "An error occurred while processing your agent query"
            }

    def get_document_info(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get information about an ingested document"""
        return self.documents_metadata.get(document_id)
    
    def list_ingested_documents(self) -> List[Dict[str, Any]]:
        """List all ingested documents with metadata"""
        return [
            {
                "document_id": doc_id,
                **metadata
            }
            for doc_id, metadata in self.documents_metadata.items()
        ]
    
    def clear_document(self, document_id: str) -> bool:
        """Remove a document from the RAG system"""
        try:
            if document_id in self.vector_stores:
                del self.vector_stores[document_id]
            if document_id in self.retrievers:
                del self.retrievers[document_id]
            if document_id in self.chains:
                del self.chains[document_id]
            if document_id in self.documents_metadata:
                del self.documents_metadata[document_id]
            
            logger.info(f"🗑️ Cleared document from RAG system: {document_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to clear document {document_id}: {str(e)}")
            return False
    
    def clear_all_documents(self) -> int:
        """Clear all documents from the RAG system"""
        count = len(self.documents_metadata)
        self.vector_stores.clear()
        self.retrievers.clear()
        self.chains.clear()
        self.documents_metadata.clear()
        
        logger.info(f"🧹 Cleared all documents from RAG system: {count} documents removed")
        return count
    
    def reinitialize(self) -> None:
        """Reinitialize the RAG service"""
        self.clear_all_documents()
        logger.info("🔄 RAG service reinitialized")
    
    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document with metadata"""
        try:
            if document_id not in self.vector_stores:
                logger.warning(f"Document {document_id} not found in vector stores")
                return []
            
            vector_store = self.vector_stores[document_id]
            
            # Get all documents from the vector store
            # This is a simplified approach - in production you might want pagination
            results = vector_store.similarity_search("", k=1000)  # Get up to 1000 chunks
            
            chunks = []
            for i, doc in enumerate(results):
                chunk_data = {
                    "chunk_id": f"{document_id}_chunk_{i}",
                    "content": doc.page_content,
                    "metadata": {
                        "document_id": document_id,
                        "chunk_index": i,
                        "char_start": doc.metadata.get("start_index", 0),
                        "char_end": doc.metadata.get("end_index", len(doc.page_content)),
                        "page_number": doc.metadata.get("page", None),
                        "source": doc.metadata.get("source", ""),
                    }
                }
                chunks.append(chunk_data)
            
            logger.info(f"📄 Retrieved {len(chunks)} chunks for document {document_id}")
            return chunks
            
        except Exception as e:
            logger.error(f"❌ Failed to get chunks for document {document_id}: {str(e)}")
            return []
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        total_chunks = sum(
            metadata.get('chunks_created', 0) 
            for metadata in self.documents_metadata.values()
        )
        
        return {
            "documents_count": len(self.documents_metadata),
            "total_chunks": total_chunks,
            "vector_stores_active": len(self.vector_stores),
            "retrievers_active": len(self.retrievers),
            "chains_active": len(self.chains)
        }
        self.chains.clear()
        self.documents_metadata.clear()
        logger.info("🗑️ Cleared all documents from RAG system")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get RAG system statistics"""
        total_chunks = sum(
            metadata.get("chunks_count", 0) 
            for metadata in self.documents_metadata.values()
        )
        
        return {
            "total_documents": len(self.documents_metadata),
            "total_chunks": total_chunks,
            "vector_stores": len(self.vector_stores),
            "active_chains": len(self.chains),
            "langchain_available": LANGCHAIN_AVAILABLE,
            "embeddings_type": "fastembed",
            "vector_db_type": "chroma"
        }

# Global RAG service instance
rag_service = None

def get_rag_service() -> RealRAGService:
    """Get or create the global RAG service instance"""
    global rag_service
    if rag_service is None:
        rag_service = RealRAGService()
    return rag_service