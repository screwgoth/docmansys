#!/bin/bash

# Script to replace hard-coded colors with CSS variables

cd ~/code/docmansys/public

for file in dashboard.html documents.html viewer.html index.html; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Remove hard-coded body background
        sed -i '/body {/{n;s/background: #0f172a;//;}' "$file"
        sed -i '/body {/{n;s/background: #0f172a;$//;}' "$file"
        
        # Replace colors with CSS variables
        sed -i 's/#0f172a/var(--bg-primary)/g' "$file"
        sed -i 's/#1e293b/var(--bg-card)/g' "$file"
        sed -i 's/#2d2d2d/var(--bg-secondary)/g' "$file"
        sed -i 's/#f8fafc/var(--text-primary)/g' "$file"
        sed -i 's/#f5f5f5/var(--text-primary)/g' "$file"
        sed -i 's/#334155/var(--border-color)/g' "$file"
        sed -i 's/#cbd5e1/var(--text-primary)/g' "$file"
        sed -i 's/#94a3b8/var(--text-secondary)/g' "$file"
        sed -i 's/#64748b/var(--text-secondary)/g' "$file"
        sed -i 's/#3b82f6/var(--accent-primary)/g' "$file"
        sed -i 's/#2563eb/var(--accent-hover)/g' "$file"
        sed -i 's/#475569/var(--bg-secondary)/g' "$file"
        
        echo "✓ Updated $file"
    fi
done

echo ""
echo "All colors updated to use CSS variables!"
