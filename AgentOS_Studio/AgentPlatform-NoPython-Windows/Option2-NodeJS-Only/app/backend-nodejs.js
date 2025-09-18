const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple in-memory storage
let agents = [];
let workflows = [];
let monitoring = {
    system: {
        cpu_usage: 45.2,
        memory_usage: 62.8,
        disk_usage: 34.1,
        network_io: { in: 1024, out: 2048 },
        active_agents: 0,
        running_workflows: 0,
        timestamp: new Date().toISOString()
    },
    agents: []
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Create backend server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }
    
    // Set CORS headers
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });
    
    // Health check
    if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
        return;
    }
    
    // Agents API
    if (parsedUrl.pathname === '/api/agents') {
        if (method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(agents));
            return;
        }
        
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const agent = {
                        id: Date.now().toString(),
                        name: data.name,
                        framework: data.framework,
                        model: data.model,
                        capabilities: data.capabilities || [],
                        status: 'active',
                        created_at: new Date().toISOString(),
                        config: data.config || {}
                    };
                    agents.push(agent);
                    monitoring.system.active_agents = agents.length;
                    
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ id: agent.id, status: 'created' }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }
    }
    
    // Workflows API
    if (parsedUrl.pathname === '/api/workflows') {
        if (method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(workflows));
            return;
        }
        
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const workflow = {
                        id: Date.now().toString(),
                        name: data.name,
                        type: data.type,
                        agents: data.agents || [],
                        config: data.config || {},
                        status: 'draft',
                        created_at: new Date().toISOString()
                    };
                    workflows.push(workflow);
                    monitoring.system.running_workflows = workflows.filter(w => w.status === 'running').length;
                    
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ id: workflow.id, status: 'created' }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }
    }
    
    // Monitoring APIs
    if (parsedUrl.pathname === '/api/monitoring/system') {
        monitoring.system.timestamp = new Date().toISOString();
        monitoring.system.active_agents = agents.length;
        monitoring.system.running_workflows = workflows.filter(w => w.status === 'running').length;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(monitoring.system));
        return;
    }
    
    if (parsedUrl.pathname === '/api/monitoring/agents') {
        const agentMonitoring = agents.map(agent => ({
            agent_id: agent.id,
            name: agent.name,
            status: agent.status,
            cpu_usage: Math.random() * 20,
            memory_usage: Math.random() * 500 + 100,
            requests_per_minute: Math.floor(Math.random() * 100),
            last_activity: new Date().toISOString()
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(agentMonitoring));
        return;
    }
    
    // Framework validation
    if (parsedUrl.pathname === '/api/frameworks/validate') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const framework = data.framework;
                
                if (['agentcore', 'strands', 'custom'].includes(framework)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        valid: true,
                        framework: framework,
                        version: '1.0.0',
                        capabilities: ['chat', 'reasoning', 'tools'],
                        status: 'connected'
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        valid: false,
                        error: 'Unsupported framework',
                        supported_frameworks: ['agentcore', 'strands', 'custom']
                    }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('Health check: http://localhost:5000/health');
});
