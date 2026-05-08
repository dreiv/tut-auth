import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const demoTasks = [
  { id: 1, title: "My first task", completed: true },
  { id: 2, title: "My second task", completed: false },
];

const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const [type, credentials] = (req.headers.authorization || "").split(" ");
  const [user, pass] = Buffer.from(credentials || "", "base64")
    .toString()
    .split(":");

  if (type === "Basic" && user === "admin" && pass === "secret123") {
    console.log(`[auth]: ${user} logged in`);
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Node Tutorial"');
  res.status(401).json({ error: "Access denied. Use Basic Auth." });
};

app.get("/", (_, res) =>
  res.send({ message: "Basic Auth Server is running!" }),
);
app.get("/tasks", basicAuth, (_, res) => res.json(demoTasks));
app.listen(PORT, () =>
  console.log(`🚀 Basic Auth Server: http://localhost:${PORT}`),
);
