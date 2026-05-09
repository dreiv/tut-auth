import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import cors from "cors";

interface Session {
  userId: number;
  username: string;
  createdAt: number;
  expiresAt: number;
}

interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors()).use(express.json());

// In-memory session storage (use actual DB/Redis in production)
const sessions = new Map<string, Session>();

const demoTasks = [
  { id: 1, title: "My first task", completed: true },
  { id: 2, title: "My second task", completed: false },
];

/**
 * Bearer Token Authentication Middleware
 * Validates the token against our "database" (the Map)
 */
function bearerAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1];
  const session = sessions.get(token);

  // Validation Logic
  if (!session) {
    console.log("[auth]: Invalid token lookup attempt");
    return res.status(401).json({ error: "Invalid token" });
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    console.log("[auth]: Expired token removed");
    return res.status(401).json({ error: "Token expired" });
  }

  console.log("Token valid, user:", session.username);
  req.user = { userId: session.userId, username: session.username };
  next();
}

// --- Routes ---

app.get("/", (_, res) => res.send("Server running!"));

app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  // hardcoded for demo
  if (username === "admin" && password === "secret123") {
    const token = crypto.randomBytes(32).toString("hex");

    sessions.set(token, {
      userId: 1,
      username: username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log("Token generated and stored");
    console.log("Current sessions:", sessions.size);

    return res.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: 86400,
    });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

app.get("/tasks", bearerAuth, (_, res: Response) => {
  res.json(demoTasks);
});

app.post("/logout", bearerAuth, (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    sessions.delete(token);
    console.log(`[auth]: Session destroyed. Active sessions: ${sessions.size}`);
  }

  res.json({ message: "Logged out successfully" });
});

app.listen(PORT, () =>
  console.log(`🚀 Bearer Token Server: http://localhost:${PORT}`),
);
