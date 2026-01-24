#!/bin/bash
# Comprehensive script to sync all assets from BRAND-OS repository
# Uses git sparse-checkout for efficient downloading

set -e

REPO_URL="https://github.com/opensesh/BRAND-OS.git"
TEMP_DIR="/tmp/brand-os-sync-$$"
TARGET_DIR="public"

echo "Syncing all assets from BRAND-OS repository..."

# Create temp directory
mkdir -p "${TEMP_DIR}"
cd "${TEMP_DIR}"

# Clone only the public folder using sparse-checkout
echo "Cloning BRAND-OS repository (public folder only)..."
git clone --no-checkout --depth 1 "${REPO_URL}" .
git sparse-checkout init --cone
git sparse-checkout set public
git checkout

# Copy public folder contents to target
echo "Copying assets to ${TARGET_DIR}..."
cd - > /dev/null
cp -r "${TEMP_DIR}/public/"* "${TARGET_DIR}/" 2>/dev/null || true
cp -r "${TEMP_DIR}/public/." "${TARGET_DIR}/" 2>/dev/null || true

# Cleanup
rm -rf "${TEMP_DIR}"

echo "✓ Asset sync complete!"
echo ""
echo "Synced structure:"
find "${TARGET_DIR}" -type f | head -20

