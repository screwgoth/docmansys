#!/bin/bash

# Script to add theme toggle to all HTML pages

cd ~/code/docmansys/public

# Function to add theme toggle to a file
add_theme_toggle() {
    local file=$1
    
    # Check if theme.js is already included
    if grep -q "theme.js" "$file"; then
        echo "✓ $file already has theme.js"
        return
    fi
    
    # Add theme.js script before auth.js
    sed -i 's|<script src="/js/auth.js">|<script src="/js/theme.js"></script>\n    <script src="/js/auth.js">|' "$file"
    
    # Add theme toggle in sidebar (after logo, before nav-menu)
    sed -i '/<\/a>/,/<nav class="nav-menu">/ {
        /<\/a>/ a\
\
        <!-- Theme Toggle -->\
        <div class="theme-toggle">\
            <button class="theme-toggle-btn" onclick="toggleTheme()">\
                <span class="theme-icon" id="theme-icon">🌙</span>\
                <span id="theme-text">Dark Mode</span>\
            </button>\
        </div>
    }' "$file" 2>/dev/null
    
    echo "✓ Updated $file"
}

# Update all HTML files in public directory
for file in *.html; do
    if [ -f "$file" ]; then
        add_theme_toggle "$file"
    fi
done

echo ""
echo "Theme toggle added to all pages!"
