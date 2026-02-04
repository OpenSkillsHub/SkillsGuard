---
name: markdown-processor
description: Process and convert Markdown files. Use when users need to convert Markdown to HTML, PDF, or other formats, extract metadata, validate Markdown syntax, or batch process multiple Markdown files.
license: MIT
---

# Markdown Processing Guide

## Overview

This skill provides tools for processing Markdown files, including conversion, validation, and metadata extraction.

## Quick Start

```python
import markdown

# Convert Markdown to HTML
md = markdown.Markdown()
html = md.convert("# Hello World")
```

## Scripts

### Convert Markdown to HTML

Run from this directory:

```bash
python scripts/convert_to_html.py input.md output.html
```

### Extract Frontmatter

```bash
python scripts/extract_frontmatter.py input.md
```

### Validate Markdown Syntax

```bash
python scripts/validate_syntax.py input.md
```

## Advanced Features

For table of contents generation, see [references/toc.md](references/toc.md).
For custom extensions, see [references/extensions.md](references/extensions.md).

## Best Practices

1. Always validate Markdown before conversion
2. Use frontmatter for metadata
3. Keep images in a relative `assets/` directory
