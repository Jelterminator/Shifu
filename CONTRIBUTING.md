# Contributing to Shifu

Thank you for your interest in contributing to Shifu! We welcome contributions from the community properly.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Shifu.git
    cd Shifu
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up environment**:
    Copy `.env.example` to `.env` and fill in necessary values (though for core logic, defaults often suffice).
    ```bash
    cp .env.example .env
    ```

## Development Workflow

-   **Branching**: specific feature branches off `develop` (e.g., `feature/amazing-feature` or `fix/critical-bug`).
-   **Commits**: Use clear, descriptive commit messages.
-   **Linting**: Ensure your code passes linting checks before pushing.
    ```bash
    npm run lint:check
    ```
-   **Testing**: Add or update tests for your changes. Run the test suite to ensure no regressions.
    ```bash
    npm test
    ```

## Project Structure

-   `src/components`: Reusable UI components.
-   `src/screens`: Application screens.
-   `src/services`: Core business logic and AI services.
-   `src/db`: Database schema and repositories.
-   `src/stores`: Zustand state management.

## Pull Requests

1.  Push your branch to your fork.
2.  Open a Pull Request against the `develop` branch.
3.  Describe your changes clearly in the PR description.
4.  Ensure all CI checks pass.

## Code of Conduct

Please be respectful and kind to others in the community.
