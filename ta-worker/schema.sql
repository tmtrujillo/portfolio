-- Anonymous log of AI questions. No IP addresses or visitor identifiers.
-- Rows older than 30 days are deleted daily by the Worker's scheduled job.
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  day TEXT NOT NULL,
  track TEXT,
  preset TEXT,
  question TEXT NOT NULL,
  answer TEXT,
  sources TEXT,
  outcome TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_day ON questions(day);
