#!/bin/bash

# Configuration
URL="http://localhost:9000/webhook"
SECRET="your_secret_here" # Must match the one in your listener
PAYLOAD='{"ref": "refs/heads/main", "repository": {"name": "Synapse-AI"}}'

# Generate HMAC SHA256 signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

echo "Testing Webhook at $URL"
echo "Payload: $PAYLOAD"
echo "Signature: sha256=$SIGNATURE"

curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD" \
  "$URL"

echo -e "\nCheck the listener logs to see if the command was executed."
