# Bearer Token (Opaque) Demo

## What is Bearer Token Auth?

Unlike Basic Auth, where you send your password every time, Bearer Authentication allows you to **authenticate once and reuse a token safely**. These are typically random "opaque" strings stored on the server.

---

## The "Scaling" Advantage

Moving from passwords to tokens provides **way more control**:

| Feature        | Basic Auth (Passwords)               | Bearer Tokens                           |
| -------------- | ------------------------------------ | --------------------------------------- |
| **Exposure**   | Password sent on every request       | Token used instead of password          |
| **Revocation** | Impossible without changing password | **Instant revocation** (delete from DB) |
| **Control**    | Zero session control                 | **Full session control** and expiration |

---

## How It Works

1. **Login:** Server validates credentials, generates a random token, and stores it in a database (like Redis or SQL).
2. **Client Storage:** The client receives the token and includes it in the header: `Authorization: Bearer <token>`.
3. **Validation:** On every request, the server looks up the token in the database to verify the user.
4. **Logout:** The server deletes the token from the database, rendering it useless immediately.

---

## Key Characteristics

### ✅ Pros

- **Instant Revocation:** You can "kill" a session server-side at any time.
- **Granular Expiration:** Tokens can be set to expire after 1 hour, 1 day, or 1 week.
- **Security:** Even if a token is stolen, your actual password remains safe and unexposed.

### ❌ Cons

- **Database Overhead:** Requires a database lookup on every single API request.
- **Stateful:** The server must maintain a list of active tokens (session storage).

---

## Testing

### Interactive Demo (Recommended)

1. Start the server and client (from root): `npm run dev:2`
2. Open `client.html` in your browser.
3. **The Workflow:** Login $\rightarrow$ Access Tasks $\rightarrow$ Logout $\rightarrow$ Try to access Tasks again. Notice that unlike Basic Auth, the logout actually works!

### Command Line

```bash
# 1. Login to get your token
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}'

# 2. Use that token for protected data
curl http://localhost:3001/tasks \
  -H "Authorization: Bearer <your-token-here>"

# 3. Revoke the token (Logout)
curl -X POST http://localhost:3001/logout \
  -H "Authorization: Bearer <your-token-here>"

```

**Credentials:** `admin` / `secret123`
