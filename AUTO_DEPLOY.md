# Automated GitHub Deployment Setup

This guide will help you set up an automated deployment system on your Ubuntu VPS. This system will listen for GitHub "push" events and automatically pull the latest code and restart your application.

## 1. Prerequisites

-   **Node.js**: Ensure Node.js is installed on your VPS.
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

## 2. Setup the Listener

The listener files are located in your project's `scripts` folder. You need to get them onto your VPS.

### Option A: Use Git (Recommended)
Since you've already cloned the repo on your VPS, simply push these new files to GitHub from your local machine, then pull them on your VPS:
1. **Local**: `git add . && git commit -m "Add auto-deploy scripts" && git push origin main`
2. **VPS**: `cd Synapse-AI && git pull origin main`

### Option B: Use SCP (From your local machine)
If you want to copy them directly without pushing to GitHub yet:
```bash
scp scripts/webhook-listener.js scripts/deploy.sh <user>@<your-vps-ip>:/home/<user>/Synapse-AI/scripts/
```

### Option C: Manual Creation (On VPS)
If you prefer to copy-paste the content:
1. Open a blank file: `nano scripts/webhook-listener.js`
2. Paste the code from your local `scripts/webhook-listener.js`.
3. Save (Ctrl+O) and Exit (Ctrl+X).
4. Repeat for `scripts/deploy.sh`.

### Finally: Make scripts executable
```bash
chmod +x scripts/deploy.sh
```

## 3. Configure GitHub Webhook

1.  Go to your GitHub repository: **Settings > Webhooks > Add webhook**.
2.  **Payload URL**: `http://<your-vps-ip>:9000/webhook`
3.  **Content type**: `application/json`
4.  **Secret**: Generate a strong secret by running this on your computer or VPS:
    ```bash
    openssl rand -hex 20
    ```
    **Copy the output** and paste it into the "Secret" field on GitHub.
5.  **Important**: Keep this secret handy! You will need to paste it into the `Environment=WEBHOOK_SECRET=...` line in the service file (Step 4 below).
6.  **Which events?**: Just the `push` event.
7.  Click **Add webhook**.

## 4. Run as a System Service (systemd)

To keep the listener running in the background and restart it on reboot, you must place the service file in the system directory.

1.  **Move or create** the service file in the correct location:
    ```bash
    sudo nano /etc/systemd/system/github-webhook.service
    ```
    *(If you already created it in your home folder, run `sudo mv github-webhook.service /etc/systemd/system/`)*

2.  **Edit the content** to match your actual paths. Based on your folder structure, it should look like this:
    ```ini
    [Unit]
    Description=GitHub Webhook Listener
    After=network.target

    [Service]
    Type=simple
    User=root
    WorkingDirectory=/root
    Environment=WEBHOOK_SECRET=your_secret_here
    Environment=WEBHOOK_PORT=9000
    Environment="WEBHOOK_COMMAND=bash /root/deploy.sh"
    ExecStart=/usr/bin/node /root/webhook-listener.js
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```
3.  **Start and enable** the service:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl start github-webhook
    sudo systemctl enable github-webhook
    ```

## 5. Security (UFW)

Ensure port 9000 is open in your firewall:
```bash
sudo ufw allow 9000/tcp
```

## 6. Testing

You can simulate a webhook call to verify your setup:
```bash
./scripts/test-webhook.sh
```
*(See `scripts/test-webhook.sh` for details)*
