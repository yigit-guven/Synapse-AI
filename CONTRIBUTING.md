# Contributing to Synapse AI

We welcome contributions to Synapse AI. This document outlines the process for contributing to the project, including reporting bugs, suggesting enhancements, and submitting pull requests.

## How to Contribute

### 1. Reporting Bugs
If you encounter a bug, please create a GitHub Issue with the following details:
*   **Title**: A concise description of the issue.
*   **Reproduction**: Step-by-step instructions to reproduce the error.
*   **Behavior**: A description of expected versus actual behavior.
*   **Environment**: Operating System, Python version, and hardware specifications.

### 2. Suggesting Enhancements
We welcome proposals for new features, particularly those that align with our core goals:
*   Optimization of RAG performance on low-resource hardware.
*   Enhanced handling of documents.
*   Implementation of new document parsers.

### 3. Pull Request Process
1.  Fork the repository and create a feature branch from `main`.
2.  If the change adds new functionality, include appropriate tests.
3.  Ensure the code adheres to the style guide.
4.  Verify that all linting checks pass.
5.  Submit the pull request for review.

## Development Standards

*   **Code Style**: Adhere to **PEP 8** standards for all Python code.
*   **Documentation**: Ensure all new functions and classes include docstrings detailing their purpose, arguments, and return values.
*   **Commit Messages**: Use clear, imperative mood commit messages (e.g., "Add PDF parser", "Fix vector dimension mismatch").

## Testing
Before submitting a pull request, run the test suite to ensure no regressions are introduced. Detailed testing instructions will be provided as the project infrastructure matures.
