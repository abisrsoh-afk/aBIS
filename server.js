const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "32kb" }));

const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const CODES_FILE = path.join(__dirname, "data", "codes.json");

function readCodes() {
  try {
    return JSON.parse(fs.readFileSync(CODES_FILE, "utf8"));
  } catch (_) {
    return {};
  }
}
function writeCodes(codes) {
  fs.mkdirSync(path.dirname(CODES_FILE), { recursive: true });
  fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
}
function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}
function adminOnly(req, res, next) {
  const supplied = String(req.get("x-admin-token") || "");
  if (!ADMIN_TOKEN || supplied !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  next();
}

app.get("/", (_req, res) => {
  res.json({
    service: "ABN SENARA LOADER activation API",
    status: "running",
    endpoints: {
      health: "GET /health",
      validate: "POST /api/validate",
      adminAddCode: "POST /admin/codes (requires x-admin-token)"
    }
  });
});
app.get("/health", (_req, res) => res.json({ ok: true }));

// Request JSON: { "code": "YOUR-CODE", "deviceId": "optional-device-id" }
app.post("/api/validate", (req, res) => {
  const code = normalizeCode(req.body && req.body.code);
  if (!code) return res.status(400).json({ ok: false, valid: false, message: "Code is required" });

  const codes = readCodes();
  const record = codes[code];
  if (!record) return res.status(200).json({ ok: true, valid: false, message: "Invalid code" });
  if (record.enabled === false) return res.status(200).json({ ok: true, valid: false, message: "Code disabled" });

  if (record.expiresAt) {
    const expiry = Date.parse(record.expiresAt);
    if (!Number.isFinite(expiry) || Date.now() > expiry) {
      return res.status(200).json({ ok: true, valid: false, message: "Code expired" });
    }
  }

  const deviceId = String((req.body && req.body.deviceId) || "").trim();
  if (record.deviceId && deviceId && record.deviceId !== deviceId) {
    return res.status(200).json({ ok: true, valid: false, message: "Code already bound to another device" });
  }
  if (deviceId && !record.deviceId) {
    record.deviceId = deviceId;
    codes[code] = record;
    writeCodes(codes);
  }
  return res.json({ ok: true, valid: true, message: "Activation successful" });
});

// Add one code. Example body: {"code":"SENARA-ABC123","expiresAt":null,"enabled":true}
app.post("/admin/codes", adminOnly, (req, res) => {
  const code = normalizeCode(req.body && req.body.code);
  if (!/^[A-Z0-9-]{6,64}$/.test(code)) {
    return res.status(400).json({ ok: false, message: "Code must be 6-64 characters using A-Z, 0-9, or hyphens" });
  }
  const codes = readCodes();
  if (codes[code]) return res.status(409).json({ ok: false, message: "Code already exists" });

  const expiresAt = req.body.expiresAt || null;
  if (expiresAt && !Number.isFinite(Date.parse(expiresAt))) {
    return res.status(400).json({ ok: false, message: "expiresAt must be an ISO date or null" });
  }
  codes[code] = {
    enabled: req.body.enabled !== false,
    expiresAt,
    deviceId: null,
    createdAt: new Date().toISOString()
  };
  writeCodes(codes);
  res.status(201).json({ ok: true, code, expiresAt });
});

// Disable a code. Example body: {"code":"SENARA-ABC123"}
app.post("/admin/codes/disable", adminOnly, (req, res) => {
  const code = normalizeCode(req.body && req.body.code);
  const codes = readCodes();
  if (!codes[code]) return res.status(404).json({ ok: false, message: "Code not found" });
  codes[code].enabled = false;
  writeCodes(codes);
  res.json({ ok: true, message: "Code disabled" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ABN SENARA server listening on port ${PORT}`);
});
