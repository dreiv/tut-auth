import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";

interface AuthRequest extends Request {
  user?: {
    username: string;
  };
}

interface Session {
  username: string;
  createdAt: Date;
  expiresAt: Date;
}

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors()).use(express.json());

// In-memory data stores
const demoTasks = [
  { id: 1, title: "Learn Opaque Tokens", completed: true },
  { id: 2, title: "Understand DB lookup overhead", completed: false },
];

// Memory Map simulating a central session store/database (e.g., Redis)
const sessionStore = new Map<string, Session>();

const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Middleware: Opaque Bearer Token Authentication
 */
function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or malformed authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not found in header" });
  }

  console.log(
    `[db-lookup]: Checking token session store for: ${token.substring(0, 8)}...`,
  );
  const session = sessionStore.get(token);

  if (!session) {
    return res.status(401).json({ error: "Invalid token or expired session" });
  }

  if (new Date() > session.expiresAt) {
    console.log(`[db-lookup]: Token expired. Cleaning up.`);
    sessionStore.delete(token); // Active cleanup
    return res.status(401).json({ error: "Token has expired" });
  }

  req.user = { username: session.username };
  return next();
}

// --- Routes ---

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "secret123") {
    const token = crypto.randomBytes(32).toString("hex");

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    sessionStore.set(token, {
      username,
      createdAt: now,
      expiresAt,
    });

    console.log(`[auth]: Created stateful session for ${username}`);
    return res.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: SESSION_DURATION_MS / 1000,
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

app.post("/logout", authenticate, (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization!;
  const token = authHeader.split(" ")[1]!;

  sessionStore.delete(token);
  console.log(`[auth]: ${req.user?.username} logged out. Token revoked.`);

  res.json({ message: "Successfully logged out. Token is now invalid." });
});

app.get("/tasks", authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    user: req.user?.username,
    tasks: demoTasks,
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Bearer Token Server: http://localhost:${PORT}`),
);
