export interface WorkflowPreset {
  id: string;
  title: string;
  category: "STANDARD" | "MATRIX" | "MONOREPO" | "DIAGNOSTICS";
  description: string;
  nodeCount: number;
  tags: string[];
  yaml: string;
}

export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: "prod-full-pipeline",
    title: "Standard Enterprise Release Flow",
    category: "STANDARD",
    description:
      "A 5-job pipeline covering linting, testing, parallel artifact building, Trivy security scanning, and Kubernetes deployment.",
    nodeCount: 5,
    tags: ["FAN-OUT", "FAN-IN", "PRODUCTION"],
    yaml: `name: Production CI/CD Pipeline

on:
  push:
    branches: [ "main" ]

jobs:
  lint:
    name: Code Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run ESLint
        run: npm run lint

  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: [lint]
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: npm test

  build:
    name: Build Artifacts
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - name: Compile Bundle
        run: npm run build

  security:
    name: Security Vulnerability Scan
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - name: Container Audit
        run: npx trivy fs .

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, security]
    steps:
      - uses: actions/checkout@v4
      - name: Rollout Status
        run: kubectl rollout status deployment/app
`,
  },
  {
    id: "matrix-multi-os",
    title: "Cross-Platform Build Matrix",
    category: "MATRIX",
    description:
      "Multi-runner parallel jobs evaluating packages simultaneously on Linux, Windows, and macOS before synthesizing results.",
    nodeCount: 5,
    tags: ["PARALLEL", "MATRIX", "MULTI-RUNNER"],
    yaml: `name: Cross-Platform Matrix

on:
  pull_request:
    branches: [ "main" ]

jobs:
  bootstrap:
    name: Environment Setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify Config
        run: echo "Environment Verified"

  build-linux:
    name: Build on Ubuntu
    runs-on: ubuntu-latest
    needs: [bootstrap]
    steps:
      - uses: actions/checkout@v4
      - name: Compile
        run: make build-linux

  build-windows:
    name: Build on Windows
    runs-on: windows-latest
    needs: [bootstrap]
    steps:
      - uses: actions/checkout@v4
      - name: Compile
        run: powershell ./build.ps1

  build-macos:
    name: Build on macOS
    runs-on: macos-latest
    needs: [bootstrap]
    steps:
      - uses: actions/checkout@v4
      - name: Compile
        run: make build-darwin

  sign-binaries:
    name: Aggregate & Sign
    runs-on: ubuntu-latest
    needs: [build-linux, build-windows, build-macos]
    steps:
      - uses: actions/checkout@v4
      - name: Sign Releases
        run: echo "Sign and release multi-platform binaries"
`,
  },
  {
    id: "monorepo-services",
    title: "Monorepo Service Orchestration",
    category: "MONOREPO",
    description:
      "Independent microservice roots running build pipelines concurrently before joining at an end-to-end integration test stage.",
    nodeCount: 5,
    tags: ["DISJOINT ROOTS", "E2E TEST", "MICROSERVICES"],
    yaml: `name: Monorepo Orchestration

on:
  push:
    branches: [ "main" ]

jobs:
  auth-service:
    name: Build Auth Microservice
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Compile Auth
        run: npm --prefix services/auth run build

  billing-service:
    name: Build Billing Microservice
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Compile Billing
        run: npm --prefix services/billing run build

  frontend-client:
    name: Build Web Client
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Compile Frontend
        run: npm --prefix apps/web run build

  e2e-integration:
    name: End-to-End Suite
    runs-on: ubuntu-latest
    needs: [auth-service, billing-service, frontend-client]
    steps:
      - uses: actions/checkout@v4
      - name: Cypress E2E
        run: npm run test:e2e

  release-staging:
    name: Push Staging Release
    runs-on: ubuntu-latest
    needs: [e2e-integration]
    steps:
      - uses: actions/checkout@v4
      - name: Tag Image
        run: echo "Staging release triggered"
`,
  },
  {
    id: "diagnostics-fault-lab",
    title: "Fault Lab (Cycle + Phantom Node)",
    category: "DIAGNOSTICS",
    description:
      "Testbed workflow with cyclic dependencies (A ⇄ B), missing upstream nodes, missing steps, and unrecognized runner keys.",
    nodeCount: 3,
    tags: ["CYCLE VIOLATION", "GHOST JOB", "INTEGRITY TEST"],
    yaml: `name: Topology Fault Lab

on:
  push:
    branches: [ "main" ]

jobs:
  lint:
    name: Syntax Validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Linter
        run: npm run lint

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: [deploy, phantom_db_provisioner]
    steps:
      - name: Run Test Suite
        run: npm test

  deploy:
    name: Production Release
    runs-on: unsupported-arm-runner
    needs: [test]
`,
  },
];
