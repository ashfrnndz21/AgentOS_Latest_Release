import { useState } from 'react';
import { FileText } from 'lucide-react';

export default function DocumentWorkspaceTest() {
  const [status, setStatus] = useState('Testing...');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="text-purple-400" />
            Real RAG Document Workspace - Test
          </h1>
          <p className="text-gray-400">
            Testing the Real RAG implementation
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <p>Status: {status}</p>
          <p>If you can see this, the basic React setup is working.</p>
        </div>
      </div>
    </div>
  );
}