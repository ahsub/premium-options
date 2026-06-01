# PremiumOptions — Ludwig-Optionsstrategie App

PWA für Cash Secured Puts, Covered Calls und Wheel-Strategie nach Eric Ludwig.

## Features

- **Screener** — Ludwig-Checkliste (13 Kriterien) + Dividenden-Scoring (Rendite, Sicherheit, Wachstum)
- **Live Optionskette** — Tradier API (Greeks via ORATS) + IBKR-Proxy + Demo
- **Prämienrechner** — CSP / CC / Wheel mit Dividenden-Vergleich
- **Roll-Manager** — 3-Stufen-Systematik nach Ludwig Kap. 3
- **Journal** — Trade-Erfassung, Win-Rate, Rendite-Hochrechnung
- **Markt** — Makro-Dashboard, Earnings-Kalender, IV-Analyse

## Dividend-Scoring (Bonus-System)

| Kriterium | Score |
|---|---|
| Dividendenrendite 2–4% | +0.5 Pkt |
| Dividendenrendite >4% | +0.3 Pkt (Vorsicht!) |
| Dividendenwachstum >5%/J | +0.6 Pkt |
| Dividendenwachstum 2–5%/J | +0.3 Pkt |
| Payout-Ratio ≤40% | 4/4 Pkt Sicherheit |
| FCF-Deckung ≥3× | 3/3 Pkt Sicherheit |
| Dividend King (50+ J) | 3/3 Pkt Sicherheit |

## Setup

### Tradier API (empfohlen)
1. Account anlegen: https://brokerage.tradier.com
2. API-Token: Account Settings → API Access
3. In App: Einstellungen → API-Key eintragen → Testen

### IBKR-Proxy (CapTrader)
```bash
pip install flask flask-cors ib_insync
python ibkr_options_proxy.py
# → http://localhost:5001
```

## Deployment

```bash
# Neues Repo: ahsub/premium-options (public — sicher, kein Key im Code)
git init
git remote add origin https://github.com/ahsub/premium-options.git
git add index.html manifest.json README.md
git commit -m "Initial: PremiumOptions v1.0"
git push -u origin main

# GitHub Settings → Pages → Branch: main → / (root)
# URL: https://ahsub.github.io/premium-options
```

## Ludwig-Strategie (Kap. 4 Checkliste)

- Kurs $15–$80
- KGV ≤20
- IV 20–50%
- Payout-Ratio ≤60%
- Umsatz steigend (10 Jahre)
- FCF positiv
- Weekly-Optionen verfügbar
- ATM-Option (δ ~0.50), 30 Tage Laufzeit
- RSI nicht überkauft (<70), steigend
- MACD-Kaufsignal
- Nahe Unterstützung
