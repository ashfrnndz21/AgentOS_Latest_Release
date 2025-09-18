"""
Stock Market Agent A2A Server
Independent A2A server for financial and stock market analysis
"""

import requests
import json
from typing import List
from flask import request, jsonify
from base_a2a_server import BaseA2AServer

class StockA2AServer(BaseA2AServer):
    """Stock market agent that provides financial analysis and market data"""
    
    def __init__(self, agent_name: str, port: int, host: str = "0.0.0.0"):
        super().__init__(agent_name, port, host)
        self.market_data = {
            "stocks": {
                "AAPL": {"price": 175.43, "change": 2.15, "change_percent": 1.24, "volume": 45678900},
                "GOOGL": {"price": 142.67, "change": -1.23, "change_percent": -0.85, "volume": 23456700},
                "MSFT": {"price": 378.85, "change": 4.32, "change_percent": 1.15, "volume": 34567800},
                "TSLA": {"price": 248.50, "change": -5.67, "change_percent": -2.23, "volume": 56789000},
                "NVDA": {"price": 875.20, "change": 12.45, "change_percent": 1.44, "volume": 67890100}
            },
            "indices": {
                "S&P 500": {"value": 4567.89, "change": 15.67, "change_percent": 0.34},
                "NASDAQ": {"value": 14234.56, "change": 45.23, "change_percent": 0.32},
                "DOW": {"value": 34567.89, "change": 123.45, "change_percent": 0.36}
            },
            "market_sentiment": "bullish",
            "sector_performance": {
                "Technology": 1.2,
                "Healthcare": 0.8,
                "Finance": 0.5,
                "Energy": -0.3,
                "Consumer": 0.9
            }
        }
    
    def create_agent(self, system_prompt: str, tools: List[str] = None, model_id: str = "llama3.2:latest"):
        """Create the stock market agent"""
        stock_prompt = """You are a Stock Market Agent specialized in financial analysis and market intelligence. 
        
Your capabilities include:
- Providing real-time stock prices and market data
- Analyzing market trends and patterns
- Explaining financial concepts and terminology
- Making investment recommendations (for educational purposes)
- Interpreting market sentiment and indicators

Always be professional, accurate, and provide detailed financial analysis when requested.
Use the available market data to answer questions about stocks, indices, and market conditions.
Remember to include appropriate disclaimers about investment risks."""
        
        super().create_agent(stock_prompt, tools, model_id)
    
    def setup_routes(self):
        """Setup stock market-specific routes"""
        super().setup_routes()
        
        @self.app.route('/stocks/<symbol>', methods=['GET'])
        def get_stock_data(symbol):
            """Get specific stock data"""
            symbol = symbol.upper()
            if symbol in self.market_data["stocks"]:
                return jsonify({
                    "agent_name": self.agent_name,
                    "symbol": symbol,
                    "data": self.market_data["stocks"][symbol],
                    "status": "success"
                })
            else:
                return jsonify({
                    "error": f"Stock symbol {symbol} not found",
                    "status": "error"
                }), 404
        
        @self.app.route('/stocks', methods=['GET'])
        def get_all_stocks():
            """Get all stock data"""
            return jsonify({
                "agent_name": self.agent_name,
                "stocks": self.market_data["stocks"],
                "status": "success"
            })
        
        @self.app.route('/indices', methods=['GET'])
        def get_market_indices():
            """Get market indices"""
            return jsonify({
                "agent_name": self.agent_name,
                "indices": self.market_data["indices"],
                "status": "success"
            })
        
        @self.app.route('/analysis/trend', methods=['POST'])
        def analyze_trend():
            """Analyze market trends"""
            try:
                data = request.get_json()
                timeframe = data.get('timeframe', 'daily')
                
                analysis = self._analyze_market_trend(timeframe)
                
                return jsonify({
                    "agent_name": self.agent_name,
                    "timeframe": timeframe,
                    "analysis": analysis,
                    "status": "success"
                })
            except Exception as e:
                return jsonify({
                    "error": str(e),
                    "status": "error"
                }), 500
        
        @self.app.route('/analysis/sector', methods=['POST'])
        def analyze_sector():
            """Analyze sector performance"""
            try:
                data = request.get_json()
                sector = data.get('sector', 'all')
                
                analysis = self._analyze_sector_performance(sector)
                
                return jsonify({
                    "agent_name": self.agent_name,
                    "sector": sector,
                    "analysis": analysis,
                    "status": "success"
                })
            except Exception as e:
                return jsonify({
                    "error": str(e),
                    "status": "error"
                }), 500
    
    def _analyze_market_trend(self, timeframe):
        """Analyze market trends"""
        stocks = self.market_data["stocks"]
        positive_movers = sum(1 for stock in stocks.values() if stock["change"] > 0)
        total_stocks = len(stocks)
        
        trend_strength = "strong" if positive_movers > total_stocks * 0.7 else "moderate" if positive_movers > total_stocks * 0.5 else "weak"
        
        return {
            "positive_movers": positive_movers,
            "total_stocks": total_stocks,
            "trend_strength": trend_strength,
            "market_sentiment": self.market_data["market_sentiment"],
            "recommendation": "Consider buying opportunities" if trend_strength == "strong" else "Exercise caution"
        }
    
    def _analyze_sector_performance(self, sector):
        """Analyze sector performance"""
        if sector == "all":
            sectors = self.market_data["sector_performance"]
            best_sector = max(sectors.items(), key=lambda x: x[1])
            worst_sector = min(sectors.items(), key=lambda x: x[1])
            
            return {
                "sectors": sectors,
                "best_performer": best_sector,
                "worst_performer": worst_sector,
                "overall_sentiment": "positive" if best_sector[1] > 0 else "negative"
            }
        else:
            if sector in self.market_data["sector_performance"]:
                performance = self.market_data["sector_performance"][sector]
                return {
                    "sector": sector,
                    "performance": performance,
                    "outlook": "positive" if performance > 0 else "negative",
                    "recommendation": "Consider investments" if performance > 0.5 else "Avoid for now"
                }
            else:
                return {"error": f"Sector {sector} not found"}

