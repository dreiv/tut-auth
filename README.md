# Auth Lab: From Basic to Beyond

A hands-on collection of authentication demos exploring the evolution of web security: from simple **Basic Auth** to **Stateful Sessions**, **Stateless JWTs**, and **Defense-in-Depth Security**.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Install all dependencies for the lab
npm install

```

---

## 📚 The Authentication Roadmap

Each module builds on the previous one to solve a specific security or scaling challenge.

| Module                                                                     | Strategy                | Key Concept                                        | Use Case Hint                               |
| -------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------- | ------------------------------------------- |
| **[01-Basic Auth](https://www.google.com/search?q=./01-basic-auth)**       | `Authorization: Basic`  | Credentials sent on every request.                 | Internal tools, VPNs, or simple IoT.        |
| **[02-Bearer Opaque](https://www.google.com/search?q=./02-bearer-opaque)** | `Authorization: Bearer` | Stateful. Server stores a random string in a DB.   | Most standard web apps; easy revocation.    |
| **[03-JWT Auth](https://www.google.com/search?q=./03-jwt)**                | `Authorization: Bearer` | Stateless. Data is inside the token via signature. | High-scale, microservices, or mobile APIs.  |
| **[04-Security Lab](https://www.google.com/search?q=./04-security)**       | `Cookie: httpOnly`      | Defense-in-depth. Protecting tokens.               | Production apps requiring XSS/CSRF defense. |

---

## 🛠️ How to Run

Launch the API and Interactive Client simultaneously using these scripts:

### 1. Basic Auth Demo

`npm run dev:1`

- **Use when**: You need a 20-line solution for an internal dashboard behind a VPN.
- **Risk**: Base64 is **not** encryption; it’s just a different "font" for your password.

### 2. Bearer Opaque Token Demo

`npm run dev:2`

- **Use when**: You need **instant revocation** (e.g., a "Logout all devices" button).
- **Trade-off**: Requires a database lookup on _every single request_.

### 3. JWT (JSON Web Token) Demo

`npm run dev:3`

- **Use when**: You have thousands of users and want to avoid database bottlenecks.
- **Risk**: JWTs are like cash—if someone steals them, they can use them until they expire. There is no "Delete" button.

### 4. Security & Vulnerabilities Lab

`npm run dev:4`

- **The Lesson**: **HTTPS is mandatory** for all the above. Without it, you are broadcasting credentials to the world.

---

## 💡 Learning Objectives

While running these demos, pay close attention to your **Network Tab** (`F12`):

- **The "Envelope" Metaphor**: Think of `Bearer` as the envelope and the token as the content. The envelope tells the server _how_ to read it, while the token tells the server _who_ you are.
- **Tamperproof vs. Private**: In the JWT demo, notice that you can read the payload on [jwt.io](https://www.google.com/search?q=https://jwt.io) (it's not private), but you can't change it (it's tamperproof).
- **XSS Defense**: Observe how `httpOnly` cookies act as a vault that JavaScript cannot reach, stopping malicious scripts from stealing your session.
- **CSRF Defense**: See how `SameSite=Strict` ensures your browser only sends cookies when you are actually on the legitimate site, not a malicious "prize" page.

---

### Pro-Tip: Manual Server Watch

If you want to debug just the server without the browser client:
`npx tsx watch 04-security/secure-server.ts`
