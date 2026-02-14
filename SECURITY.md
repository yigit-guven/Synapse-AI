# Security Policy

## Core Philosophy: Zero-Leakage

Synapse AI is designed with a "Zero-Leakage" philosophy. The primary security feature of this software is that **it does not require external API calls** to third-party model providers for inference or embedding. All data processing happens locally on your machine or private VPS.

## Supported Versions

| Version | Supported |
| :--- | :--- |
| 0.1.x | Yes |
| < 0.1 | No |

## Reporting a Vulnerability

If you discover a security vulnerability within Synapse AI, please **DO NOT** create a public GitHub issue.

1.  **Email**: Please report sensitive bugs directly to the maintainers via **contact@yigitguven.net**.
2.  **Details**: Please provide a detailed description of the vulnerability and steps to reproduce it.
3.  **Timeline**: We will acknowledge receipt of your report within 48 hours and strive to provide a fix or workaround as soon as possible.

## Security Best Practices for Deployment

Since Synapse AI is intended to be self-hosted, the security of the data also depends on the host environment:

*   **VPS Security**: Ensure your Linux VPS is hardened (firewalls configured, SSH keys used).
*   **Docker Containers**: We recommend running Synapse AI in isolated Docker containers to prevent unauthorized access to the host file system.
*   **Input Sanitization**: While this is an internal tool, always treat document inputs as potentially untrusted if they come from outside your organization.

## Disclaimer

This software is provided "as is", without warranty of any kind. While we strive to ensure data privacy through local processing, the user is responsible for the security of the infrastructure on which Synapse AI is deployed.
