# --- STAGE 1: Build the Frontend ---
FROM node:18-alpine as frontend_build
WORKDIR /app/frontend

RUN apk update && apk upgrade --no-cache

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source code and build
COPY frontend/ ./
RUN npm run build

# --- STAGE 2: Setup the Backend & Final Image ---
FROM python:3.11-slim
WORKDIR /app/backend

# Install system dependencies (e.g. libgomp1 is required for XGBoost)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend package files and install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy the built frontend from Stage 1 into the correct path for the server
COPY --from=frontend_build /app/frontend/build ../frontend/build

# Expose the port the app runs on (Flask default is 5000)
EXPOSE 5000

# Start the application
CMD ["python", "app.py"]
