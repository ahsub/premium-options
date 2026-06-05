#!/bin/bash
# ═══════════════════════════════════════════════════════
# PremiumOptions + KO-Scanner — MacBook Einrichtung
# Einmalig ausführen: bash setup_macbook.sh
# ═══════════════════════════════════════════════════════
 
GREEN='\033[0;32m'
AMBER='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'
 
echo ""
echo "═══════════════════════════════════════════════"
echo "   PremiumOptions MacBook Setup"
echo "═══════════════════════════════════════════════"
echo ""
 
# ── 1. Homebrew ──
echo -e "${AMBER}⟳ Prüfe Homebrew...${NC}"
if ! command -v brew &>/dev/null; then
    echo "  Installiere Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}✓ Homebrew bereits installiert${NC}"
fi
 
# ── 2. Python 3.11 ──
echo -e "${AMBER}⟳ Prüfe Python 3.11...${NC}"
if ! command -v python3.11 &>/dev/null; then
    echo "  Installiere Python 3.11..."
    brew install python@3.11
else
    echo -e "${GREEN}✓ Python 3.11 bereits installiert${NC}"
fi
 
# ── 3. Virtuelle Umgebung ──
echo -e "${AMBER}⟳ Erstelle virtuelle Umgebung...${NC}"
if [ ! -d "$HOME/ibkr-proxy-env311" ]; then
    python3.11 -m venv ~/ibkr-proxy-env311
    echo -e "${GREEN}✓ Virtuelle Umgebung erstellt${NC}"
else
    echo -e "${GREEN}✓ Virtuelle Umgebung bereits vorhanden${NC}"
fi
 
# ── 4. Python-Pakete installieren ──
echo -e "${AMBER}⟳ Installiere Python-Pakete...${NC}"
source ~/ibkr-proxy-env311/bin/activate
pip install --quiet flask flask-cors ib_insync pyopenssl
echo -e "${GREEN}✓ Pakete installiert${NC}"
 
# ── 5. Projektordner erstellen ──
echo -e "${AMBER}⟳ Erstelle Projektordner...${NC}"
mkdir -p ~/premium-options
echo -e "${GREEN}✓ Ordner ~/premium-options erstellt${NC}"
 
# ── 6. Dateien von GitHub laden ──
echo -e "${AMBER}⟳ Lade Dateien von GitHub...${NC}"
 
curl -sL -o ~/premium-options/ibkr_options_proxy.py \
    "https://raw.githubusercontent.com/ahsub/premium-options/main/ibkr_options_proxy.py"
echo -e "  ${GREEN}✓ ibkr_options_proxy.py${NC}"
 
curl -sL -o ~/premium-options/index.html \
    "https://ahsub.github.io/premium-options/index.html"
echo -e "  ${GREEN}✓ index.html${NC}"
 
curl -sL -o ~/premium-options/start_premium_options.sh \
    "https://raw.githubusercontent.com/ahsub/premium-options/main/start-premium-options.sh"
chmod +x ~/premium-options/start_premium_options.sh
echo -e "  ${GREEN}✓ start_premium_options.sh${NC}"
 
# ── 7. Anthropic Key ──
echo ""
echo -e "${AMBER}⟳ Anthropic API-Key einrichten...${NC}"
if [ -f "$HOME/.premium_options_key" ]; then
    echo -e "${GREEN}✓ API-Key bereits vorhanden${NC}"
else
    echo ""
    echo "  Bitte deinen Anthropic API-Key eingeben"
    echo "  (console.anthropic.com → API Keys)"
    echo ""
    read -p "  API-Key: " ANTHROPIC_KEY
    if [ -n "$ANTHROPIC_KEY" ]; then
        echo "$ANTHROPIC_KEY" > ~/.premium_options_key
        chmod 600 ~/.premium_options_key
        echo -e "${GREEN}✓ API-Key gespeichert in ~/.premium_options_key${NC}"
    else
        echo -e "${AMBER}⚠️  Kein Key eingegeben — später nachholen${NC}"
    fi
fi
 
# ── 8. Finnhub Key ──
echo ""
echo -e "${AMBER}⟳ Finnhub API-Key...${NC}"
echo "  Den Finnhub-Key trägst du direkt in der App unter"
echo "  Einstellungen → Finnhub API-Key ein."
echo -e "${GREEN}✓ Wird in der App gespeichert${NC}"
 
# ── Fertig ──
echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}  ✓ Setup abgeschlossen!${NC}"
echo ""
echo "  Nächste Schritte:"
echo "  1. TWS starten"
echo "  2. ~/premium-options/start_premium_options.sh"
echo "  3. http://localhost:8080 im Browser"
echo "═══════════════════════════════════════════════"
echo ""
 
