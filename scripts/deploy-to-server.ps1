param(
  [Parameter(Mandatory = $false)]
  [string]$RemoteHost,

  [Parameter(Mandatory = $false)]
  [string]$RemoteUser = "artic",

  [Parameter(Mandatory = $false)]
  [string]$RemotePath = "/home/artic/artic-hms",

  [Parameter(Mandatory = $false)]
  [int]$RemotePort = 22
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $RemoteHost) {
  $RemoteHost = $env:ARTIC_REMOTE_HOST
}

if (-not $RemoteHost) {
  throw "Provide -RemoteHost or set ARTIC_REMOTE_HOST."
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $repoRoot

try {
  Write-Host "[HMS] Packaging local repository for deployment..." -ForegroundColor Green
  $tempArchive = Join-Path $env:TEMP ("artic-hms-" + (Get-Date -Format "yyyyMMddHHmmss") + ".tar.gz")
  git archive --format=tar.gz --output=$tempArchive HEAD

  if (-not (Test-Path $tempArchive)) {
    throw "Failed to create deployment archive."
  }

  Write-Host "[HMS] Uploading archive to ${RemoteUser}@${RemoteHost}:${RemotePort}" -ForegroundColor Green
  & scp -P $RemotePort $tempArchive "${RemoteUser}@${RemoteHost}:/tmp/artic-hms-release.tar.gz"

  $remoteCommand = (@"
set -e
mkdir -p /home/artic
if [ -d '$RemotePath' ]; then
  ts=`$(date +%Y%m%d%H%M%S)
  sudo mv '$RemotePath' '$RemotePath.bak-`$ts'
fi
sudo mkdir -p '$RemotePath'
sudo chown -R ${RemoteUser}:${RemoteUser} '$RemotePath'
cd '$RemotePath'
tar -xzf /tmp/artic-hms-release.tar.gz --strip-components=1
rm -f /tmp/artic-hms-release.tar.gz
if [ -f scripts/server-setup.sh ]; then
  bash scripts/server-setup.sh
else
  echo 'server-setup.sh was not found in the deployed archive.' >&2
  exit 1
fi
"@).Replace("`r", "")

  & ssh -p $RemotePort "$RemoteUser@$RemoteHost" $remoteCommand

  Write-Host "[HMS] Deployment completed. The server should now be reachable on ports 3001 and 4001 without touching the existing VMS project." -ForegroundColor Green
}
finally {
  Pop-Location
  if (Test-Path $tempArchive) {
    Remove-Item $tempArchive -Force
  }
}
