#!/bin/bash

# Synapse AI - VPS Setup Script
# Run this on your Ubuntu VPS to set up the environment and deploy the app.

set -e

echo "🧠 Starting Synapse AI VPS Setup..."

# 1. Update and Install Dependencies
echo "📦 Updating system and installing dependencies..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# 2. Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "✅ Docker is already installed."
fi

# 3. Install Ollama
if ! command -v ollama &> /dev/null; then
    echo "🦙 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama is already installed."
fi

# 4. Clone/Update Repository
REPO_DIR="Synapse-AI"
if [ -d "$REPO_DIR" ]; then
    echo "🔄 Updating existing repository..."
    cd "$REPO_DIR"
    git pull
else
    echo "📥 Cloning repository..."
    git clone https://github.com/yigit-guven/Synapse-AI.git
    cd "$REPO_DIR"
fi

# 5. Start Ollama (in background if needed)
echo "🦙 Checking Ollama service..."
if ! pgrep -x "ollama" > /dev/null; then
    echo "   Starting Ollama..."
    ollama serve &
    sleep 5
fi

# 6. Deploy with Docker Compose
echo "🚀 Deploying Synapse AI..."
# Ensure we are in the repo directory
cd "$(dirname "$0")/../Synapse-AI" || cd "Synapse-AI"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found in $(pwd)"
    exit 1
fi

echo "📂 Working directory: $(pwd)"

# Deploy
sudo docker compose -f docker-compose.yml up -d --build

echo "
🎉 Deployment Complete!

Access your Synapse AI dashboard at:
http://$(curl -s ifconfig.me):8501

Make sure port 8501 is allowed in your firewall:
sudo ufw allow 8501/tcp
"
