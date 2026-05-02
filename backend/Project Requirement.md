# CSE311 Project Requirement Mapping (Mulingo)

This document maps the **official project rubric** to what has been implemented in this project and what still needs to be prepared for final submission.

Reference rubric: `CSE311 Group Project Requirements.pdf`

---

## 1) SQL Database Design & Integration

### Requirement
- Use MySQL as backend.
- At least 5 interrelated normalized tables.
- Show PK, FK, proper data types, constraints.

### How this project fulfills it
- **MySQL integration** is used end-to-end through `mysql2/promise` in:
  - `src/config/db.ts`
- Core schema is defined in:
  - `src/config/schema.sql`
- The schema contains **7 interrelated tables**:
  1. `languages`
  2. `users`
  3. `chats`
  4. `chat_members`
  5. `messages`
  6. `message_translations`
  7. `message_attachments`
- Strong relationship model (normalized structure):
  - Users reference preferred language
  - Chats are separate from members (many-to-many through `chat_members`)
  - Messages are separate from translations (one-to-many per target language)
  - Attachments are separate from messages

### Evidence of constraints
- **Primary Keys**: every table has `... PRIMARY KEY AUTO_INCREMENT`
- **Foreign Keys**:
  - `users.preferred_language_id -> languages.language_id`
  - `chats.created_by -> users.user_id`
  - `chat_members.chat_id -> chats.chat_id`
  - `chat_members.user_id -> users.user_id`
  - `messages.chat_id -> chats.chat_id`
  - `messages.sender_id -> users.user_id`
  - `messages.source_language_id -> languages.language_id`
  - `message_translations.message_id -> messages.message_id`
  - `message_translations.target_language_id -> languages.language_id`
- **UNIQUE/NOT NULL/DEFAULT** examples:
  - `users.email UNIQUE NOT NULL`
  - `users.username UNIQUE NOT NULL`
  - `chat_members UNIQUE(chat_id, user_id)`
  - `message_translations UNIQUE(message_id, target_language_id)`
  - `account_status` / `chat_type` / `member_role` as ENUM
  - defaults for timestamps, booleans, and statuses

### Status
- **Fulfilled**

---

## 2) Front-End Interface Requirement

### Requirement
- Forms/pages for add, edit, delete records.
- View/search/filter results.
- Frontend connected via SQL-backed application layer.

### How this project supports frontend
This backend provides production-style REST + Socket APIs for frontend integration:

- **Add/Create**
  - Create DM room: `POST /rooms`
  - Create group: `POST /groups`
  - Add group member: `POST /groups/:id/members`
  - Send messages: `send_message` socket event
- **Edit/Update**
  - Update profile: `PUT /users/:id`
  - Update group: `PUT /groups/:id`
  - Change role: `PUT /groups/:id/members/:userId/role`
  - Mute/unmute member
- **Delete/Remove**
  - Remove group member: `DELETE /groups/:id/members/:userId`
- **View/Search/Filter**
  - Search users: `GET /users?q=...` and `GET /search?username=...`
  - List rooms/groups
  - Room/group details with participants
  - Paginated message history: `GET /rooms/:id/messages`, `GET /groups/:id/messages`

### SQL-backed execution evidence
- SQL statements are organized in query modules:
  - `src/sql/user/*.sql.ts`
  - `src/sql/chat/*.sql.ts`
  - `src/sql/authentication/*.sql.ts`
- Controllers call these SQL wrappers with async/await and return JSON API results.

### Status
- **Fulfilled (backend side)**  
- Frontend GUI screenshots are still needed for final report deliverables.

---

## 3) SQL Features Implementation

## 3.1 Basic Operations

### Creating tables
- Implemented in `src/config/schema.sql` with full DDL.

### Inserting rows
- Examples:
  - `createGroupChatSql` -> `INSERT INTO chats ...`
  - `insertMessageSql` -> `INSERT INTO messages ...`
  - `insertMessageTranslationSql` -> `INSERT INTO message_translations ...`

