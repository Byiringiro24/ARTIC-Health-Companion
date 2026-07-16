$base = "http://localhost:4000"

function Test-Endpoint($label, $url, $method="GET", $bodyStr=$null, $token=$null) {
  $headers = @{ "Content-Type" = "application/json" }
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  try {
    $params = @{ Uri=$url; Method=$method; Headers=$headers; ErrorAction="Stop" }
    if ($bodyStr) { $params["Body"] = $bodyStr }
    $r = Invoke-WebRequest @params
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)] $label"
    return $data
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "FAIL [$code] $label -- $($_.Exception.Message.Split("`n")[0])"
    return $null
  }
}

Write-Host ""
Write-Host "=== ARTIC HMS ENDPOINT VERIFICATION ==="
Write-Host ""

$h = Test-Endpoint "GET /health" "$base/health"
if ($h) { Write-Host "  db=$($h.database)  env=$($h.environment)" }

$l = Test-Endpoint "POST /api/auth/login (doctor)" "$base/api/auth/login" "POST" '{"email":"doctor@artic.health","password":"doctor123"}'
$tok = if ($l) { $l.accessToken } else { $null }
if ($l) { Write-Host "  role=$($l.user.roleName)  modules=$($l.user.modules.Count)" }

$la = Test-Endpoint "POST /api/auth/login (admin)" "$base/api/auth/login" "POST" '{"email":"admin@artic.health","password":"admin123"}'
$atk = if ($la) { $la.accessToken } else { $null }
if ($la) { Write-Host "  role=$($la.user.roleName)" }

$me = Test-Endpoint "GET /api/auth/me" "$base/api/auth/me" "GET" $null $tok
if ($me) { Write-Host "  name=$($me.user.firstName) $($me.user.lastName)" }

$pts = Test-Endpoint "GET /api/patients" "$base/api/patients" "GET" $null $tok
if ($pts) { Write-Host "  total=$($pts.meta.total)  pages=$($pts.meta.totalPages)" }

$pm = Test-Endpoint "GET /api/patients/mrn/MRN-2026-0001" "$base/api/patients/mrn/MRN-2026-0001" "GET" $null $tok
if ($pm) { Write-Host "  patient=$($pm.patient.fullName)  blood=$($pm.patient.bloodGroup)" }

$pn = Test-Endpoint "GET /api/patients/nid/1199880000000001" "$base/api/patients/nid/1199880000000001" "GET" $null $tok
if ($pn) { Write-Host "  patient=$($pn.patient.fullName)" }

$us = Test-Endpoint "GET /api/users" "$base/api/users" "GET" $null $atk
if ($us) { Write-Host "  total=$($us.meta.total)" }

$ro = Test-Endpoint "GET /api/users/roles" "$base/api/users/roles" "GET" $null $tok
if ($ro) { Write-Host "  roles=$($ro.roles.Count)" }

$kp = Test-Endpoint "GET /api/dashboard/kpis" "$base/api/dashboard/kpis" "GET" $null $tok
if ($kp) { Write-Host "  kpis=$($kp.kpis.Count)"; $kp.kpis | ForEach-Object { Write-Host "    $($_.label): $($_.value)" } }

$dm = Test-Endpoint "GET /api/dashboard/modules" "$base/api/dashboard/modules" "GET" $null $tok
if ($dm) { Write-Host "  modules=$($dm.modules.Count)" }

# Search
$ps = Test-Endpoint "GET /api/patients?search=Claudine" "$base/api/patients?search=Claudine" "GET" $null $tok
if ($ps) { Write-Host "  search results=$($ps.meta.total)" }

# Wrong credentials → 401
Test-Endpoint "POST /api/auth/login (wrong creds -> expect 401)" "$base/api/auth/login" "POST" '{"email":"bad@test.com","password":"wrong"}' | Out-Null

# Unauthenticated → 401
Test-Endpoint "GET /api/patients (no token -> expect 401)" "$base/api/patients" "GET" $null $null | Out-Null

# Legacy compat endpoint
$leg = Test-Endpoint "GET /api/roles (legacy)" "$base/api/roles"
if ($leg) { Write-Host "  legacy roles count=$($leg.PSObject.Properties.Name.Count)" }

Write-Host ""
Write-Host "=== ALL TESTS COMPLETE ==="
