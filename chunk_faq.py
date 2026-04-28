import re
import json
from pathlib import Path

INPUT_FILE = "kb_faq.md"
OUTPUT_FILE = "chunks.jsonl"

def read_markdown_file(path):
    return Path(path).read_text(encoding="utf-8")

def split_by_h2_sections(markdown_text):
    pattern = r"(?=^##\s.+$)"
    sections = re.split(pattern, markdown_text, flags=re.MULTILINE)

    cleaned_sections = []
    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        if sec.startswith("# "):
            continue
        cleaned_sections.append(sec)

    return cleaned_sections

def extract_title_and_text(section_text):
    lines = section_text.splitlines()
    title = "Untitled"

    if lines and lines[0].startswith("## "):
        title = lines[0][3:].strip()
        body = "\n".join(lines[1:]).strip()
    else:
        body = section_text.strip()

    return title, body

def main():
    md = read_markdown_file(INPUT_FILE)
    sections = split_by_h2_sections(md)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for i, sec in enumerate(sections, start=1):
            title, body = extract_title_and_text(sec)

            chunk = {
                "id": f"faq_{i:03d}",
                "title": title,
                "text": body,
                "source": INPUT_FILE
            }

            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

    print(f"✅ Created {len(sections)} chunks in {OUTPUT_FILE}")

if __name__ == "__main__":
    main()