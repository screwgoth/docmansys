#!/bin/bash

# Script to increase font sizes and spacing

cd ~/code/docmansys/public

for file in documents.html viewer.html index.html; do
    if [ -f "$file" ]; then
        echo "Updating typography in $file..."
        
        # Font size updates (increase by 2-4px generally)
        sed -i 's/font-size: 12px;/font-size: 14px;/g' "$file"
        sed -i 's/font-size: 13px;/font-size: 16px;/g' "$file"
        sed -i 's/font-size: 14px;/font-size: 16px;/g' "$file"
        sed -i 's/font-size: 16px;/font-size: 18px;/g' "$file" # Some 16 go to 18
        sed -i 's/font-size: 18px;/font-size: 20px;/g' "$file"
        sed -i 's/font-size: 20px;/font-size: 24px;/g' "$file"
        
        # Padding updates (increase by 4-8px)
        sed -i 's/padding: 10px 16px;/padding: 14px 20px;/g' "$file"
        sed -i 's/padding: 12px 20px;/padding: 16px 24px;/g' "$file"
        sed -i 's/padding: 16px 20px;/padding: 20px 24px;/g' "$file"
        sed -i 's/padding: 16px;/padding: 24px;/g' "$file"
        sed -i 's/padding: 20px;/padding: 28px;/g' "$file"
        sed -i 's/padding: 24px;/padding: 32px;/g' "$file"
        
        # Gap updates
        sed -i 's/gap: 8px;/gap: 12px;/g' "$file"
        sed -i 's/gap: 12px;/gap: 16px;/g' "$file"
        sed -i 's/gap: 16px;/gap: 20px;/g' "$file"
        
        # Margin updates
        sed -i 's/margin-bottom: 12px;/margin-bottom: 16px;/g' "$file"
        sed -i 's/margin-bottom: 16px;/margin-bottom: 24px;/g' "$file"
        sed -i 's/margin-bottom: 20px;/margin-bottom: 28px;/g' "$file"
        sed -i 's/margin-bottom: 24px;/margin-bottom: 32px;/g' "$file"
        sed -i 's/margin-bottom: 32px;/margin-bottom: 48px;/g' "$file"
        
        # Border radius updates
        sed -i 's/border-radius: 6px;/border-radius: 8px;/g' "$file"
        sed -i 's/border-radius: 8px;/border-radius: 12px;/g' "$file"
        
        # Icon size updates
        sed -i 's/width: 40px;$/width: 56px;/g' "$file"
        sed -i 's/height: 40px;$/height: 56px;/g' "$file"
        sed -i 's/width: 36px;$/width: 48px;/g' "$file"
        sed -i 's/height: 36px;$/height: 48px;/g' "$file"
        
        echo "✓ Updated $file"
    fi
done

echo ""
echo "All typography and spacing updated!"
