import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

interface AuthRequest extends Request {
  user?: {
    username: string;
  };
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()).use(express.json());

const demoTasks = [
  { id: 1, title: "My first task", completed: true },
  { id: 2, title: "My second task", completed: false },
];

/**
 * Decodes the Basic Auth header into a [username, password] tuple.
 */
function parseBasicAuth(header: string): [string, string] {
  const base64Credentials = header.split(" ")[1] ?? "";
  const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");

  return [username ?? "", password ?? ""];
}

/**
 * Middleware: Basic Authentication
 */
function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Node Tutorial"');
    return res.status(401).json({ error: "Authentication required" });
  }

  const [username, password] = parseBasicAuth(authHeader);

  if (username === "admin" && password === "secret123") {
    console.log(`[auth]: ${username} logged in via Basic Auth`);

    req.user = { username };
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Node Tutorial"');
  return res.status(401).json({ error: "Invalid username or password" });
}

// --- Routes ---

app.get("/", (_, res) => res.send("Server running!"));

app.get("/tasks", authenticate, (req: AuthRequest, res: Response) => {
  console.log(`[data]: Sending tasks to ${req.user?.username}`);
  res.json(demoTasks);
});

app.listen(PORT, () =>
  console.log(`🚀 Basic Auth Server: http://localhost:${PORT}`),
);
