#!/usr/bin/env bash
# seed_test_users.sh
# Creates test admin and respondent users in the local dev database if they
# don't already exist. Both accounts use the password: password123
#
# Usage:
#   ./scripts/seed_test_users.sh
#   ./scripts/seed_test_users.sh --host localhost --port 5432 --user postgres --db forms_db

set -euo pipefail

# ── Defaults (match docker-compose.yml) ──────────────────────────────────────
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-forms_db}"
TENANT_ID="${DEFAULT_TENANT_ID:-00000000-0000-0000-0000-000000000001}"

# ── Parse optional CLI overrides ─────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)     DB_HOST="$2";     shift 2 ;;
    --port)     DB_PORT="$2";     shift 2 ;;
    --user)     DB_USER="$2";     shift 2 ;;
    --password) DB_PASSWORD="$2"; shift 2 ;;
    --db)       DB_NAME="$2";     shift 2 ;;
    --tenant)   TENANT_ID="$2";   shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

export PGPASSWORD="$DB_PASSWORD"

PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1"

echo "🔧  Seeding test users into $DB_NAME on $DB_HOST:$DB_PORT ..."

# Both accounts use password: password123 (bcrypt, cost 12)
ADMIN_HASH='$2b$12$reHPOVG3Ki/tMkiY/jg2eukRvT.U6Un6hLWBRThDyhG9pVIj/a8vy'
RESPONDENT_HASH='$2b$12$S2QGdnRyZlnhcr/Lc6lyr.heKWf9p903XULvGEp8FRz4QIKt0irZC'

$PSQL <<SQL

-- admin@localhost
INSERT INTO users (id, tenant_id, email, password_hash, role, created_at)
SELECT
  gen_random_uuid(),
  '$TENANT_ID',
  'admin@localhost',
  '$ADMIN_HASH',
  'admin',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users
  WHERE tenant_id = '$TENANT_ID' AND email = 'admin@localhost'
);

-- respondent@localhost
INSERT INTO users (id, tenant_id, email, password_hash, role, created_at)
SELECT
  gen_random_uuid(),
  '$TENANT_ID',
  'respondent@localhost',
  '$RESPONDENT_HASH',
  'respondent',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users
  WHERE tenant_id = '$TENANT_ID' AND email = 'respondent@localhost'
);

SQL

echo ""
echo "✅  Done. Test accounts (password: password123):"
echo "    admin@localhost      — role: admin"
echo "    respondent@localhost — role: respondent"