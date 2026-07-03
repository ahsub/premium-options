# Premium Options — Strategiedokument

**Version:** 1.0
**Stand:** 03.07.2026
**Ablage:** `ahsub/premium-options/docs/STRATEGIE.md`
**Fortschreibung:** Claude versioniert dieses Dokument bei jeder strategischen Weichenstellung — Governance analog `ko-aggregator/docs/STRATEGIE.md` (UIQ) und `refundex/docs/STRATEGIE.md`.

---

## 1. Leitbild

**Premium Options ist das Bewirtschaftungs-Modul der Investment-Suite — mit dem steuerbewussten Options-Doktor als Kern.**

UIQ entscheidet, was ins Depot kommt. Refundex rechnet ab, was das Depot getan hat. Premium Options füllt die Mitte des Anlegerzyklus: die **laufende Bewirtschaftung von Stillhalter-Positionen** (Cash Secured Puts, Covered Calls, Wheel). Herzstück ist der Options-Doktor:

> **Position rein → Diagnose (Ampel) → Szenariorechnung inkl. deutscher Steuerfolge → Kontext raus.**

Der Differenzierer ist nicht die Options-Mathematik (die können viele Tools), sondern die **deutsche Steuerbrille mit Belegkette**: Was kostet die Ausübung dieses Covered Calls wirklich — auf EUR-Basis, nach FIFO-Lots, topfgerecht (§20 Abs. 6), inklusive 20.000-€-Verlustverrechnungsgrenze? Kein uns bekanntes Retail-Tool verbindet Roll-Entscheidungen mit deutschen Steuerfolgen. Diese Rechenleistung existiert in der Suite bereits: `ko-fifo.js`, `ko-fx.js`, `ko-flex.js` (Refundex-Module) liefern echte FIFO-Lots mit tagesgenauer EUR-Umrechnung.

Die Wertschöpfungskette in vier Stufen (Suite-Muster):

| Stufe | Premium Options | UIQ-Pendant | Refundex-Pendant |
|---|---|---|---|
| 1 | **Positions-Import** (Flex Query / Live-Proxy / manuell) | Regime-Erkennung | Datenextraktion |
| 2 | **Diagnose** (Ampel: OK/WATCH/ROLLEN/DRINGEND) | Strategie-Routing | Klassifikation |
| 3 | **Szenariorechnung** (Ausüben / Rollen / Rückkauf — je netto nach Steuer, EUR, FIFO) | Underlying-Auswahl | Berechnung |
| 4 | **Kontext-Output** (Public: Statistische Kontext-Analyse · EIC: dezidierte Empfehlung) | Instrumenten-Vorschlag | Formular-Output |

Geplante Verbreiterung (hinter Recherche-Gate, ROADMAP P4): Multi-Leg-Strategien (Straddle, Strangle, Iron Condor) und LEAPs — Public als Erklär-Module **mit Steuer-Check je Strategie** (Legs werden separat besteuert; 20k-Topf-Falle), EIC mit konkreten Strike-/DTE-Vorschlägen.

### Kernversprechen

1. **Belegkette:** Jede Steuerzahl im Doktor ist auf FIFO-Lot + Wechselkurs + Rechtsnorm rückführbar — keine USD-Pauschalnäherungen.
2. **Ehrliche Diagnostik:** Der Doktor benennt Unsicherheiten (Näherungswerte markiert) und Grenzen (was er nicht rechnet).
3. **Compliance by Design:** Public-Modus ohne Empfehlungssprache; Handlungsempfehlungen ausschließlich im PIN-gated EIC-Modus.
4. **Datensouveränität:** Browser-first; Depotdaten verlassen den Rechner des Nutzers nicht.

---

## 2. Positionierung: drittes Modul der Investment-Suite

```
┌────────────────────────────────────────────────────────────────┐
│                      INVESTMENT-SUITE                          │
│                                                                │
│  UnderlyingIQ         Premium Options        Refundex          │
│  (Vorne: Entscheiden) (Mitte: Bewirtschaften)(Hinten: Abrechnen)│
│  Regime → Strategie   Import → Diagnose →    Flex → Töpfe →    │
│  → Underlying → Instr. Szenario → Kontext    FIFO → KAP        │
│                                                                │
│  Gemeinsame Module: ko-flex, ko-fifo, ko-fx, ko-dba,           │
│  Hilfe-System, CF-Pages-Deploy-Muster, EIC-PIN-Muster          │
└────────────────────────────────────────────────────────────────┘
```

