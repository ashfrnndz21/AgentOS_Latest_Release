# Ollama Terminal Integration

## Overview

The Ollama Terminal feature has been successfully integrated into your existing app. This provides a web-based terminal interface for managing local AI models using Ollama.

## Features Integrated

### Frontend Components
- **OllamaTerminal Component** (`src/components/OllamaTerminal.tsx`)
  - Interactive terminal with command execution
  - Real-time connection status indicator
  - Command history and output display
  - Quick action buttons for common commands
  - Copy and clear terminal functionality

- **OllamaTerminal Page** (`src/pages/OllamaTerminal.tsx`)
  - Full page layout with terminal and sidebar
  - Popular models showcase
  - Quick commands reference
  - Setup instructions

- **Ollama Service** (`src/lib/services/ollamaService.ts`)
  - TypeScript service for API communication
  - Model management functions
  - Command execution interface

### Backend API
- **Ollama API Backend** (`backend/ollama_api.py`)
  - FastAPI-based backend service
  - Secure command execution (ollama commands only)
  - Model management endpoints
  - Health checking and status monitoring

### Navigation
- Added "Ollama Terminal" to the Core Platform section in the sidebar
- Accessible via `/ollama-terminal` route

## Setup Instructions

### 1. Install Ollama
First, install Ollama on your system:
- Visit [ollama.ai](https://ollama.ai) and download the installer
- Follow the installation instructions for your OS

### 2. Start Ollama Service
```bash
ollama serve
```

### 3. Start the Backend
Choose the appropriate script for your OS:

**macOS/Linux:**
```bash
./start-ollama-backend.sh
```

**Windows:**
```bash
start-ollama-backend.bat
```

The backend will:
- Create a Python virtual environment
- Install required dependencies
- Start the API server on port 5001

### 4. Start the Frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

## Usage

1. Navigate to "Ollama Terminal" in the sidebar
2. The terminal will automatically test the connection to the backend and Ollama
3. Use commands like:
   - `ollama list` - Show installed models
   - `ollama pull llama3.2` - Download a model
   - `ollama show llama3.2` - Show model information
   - `ollama rm model_name` - Remove a model

## API Endpoints

The backend provides these endpoints:

- `GET /health` - Health check
- `GET /api/ollama/status` - Ollama service status
- `GET /api/ollama/models` - List installed models
- `POST /api/ollama/terminal` - Execute terminal commands
- `POST /api/ollama/pull` - Pull a model
- `POST /api/ollama/generate` - Generate text with a model
- `DELETE /api/ollama/delete` - Delete a model

## Security Features

- Only `ollama` commands are allowed in the terminal
- Command timeout protection (60 seconds)
- Proper error handling and user feedback
- CORS protection for frontend-backend communication

## Architecture

```
Frontend (React) → Vite Proxy → Backend API (FastAPI) → Ollama Service
     :8080            /api           :5001              :11434
```

The Vite proxy forwards `/api` requests to the backend, avoiding CORS issues and providing a seamless development experience.

## Troubleshooting

### Backend Connection Issues
- Ensure the backend is running on port 5001
- Check that the Vite proxy is configured correctly
- Verify CORS settings in the backend

### Ollama Connection Issues
- Make sure Ollama is installed and running (`ollama serve`)
- Check that Ollama is accessible on `localhost:11434`
- Verify Ollama is in your system PATH

### Command Execution Issues
- Only `ollama` commands are allowed for security
- Commands have a 60-second timeout
- Check the terminal output for specific error messages

## Next Steps

You can extend this integration by:

1. **Adding Model Management UI**: Create a visual interface for model installation/removal
2. **Chat Interface**: Add a chat interface using the installed models
3. **Model Performance Monitoring**: Track model usage and performance metrics
4. **Batch Operations**: Support for multiple model operations
5. **Model Recommendations**: Suggest models based on use cases

The foundation is now in place for a comprehensive local AI model management system within your existing application.