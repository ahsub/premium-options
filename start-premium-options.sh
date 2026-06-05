#!/bin/bash
# ═══════════════════════════════════════════════════════
# PremiumOptions — Start-Script
# Doppelklick zum Starten: Rechtsklick → Öffnen mit → Terminal
#
# Einmalig Key speichern:
#   echo 'sk-ant-...' > ~/.premium_options_key
#   chmod 600 ~/.premium_options_key
# ═══════════════════════════════════════════════════════

VENV="$HOME/ibkr-proxy-env311"
PROXY="$HOME/premium-options/ibkr_options_proxy.py"
WEBDIR="$HOME/premium-options"
APP_URL="http://localhost:8080"
HEALTH_URL="http://localhost:5001/health"
KEY_FILE="$HOME/.premium_options_key"

GREEN='\033[0;32m'
AMBER='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════"
echo "   PremiumOptions Starter"
echo "═══════════════════════════════════════════════"

# ── Anthropic Key laden ──
if [ -f "$KEY_FILE" ]; then
    export ANTHROPIC_API_KEY=$(cat "$KEY_FILE")
    echo -e "${GREEN}✓ Anthropic API-Key geladen${NC}"
else
    echo -e "${AMBER}⚠️  Kein API-Key gefunden.${NC}"
    echo "  Einmalig ausführen:"
    echo "  echo 'sk-ant-...' > ~/.premium_options_key"
    echo "  chmod 600 ~/.premium_options_key"
fi

# ── Alte Prozesse beenden ──
OLD_PROXY=$(lsof -ti:5001 2>/dev/null)
OLD_WEB=$(lsof -ti:8080 2>/dev/null)
[ -n "$OLD_PROXY" ] && kill -9 $OLD_PROXY 2>/dev/null && echo -e "${AMBER}⟳ Alter Proxy beendet${NC}"
[ -n "$OLD_WEB" ] && kill -9 $OLD_WEB 2>/dev/null && echo -e "${AMBER}⟳ Alter Webserver beendet${NC}"
sleep 1

# ── TWS prüfen ──
if pgrep -f "Trader Workstation" > /dev/null 2>&1 || pgrep -f "tws" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ TWS läuft${NC}"
else
    echo -e "${AMBER}⚠️  TWS nicht gefunden — bitte manuell starten${NC}"
fi

# ── IBKR Proxy starten ──
echo -e "${AMBER}⟳ IBKR Proxy wird gestartet...${NC}"
source "$VENV/bin/activate"
python3 "$PROXY" &
PROXY_PID=$!
sleep 4

# ── Webserver starten ──
echo -e "${AMBER}⟳ Webserver wird gestartet...${NC}"
cd "$WEBDIR"
python3 -m http.server 8080 &
WEB_PID=$!
sleep 2

# ── Status prüfen ──
STATUS=$(curl -sk "$HEALTH_URL" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','?'))" 2>/dev/null)
if [ "$STATUS" = "ok" ]; then
    echo -e "${GREEN}✓ Proxy verbunden mit TWS!${NC}"
else
    echo -e "${AMBER}⚠️  Proxy läuft, TWS-Verbindung wird aufgebaut...${NC}"
fi

# ── App in Chrome öffnen ──
sleep 1
open -a "Google Chrome" "$APP_URL"

echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}  ✓ PremiumOptions läuft!${NC}"
echo "  App:    http://localhost:8080"
echo "  Proxy:  http://localhost:5001"
echo "  Zum Beenden: Ctrl+C"
echo "═══════════════════════════════════════════════"
echo ""

trap "kill $PROXY_PID $WEB_PID 2>/dev/null; echo 'Beendet.'" EXIT
wait $PROXY_PID
