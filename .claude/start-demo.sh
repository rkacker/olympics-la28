#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/../demo"
exec npx vite --port 5173
