# Premium Options — Roadmap

**Version:** 1.0
**Stand:** 03.07.2026
**Ablage:** `ahsub/premium-options/docs/ROADMAP.md`
**Referenzrahmen:** `docs/STRATEGIE.md` v1.0 — jedes Item hat den Vier-Fragen-Filter (Belegkette / 80-20 / ES6 / Doppel-Compliance) bestanden oder trägt ein Gate.

---

## Ausgangslage (Ist-Stand 03.07.2026, aus Code-Review)

| Baustein | Stand |
|---|---|
| Frontend | `index.html` (~165 KB Monolith, PWA mit manifest.json), letzte Commits 06/2026 |
| Features | Screener (13 Kriterien + Dividend-Scoring), Optionsketten (Tradier + IBKR-Proxy + Demo), Prämienrechner (CSP/CC/Wheel), Roll-Manager (3-Stufen), Journal, Markt-Dashboard |
| Options-Doktor | Ampel-Diagnostik (OK/WATCH/ROLLEN/DRINGEND) nach ITM-%/DTE; `getTaxAnalysis()` als USD-Näherung; KI-Analyse via lokalem Proxy |
| Datenpfade | IBKR-Live-Import (Flask/ib_insync, Port 5001), CSV-Import, manuelle Erfassung |
| **Befund 1** | Ludwig-Altlast: 60 Vorkommen (README, Funktionen, KI-Prompt) — Publikationsblocker |
| **Befund 2** | Empfehlungssprache im Public-Pfad („Rollen!", „Halten/Rollen/Schließen") — Publikationsblocker |
| **Befund 3** | Steuerrechnung ohne Belegkette (25 % + Soli flat auf USD; kein FIFO, keine EUR-Basis, keine Töpfe, kein 20k-Cap) |
| **Befund 4** | Roll-Manager mit unbelegten Konstanten (+15, +25, ×0.87) |
| **Befund 5** | README-Deploy-Anleitung veraltet (GitHub Pages statt CF-Pages-Muster) |

---

## Phase P1 — Sanierung (vor jedem Feature; Ziel: publikationsfähige Basis)

| # | Item | Kriterium „fertig" | Filter-Notiz |
|---|---|---|---|
| P1.1 | **Ludwig → atmna Rename** — alle 60 Vorkommen in README, index.html (Funktionen, UI-Texte, KI-Prompt) nach dem UIQ-Muster ersetzen; Strategie-Bezeichnungen generisch („3-Stufen-Roll-Systematik", „Stillhalter-Checkliste") | `grep -ci ludwig` = 0 über alle Dateien | Namensrecht; billig, zwingend, zuerst |
| P1.2 | **Public/EIC-Split (BaFin)** — UIQ-Muster übernehmen: EIC-PIN-Gate; Public-Wording auf „Statistische Kontext-Analyse" umstellen („Im Geld — Rollen!" → „Im Geld · Zeitwert X · Szenarien s. Doktor"); KI-Prompt zweigeteilt (Public ohne, EIC mit Empfehlungsauftrag) | Kein Empfehlungsverb im Public-Pfad; EIC nur nach PIN | Publikationsblocker 2 |
| P1.3 | **Governance & Doku** — docs/STRATEGIE.md + ROADMAP.md (✅ mit diesem Commit); README-Deploy-Abschnitt auf CF-Pages-Muster korrigieren (Zwei-Vorgänge-Prinzip: GitHub = Quellcode, Pages-Zip = Publikation); RUNBOOK-Kurzfassung mit Verweis auf Refundex-RUNBOOK §3 | README konsistent; Pages-Projekt `premium-options-app` benannt | Muster liegt fertig vor |
| P1.4 | **Disclaimer-Paket** — Refundex-Vier-Punkte-Muster adaptiert: keine Anlageberatung (WpHG), keine Steuerberatung (StBerG), Näherungswerte markiert, Nicht-Abdeckungsliste | Banner + aufklappbarer Volltext wie Refundex v139 | Copy-Paste-Nähe zu Refundex |

**Deploy-Politik:** P1 komplett als ein Batch; bis dahin bleibt PO unpubliziert (kein CF-Pages-Projekt vor P1-Abschluss).

