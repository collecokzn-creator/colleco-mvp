# Collaboration Workspace Persistence Schema

Version: 1.0
Status: Design Draft
Owner: Collaboration Feature Group

## Overview
Currently `collabStore.js` stores threads, messages, and attachments in localStorage. This limits multi-device sync, real-time collaboration, and data resilience. This spec defines backend persistence for collaboration workspaces.

## Goals
- Multi-device sync: clients poll or subscribe to thread updates
- Role-based visibility: agents see all threads, clients see only their own
- Audit trail: track message edits, deletions, status changes
- Scalable storage: support hundreds of threads per user, thousands of messages
- Backward compatibility: existing localStorage schema migrates gracefully

## Database Schema (Relational)

### `collaboration_threads`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Thread unique identifier |
| booking_id | VARCHAR(64) | UNIQUE, FK → bookings.id | Associated booking |
| ref | VARCHAR(32) | INDEXED | Booking reference (e.g., BKG-1234) |
| title | VARCHAR(255) | NOT NULL | Thread display name |
| client_name | VARCHAR(255) | | Client full name |
| status | VARCHAR(32) | | Draft, Confirmed, Completed, Cancelled |
| participants | JSONB | NOT NULL | Array of {role, name, contact} |
| created_at | TIMESTAMP | NOT NULL | Thread creation time |
| updated_at | TIMESTAMP | NOT NULL | Last activity timestamp |
| archived | BOOLEAN | DEFAULT false | Soft delete flag |

### `collaboration_messages`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Message unique identifier |
| thread_id | UUID | FK → collaboration_threads.id | Parent thread |
| author_role | VARCHAR(32) | NOT NULL | agent, client, productOwner, system |
| author_name | VARCHAR(255) | | Display name |
| channel | VARCHAR(32) | NOT NULL | in-app, whatsapp, email, sms, call, note |
| content | TEXT | NOT NULL | Message body (sanitized HTML allowed) |
| reply_to | UUID | FK → collaboration_messages.id | Optional parent message |
| created_at | TIMESTAMP | NOT NULL | Message creation time |
| edited_at | TIMESTAMP | | Last edit timestamp |
| deleted_at | TIMESTAMP | | Soft delete timestamp |
| metadata | JSONB | | {"whatsappId": "...", "emailSubject": "..."} |

### `collaboration_attachments`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Attachment unique identifier |
| thread_id | UUID | FK → collaboration_threads.id | Parent thread |
| message_id | UUID | FK → collaboration_messages.id | Optional message association |
| filename | VARCHAR(512) | NOT NULL | Original filename |
| mime_type | VARCHAR(128) | NOT NULL | File MIME type |
| size_bytes | INTEGER | NOT NULL | File size |
| storage_key | VARCHAR(512) | NOT NULL | S3/blob key or local path |
| uploaded_by_role | VARCHAR(32) | NOT NULL | Uploader role |
| uploaded_by_name | VARCHAR(255) | | Uploader display name |
| created_at | TIMESTAMP | NOT NULL | Upload timestamp |
| deleted_at | TIMESTAMP | | Soft delete timestamp |

### `collaboration_read_receipts`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| thread_id | UUID | FK → collaboration_threads.id | Thread |
| user_role | VARCHAR(32) | NOT NULL | Role reading thread |
| user_name | VARCHAR(255) | | User name (if logged in) |
| last_read_message_id | UUID | FK → collaboration_messages.id | Last seen message |
| last_read_at | TIMESTAMP | NOT NULL | Read timestamp |
| PRIMARY KEY | (thread_id, user_role, user_name) | | Composite key |

## API Endpoints (REST)

### Thread Management
- `GET /api/collab/threads` → List threads (role-filtered)
  - Query params: `status`, `archived`, `limit`, `offset`
  - Response: `{threads: [...], total, hasMore}`
- `GET /api/collab/threads/:threadId` → Get thread details + participants
- `POST /api/collab/threads` → Create thread
  - Body: `{bookingId, title, participants, status?}`
- `PATCH /api/collab/threads/:threadId` → Update thread (title, status, participants)
- `DELETE /api/collab/threads/:threadId` → Archive thread (soft delete)

### Message Operations
- `GET /api/collab/threads/:threadId/messages` → List messages
  - Query params: `limit`, `before` (cursor), `after` (cursor)
  - Response: `{messages: [...], hasMore, nextCursor}`
- `POST /api/collab/threads/:threadId/messages` → Post message
  - Body: `{content, channel, replyTo?, metadata?}`
- `PATCH /api/collab/messages/:messageId` → Edit message (content only, within 5 min)
- `DELETE /api/collab/messages/:messageId` → Soft delete message

### Attachments
- `GET /api/collab/threads/:threadId/attachments` → List attachments
- `POST /api/collab/threads/:threadId/attachments` → Upload (multipart/form-data)
  - Returns: `{id, filename, url, size}`
- `GET /api/collab/attachments/:attachmentId` → Download (presigned URL or proxy)
- `DELETE /api/collab/attachments/:attachmentId` → Soft delete

### Read Receipts & Presence
- `POST /api/collab/threads/:threadId/read` → Mark thread read
  - Body: `{lastMessageId}`
- `GET /api/collab/threads/:threadId/unread` → Get unread count for current user
- `GET /api/collab/threads/:threadId/typing` → Get typing indicators (future: SSE or WebSocket)

## Real-Time Strategy (Phase 2)
- Polling: Frontend polls `/threads/:threadId/messages?after=lastSeenId` every 5s when thread open
- WebSocket: Upgrade to Socket.IO for typing indicators, instant message delivery
- SSE: Server-sent events for unidirectional updates (simpler than WebSocket)

## Migration from localStorage
1. On first backend connection, client calls `POST /api/collab/migrate` with localStorage dump
2. Backend deduplicates by bookingId, merges messages chronologically
3. Client receives confirmation, clears localStorage, switches to API mode

## Security & Validation
- Role checks: Agents see all threads; clients see only threads where `participants` includes their role/contact
- Content sanitization: Strip scripts, validate length (max 10,000 chars/message)
- Rate limiting: 60 messages/min per user, 10 attachments/min (5 MB each)
- Attachment scanning: Virus scan on upload (ClamAV or cloud service)

## Performance Optimizations
- Indexes: `(thread_id, created_at DESC)` on messages, `(booking_id)` on threads
- Pagination: Cursor-based (use message.id + created_at composite)
- Caching: Redis cache for active threads (TTL 10 min)
- Archival: Move threads older than 2 years to cold storage

## Observability
- Metrics: message_post_latency_ms, attachment_upload_size_bytes, threads_active_count
- Logs: Structured JSON with threadId, messageId, userId, action
- Alerts: Spike in failed uploads, read receipt lag > 1 min

## Open Questions
- Should we support message reactions (emoji)? (Answer: Phase 3)
- Encrypt attachments at rest? (Answer: Yes if PII; use server-side encryption)
- Max thread lifetime before forced archival? (Suggest: 5 years)

## Implementation Phases
**Phase 1**: REST API + SQLite/Postgres backend, polling for updates, basic RBAC
**Phase 2**: WebSocket real-time, typing indicators, read receipts
**Phase 3**: Message reactions, advanced search, export to PDF/CSV

---
End of Schema Draft.
