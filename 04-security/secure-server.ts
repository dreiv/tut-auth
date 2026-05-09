import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

interface AuthRequest extends Request {
  user?: any;
}

const app = express();
const PORT = process.env.PORT || 3004;
const JWT_SECRET = "security-is-hard-keep-it-secret";

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cookieParser())
  .use(cors({ origin: true, credentials: true })); // Crucial: Allows cookies to be sent cross-origin

const demoTasks = [
  { id: 1, title: "Learn XSS", completed: true },
  { id: 2, title: "Fix CSRF vulnerabilities", completed: false },
];

// --- Routes ---

/**
 * Login: Demonstrates setting an httpOnly Cookie
 */
app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "secret123") {
    const token = jwt.sign({ sub: "1", username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // 🛡️ The Secure Approach: httpOnly Cookie
    res.cookie("auth_token", token, {
      httpOnly: true, // 🚫 JavaScript cannot touch this! (Prevents XSS theft)
      secure: false, // Set to true in production (requires HTTPS)
      sameSite: "strict", // 🛡️ Prevents CSRF by blocking cross-site cookie sending
      maxAge: 3600000, // 1 hour
      path: "/",
    });

    console.log("[auth]: Token set in httpOnly cookie");

    // We also return the token in the body for the VULNERABLE localStorage demo
    return res.json({ message: "Login successful", access_token: token });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

/**
 * Middleware: Extracts JWT from either Cookie or Bearer Header
 */
function universalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Check cookie first, then fallback to header
  const token =
    req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("[auth]: No token found in cookie or header");
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("[auth]: Invalid token signature");
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/tasks", universalAuth, (_, res) => {
  res.json(demoTasks);
});

/**
 * CSRF Target: Malicious sites try to trigger this POST
 */
app.post("/tasks", universalAuth, (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  const newTask = {
    id: demoTasks.length + 1,
    title: title || "New Task",
    completed: false,
  };
  demoTasks.push(newTask);

  console.log(`[data]: Task created by ${req.user.username}: ${newTask.title}`);
  res.status(201).json(newTask);
});

app.listen(PORT, () =>
  console.log(`🚀 Secure Server: http://localhost:${PORT}`),
);
