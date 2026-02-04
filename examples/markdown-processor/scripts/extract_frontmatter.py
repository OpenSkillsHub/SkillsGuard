#!/usr/bin/env python3
"""Extract YAML frontmatter from Markdown files."""

import sys
import json
import yaml
from pathlib import Path


def extract_frontmatter(input_path: str) -> dict:
    """Extract YAML frontmatter from a Markdown file.
    
    Args:
        input_path: Path to input Markdown file
        
    Returns:
        Dictionary containing frontmatter data
    """
    input_file = Path(input_path)
    if not input_file.exists():
        print(f"Error: File not found: {input_path}")
        sys.exit(1)
    
    content = input_file.read_text(encoding='utf-8')
    
    if not content.startswith('---'):
        return {}
    
    # Find the closing ---
    end_index = content.find('---', 3)
    if end_index == -1:
        return {}
    
    frontmatter_str = content[3:end_index].strip()
    
    try:
        return yaml.safe_load(frontmatter_str) or {}
    except yaml.YAMLError as e:
        print(f"Error parsing YAML: {e}")
        return {}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: extract_frontmatter.py <input.md>")
        sys.exit(1)
    
    frontmatter = extract_frontmatter(sys.argv[1])
    print(json.dumps(frontmatter, indent=2))
