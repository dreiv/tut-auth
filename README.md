# Auth Lab: Basic, Bearer, and JWT

A hands-on collection of authentication demos exploring the evolution of web security: from simple **Basic Auth** to **Stateful Sessions** and **Stateless JWTs**.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository and install dependencies
npm install

```

---

## 📚 The Authentication Roadmap

Each module builds on the previous one to solve a specific security or scaling challenge.

| Module                                                               | Strategy                | Key Concept                                                      |
| -------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------- |
| **[01-Basic Auth](https://www.google.com/search?q=./01-basic-auth)** | `Authorization: Basic`  | Credentials sent on every request. Simple but hard to "log out." |
| **[02-Bearer Opaque]()**                                             | `Authorization: Bearer` | Stateful sessions. Server stores a random token in a Map/DB.     |
| **[03-JWT Auth]()**                                                  | `Authorization: Bearer` | Stateless tokens. Server verifies a cryptographic signature.     |

---

## 🛠️ How to Run

This project uses `tsx` for the TypeScript environment and `concurrently` to launch both the API and the Interactive Client with a single command.

### 1. Basic Auth Demo

```bash
npm run dev:1

```

- **Server**: `http://localhost:3001`
- **Client**: `http://localhost:3000` (via live-server)

### 2. Bearer Opaque Token Demo

```bash
npm run dev:2

```

- **Server**: `http://localhost:3002`
- **Client**: `http://localhost:3001` (via live-server)

### 3. JWT (JSON Web Token) Demo

```bash
npm run dev:3

```

- **Server**: `http://localhost:3003`
- **Client**: `http://localhost:3004` (via live-server)

---

## 💡 Learning Objectives

While running these demos, pay close attention to the **Terminal Logs** and the **Network Tab** in your browser:

- **Watch the logs** to see when the server hits the "Database" (Map) versus when it just verifies a signature.
- **Experiment with the "Tamper" buttons** in the JWT demo to see how cryptographic signing prevents data modification.
- **Observe the Revocation problem**: Notice how an Opaque token can be killed instantly, while a JWT lives on until it naturally expires.

For detailed API documentation and deep-dives into the pros/cons of each method, check the **README.md** inside each folder.

---

### Pro-Tip: Running Manually

If you prefer to run only the server without the auto-reloading client:
`npx tsx watch 02-bearer-opaque/server.ts`
