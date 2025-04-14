import subprocess

# Replace this path with the one you saw in the GitHub error message
BIG_FILE_PATH = "node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node"

print(f"🚨 Removing {BIG_FILE_PATH} from Git history...")

# Git command to remove the file from all history
commands = [
    f'git filter-branch --force --index-filter "git rm --cached --ignore-unmatch {BIG_FILE_PATH}" --prune-empty --tag-name-filter cat -- --all',
    'git reflog expire --expire=now --all',
    'git gc --prune=now --aggressive'
]

for cmd in commands:
    print(f"\n▶ Running: {cmd}")
    subprocess.call(cmd, shell=True)

print("\n✅ Done! You should now be able to push without size errors.")