Die **Suite-Grundgesetze** (streng-modularer Aufbau; ES6-Zielarchitektur; 80/20-Vorbehalt; No-Hallucination auf allen Ebenen; Compliance by Design) gelten unverändert — Referenz: `refundex/docs/STRATEGIE.md` §2. PO-spezifische Ausprägung: Die Steuerlogik wird **nicht dupliziert**, sondern aus den Suite-Modulen bezogen (ein Bugfix wirkt in Refundex und PO zugleich).

---

## 3. SWOT-Analyse

### Stärken (intern)

| # | Stärke | Beleg |
|---|---|---|
| S1 | **Funktionsreicher Prototyp** — Screener (13-Kriterien-Checkliste + Dividend-Scoring), Optionsketten (Tradier/IBKR/Demo), Prämienrechner, Roll-Manager, Journal, Markt-Dashboard | index.html, Stand 06/2026 |
| S2 | **Doktor-Grundgerüst steht** — Ampel-Diagnostik nach ITM-Tiefe/DTE, CC-Steuerwarnung konzeptionell angelegt, KI-Zweitmeinung angebunden | `diagnosePosition()`, `getTaxAnalysis()` |
| S3 | **Suite-Module für den USP existieren fertig und getestet** — ko-fifo (FIFO-Lots), ko-fx (tagesgenaue EUR-Kurse), ko-flex (Positions-/Trade-Import), ko-dba (Quellensteuer) aus Refundex | `refundex/modules/` |
| S4 | **Inhaber ist die Zielgruppe** — aktiver Wheel-Trader (CapTrader ~212k, DDOG/IREN/HOOD u. a.) mit etablierter Roll-Systematik = eingebauter Realitätstest | — |
| S5 | **Zyklus-Vollständigkeit** — PO schließt die letzte Lücke der Suite; jede Phase des Anlegerlebens hat ein Modul | Suite-Diagramm §2 |

### Schwächen (intern)

