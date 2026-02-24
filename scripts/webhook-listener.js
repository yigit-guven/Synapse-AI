const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

// Configuration - Use environment variables or change these defaults
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'your_secret_here';
const COMMAND = process.env.WEBHOOK_COMMAND || 'bash /root/deploy.sh';

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'];

            if (!signature) {
                console.error('No signature found');
                res.writeHead(401);
                return res.end('No signature');
            }

            const hmac = crypto.createHmac('sha256', SECRET);
            const digest = 'sha256=' + hmac.update(body).digest('hex');

            if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
                console.log(`Signature verified. Executing: ${COMMAND}`);

                res.writeHead(200);
                res.end('Deployment started');

                // Execute the command
                exec(COMMAND, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Execution error: ${error}`);
                        return;
                    }
                    console.log(`STDOUT: ${stdout}`);
                    if (stderr) console.error(`STDERR: ${stderr}`);
                    console.log('Deployment command finished.');
                });
            } else {
                console.error('Signature mismatch');
                res.writeHead(403);
                res.end('Forbidden');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}`);
    console.log(`Waiting for GitHub events at /webhook`);
});
