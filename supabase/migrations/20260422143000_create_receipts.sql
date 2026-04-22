CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario TEXT NOT NULL,
  decision TEXT NOT NULL,
  summary TEXT NOT NULL,
  rule_trace JSONB NOT NULL,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
