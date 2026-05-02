# Mulingo Backend API

Node.js + Express + Socket.io backend for a multilingual real-time chat system.

Core behavior: every message is stored once in original language and delivered to each user in their own preferred language.

## Stack

- Node.js + Express (TypeScript)
- Socket.io (real-time events)
- MySQL
- Google OAuth login + JWT auth
- Groq LLM translation (`GROQ_API_KEY`)

## Project Structure

```text
backend/
├── src/
│   ├── config/        # DB config + SQL schema
│   ├── controllers/   # REST controllers
│   ├── middleware/    # auth + validation
│   ├── routes/        # REST routes
│   ├── services/      # translation service
│   ├── socket/        # socket auth + handlers
│   ├── sql/           # raw SQL strings + query wrappers
│   └── utils/         # JWT + response helpers
├── package.json
└── tsconfig.json
```

## Environment Variables

Create `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mulingo

GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret

# Translation (Groq)
GROQ_API_KEY=your_groq_api_key
# Optional overrides:
# GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
# GROQ_TRANSLATION_MODEL=llama-3.1-8b-instant
```

## Install & Run

From repository root:

```bash
npm install
npm run dev:backend
```

## Database Setup (`mysql -u root`)

From project root, open MySQL shell:

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE IF NOT EXISTS mulingo;
USE mulingo;
SOURCE backend/src/config/schema.sql;
SOURCE backend/sql/submission_extras.sql;
```

Verify view creation (required for reports endpoint):

```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
SELECT * FROM v_user_chat_overview LIMIT 5;
```

Backend health check:

```text
GET http://localhost:3000/health
```

## Auth Flow (Frontend)

1. Frontend gets Google ID token from Google SDK.
2. Frontend sends token to:
   - `POST /auth/login`
3. Backend verifies Google token and returns app JWT.
4. Frontend uses returned JWT:
   - REST: `Authorization: Bearer <token>`
   - Socket: `io(url, { auth: { token } })`

## Response Format

- Success:

```json
{ "success": true, "data": {} }
```

- Error:

```json
{ "success": false, "message": "..." }
```

## Security Middleware

- `helmet()` is enabled globally.
- Rate limiting is enabled:
  - Global API limiter (`/`): broad protection against abusive traffic
  - Auth limiter (`/auth/login`): stricter limit for login attempts
  - Search limiter (`/search`, `/users` list/search): protects expensive lookup endpoints
  - LLM limiter (`/llm/test-translation`): protects Groq usage and costs

## REST API (Frontend Integration)

Base URL: `http://localhost:3000`

### Auth

- `POST /auth/login`
  - Body: `{ "token": "<google_id_token>" }`

### Users

- `GET /users/:id`
- `PUT /users/:id`
  - Body (optional fields):
    - `display_name`
    - `preferred_language_code` or `preferred_language_id`
    - `avatar_url`
- `GET /users?q=<search>&limit=20`

### DM Rooms

- `POST /rooms`
  - Body: `{ "other_user_id": 2 }`
  - Returns existing or newly created private room.
- `GET /rooms`
- `GET /rooms/:id`
- `GET /rooms/:id/messages?cursor=<message_id>&limit=30`

### Groups

- `POST /groups`
  - Body: `{ "name": "Dev Team", "description": "optional", "image_url": "optional" }`
- `GET /groups`
- `GET /groups/:id`
- `PUT /groups/:id`
- `POST /groups/:id/members`
  - Body: `{ "user_id": 12 }`
- `DELETE /groups/:id/members/:userId`
- `PUT /groups/:id/members/:userId/role`
  - Body: `{ "role": "admin" | "moderator" | "member" }`
- `POST /groups/:id/members/:userId/mute`
  - Optional body: `{ "duration_minutes": 30 }`
- `DELETE /groups/:id/members/:userId/mute`
- `POST /groups/:id/members/:userId/ban`
- `DELETE /groups/:id/members/:userId/ban`
- `GET /groups/:id/messages?cursor=<message_id>&limit=30`

### LLM Test Route

- `POST /llm/test-translation` (JWT required)
  - Purpose: quickly verify Groq LLM translation from Postman/frontend
  - Body:

```json
{
  "text": "Hello, how are you?",
  "from": "en",
  "to": "bn"
}
```

### Reports Routes (Rubric SQL Evidence)

- `GET /reports/chats-in-subquery?limit=50`
  - Multi-row subquery with `IN`
- `GET /reports/chats/:chatId/distinct-senders`
  - `DISTINCT` usage
- `GET /reports/chats/:chatId/aggregate-stats?minCount=1`
  - `COUNT/SUM/AVG/MIN/MAX` + `GROUP BY` + `HAVING`
- `GET /reports/my-chat-overview-view?limit=50`
  - SQL `VIEW` usage (`v_user_chat_overview`)

  - Response:

```json
{
  "success": true,
  "data": {
    "original": "Hello, how are you?",
    "from": "en",
    "to": "bn",
    "translated": "হ্যালো, আপনি কেমন আছেন?"
  }
}
```

## Socket.io Integration

### Connect

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: jwtToken },
});
```

### Client -> Server Events

- `join_room`
  - payload: `{ chatId: number }`
- `leave_room`
  - payload: `{ chatId: number }`
- `send_message`
  - payload: `{ chatId: number, text: string, langId: number }`
- `typing`
  - payload: `{ chatId: number, isTyping: boolean }`
- `read_receipt`
  - payload: `{ chatId: number, messageId: number }`

### Server -> Client Events

- `receive_message`
  - payload:

```json
{
  "chatId": 1,
  "messageId": 99,
  "senderId": 5,
  "sourceLanguageId": 1,
  "originalText": "Hello world",
  "text": "Hola mundo",
  "sentAt": "2026-05-02T12:00:00.000Z"
}
```

- `typing`
  - payload: `{ chatId, userId, isTyping }`
- `read_receipt`
  - payload: `{ chatId, userId, messageId }`
- `send_message_error`
  - payload: `{ success: false, message: string }`

## Important Notes for Frontend

- Use `langId` from `languages.language_id` while sending message.
- Server enforces membership and mute rules. Do not rely on client-side checks.
- `receive_message.text` is already translated for the recipient.
- Message history endpoints also return `translated_text` for requesting user.
- File transfer is not implemented.

## Known Schema-Limit Notes

- Schema currently stores group roles as `owner | admin | member`. If frontend sends `moderator`, backend maps it to `admin`.
- Group ban endpoints exist but require schema support for persistent bans to be fully enforceable.
- Group description is accepted at API level but current `chats` table has no dedicated `description` column.

## Build / Lint

```bash
npm run build
npx eslint .
```

