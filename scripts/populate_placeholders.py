from pathlib import Path

root = Path(r"D:\Projectts 2026\ARTIC\Hospital\frontend\app")
keep = {
    root / "login" / "page.tsx",
    root / "dashboard" / "page.tsx",
}

replacement = '''import { RoutePageShell } from "@/components/RoutePageShell";

export default function Page() {
  return <RoutePageShell />;
}
'''

for path in sorted(root.rglob("page.tsx")):
    if path in keep:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        continue
    if "return null;" not in text and text.strip():
        continue
    path.write_text(replacement, encoding="utf-8")
    print(path.relative_to(root))
