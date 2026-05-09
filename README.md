# auth-basic-sessions-jwt

A collection of demos exploring different authentication methods: Basic Auth, Opaque Bearer Tokens, and JWT.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [npm](https://www.npmjs.com/) installed

"### Installation

```bash
npm install
```

## 📚 Authentication Demos

Each folder contains a separate implementation of an authentication strategy:

1. **[Basic Authentication](./01-basic-auth)**: Simple username/password auth using the `Authorization: Basic` header.
2. **[Bearer Opaque Tokens](./02-bearer-opaque)**: Session-based authentication using random server-side tokens.

## 🛠️ How to Run

This project uses `tsx` and `concurrently` to run the servers and clients simultaneously. Use the following npm scripts from the root directory:

### 1. Basic Auth Demo

```bash
npm run dev:1
```

- **Server**: `http://localhost:3001`
- **Client**: Opens automatically via `live-server`

### 2. Bearer Token Demo

```bash
npm run dev:2
```

- **Server**: `http://localhost:3002`
- **Client**: Opens automatically via `live-server`

See the README in each folder for detailed testing instructions and API endpoints."
