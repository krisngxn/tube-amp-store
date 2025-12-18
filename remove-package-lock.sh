#!/bin/bash
# Script to remove package-lock.json from git if it exists

echo "Checking for package-lock.json in git repository..."

# Check if file exists in git
if git ls-files --error-unmatch package-lock.json >/dev/null 2>&1; then
    echo "Found package-lock.json in git. Removing..."
    git rm --cached package-lock.json
    echo "✅ Removed package-lock.json from git"
    echo ""
    echo "Next steps:"
    echo "1. Commit this change: git commit -m 'Remove package-lock.json (using yarn.lock only)'"
    echo "2. Push to remote: git push"
else
    echo "✅ package-lock.json is not tracked in git"
    echo ""
    echo "The warning might be from:"
    echo "- Vercel build cache (will clear on next deploy)"
    echo "- File exists in a different branch"
    echo ""
    echo "Since it's already in .gitignore, it won't be committed in the future."
fi

