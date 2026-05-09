import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import cors from "cors";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = "your-secret-key-change-in-production";

app.use(cors()).use(express.json());

const demoTasks = [
  { id: 1, title: "Build authentication", completed: true },
  { id: 2, title: "Record demo", completed: false },
];

/**
 * JWT Authentication Middleware
 * No database lookup here! We just verify the signature.
 */
function jwtAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("[auth]: Verifying JWT signature (No DB lookup needed)");

    // This throws if the token is tampered with or expired
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as any;

    req.user = {
      userId: decoded.sub,
      username: decoded.username,
      role: decoded.role,
    };

    console.log(`[auth]: ${decoded.username} verified via JWT`);
    next();
  } catch (error: any) {
    console.log(`[auth]: Verification failed - ${error.message}`);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// --- Routes ---

app.get("/", (_, res) => res.send("JWT Server running!"));

app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "secret123") {
    // We embed the data directly into the token
    const token = jwt.sign(
      {
        sub: "1",
        username: username,
        role: "admin",
      },
      JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      },
    );

    console.log("[auth]: JWT generated. Server will not store this token.");

    return res.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: 3600,
    });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

app.get("/tasks", jwtAuth, (req: AuthRequest, res: Response) => {
  console.log(`[data]: Serving tasks to ${req.user?.username}`);
  res.json(demoTasks);
});

/**
 * Note: Logout with pure JWT is "client-side only"
 * unless you implement a blacklist/revocation list.
 */
app.post("/logout", jwtAuth, (_, res: Response) => {
  console.log("[auth]: Stateless logout triggered.");
  console.log("[warn]: Token is still technically valid until it expires!");

  res.json({
    message: "Logged out",
    warning: "The JWT is stateless and cannot be revoked by the server alone.",
  });
});

app.listen(PORT, () => console.log(`🚀 JWT Server: http://localhost:${PORT}`));
