#!/bin/bash

# Configuration
PROJECT_DIR="/root/Synapse-AI"

echo "--- Deployment started: $(date) ---"
echo "Target directory: $PROJECT_DIR"

# Go to project directory
cd "$PROJECT_DIR" || { echo "Error: Could not cd to $PROJECT_DIR"; exit 1; }

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Restart containers
echo "Building and restarting Docker containers..."
sudo docker compose up -d --build

echo "--- Deployment finished: $(date) ---"
