export const DEFAULT_WORKFLOW_YAML = `name: Production CI/CD Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  lint:
    name: Code Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run ESLint
        run: npm run lint

  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: [lint]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Test Environment
        run: npm test

  build:
    name: Build Artifacts
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - name: Build Production Bundle
        run: npm run build

  security:
    name: Vulnerability Scan
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - name: Trivy Security Scan
        run: npx trivy fs .

  deploy:
    name: Deploy to Kubernetes
    runs-on: ubuntu-latest
    needs: [build, security]
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Configure Kubectl
        uses: azure/setup-kubectl@v3
      - name: Rollout Status
        run: kubectl rollout status deployment/web
`;
