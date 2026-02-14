# Synapse AI - VPS Deployment Guide

This guide details how to deploy Synapse AI on a Linux VPS (e.g., Ubuntu 22.04).

## Quick Start (Automated Script)

The easiest way to deploy is using our setup script.

1.  **Download and Run the Script**:
    ```bash
    curl -O https://raw.githubusercontent.com/yigit-guven/Synapse-AI/main/scripts/setup_vps.sh
    chmod +x setup_vps.sh
    ./setup_vps.sh
    ```
    *Note: If the repo is private or you haven't pushed yet, you can copy the script content manually.*

## Manual Installation

If you prefer to install manually, follow these steps.

### 1. Install Docker & Ollama

### Install Docker
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker packages
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Install & Configure Ollama
Ollama needs to run on the host (or in a separate container) and be accessible to the Synapse AI container.

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve
```

**Important**: By default, Ollama binds to `127.0.0.1`. To allow the Docker container to access it, you might need to configure it to listen on all interfaces or use the host networking driver. 
For simplicity in this guide, we use `host.docker.internal` mapping in `docker-compose.yml`, which works out-of-the-box on many setups, but on a raw Linux VPS, you may need to run Ollama with `OLLAMA_HOST=0.0.0.0` environment variable:

```bash
# Edit systemd service or run manually like:
OLLAMA_HOST=0.0.0.0 ollama serve
```
*Security Warning: exposes Ollama to the internet if not firewalled.*

## 2. Deploy Synapse AI

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yigit-guven/Synapse-AI.git
    cd Synapse-AI
    ```

2.  **Start the Application**
    ```bash
    docker compose up -d --build
    ```
    *Note: Use `docker compose` (v2) or `docker-compose` (v1) depending on your version.*

## 3. Configuration

### Environment Variables
You can create a `.env` file in the root directory to override defaults:

```bash
OLLAMA_BASE_URL=http://172.17.0.1:11434  # Docker host IP on Linux is often this
CHROMA_DB_PATH=/app/data/chroma
```

### Accessing the UI
Open your browser and navigate to:
`http://<your-vps-ip>:8501`

## 4. Web Ingestion

Once running, you can ingest documentation from websites directly:
1.  Paste a URL (e.g., `https://yigit-guven.github.io/some-project/`) into the **Web Ingestion** field in the sidebar.
2.  Click **Ingest URL**.
3.  Query the content immediately.

## 5. Security

*   **Firewall**: Use `ufw` to restrict ports. Only open 8501 if you need public access, or use SSH tunneling for private access.
    ```bash
    sudo ufw allow 22/tcp
    sudo ufw allow 8501/tcp
    sudo ufw enable
    ```
*   **HTTPS**: For production use, put Synapse AI behind a reverse proxy like Nginx or Traefik with SSL termination (Let's Encrypt).
