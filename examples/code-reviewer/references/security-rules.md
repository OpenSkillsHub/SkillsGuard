# Security Rules Reference

## Critical Security Rules

### SEC001: No eval()

**Risk**: Remote Code Execution

```python
# Bad
result = eval(user_input)

# Good
import ast
result = ast.literal_eval(user_input)  # For simple literals only
```

### SEC002: No exec()

**Risk**: Remote Code Execution

Never use `exec()` with user-controlled input.

### SEC003: No Hardcoded Credentials

**Risk**: Credential Exposure

```python
# Bad
password = "secret123"

# Good
import os
password = os.environ.get("DB_PASSWORD")
```

### SEC004: SQL Injection

**Risk**: Database Compromise

```python
# Bad
query = f"SELECT * FROM users WHERE id = {user_id}"

# Good
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))
```

### SEC005: Command Injection

**Risk**: System Compromise

```python
# Bad
os.system(f"echo {user_input}")

# Good
import subprocess
subprocess.run(["echo", user_input], shell=False)
```

## Warning Rules

### QUAL001: Bare Except

Always specify exception types.

### QUAL002: Print Statements

Use logging for production code.