def main():
    """Main function to start the stock market agent server"""
    print("📈 Starting Stock Market Agent A2A Server...")
    
    # Create and start the stock market agent
    server = StockA2AServer("Stock Market Agent", 8004)
    
    # Create the agent with financial analysis tools
    server.create_agent(
        system_prompt="Financial analysis and market intelligence specialist",
        tools=["current_time", "think"],
        model_id="llama3.2:latest"
    )
    
    # Register with agent registry
    try:
        registry_url = "http://localhost:5010/agents"
        agent_data = {
            "id": "stock",
            "name": "Stock Market Agent",
            "description": "Financial analysis and market intelligence specialist",
            "url": "http://localhost:8004",
            "capabilities": ["stock_analysis", "market_trends", "financial_data", "current_time", "think"],
            "status": "active"
        }
        response = requests.post(registry_url, json=agent_data)
        if response.status_code == 200:
            print("✅ Stock Market Agent registered with registry")
        else:
            print(f"⚠️  Failed to register with registry: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Could not register with registry: {e}")
    
    print(f"📈 Stock Market Agent running on port 8004")
    print("📈 Available endpoints:")
    print("   • GET  /health - Health check")
    print("   • GET  /capabilities - Agent capabilities")
    print("   • POST /execute - Execute financial tasks")
    print("   • POST /a2a/message - A2A communication")
    print("   • GET  /stocks/<symbol> - Get specific stock data")
    print("   • GET  /stocks - Get all stock data")
    print("   • GET  /indices - Get market indices")
    print("   • POST /analysis/trend - Analyze market trends")
    print("   • POST /analysis/sector - Analyze sector performance")
    
    # Start the server
    server.run()

if __name__ == "__main__":
    main()