---

## Phase P2 — Datenfundament (der Suite-Hebel)

| # | Item | Kriterium „fertig" | Filter-Notiz |
|---|---|---|---|
| P2.1 | **Flex-Query-Adapter als Public-Datenpfad** — ko-flex.js (Suite-Modul) einbinden; Positionen + Trades aus derselben CSV, die Refundex-Nutzer ohnehin ziehen; Live-Proxy bleibt als EIC-/Eigenbedarfs-Option erhalten | Ein Flex-Upload befüllt das Doktor-Portfolio vollständig | W4-Lösung; Modul existiert |
| P2.2 | **EUR-FIFO-costBasis** — ko-fifo.js + ko-fx.js einbinden: echte FIFO-Lots mit tagesgenauer EUR-Umrechnung ersetzen die Broker-Durchschnittskurse | Doktor zeigt je Position FIFO-Lots in EUR mit Belegkette | Kern-Voraussetzung für P2.3/P3 |
| P2.3 | **Doktor-Steuermodul mit Belegkette** — `getTaxAnalysis()` v2: EUR-Basis, FIFO, Topf-Trennung (Stillhalterprämie = Termingeschäfte-Topf, Aktiengewinn = Aktien-Topf), 20k-Cap-Warnung, Pauschbetrag-Hinweis; Logik aus/als Suite-Modul (keine Duplikation zu Refundex) | Jede Steuerzahl trägt Lot- und Kursquelle; USD-Flat-Rechnung entfernt | Der USP; StBerG-Wording beachten (Szenarien nebeneinander) |
| P2.4 | **Roll-Manager härten** — Magic Numbers durch echte Chain-Daten ersetzen (wo Kette verfügbar) bzw. sichtbar als „Faustformel-Näherung" kennzeichnen (Demo-Modus) | Keine unbelegte Konstante ohne Kennzeichnung | No-Hallucination |
| P2.5 | **ES6-Anfang** — neue Module (Steuer, Adapter) von Beginn an ES6/Suite-konform; Monolith-Migration schrittweise, nicht big-bang | Neue Features berühren nur Module | Suite-Grundgesetz |

---

## Phase P3 — Doktor 2.0 (Szenariorechnung netto nach Steuer)

| # | Item | Kriterium „fertig" |
|---|---|---|
| P3.1 | **Drei-Szenarien-Vergleich je kranker Position:** (A) Ausüben lassen, (B) Rollen (Strike/DTE-Varianten), (C) Rückkauf — jeweils Brutto-P&L, Steuerfolge (EUR, FIFO, Töpfe) und **Netto nach Steuer** nebeneinander; Bewertung trifft der Nutzer (Public) bzw. EIC-Empfehlung hinter PIN | Der CC-mit-Kursgewinn-Fall (Leitbild-Beispiel) wird vollständig durchgerechnet |
| P3.2 | **Break-even inkl. Steuer** — Roll-Break-evens um Steuereffekt erweitert | Break-even brutto UND netto ausgewiesen |
| P3.3 | **Doktor-Journal-Kopplung** — geheilte Positionen mit Ergebnis ins Journal (Lerneffekt, Win-Rate der Roll-Entscheidungen) | Roll-Historie je Ticker abrufbar |

---

## Phase P4 — Strategie-Erweiterung: Multi-Leg & LEAPs (hinter Recherche-Gate)

**Konzept:** Straddle, Strangle, Iron Condor (+ ggf. Credit Spreads) und LEAP-Strategien. **Public:** Erklär-Module + **Steuer-Check je Strategie** — der eigentliche Differenzierer: Legs werden in DE separat besteuert; Verlust-Legs fallen in den 20.000-€-Topf, Gewinn-Legs sind voll steuerpflichtig — eine vor Steuern neutrale Struktur kann nach Steuern toxisch sein. Genau das rechnet der Steuer-Check vor. **EIC:** dezidierte Strike-/DTE-Vorschläge auf Basis der Optionskette. Start mit 3–4 Strategien (R6: kein Vollständigkeitsanspruch).

