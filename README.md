# ABN SENARA LOADER — Activation API

Small Node.js/Express API for validating activation codes.

## Endpoints
- `GET /` — service information
- `GET /health` — health check
- `POST /api/validate` — validate a code
- `POST /admin/codes` — add a code (requires `x-admin-token`)
- `POST /admin/codes/disable` — disable a code (requires `x-admin-token`)

## Deploy (Render)
1. Push this folder's contents to a GitHub repository.
2. Create a **Web Service** in Render and connect the repository.
3. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
4. Add environment variable `ADMIN_TOKEN` with a long random secret. Never share it or put it in the Android app.
5. Deploy, then test `GET /health`.

## Validate request
`POST /api/validate`
```json
{"code":"SENARA-ABC123","deviceId":"optional-device-id"}
```
Returns JSON with `valid: true` or `valid: false`.

## Add a code
Send `POST /admin/codes` with JSON body `{"code":"SENARA-ABC123","expiresAt":null,"enabled":true}` and header `x-admin-token: YOUR_ADMIN_TOKEN`.

## Important limitations
This starter stores codes in a local JSON file. On many hosting platforms, local files may be reset during redeploy/restart unless a persistent disk/database is configured. For reliable production use, connect a persistent database before selling codes. This repository does not automatically connect or modify an existing APK; the app must send requests to this API and parse the JSON response.
