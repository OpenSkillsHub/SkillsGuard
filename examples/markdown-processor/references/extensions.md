# Markdown Extensions

## Available Extensions

| Extension | Description |
|-----------|-------------|
| `tables` | GitHub-flavored tables |
| `fenced_code` | Fenced code blocks with syntax highlighting |
| `toc` | Table of contents generation |
| `footnotes` | Footnote support |
| `attr_list` | Attribute lists for elements |

## Usage Example

```python
import markdown

md = markdown.Markdown(extensions=[
    'tables',
    'fenced_code',
    'toc',
    'footnotes'
])

html = md.convert(markdown_text)
toc = md.toc  # Generated table of contents
```

## Custom Extensions

To create a custom extension, inherit from `markdown.Extension`:

```python
from markdown import Extension
from markdown.preprocessors import Preprocessor

class MyExtension(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(
            MyPreprocessor(md),
            'my_preprocessor',
            25
        )
```
