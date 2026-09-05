# TraceLens

TraceLens is a privacy-friendly incident triage dashboard that turns raw application logs into grouped failures, an error-rate timeline, and a deterministic incident summary. All parsing happens locally in the browser—uploaded logs never leave the machine.

## Run it

No package install is required.

```bash
cd /Users/pallavi/Documents/Codex/2026-09-05/i-x20
python3 -m http.server 4173
```

Open `http://localhost:4173`. Use **Load demo incident** or upload a `.log`, `.txt`, or `.csv` file.

## What it handles

- Common ISO-timestamp logs, bracketed logs, and CSV (`timestamp`, `level`, `service`, `message`, `endpoint`) records
- Error and warning detection, endpoint/service extraction, and dynamic-value normalization
- Repeated-failure grouping, a 12-bucket error-rate timeline, sample event inspection, and copyable incident reports

## Design notes

The grouping is deliberately deterministic and explainable: UUIDs, IDs, IPs, quoted strings, numbers, and long hashes are replaced with stable placeholders before errors are grouped. This makes the summary useful even without an LLM and avoids transmitting production logs.

## Portfolio extensions

Persist analyses in SQLite/Supabase, add ingestion APIs and alerts, support OpenTelemetry fields, and add role-based redaction policies.
