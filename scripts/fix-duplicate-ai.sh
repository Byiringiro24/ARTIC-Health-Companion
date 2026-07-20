#!/bin/bash
# Remove the duplicate processAIQuery function from super-admin.service.js
FILE="/home/artic/artic-hms/backend/src/modules/super-admin/super-admin.service.js"

/usr/bin/python3 << 'PYEOF'
with open('/home/artic/artic-hms/backend/src/modules/super-admin/super-admin.service.js', 'r') as f:
    content = f.read()

# Find the two occurrences of the function declaration
marker = 'export async function processAIQuery'
first = content.find(marker)
second = content.find(marker, first + 10)

if second == -1:
    print("No duplicate found - file may already be clean")
else:
    # Find where getAIHistory starts (just after the old duplicate)
    gethistory = content.find('export async function getAIHistory', second)
    if gethistory == -1:
        print("ERROR: Could not find getAIHistory marker")
    else:
        # Remove from second occurrence to just before getAIHistory
        new_content = content[:second].rstrip() + '\n\n' + content[gethistory:]
        with open('/home/artic/artic-hms/backend/src/modules/super-admin/super-admin.service.js', 'w') as f:
            f.write(new_content)
        print(f"Removed duplicate processAIQuery (was at char {second})")
        print(f"File is now {len(new_content)} chars (was {len(content)})")
PYEOF

echo ""
echo "Checking syntax..."
node --check /home/artic/artic-hms/backend/src/modules/super-admin/super-admin.service.js 2>&1
echo ""
echo "Restarting backend..."
cd /home/artic/artic-hms/backend
pm2 delete artic-hms-backend 2>/dev/null || true
pm2 start /home/artic/artic-hms/backend/ecosystem.config.cjs
pm2 save
sleep 8
/usr/bin/curl -s --max-time 5 http://localhost:4001/health && echo "Backend OK" || echo "Backend still not responding"
