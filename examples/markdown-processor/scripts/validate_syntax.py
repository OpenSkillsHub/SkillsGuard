#!/usr/bin/env python3
"""Validate Markdown syntax."""

import sys
import re
from pathlib import Path


def validate_markdown(input_path: str) -> list:
    """Validate Markdown syntax and return issues.
    
    Args:
        input_path: Path to input Markdown file
        
    Returns:
        List of validation issues
    """
    input_file = Path(input_path)
    if not input_file.exists():
        print(f"Error: File not found: {input_path}")
        sys.exit(1)
    
    content = input_file.read_text(encoding='utf-8')
    lines = content.split('\n')
    issues = []
    
    for i, line in enumerate(lines, 1):
        # Check for trailing whitespace
        if line.endswith(' ') and not line.endswith('  '):
            issues.append(f"Line {i}: Trailing whitespace")
        
        # Check for tabs (prefer spaces)
        if '\t' in line:
            issues.append(f"Line {i}: Tab character found (prefer spaces)")
        
        # Check for broken links
        broken_link = re.search(r'\[([^\]]*)\]\(\s*\)', line)
        if broken_link:
            issues.append(f"Line {i}: Empty link URL for '{broken_link.group(1)}'")
        
        # Check for heading without space after #
        if re.match(r'^#+[^#\s]', line):
            issues.append(f"Line {i}: Missing space after heading marker")
    
    return issues


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: validate_syntax.py <input.md>")
        sys.exit(1)
    
    issues = validate_markdown(sys.argv[1])
    
    if issues:
        print("Validation issues found:")
        for issue in issues:
            print(f"  - {issue}")
        sys.exit(1)
    else:
        print("✓ Markdown syntax is valid")
        sys.exit(0)
