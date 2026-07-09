[CmdletBinding()]
param(
  [string]$DbHost = $(if ([string]::IsNullOrWhiteSpace($env:DB_HOST)) { 'localhost' } else { $env:DB_HOST }),
  [string]$DbPort = $(if ([string]::IsNullOrWhiteSpace($env:DB_PORT)) { '5432' } else { $env:DB_PORT }),
  [string]$DbUser = $(if ([string]::IsNullOrWhiteSpace($env:DB_USER)) { 'postgres' } else { $env:DB_USER }),
  [string]$DbPassword = $(if ([string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) { 'postgres' } else { $env:DB_PASSWORD }),
  [string]$DbName = $(if ([string]::IsNullOrWhiteSpace($env:DB_NAME)) { 'forms_db' } else { $env:DB_NAME }),
  [string]$TenantId = $(if ([string]::IsNullOrWhiteSpace($env:DEFAULT_TENANT_ID)) { '00000000-0000-0000-0000-000000000001' } else { $env:DEFAULT_TENANT_ID })
)

$ErrorActionPreference = 'Stop'
$env:PGPASSWORD = $DbPassword

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  throw "psql was not found in PATH. Install the PostgreSQL client tools for Windows or run the Bash script inside Docker."
}

$adminHash = '$2b$12$reHPOVG3Ki/tMkiY/jg2eukRvT.U6Un6hLWBRThDyhG9pVIj/a8vy'
$respondentHash = '$2b$12$S2QGdnRyZlnhcr/Lc6lyr.heKWf9p903XULvGEp8FRz4QIKt0irZC'

Write-Host "Seeding test users into $DbName on $DbHost`:$DbPort ..."

$sql = @'
INSERT INTO users (id, tenant_id, email, password_hash, role, created_at)
SELECT
  gen_random_uuid(),
  :'tenant_id',
  :'admin_email',
  :'admin_hash',
  'admin',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users
  WHERE tenant_id = :'tenant_id' AND email = :'admin_email'
);

INSERT INTO users (id, tenant_id, email, password_hash, role, created_at)
SELECT
  gen_random_uuid(),
  :'tenant_id',
  :'respondent_email',
  :'respondent_hash',
  'respondent',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users
  WHERE tenant_id = :'tenant_id' AND email = :'respondent_email'
);
'@

& $psql.Source `
  -h $DbHost `
  -p $DbPort `
  -U $DbUser `
  -d $DbName `
  -v ON_ERROR_STOP=1 `
  -v tenant_id=$TenantId `
  -v admin_email='admin@localhost' `
  -v respondent_email='respondent@localhost' `
  -v admin_hash=$adminHash `
  -v respondent_hash=$respondentHash `
  -c $sql

Write-Host ''
Write-Host 'Done. Test accounts (password: password123):'
Write-Host '  admin@localhost      - role: admin'
Write-Host '  respondent@localhost - role: respondent'