### Updating rows
- Examples:
  - `updateUserProfileSql`
  - `updateGroupChatSql`
  - `updateMemberRoleSql`
  - `setMemberMutedSql`
  - `updateLastReadMessageSql`

### Deleting rows
- Examples:
  - `removeGroupMemberSql` -> `DELETE FROM chat_members ...`
  - Schema also uses `ON DELETE CASCADE` for relational cleanup.

### SELECT with aliases/expressions
- `getMessagesPageSql` uses aliases like `sender_username`, `sender_avatar`
- `getUserByIdSql` uses `preferred_language_code`, `preferred_language_name`
- `listMyPrivateRoomsSql` has computed expression subquery:
  - `(SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.chat_id) AS message_count`

### Status
- **Fulfilled**

---

## 3.2 Query Features

### WHERE / ORDER BY / LIMIT
- Used extensively across user/group/room/message queries.

### Logical operators AND / OR / NOT
- `listUsersSql` uses OR + AND filtering
- Various queries use compound AND filters.

### LIKE
- Implemented in user search:
  - `username LIKE ? OR first_name LIKE ? OR last_name LIKE ?`

### IS NULL / DISTINCT
- `IS NULL` is used in message pagination:
  - `(? IS NULL OR m.message_id < ?)`
- `DISTINCT` is implemented in the rubric report query:
  - `src/sql/reports/reports.sql.ts` → `distinctSendersInChatSql`

### Status
- **Fulfilled** (IS NULL + DISTINCT covered)

---

## 3.3 Joins & Multi-table Queries

### Required in rubric
1. One INNER JOIN
2. One LEFT/RIGHT JOIN
3. One JOIN involving 3+ tables

### Evidence
- **INNER JOIN**
  - `getGroupMembersSql` (`chat_members` INNER JOIN `users`)
- **LEFT JOIN**
  - `getUserByIdSql` (`users` LEFT JOIN `languages`)
  - `getMessagesPageSql` (`messages` LEFT JOIN `message_translations`)
- **3+ table join**
  - `getMessagesPageSql` joins `messages` + `users` + `message_translations`
  - `findExistingPrivateChatSql` joins `chats` + `chat_members` + `chat_members`

### Status
- **Fulfilled**

---

## 3.4 Group Functions & Aggregates

### Requirement
- Use `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`
- `GROUP BY` and `HAVING`

### Current evidence
- `COUNT(*)` exists in `listMyPrivateRoomsSql`.
- Full aggregate coverage is implemented in:
  - `src/sql/reports/reports.sql.ts` → `chatAggregateStatsSql`
    - `COUNT()`, `MIN()`, `MAX()`, `AVG()`, `SUM()`
    - `GROUP BY` + `HAVING`

### Status
- **Fulfilled**

### Suggested completion (for full marks)
Add reporting SQL in a new file (e.g., `src/sql/reports/report.sql.ts`) such as:
- messages per chat (`COUNT`, `GROUP BY`)
- average messages per user per chat (`AVG`)
- min/max message timestamps per chat (`MIN`, `MAX`)
- `HAVING COUNT(*) > ...` filter

---

## 3.5 Subqueries

### Requirement
- One single-row subquery
- One multiple-row subquery with `IN`/`ANY`/`ALL`

### Current evidence
- **Single-row / scalar-style subquery**:
  - `listMyPrivateRoomsSql` message count scalar subquery.
- Multiple-row subquery with `IN` is implemented:
  - `src/sql/reports/reports.sql.ts` → `chatsForUserUsingInSubquerySql`

### Status
- **Fulfilled**

### Suggested completion
Add one query like:
- `WHERE chat_id IN (SELECT chat_id FROM chat_members WHERE user_id = ?)`

---

## 3.6 Views & CASE

### Requirement
- At least one SQL `VIEW`
- Use of `CASE`

