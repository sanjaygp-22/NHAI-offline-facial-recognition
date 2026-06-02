# Security and Storage

## Data Stored Locally
- Enrolled identities and embeddings.
- Attendance records with timestamps and location.
- Sync queue status and upload receipts.

## Data Not Stored
- No raw face images after embedding extraction.
- No camera frames persisted on disk.

## Encryption
- SQLite database encrypted with AES-256.
- Encryption key stored in secure OS keystore if available.

## Tamper Resistance
- Each attendance record includes SHA-256 hash of key fields.
- Hash chain optional for sequential integrity.

## Retention Policy
- Configurable retention window for attendance records.
- Purge manager deletes data after successful cloud sync.

## Threat Model (Assumptions)
- Device may be lost or inspected.
- Offline mode means no remote attestation.
- Emphasis on local at-rest protection.
