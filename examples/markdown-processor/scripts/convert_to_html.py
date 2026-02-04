#!/usr/bin/env python3
"""Convert Markdown file to HTML."""

import sys
import markdown
from pathlib import Path


def convert_to_html(input_path: str, output_path: str) -> None:
    """Convert a Markdown file to HTML.
    
    Args:
        input_path: Path to input Markdown file
        output_path: Path to output HTML file
    """
    input_file = Path(input_path)
    if not input_file.exists():
        print(f"Error: File not found: {input_path}")
        sys.exit(1)
    
    md_content = input_file.read_text(encoding='utf-8')
    
    md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
    html_content = md.convert(md_content)
    
    # Wrap in basic HTML structure
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{input_file.stem}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        pre {{ background: #f4f4f4; padding: 10px; overflow-x: auto; }}
        code {{ background: #f4f4f4; padding: 2px 5px; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
    </style>
</head>
<body>
{html_content}
</body>
</html>"""
    
    Path(output_path).write_text(full_html, encoding='utf-8')
    print(f"Successfully converted {input_path} to {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: convert_to_html.py <input.md> <output.html>")
        sys.exit(1)
    
    convert_to_html(sys.argv[1], sys.argv[2])