**Gate-Bedingungen (alle vor Bau-Entscheidung):**

| Gate | Inhalt | Wer | Status |
|---|---|---|---|
| (a) | **Fachrecherche Multi-Leg-Besteuerung:** BMF-Schreiben zu Termingeschäften (Einzelbewertung der Legs, Glattstellung vs. Ausübung, Kombinationsgeschäfte), aktueller Stand §20 Abs. 6-Rechtsprechung → `docs/RECHERCHE_MULTILEG_STEUER.md` mit GZ-Quellen | Claude (Websuche-Session) | OFFEN |
| (b) | **KI-Prompt-Design Strict-Source:** Public-/EIC-Prompts für Strategie-Erklärung bzw. Strike-Vorschlag; KI erklärt, rechnet nie; Zahlen ausschließlich aus Chain-Daten/Steuermodul | Claude + Review Axel | OFFEN |
| (c) | **Datenquellen-Klärung Optionsketten:** Tradier-Limits/Konditionen für Multi-Leg-Analysen (4 Legs = 4× Datenbedarf), ORATS-Greeks-Verfügbarkeit, Fallback-Strategie | Axel (Account) + Claude (Doku) | OFFEN |
| (d) | **BaFin-Wording-Review:** Grenzziehung Erklär-Content vs. Empfehlung für Multi-Leg-Public-Module (strenger als bei Einzel-Legs, da Struktur-Vorschlag = impliziter Trade) | Claude, gegen UIQ-Public-Muster | OFFEN |
| (e) | **Eigenfall-Validierung:** mind. eine Multi-Leg-Position real im CapTrader-Depot durchrechnen (Steuer-Check gegen tatsächliche Flex-Daten) | Axel | OFFEN |

**Gate-Logik:** (a) ist Voraussetzung für alles Weitere — ohne belastbare Steuerquellen kein Steuer-Check, und ohne Steuer-Check wäre P4 nur Commodity-Erklär-Content (80/20-Fail). LEAPs können als steuerlich einfacherer Teilschritt (ein Leg, lange Haltedauer, Zeitwert-Fokus) vor den Multi-Leg-Strategien starten.

---

## Phase P5 — Kandidaten (je einzeln durch den Filter)

| # | Kandidat | Einschätzung |
|---|---|---|
| P5.1 | Suite-Cross-Verlinkung (PO ↔ Refundex ↔ UIQ) | Minimal-Aufwand; Wording compliance-sauber |
| P5.2 | Earnings-/Ex-Div-Warnungen im Doktor (Assignment-Risiko CC vor Ex-Tag) | Guter 80/20-Kandidat, Daten via Finnhub vorhanden |
| P5.3 | IV-Rank-Integration aus UIQ-Datenwelt | Prüfen, ob Suite-Modul sinnvoll |
| P5.4 | Publikations-/Monetarisierungsentscheidung | Nach P1–P3, gemeinsam mit Refundex 3.5 |

---

## Nicht-Ziele (bewusst verworfen)

1. **Order-Ausführung/Trade-Routing** — PO analysiert, handelt nie; dauerhaft.
2. **Individuelle Anlageberatung im Public-Modus** — BaFin-Grenze, Filter-Frage 4 dauerhaft negativ.
3. **Steuer-Gestaltungsempfehlungen** („rolle vor Jahresende wegen…") — StBerG-Grenze; Szenarien ja, Ratschlag nein.
4. **KI-berechnete Steuern oder Greeks** — KI erklärt, Module rechnen.
5. **Vollständigkeit aller Optionsstrategien** — Start 3–4, Rest dokumentierte Grenze.
6. **Server-seitige Depotdaten** — Browser-first, wie Suite-weit.

---

## Fortschreibungshistorie

| Version | Datum | Änderung |
|---|---|---|
| 1.0 | 03.07.2026 | Erstfassung: Ist-Stand aus Code-Review (5 Befunde), P1 Sanierung, P2 Datenfundament (Suite-Module), P3 Doktor 2.0, P4 Multi-Leg/LEAPs hinter 5-Bedingungen-Gate, P5 Kandidaten, Nicht-Ziele |
