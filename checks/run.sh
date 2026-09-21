#!/bin/sh
# The one command. Exits 1 on the first failing step.
set -e
cd "$(dirname "$0")/.."
npm run --silent check
