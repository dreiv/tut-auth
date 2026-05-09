# Security Lab: XSS & CSRF

## The Core Concept

Tokens are sensitive. If they are stolen, an attacker becomes the user. This lab explores the two most common web attacks and their modern defenses.

---

## 🧪 Demo 1: XSS (Cross-Site Scripting)

**The Vulnerability:** Storing tokens in `localStorage`.

1. Run `dev:4`.
2. Open `vulnerable-client.html`.
3. Login and click **Simulate XSS Theft**.
4. Notice how any script on the page can instantly steal the token.

**The Fix:** `httpOnly` Cookies.

1. Open `secure-client.html`.
2. Login and try to steal the token via `document.cookie`.
3. The attack fails because the browser hides the cookie from JavaScript.

---

## 🧪 Demo 2: CSRF (Cross-Site Request Forgery)

**The Vulnerability:** Cookies are sent automatically by the browser, even if the request is triggered by a different website.

1. Stay logged in on `secure-client.html`.
2. Visit `http://localhost:3004` (Malicious site).
3. Click "Claim Prize."
4. Check your server logs. If `SameSite` is not set, a new task was created without your permission!

**The Fix:** `SameSite=Strict`.

- Setting the cookie to `Strict` tells the browser: "Only send this cookie if the user is currently on MY website."

---

## Comparison Table

| Attack   | Target                              | Primary Defense               |
| -------- | ----------------------------------- | ----------------------------- |
| **XSS**  | Stealing the token string           | `httpOnly` Flag               |
| **CSRF** | Using the token without stealing it | `SameSite` Flag & CSRF Tokens |

---

### Credentials

- **Username:** `admin`
- **Password:** `secret123`
