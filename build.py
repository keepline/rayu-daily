#!/usr/bin/env python3
"""扫描 diary/*.md，重新生成 manifest.json（日记索引）。"""

import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).parent
DIARY_DIR = ROOT / "diary"
MANIFEST = ROOT / "manifest.json"
CST = timezone(timedelta(hours=8))
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_front_matter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    parts = text.split("\n---", 1)
    if len(parts) != 2:
        return {}, text
    meta = {}
    for line in parts[0].lstrip("-").strip().splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip().lower()] = value.strip().strip('"').strip("'")
    body = parts[1].split("\n", 1)[-1].lstrip("\n")
    return meta, body


def build() -> None:
    days = []
    for path in sorted(DIARY_DIR.glob("*.md")):
        date = path.stem
        if not DATE_RE.match(date):
            print(f"跳过（文件名不是 YYYY-MM-DD）：{path.name}")
            continue
        meta, body = parse_front_matter(path.read_text(encoding="utf-8"))
        title_match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
        title = meta.get("title") or (title_match.group(1).strip() if title_match else date)
        words = len(re.sub(r"\s", "", body))
        days.append(
            {
                "date": date,
                "title": title,
                "weather": meta.get("weather", ""),
                "mood": meta.get("mood", ""),
                "summary": meta.get("summary", ""),
                "words": words,
            }
        )

    days.sort(key=lambda d: d["date"], reverse=True)
    manifest = {
        "generated_at": datetime.now(CST).isoformat(timespec="seconds"),
        "days": days,
    }
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"已生成 {MANIFEST.name}：{len(days)} 篇日记")


if __name__ == "__main__":
    build()
