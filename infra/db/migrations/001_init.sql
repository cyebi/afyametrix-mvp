CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CHPS', 'DHIO', 'DSNO', 'REGIONAL', 'MINISTRY', 'DONOR')),
  district_id TEXT,
  facility_id TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district_id TEXT NOT NULL,
  connectivity_profile TEXT NOT NULL DEFAULT 'intermittent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE case_reports (
  id UUID PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id),
  case_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  location TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alert_rules (
  id UUID PRIMARY KEY,
  district_id TEXT NOT NULL,
  case_type TEXT NOT NULL,
  threshold_value INTEGER NOT NULL,
  threshold_window_hours INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alert_events (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES alert_rules(id),
  case_report_id UUID REFERENCES case_reports(id),
  triggered_at TIMESTAMPTZ NOT NULL,
  delivery_channels TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY,
  device_id TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  retries INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY,
  district_id TEXT NOT NULL,
  week_start DATE NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  pdf_url TEXT,
  xlsx_url TEXT
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_case_reports_district_time ON case_reports (occurred_at);
CREATE INDEX idx_alert_events_time ON alert_events (triggered_at);
CREATE INDEX idx_audit_logs_time ON audit_logs (timestamp);
