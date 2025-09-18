FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose ports
EXPOSE 3000 5000

# Create startup script
RUN echo '#!/bin/bash\n\
python backend/simple_api.py &\n\
python -m http.server 3000 --directory frontend &\n\
wait' > start.sh && chmod +x start.sh

CMD ["./start.sh"]
