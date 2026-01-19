#!/bin/bash
# Build script for Firefox extension
echo "Building Keyword Highlighter for Firefox..."

# Copy Firefox manifest
cp -f manifest.firefox.json manifest.json

echo ""
echo "Firefox build ready!"
echo "To install:"
echo "1. Open Firefox and go to about:debugging#/runtime/this-firefox"
echo "2. Click 'Load Temporary Add-on'"
echo "3. Select manifest.json from this directory"
echo ""
