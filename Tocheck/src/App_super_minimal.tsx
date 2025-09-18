import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#2563eb' }}>🚀 Banking Agent Platform</h1>
        <p>Super minimal test - if you see this, routing works!</p>
        
        <div style={{ marginTop: '20px' }}>
          <h2>Available Routes:</h2>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/test">Test Page</a></li>
          </ul>
        </div>
        
        <Routes>
          <Route path="/" element={
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
              <h3>✅ Home Page Loaded</h3>
              <p>React Router is working correctly!</p>
            </div>
          } />
          <Route path="/test" element={
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #22c55e' }}>
              <h3>✅ Test Page Loaded</h3>
              <p>Navigation is working!</p>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;