# Bearer Token (Opaque) Demo

## What is Bearer Token Auth?

Unlike Basic Auth, where you send your password with every single request, Bearer Authentication allows you to **authenticate once and reuse a secure token**.

In this demo, we use **Opaque Tokens**: random strings that have no meaning on their own. They act like a "Claim Check" at a coat room; the token itself is just a number, but the server uses it to look up your "coat" (your user session) in its database.

---

## The "Scaling" Advantage

Moving from passwords to tokens provides **granular control** over security:

| Feature        | Basic Auth (Passwords)               | Bearer Tokens (Opaque)                  |
| -------------- | ------------------------------------ | --------------------------------------- |
| **Exposure**   | Password sent on every request       | Token used instead of password          |
| **Revocation** | Impossible without changing password | **Instant revocation** (Delete from DB) |
| **Control**    | Zero session control                 | **Full control** over expiry & activity |

---

## How It Works

1. **Login:** Server validates credentials, generates a `crypto.randomBytes` hex string, and stores it in a Map (acting as our database).
2. **Client Storage:** The client receives the token and includes it in the header: `Authorization: Bearer <token>`.
3. **Validation:** On every request, the server looks up the token in the database to verify the user exists and the token hasn't expired.
4. **Logout:** The server deletes the token from the database, rendering it useless immediately.

---

## Key Characteristics

### ✅ Pros

- **Instant Revocation:** You can "kill" a session server-side at any time. If a user's laptop is stolen, you just delete the token.
- **Granular Expiration:** Tokens can be set to expire after 1 hour, 1 day, or 1 week without affecting the user's actual password.
- **Security:** Even if a token is intercepted, your actual password remains safe behind the login wall.

### ❌ Cons

- **Database Overhead:** Requires a database lookup (latency) on every single API request.
- **Stateful:** The server must maintain a "list of truths" (session storage). This gets harder to manage across multiple global servers.

---

## Testing

### 1. Interactive Demo (Recommended)

1. Start the stack: `npm run dev:2`
2. Open the client in your browser (usually `http://localhost:3001`).
3. **The Workflow:** Login $\rightarrow$ Access Tasks $\rightarrow$ Logout $\rightarrow$ Try to access Tasks again. Notice that unlike Basic Auth, the logout actually works because the server "forgot" the token.

### 2. Command Line

```bash
# 1. Login to get your token
curl -X POST http://localhost:3003/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}'

# 2. Use that token for protected data
curl http://localhost:3003/tasks \
  -H "Authorization: Bearer <your-token-here>"

# 3. Revoke the token (Logout)
curl -X POST http://localhost:3003/logout \
  -H "Authorization: Bearer <your-token-here>"

```

---

# JWT (JSON Web Token) Demo

## What is JWT?

A **JWT** is a self-contained, digitally signed "Passport." Instead of the server looking you up in a database (like Opaque tokens), the server simply looks at the token, checks the signature to ensure it hasn't been tampered with, and reads the user data encoded directly inside it.

---

## How It Works

1. **Login:** Server creates a JSON object with user data (id, role), signs it with a `JWT_SECRET` key, and sends it to the client.
2. **Client Storage:** Client sends the token in: `Authorization: Bearer <jwt>`.
3. **Verification:** The server verifies the cryptographic signature. If the signature is valid, the server **trusts** the data inside without checking a database.
4. **Statelessness:** Since the data is in the token, the server doesn't need to "remember" the session.

---

## Token Structure: `header.payload.signature`

- **Header:** Metadata about the token (Algorithm used: `HS256`).
- **Payload:** The data! (Username, Role, Expiration time). This is **Base64 encoded**, meaning anyone can read it, but no one can change it without breaking the signature.
- **Signature:** A hash created by combining the header, payload, and your **Secret Key**.

---

## Key Characteristics

### ✅ Pros

- **Stateless:** Massive performance boost! No database lookup needed for authentication.
- **Scalable:** Great for microservices. Any server with the `Secret Key` can verify the user.
- **Self-Contained:** All the info the server needs (like `role: admin`) is right there in the token.

### ❌ Cons

- **The Revocation Problem:** You cannot "un-ring" a bell. Once a JWT is issued, it is valid until it expires. Logout on the client doesn't stop the token from working on the server.
- **Size:** JWTs are much longer than opaque tokens and add overhead to every request header.
- **Stale Data:** If you change a user's role in the DB, their current JWT still has the old role until it expires.

---

## Testing the "Stateless" Flow

### 1. Interactive Demo

1. Start the stack: `npm run dev:3`
2. Open the client (usually `http://localhost:3004`).
3. **Tampering Demo:** Use the "Tamper" button to change your role to `admin`. Try to send it. The server will reject it because your signature no longer matches the modified payload!
4. **Revocation Test:** Click Logout, then click "Re-use Dead Token." Notice the server **still accepts it**. This perfectly demonstrates the primary weakness of JWTs.

### 2. Command Line

```bash
# Login to get JWT
curl -X POST http://localhost:3003/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}'

# Use JWT (Watch server logs - notice no DB lookup!)
curl http://localhost:3003/tasks \
  -H "Authorization: Bearer <your-jwt>"

```

**Credentials:** `admin` / `secret123`

**Token Lifespan:** 1 hour (Stateless)
