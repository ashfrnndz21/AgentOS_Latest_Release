"""
Weather Agent A2A Server
Independent A2A server for weather-related tasks
"""

import requests
import json
from typing import List
from flask import request, jsonify
from base_a2a_server import BaseA2AServer

class WeatherA2AServer(BaseA2AServer):
    """Weather agent that provides weather information and analysis"""
    
    def __init__(self, agent_name: str, port: int, host: str = "0.0.0.0"):
        super().__init__(agent_name, port, host)
        self.weather_data = {
            "current_conditions": {
                "temperature": 72,
                "humidity": 65,
                "condition": "Partly Cloudy",
                "wind_speed": 8,
                "location": "San Francisco, CA"
            },
            "forecast": [
                {"day": "Today", "high": 75, "low": 58, "condition": "Partly Cloudy"},
                {"day": "Tomorrow", "high": 78, "low": 62, "condition": "Sunny"},
                {"day": "Wednesday", "high": 73, "low": 59, "condition": "Rainy"},
                {"day": "Thursday", "high": 70, "low": 55, "condition": "Cloudy"},
                {"day": "Friday", "high": 76, "low": 60, "condition": "Sunny"}
            ]
        }
    
    def create_agent(self, system_prompt: str, tools: List[str] = None, model_id: str = "llama3.2:latest"):
        """Create the weather agent"""
        weather_prompt = """You are a Weather Agent specialized in providing weather information and analysis. 
        
Your capabilities include:
- Providing current weather conditions
- Sharing weather forecasts
- Analyzing weather patterns
- Explaining weather phenomena
- Making weather-based recommendations

Always be helpful, accurate, and provide detailed weather information when requested.
Use the available weather data to answer questions about current conditions, forecasts, and weather patterns."""

        super().create_agent(weather_prompt, tools, model_id)
    
    def setup_routes(self):
        """Setup weather-specific routes"""
        super().setup_routes()
        
        @self.app.route('/weather/current', methods=['GET'])
        def get_current_weather():
            """Get current weather conditions"""
            return jsonify({
                "agent_name": self.agent_name,
                "weather": self.weather_data["current_conditions"],
                "status": "success"
            })
        
        @self.app.route('/weather/forecast', methods=['GET'])
        def get_weather_forecast():
            """Get weather forecast"""
            return jsonify({
                "agent_name": self.agent_name,
                "forecast": self.weather_data["forecast"],
                "status": "success"
            })
        
        @self.app.route('/weather/analyze', methods=['POST'])
        def analyze_weather():
            """Analyze weather patterns"""
            try:
                data = request.get_json()
                analysis_type = data.get('type', 'general')
                
                if analysis_type == 'temperature_trend':
                    analysis = self._analyze_temperature_trend()
                elif analysis_type == 'precipitation_risk':
                    analysis = self._analyze_precipitation_risk()
                else:
                    analysis = self._analyze_general_patterns()
                
                return jsonify({
                    "agent_name": self.agent_name,
                    "analysis_type": analysis_type,
                    "analysis": analysis,
                    "status": "success"
                })
            except Exception as e:
                return jsonify({
                    "error": str(e),
                    "status": "error"
                }), 500
    
    def _analyze_temperature_trend(self):
        """Analyze temperature trends"""
        temps = [day["high"] for day in self.weather_data["forecast"]]
        avg_temp = sum(temps) / len(temps)
        trend = "increasing" if temps[-1] > temps[0] else "decreasing"
        
        return {
            "average_temperature": round(avg_temp, 1),
            "trend": trend,
            "temperature_range": f"{min(temps)}°F - {max(temps)}°F",
            "recommendation": "Dress in layers" if trend == "increasing" else "Wear warmer clothing"
        }
    
    def _analyze_precipitation_risk(self):
        """Analyze precipitation risk"""
        rainy_days = [day for day in self.weather_data["forecast"] if "rain" in day["condition"].lower()]
        risk_level = "high" if len(rainy_days) > 2 else "medium" if len(rainy_days) > 0 else "low"
        
        return {
            "rainy_days": len(rainy_days),
            "risk_level": risk_level,
            "recommendation": "Carry an umbrella" if risk_level != "low" else "No umbrella needed"
        }
    
    def _analyze_general_patterns(self):
        """Analyze general weather patterns"""
        conditions = [day["condition"] for day in self.weather_data["forecast"]]
        most_common = max(set(conditions), key=conditions.count)
        
        return {
            "dominant_condition": most_common,
            "variability": "high" if len(set(conditions)) > 3 else "low",
            "overall_outlook": "pleasant" if "sunny" in most_common.lower() else "variable"
        }

def main():
    """Main function to start the weather agent server"""
    print("🌤️  Starting Weather Agent A2A Server...")
    
    # Create and start the weather agent
    server = WeatherA2AServer("Weather Agent", 8003)
    
    # Create the agent with weather-specific tools
    server.create_agent(
        system_prompt="Weather analysis and forecasting specialist",
        tools=["current_time", "think"],
        model_id="llama3.2:latest"
    )
    
    # Register with agent registry
    try:
        registry_url = "http://localhost:5010/agents"
        agent_data = {
            "id": "weather",
            "name": "Weather Agent",
            "description": "Weather information and analysis specialist",
            "url": "http://localhost:8003",
            "capabilities": ["weather_analysis", "forecasting", "current_time", "think"],
            "status": "active"
        }
        response = requests.post(registry_url, json=agent_data)
        if response.status_code == 200:
            print("✅ Weather Agent registered with registry")
        else:
            print(f"⚠️  Failed to register with registry: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Could not register with registry: {e}")
    
    print(f"🌤️  Weather Agent running on port 8003")
    print("🌤️  Available endpoints:")
    print("   • GET  /health - Health check")
    print("   • GET  /capabilities - Agent capabilities")
    print("   • POST /execute - Execute weather tasks")
    print("   • POST /a2a/message - A2A communication")
    print("   • GET  /weather/current - Current weather")
    print("   • GET  /weather/forecast - Weather forecast")
    print("   • POST /weather/analyze - Weather analysis")
    
    # Start the server
    server.run()

if __name__ == "__main__":
    main()
