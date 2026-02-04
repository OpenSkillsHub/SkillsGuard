#!/usr/bin/env python3
"""Simple code review script."""

import sys
import re
import json
import argparse
from pathlib import Path
from typing import List, Dict


def review_python(content: str, filename: str) -> List[Dict]:
    """Review Python code for common issues."""
    issues = []
    lines = content.split('\n')
    
    for i, line in enumerate(lines, 1):
        # Check for eval usage
        if 'eval(' in line and not line.strip().startswith('#'):
            issues.append({
                'line': i,
                'severity': 'CRITICAL',
                'rule': 'SEC001',
                'message': 'Use of eval() is dangerous and can lead to code injection'
            })
        
        # Check for exec usage
        if 'exec(' in line and not line.strip().startswith('#'):
            issues.append({
                'line': i,
                'severity': 'CRITICAL',
                'rule': 'SEC002',
                'message': 'Use of exec() is dangerous and can lead to code injection'
            })
        
        # Check for hardcoded passwords
        if re.search(r'password\s*=\s*["\'][^"\']+["\']', line, re.IGNORECASE):
            issues.append({
                'line': i,
                'severity': 'CRITICAL',
                'rule': 'SEC003',
                'message': 'Hardcoded password detected'
            })
        
        # Check for bare except
        if re.match(r'\s*except\s*:', line):
            issues.append({
                'line': i,
                'severity': 'WARNING',
                'rule': 'QUAL001',
                'message': 'Bare except clause - specify exception type'
            })
        
        # Check for print statements (in production code)
        if re.match(r'\s*print\(', line):
            issues.append({
                'line': i,
                'severity': 'INFO',
                'rule': 'QUAL002',
                'message': 'Print statement found - consider using logging'
            })
    
    return issues


def main():
    parser = argparse.ArgumentParser(description='Code Review Tool')
    parser.add_argument('file', help='File to review')
    parser.add_argument('--format', choices=['json', 'text'], default='text')
    args = parser.parse_args()
    
    file_path = Path(args.file)
    if not file_path.exists():
        print(f"Error: File not found: {args.file}")
        sys.exit(1)
    
    content = file_path.read_text(encoding='utf-8')
    
    if file_path.suffix == '.py':
        issues = review_python(content, args.file)
    else:
        issues = [{'message': f'Unsupported file type: {file_path.suffix}'}]
    
    if args.format == 'json':
        print(json.dumps({'file': args.file, 'issues': issues}, indent=2))
    else:
        if issues:
            print(f"Code Review Results for {args.file}:")
            print("-" * 50)
            for issue in issues:
                print(f"  Line {issue.get('line', '?')}: [{issue.get('severity', 'INFO')}] {issue['message']}")
        else:
            print(f"✓ No issues found in {args.file}")


if __name__ == "__main__":
    main()
