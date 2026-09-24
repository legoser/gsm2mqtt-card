#!/bin/bash
set -e

# Default HA config dir
HA_CONFIG_DIR="/config"
if [ ! -d "$HA_CONFIG_DIR" ]; then
    if [ -d "$HOME/.homeassistant" ]; then
        HA_CONFIG_DIR="$HOME/.homeassistant"
    else
        echo "Error: Home Assistant config directory not found. Please run this script in the same environment as your Home Assistant installation."
        echo "Looked for: /config and $HOME/.homeassistant"
        exit 1
    fi
fi

WWW_DIR="$HA_CONFIG_DIR/www/gsm2mqtt"
mkdir -p "$WWW_DIR"

echo "Downloading the latest gsm2mqtt-card.js..."
# If this is run from a downloaded release archive
if [ -f "gsm2mqtt-card.js" ]; then
    cp gsm2mqtt-card.js "$WWW_DIR/"
elif [ -f "dist/gsm2mqtt-card.js" ]; then
    cp dist/gsm2mqtt-card.js "$WWW_DIR/"
else
    # Try fetching from Github releases as fallback
    LATEST_URL=$(curl -s https://api.github.com/repos/ej/GSM2MQTT-HA-addon/releases/latest | grep "browser_download_url.*gsm2mqtt-card\.js" | cut -d '"' -f 4)
    if [ -z "$LATEST_URL" ]; then
        echo "Warning: Could not find the latest release on GitHub. Please copy gsm2mqtt-card.js to $WWW_DIR manually."
        exit 1
    fi
    curl -sL "$LATEST_URL" -o "$WWW_DIR/gsm2mqtt-card.js"
fi

chmod 644 "$WWW_DIR/gsm2mqtt-card.js"

echo "=========================================================="
echo "✅ GSM2MQTT HA Addon installed successfully!"
echo "File location: $WWW_DIR/gsm2mqtt-card.js"
echo ""
echo "Next steps in Home Assistant UI:"
echo "1. Go to Settings -> Dashboards -> 3 dots (top right) -> Resources"
echo "2. Click 'Add Resource'"
echo "3. URL: /local/gsm2mqtt/gsm2mqtt-card.js"
echo "4. Resource type: JavaScript Module"
echo "5. Refresh your browser (Ctrl+F5) to clear cache."
echo "=========================================================="