| # | Schwäche | Konsequenz |
|---|---|---|
| W1 | **Ludwig-Altlast: 60 Vorkommen** (README „nach Eric Ludwig", `getLudwigRecommendation()`, KI-Prompt) — das bei UIQ gelöste Namensrechtsproblem hat dieses Repo nie erreicht | Publikationsblocker; Rename → `atmna` (P1.1) |
| W2 | **Empfehlungssprache im Public-Pfad** („Im Geld — Rollen!", KI-Output „Halten/Rollen/Schließen" + Strike) — verstößt gegen das eigene Suite-Grundgesetz | Publikationsblocker; Public/EIC-Split (P1.2) |
| W3 | **Steuerrechnung ohne Belegkette und teils falsch** — pauschal 25 % + Soli auf USD; ignoriert EUR-Basis, FIFO, Topf-Trennung (Stillhalterprämie ≠ Aktiengewinn), 20k-Cap, Pauschbetrag | USP unglaubwürdig bis P2.3 erledigt |
| W4 | **Lokaler Flask-Proxy nicht publikumsfähig** — kein Endnutzer betreibt Python + IB-Gateway | Flex-Query-Adapter als Public-Datenpfad (P2.1) |
| W5 | **Magic Numbers im Roll-Manager** (+15, +25, ×0.87 ohne Quelle) | Kennzeichnen oder durch Chain-Daten ersetzen (P2.4) |
| W6 | **Monolith ohne ES6-Muster; README nennt falschen Deploy-Weg (GitHub Pages)** | Schrittweise Migration; Doku-Fix (P1.3) |
| W7 | **Bus-Faktor 1** (suiteweit) | RUNBOOK-Verweis; Suite-RUNBOOK-Konsolidierung mittelfristig |

### Chancen (extern)

| # | Chance | Einordnung |
|---|---|---|
| O1 | **Wachsende deutschsprachige Optionshändler-Community** (CapTrader/Lynx/IBKR; Stillhalter-Content boomt) mit hoher Engagement-Tiefe | Nische, aber zahlungsbereit und aktiv |
| O2 | **§20 Abs. 6 / 20k-Cap macht Steuerbewusstsein zur Pflicht** — deutsche Optionshändler MÜSSEN steuerlich denken; ein Tool, das das übernimmt, trifft einen echten Schmerz | Regulatorischer Rückenwind für den USP |
| O3 | **Kein bekanntes Retail-Tool verbindet Roll-Entscheidung mit deutscher Steuerfolge** *(Vorbehalt: Marktüberblick ohne Websuche; Recherche-Gate P4a prüft mit)* | First-Mover-Fenster |
| O4 | **Multi-Leg-Steuer-Check als Alleinstellung** — Iron Condor & Co. sind in DE steuerlich asymmetrisch (Legs separat besteuert, Verlust-Legs im 20k-Topf); ein warnender Steuer-Check je Strategie ist schützend, seriös und konkurrenzlos | Kern der P4-Erweiterung — Erklär-Content allein wäre Commodity |
| O5 | **Suite-Cross-Selling in beide Richtungen** — PO-Nutzer haben zwingend das KAP-Problem (→ Refundex); Refundex-Optionshändler sind geborene PO-Nutzer; UIQ liefert die Underlying-Auswahl davor | Identische Zielgruppe, drei Andockpunkte |

### Risiken (extern)

| # | Risiko | Gegenmaßnahme |
|---|---|---|
| R1 | **BaFin/§34b WpHG** — Anlageempfehlungen im öffentlichen Bereich | Public/EIC-Split (UIQ-Muster), Formulierungsdisziplin „Statistische Kontext-Analyse" |
| R2 | **Namensrecht „Ludwig"** | Vollständiger Rename P1.1, vor jeder Publikation |
| R3 | **StBerG-Grenze der Steuer-Szenarien** — individuelle Gestaltungsempfehlung („rolle wegen Steuer X") wäre Hilfeleistung in Steuersachen | Rechenwerk-Prinzip: Szenarien nebeneinander ausweisen, Bewertung beim Nutzer; Refundex-Disclaimer-Muster |
| R4 | **Rechtsprechungs-Risiko §20 Abs. 6** — 20k-Cap verfassungsrechtlich umstritten; Kernlogik beträfe PO und Refundex gleichzeitig | Topf-Logik nur in Suite-Modulen (eine Änderungsstelle) |
| R5 | **API-Abhängigkeit Optionsketten** (Tradier-Konditionen/Limits, ORATS-Greeks) | Demo-Modus als Fallback; Datenquellen-Frage im P4-Gate |
| R6 | **Komplexitätsfalle Multi-Leg** — Vollständigkeitsanspruch würde 80/20 sprengen | Start mit 3–4 Strategien, Rest dokumentierte Grenze |

---

## 4. Compliance-Rahmen: das erste Doppel-Schranken-Modul

Premium Options berührt als einziges Suite-Modul **beide** regulatorischen Schranken:

1. **BaFin / WpHG (wie UIQ):** Alles, was nach Kauf-/Verkaufs-/Roll-Empfehlung aussieht, ist im Public-Modus untersagt. Public liefert ausschließlich „Statistische Kontext-Analyse" (ITM-Tiefe, Zeitwert, Break-even-Szenarien, historische Einordnung). Dezidierte Empfehlungen (konkreter Strike, konkretes DTE, „Rollen!") existieren nur im PIN-gated EIC-Modus. Der KI-Prompt wird zweigeteilt: Public-Prompt ohne Empfehlungsauftrag, EIC-Prompt mit.
2. **StBerG (wie Refundex):** Steuer-Szenarien sind Rechenwerk nach allgemeinen Regeln — Szenarien werden **nebeneinander** ausgewiesen (Ausüben: netto X € / Rollen: netto Y €), die Entscheidung trifft der Nutzer. Formulierungen wie „steuerlich solltest du…" sind untersagt. Disclaimer-Standard: Refundex-Vier-Punkte-Muster, angepasst.

**No-Hallucination konkret:** Steuerzahlen nur aus Suite-Modulen mit Belegkette; KI erklärt und formuliert, rechnet aber nie Steuern oder Greeks; Marktdaten-Näherungen (Demo-Modus, EZB-Kurse) sichtbar markiert; Roll-Faustformeln entweder durch echte Chain-Daten ersetzt oder als solche gekennzeichnet.

---

## 5. Entscheidungsfilter (vier Fragen vor jedem neuen Feature)

1. **Belegketten-Frage:** Ist jeder Ausgabewert deterministisch und auf Datenzeile/Modul/Rechtsquelle rückführbar? KI-Text bleibt Erklärung, nie Rechnung?
2. **80/20-Frage:** ≤ 20 % Aufwand für ≥ 80 % Nutzerwert — oder Randfall, der als dokumentierte Grenze besser aufgehoben ist?
3. **ES6/Modularitäts-Frage:** Als sauberes Modul baubar, idealerweise als Suite-Modul (nutzt/erweitert ko-*), ohne den Monolithen zu vergrößern?
4. **Doppel-Compliance-Frage:** Bleibt Public frei von Empfehlungs- UND Steuerberatungssprache? Gehört das Feature ganz oder teilweise hinter den EIC-PIN?

---

## 6. Fortschreibungshistorie

| Version | Datum | Änderung |
|---|---|---|
| 1.0 | 03.07.2026 | Erstfassung: Leitbild (steuerbewusster Options-Doktor als USP), Suite-Positionierung als drittes Modul, SWOT inkl. Ludwig-/BaFin-/Steuer-Befunde aus Code-Review, Doppel-Schranken-Compliance (WpHG + StBerG), Entscheidungsfilter |
