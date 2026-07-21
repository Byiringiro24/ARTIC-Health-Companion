@echo off
REM ARTIC HMS — Deploy via plink (PuTTY)
REM Usage: double-click or run from cmd
REM Requires: plink.exe in PATH (PuTTY installed)

echo === ARTIC HMS Deploy ===
echo Server: artic@172.209.217.176
echo.

REM Accept host key and run deploy
plink -ssh artic@172.209.217.176 ^
  -pw "Ltdartic@!!" ^
  -hostkey "SHA256:jD1aebLGD24r55PBG11nA27fnzzc8qqQIpYchW5Ezf0" ^
  "cd /home/artic/artic-hms && git pull origin main && cd frontend && npm install --legacy-peer-deps 2>/dev/null; npm run build && pm2 restart artic-hms-frontend --update-env && pm2 restart artic-hms-backend --update-env && echo DEPLOY_OK && curl -s -o /dev/null -w 'Backend: HTTP %%{http_code}\n' http://localhost:4001/api/health && curl -s -o /dev/null -w 'Frontend: HTTP %%{http_code}\n' http://localhost:3001"

pause
