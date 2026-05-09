# Basic Authentication Demo

## What is Basic Auth?

HTTP Basic Authentication sends credentials (`username:password`) encoded in **Base64** with every request in the `Authorization` header.

> **⚠️ Critical Warning:** Base64 is **NOT** encryption. It is like writing your password in a different font—anyone who intercepts the header can decode it instantly.

---

## Key Characteristics

| Pros                                                            | Cons & Risks                                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Simple:** Easy to implement and built into the HTTP standard. | **Insecure over HTTP:** Credentials are sent in plain sight; must use HTTPS.              |
| **Stateless:** No session storage or database needed.           | **Every Single Request:** Credentials are sent, logged, and cached constantly.            |
| **Native:** Supported by all browsers and CLI tools.            | **No Revocation:** You can't "log out" or expire a session without changing the password. |

---

## When to Use

| ✅ Perfect For                  | ❌ Never Use For            |
| ------------------------------- | --------------------------- |
| Internal tools behind a VPN     | Production web apps         |
| Rapid dev environments          | Public user-facing services |
| Simple IoT device communication | Mobile applications         |

---

## Testing

"### Command Line

```bash
# Start server and client (from root)
npm run dev:1

# Test protected endpoint
curl -u admin:secret123 http://localhost:3001/tasks
```

**Credentials:** `admin` / `secret123`

### Browser Testing

Visit `http://localhost:3001/tasks`. The browser will natively prompt for credentials.

**Note on Logout:** To clear stored credentials during testing, you must close the browser tab or use an Incognito window. Clear Site Data in DevTools will not work."
