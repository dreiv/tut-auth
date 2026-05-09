import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const demoTasks = [
  { id: 1, title: "My first task", completed: true },
  { id: 2, title: "My second task", completed: false },
];

/**
 * Decodes the Basic Auth header into a [username, password] tuple.
 */
function parseBasicAuth(header: string): [string, string] {
  const base64Credentials = header.split(" ")[1] || "";
  const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");
  return [username || "", password || ""];
}

/**
 * Middleware: Basic Authentication
 */
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Node Tutorial"');
    return res.status(401).json({ error: "Authentication required" });
  }

  const [username, password] = parseBasicAuth(authHeader);

  if (username === "admin" && password === "secret123") {
    console.log(`[auth]: ${username} accessed the resource`);
    return next();
  }

  res.status(401).json({ error: "Invalid username or password" });
}

app.get("/", (_, res) => res.send("Server running, Go to /tasks!"));
app.get("/tasks", authenticate, (_, res) => res.json(demoTasks));
app.listen(PORT, () =>
  console.log(`🚀 Basic Auth Server: http://localhost:${PORT}`),
);