### Current evidence
- `CASE` is implemented in:
  - `getGroupMembersSql` for role-based ordering.
- SQL `VIEW` creation is included in:
  - `backend/sql/submission_extras.sql` → `CREATE OR REPLACE VIEW v_user_chat_overview ...`
- View usage is demonstrated from the application layer in:
  - `src/sql/reports/reports.sql.ts` → `userChatOverviewViewSql`
  - `GET /reports/my-chat-overview-view`

### Status
- **Fulfilled**

### Suggested completion
Add a view in `schema.sql`, e.g.:
- `CREATE VIEW v_chat_message_summary AS ...` (chat + message totals + last message time)

---

## 4) Minimum Deliverables Checklist

## 4.1 SQL Scripts

### Required
- Table creation, insert data, view creation, user/privilege creation

### Current
- Table creation + seed data: **implemented** in `src/config/schema.sql`
- View creation: **implemented** in `backend/sql/submission_extras.sql`
- DB user/privilege script: **included (commented template)** in `backend/sql/submission_extras.sql`

### Submission action
- Included in repo:
  - `backend/sql/submission_extras.sql` containing:
    - `CREATE VIEW ...`
    - `CREATE USER ...` (template)
    - `GRANT ...` (template)

### Exact commands to run (`mysql -u root`)

From project root:

```bash
mysql -u root -p
```

Inside MySQL shell:

```sql
CREATE DATABASE IF NOT EXISTS mulingo;
USE mulingo;
SOURCE backend/src/config/schema.sql;
SOURCE backend/sql/submission_extras.sql;
```

Quick verification queries:

```sql
USE mulingo;
SHOW FULL TABLES WHERE Table_type = 'VIEW';
SELECT * FROM v_user_chat_overview LIMIT 5;
```

---

## 4.2 Application Source Code

### Current
- Backend source code is complete and SQL-driven.
- Routing, controllers, middleware, SQL modules, sockets, translation, validation, security are all included.

### Status
- **Fulfilled**

---

## 4.3 Sample Database Dump

### Current
- Not yet generated in repository.

### Submission action
- Export with:
  - `mysqldump -u <user> -p mulingo > mulingo_dump.sql`

---

## 4.4 Screenshots

### Required
- GUI showing insert/search/display/update workflows.

### Current
- Not part of backend code repository.

### Submission action
- Capture frontend screens for:
  - Login
  - User search
  - Create room/group
  - Send translated messages
  - Member role/mute actions
  - Message history

---

## 4.5 Project Report

### Recommended structure
1. Problem statement
2. ER/relationship design and normalization note
3. Schema and constraints summary
4. SQL feature evidence (joins, subqueries, aggregates, view, CASE)
5. Backend architecture (REST + Socket + translation layer)
6. Frontend flow and screenshots
7. Testing strategy (Postman + realtime test)
8. Deployment note (bonus)

---

## Final Compliance Snapshot

- SQL Design & Integration: **Fulfilled**
- Front-End Connectivity (backend support): **Fulfilled**
- Basic SQL Ops: **Fulfilled**
- Query Features: **Fulfilled**
- Joins: **Fulfilled**
- Aggregates + Group By + Having: **Fulfilled**
- Subqueries: **Fulfilled**
- Views + CASE: **Fulfilled**
- Deliverables package: **Mostly fulfilled** (remaining: DB dump, GUI screenshots, final report PDF)

---

## Notes for Viva / Lab Defense

- Core innovation: **real-time multilingual chat** where each user receives translated messages in preferred language.
- Database-centered design is strong: normalized schema, relational integrity, multi-table reads/writes, caching translations in DB.
- Security enhancements added:
  - JWT route protection
  - socket auth
  - `helmet`
  - rate limiting
- Rubric-specific SQL artifacts are included; now focus on packaging deliverables:
  - `mysqldump` export
  - GUI screenshots
  - final report write-up

