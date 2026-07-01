import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { username: string; role: string };
}

const app = express();
const PORT = 3003;
const JWT_SECRET = "super-secret-key-only-the-server-knows";

app.use(cors()).use(express.json());

const demoTasks = [
  { id: 1, title: "Learn stateless verification", completed: true },
  { id: 2, title: "Understand cryptography secrets", completed: false },
];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "secret123") {
    // The user's metadata we want to include directly inside the token
    const payload = { username, role: "admin" };

    // jwt.sign wraps this payload, adds standard header configuration,
    // and seals it using our JWT_SECRET.
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ access_token: token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedPayload = jwt.verify(token, JWT_SECRET) as {
      username: string;
      role: string;
    };

    req.user = decodedPayload;
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or expired token" });
  }
}

app.get("/tasks", authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    message: `Hello ${req.user?.username} (${req.user?.role})`,
    tasks: demoTasks,
  });
});

app.listen(PORT, () =>
  console.log(`🚀 JWT Server running on http://localhost:${PORT}`),
);
