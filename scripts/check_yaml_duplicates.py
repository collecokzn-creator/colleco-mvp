#!/usr/bin/env python3
"""Check YAML files for duplicate mapping keys using ruamel.yaml.

Usage: python scripts/check_yaml_duplicates.py <dir>
Exits with code 1 if duplicate keys or parse errors are found.
"""
import sys
from pathlib import Path

try:
    from ruamel.yaml import YAML
    from ruamel.yaml.constructor import DuplicateKeyError
except Exception as e:
    print("This script requires 'ruamel.yaml'. Install with: pip install ruamel.yaml")
    raise


def check_file(path: Path):
    yaml = YAML()
    try:
        yaml.load(path.read_text())
        return None
    except DuplicateKeyError as e:
        return f"DuplicateKeyError: {e}"
    except Exception as e:
        return f"PARSE_ERROR: {e}"


def main(dirpath: str) -> int:
    p = Path(dirpath)
    if not p.exists():
        print(f"Path not found: {p}")
        return 2

    files = list(sorted(p.rglob('*.yml'))) + list(sorted(p.rglob('*.yaml')))
    errors = []
    for fp in files:
        msg = check_file(fp)
        if msg:
            errors.append((fp, msg))

    if errors:
        print("Duplicate or parse errors found in YAML files:")
        for fp, msg in errors:
            print(f"- {fp}: {msg}")
        return 1

    print("No duplicate YAML keys or parse errors found.")
    return 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: check_yaml_duplicates.py <dir>")
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
