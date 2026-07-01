import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import OAuthServer, {
  AuthorizationCodeModel,
  Request as OAuthRequest,
  Response as OAuthResponse,
} from "oauth2-server";

const app = express();
const PORT = 3005;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }));

// --- 1. IN-MEMORY DATA STORE (Simulating your Database) ---
const db = {
  clients: [
    {
      id: "vanguard-app-123",
      clientSecret: "super-secret-key",
      grants: ["authorization_code", "refresh_token"],
      redirectUris: ["http://localhost:3005/callback.html"],
    },
  ],
  users: [{ id: "user_456", username: "admin", password: "secret123" }],
  authCodes: new Map<string, any>(),
  tokens: new Map<string, any>(),
};

// --- 2. THE OAUTH2 MODEL ---
const oauthModel: AuthorizationCodeModel = {
  getClient: async (clientId, clientSecret) => {
    const client = db.clients.find((c) => c.id === clientId);
    if (!client) return false;
    if (clientSecret && client.clientSecret !== clientSecret) return false;
    return {
      id: client.id,
      grants: client.grants,
      redirectUris: client.redirectUris,
    };
  },

  saveAuthorizationCode: async (code, client, user) => {
    const authCodeData = { ...code, client, user };
    db.authCodes.set(code.authorizationCode, authCodeData);
    return authCodeData;
  },

  getAuthorizationCode: async (authorizationCode) => {
    return db.authCodes.get(authorizationCode);
  },

  revokeAuthorizationCode: async (code) => {
    return db.authCodes.delete(code.authorizationCode);
  },

  saveToken: async (token, client, user) => {
    const tokenData = { ...token, client, user };
    db.tokens.set(token.accessToken, tokenData);
    return tokenData;
  },

  getAccessToken: async (accessToken) => {
    const token = db.tokens.get(accessToken);
    if (!token) return false;
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client: token.client,
      user: token.user,
      scope: token.scope, // Attaches scope data downstream
    };
  },

  validateScope: async (user, client, scope) => {
    if (!scope) return [];
    const requestedScopes = Array.isArray(scope) ? scope : scope.split(" ");
    const validScopes = ["profile", "tasks"];
    return requestedScopes.filter((s) => validScopes.includes(s));
  },

  verifyScope: async (token, scope) => {
    if (!token.scope) return false;

    const tokenScopes = Array.isArray(token.scope)
      ? token.scope
      : token.scope.split(" ");
    const requestedScopes = Array.isArray(scope) ? scope : scope.split(" ");

    return requestedScopes.every((s) => tokenScopes.includes(s));
  },
};

// Instantiate the OAuth 2.0 Server instance
const oauth = new OAuthServer({
  model: oauthModel,
  allowEmptyState: true,
});

// --- 3. OAUTH ROUTES ---

// Endpoint A: User Authorization Verification Handler
app.post("/oauth/authorize", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = db.users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const oauthReq = new OAuthRequest(req);
  const oauthRes = new OAuthResponse(res);

  try {
    await oauth.authorize(oauthReq, oauthRes, {
      authenticateHandler: { handle: () => user },
    });

    // Send the constructed redirect location string back to the client interface
    return res.json({ redirectUri: oauthRes.headers?.location });
  } catch (err: any) {
    console.error("[OAuth Authorize Error]:", err);
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// Endpoint B: Code-to-Token Exchange Gateway
app.post("/oauth/token", async (req: Request, res: Response) => {
  const oauthReq = new OAuthRequest(req);
  const oauthRes = new OAuthResponse(res);

  try {
    const token = await oauth.token(oauthReq, oauthRes);
    return res.json({
      access_token: token.accessToken,
      token_type: "Bearer",
      expires_in: Math.floor(
        (token.accessTokenExpiresAt!.getTime() - Date.now()) / 1000,
      ),
      scope: token.scope,
    });
  } catch (err: any) {
    console.error("[OAuth Token Error]:", err);
    return res.status(err.code || 500).json({ error: err.message });
  }
});

// --- 4. SECURED RESOURCE ENDPOINT ---
const authenticateResource = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const oauthReq = new OAuthRequest(req);
  const oauthRes = new OAuthResponse(res);

  try {
    const token = await oauth.authenticate(oauthReq, oauthRes);
    (req as any).user = token.user;
    (req as any).scope = token.scope;
    return next();
  } catch (err: any) {
    return res.status(err.code || 401).json({ error: err.message });
  }
};

app.get("/tasks", authenticateResource, (req: Request, res: Response) => {
  res.json({
    message: "OAuth 2.0 Resource Scope Accessed Successfully",
    authorized_permissions: (req as any).scope,
    owner: {
      id: (req as any).user.id,
      username: (req as any).user.username,
    },
    tasks: [
      {
        id: 1,
        title: "Learn to build an Authorization Provider",
        completed: true,
      },
    ],
  });
});

app.use(express.static(__dirname));

app.listen(PORT, () =>
  console.log(`🚀 OAuth2 Provider Sandbox running on http://localhost:${PORT}`),
);
