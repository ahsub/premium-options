// ═══════════════════════════════════════════════════════════════
// PremiumOptions — Screener Engine v2.1
// Fixes: IV-Filter, Payout-Ratio-Normalisierung, PE-null-Handling
// Neu: Portfolio-Analyse (Screenshot-Dump → Roll/Close-Empfehlung)
// ═══════════════════════════════════════════════════════════════

const DOW30 = [
  'AAPL','AMGN','AXP','BA','CAT','CRM','CSCO','CVX','DIS','DOW',
  'GS','HD','HON','IBM','INTC','JNJ','JPM','KO','MCD','MMM',
  'MRK','MSFT','NKE','PG','TRV','UNH','V','VZ','WBA','WMT'
];

const NASDAQ100 = [
  'AAPL','ABNB','ADBE','ADI','ADP','ADSK','AEP','AMAT','AMD','AMGN',
  'AMZN','ANSS','APP','AVGO','AZN','BIIB','BKNG','BKR','CDNS','CEG',
  'CHTR','CMCSA','COST','CPRT','CRWD','CSCO','CSX','CTAS','CTSH','DDOG',
  'DLTR','DXCM','EA','EXC','FAST','FTNT','GILD','GOOG','GOOGL','HON',
  'IDXX','INTC','INTU','ISRG','KDP','KHC','KLAC','LRCX','LULU','MAR',
  'MCHP','MDLZ','META','MNST','MRNA','MRVL','MSFT','MU','NFLX','NVDA',
  'NXPI','ODFL','ON','ORLY','PANW','PAYX','PCAR','PDD','PEP','PYPL',
  'QCOM','REGN','ROP','ROST','SBUX','SMCI','SNPS','TEAM','TMUS','TSLA',
  'TTD','TXN','VRSK','VRTX','WBD','WDAY','XEL','ZS','AMZN','META'
];

const SP500_EXTRA = [
  'ABT','ABBV','AFL','AIG','ALLY','APD','AXP','BAC','BAX','BDX',
  'BEN','BLK','BMY','BRK.B','C','CAG','CAT','CL','CLX','COP',
  'CVS','D','DE','DHR','DIS','DUK','ECL','ED','EMR','ETN',
  'EXC','F','FDX','GE','GIS','GL','GM','GPC','GS','HAL',
  'HD','HIG','HRL','HSY','IBM','IFF','ITW','JNJ','JPM','K',
  'KIM','KMB','KMI','KO','LIN','LMT','LNC','LYB','MET','MMM',
  'MO','MPC','MRK','MS','NEE','NEM','NI','NKE','NOC','NUE',
  'O','OKE','OXY','PBI','PEG','PFE','PG','PGR','PNC','PPG',
  'PPL','PRU','PSA','PSX','RTX','SHW','SJM','SLB','SO','SPG',
  'SWK','SYF','SYY','T','TAP','TGT','TJX','TRV','TSN','UNH',
  'UNM','UPS','USB','VFC','VICI','VLO','VZ','WBA','WEC','WFC',
  'WM','WMT','WRB','WU','XEL','XOM','XYL','ZBH','ZION'
];

const FULL_UNIVERSE = [...new Set([...DOW30, ...NASDAQ100, ...SP500_EXTRA])];

// ── Kuratierte Fallback-Liste ─────────────────────────────────
const CURATED_50 = [
  {t:'AAPL',price:53.2,pe:18,iv:28,payout:15,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:52,macd:true,support:51.2,resist:58.4,divYield:0.6,divGrowth:4.5,divStreak:12,fcfCoverage:8.5},
  {t:'MSFT',price:42.1,pe:22,iv:24,payout:28,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:48,macd:true,support:41.0,resist:47.0,divYield:0.8,divGrowth:10.2,divStreak:22,fcfCoverage:6.2},
  {t:'JNJ', price:38.5,pe:14,iv:18,payout:55,fcf:true,revenue:true,weeklies:true,buyback:false,rsi:44,macd:false,support:37.0,resist:42.0,divYield:3.1,divGrowth:5.8,divStreak:62,fcfCoverage:2.1},
  {t:'KO',  price:28.4,pe:23,iv:19,payout:58,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:60,macd:false,support:27.0,resist:30.0,divYield:3.4,divGrowth:4.8,divStreak:62,fcfCoverage:1.8},
  {t:'PG',  price:72.1,pe:24,iv:16,payout:58,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:55,macd:true,support:70.0,resist:75.0,divYield:2.4,divGrowth:5.1,divStreak:68,fcfCoverage:2.4},
  {t:'MRK', price:55.8,pe:16,iv:26,payout:40,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:50,macd:true,support:54.0,resist:60.0,divYield:2.7,divGrowth:6.5,divStreak:14,fcfCoverage:3.8},
  {t:'PFE', price:22.7,pe:11,iv:29,payout:50,fcf:true,revenue:false,weeklies:true,buyback:false,rsi:46,macd:true,support:21.5,resist:25.0,divYield:6.2,divGrowth:2.5,divStreak:14,fcfCoverage:1.6},
  {t:'WMT', price:44.2,pe:21,iv:17,payout:38,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:58,macd:false,support:43.0,resist:47.0,divYield:1.3,divGrowth:2.0,divStreak:52,fcfCoverage:3.5},
  {t:'ABT', price:62.1,pe:19,iv:21,payout:44,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:51,macd:true,support:60.0,resist:66.0,divYield:1.9,divGrowth:7.8,divStreak:52,fcfCoverage:3.1},
  {t:'MMM', price:66.3,pe:12,iv:32,payout:45,fcf:true,revenue:false,weeklies:true,buyback:false,rsi:38,macd:true,support:64.0,resist:70.0,divYield:5.8,divGrowth:0.0,divStreak:0,fcfCoverage:1.3},
  {t:'VZ',  price:18.9,pe:8,iv:22,payout:56,fcf:true,revenue:false,weeklies:true,buyback:false,rsi:42,macd:false,support:18.0,resist:21.0,divYield:6.4,divGrowth:2.0,divStreak:18,fcfCoverage:1.1},
  {t:'CSCO',price:47.2,pe:15,iv:22,payout:52,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:49,macd:true,support:45.5,resist:50.0,divYield:3.2,divGrowth:3.0,divStreak:12,fcfCoverage:2.8},
  {t:'IBM', price:72.4,pe:20,iv:24,payout:65,fcf:true,revenue:true,weeklies:true,buyback:false,rsi:53,macd:true,support:70.0,resist:76.0,divYield:4.1,divGrowth:0.7,divStreak:28,fcfCoverage:1.4},
  {t:'T',   price:17.2,pe:9,iv:21,payout:58,fcf:true,revenue:false,weeklies:true,buyback:false,rsi:44,macd:false,support:16.5,resist:19.0,divYield:6.8,divGrowth:0.0,divStreak:1,fcfCoverage:1.2},
  {t:'BAC', price:37.5,pe:12,iv:26,payout:32,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:52,macd:true,support:36.0,resist:40.0,divYield:2.4,divGrowth:9.1,divStreak:4,fcfCoverage:4.2},
  {t:'JPM', price:77.2,pe:13,iv:23,payout:30,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:55,macd:true,support:75.0,resist:82.0,divYield:2.1,divGrowth:8.7,divStreak:14,fcfCoverage:5.1},
  {t:'MCD', price:72.1,pe:22,iv:18,payout:78,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:50,macd:false,support:70.0,resist:76.0,divYield:2.4,divGrowth:8.3,divStreak:28,fcfCoverage:1.6},
  {t:'CAT', price:68.4,pe:17,iv:28,payout:35,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:49,macd:true,support:66.0,resist:72.0,divYield:1.7,divGrowth:7.8,divStreak:30,fcfCoverage:3.2},
  {t:'HON', price:71.2,pe:20,iv:20,payout:42,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:53,macd:true,support:69.0,resist:75.0,divYield:2.3,divGrowth:5.0,divStreak:14,fcfCoverage:2.8},
  {t:'TXN', price:62.3,pe:22,iv:23,payout:58,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:48,macd:true,support:60.0,resist:66.0,divYield:3.2,divGrowth:12.0,divStreak:20,fcfCoverage:2.4},
  {t:'CVX', price:71.2,pe:14,iv:24,payout:48,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:44,macd:false,support:69.0,resist:75.0,divYield:4.3,divGrowth:6.0,divStreak:36,fcfCoverage:2.2},
  {t:'XOM', price:66.8,pe:13,iv:22,payout:42,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:46,macd:true,support:64.0,resist:70.0,divYield:3.7,divGrowth:5.7,divStreak:42,fcfCoverage:2.5},
  {t:'COP', price:58.4,pe:11,iv:28,payout:38,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:43,macd:true,support:56.0,resist:62.0,divYield:2.8,divGrowth:8.0,divStreak:3,fcfCoverage:3.1},
  {t:'NEE', price:68.2,pe:21,iv:20,payout:55,fcf:false,revenue:true,weeklies:true,buyback:false,rsi:52,macd:true,support:66.0,resist:72.0,divYield:3.4,divGrowth:9.0,divStreak:28,fcfCoverage:0.9},
  {t:'CL',  price:77.3,pe:23,iv:16,payout:58,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:56,macd:true,support:75.0,resist:80.0,divYield:2.4,divGrowth:3.5,divStreak:62,fcfCoverage:2.0},
  {t:'KMB', price:68.4,pe:21,iv:17,payout:65,fcf:true,revenue:false,weeklies:true,buyback:true,rsi:49,macd:false,support:66.0,resist:72.0,divYield:3.8,divGrowth:3.1,divStreak:52,fcfCoverage:1.7},
  {t:'GIS', price:58.2,pe:16,iv:18,payout:54,fcf:true,revenue:false,weeklies:true,buyback:true,rsi:45,macd:false,support:56.0,resist:62.0,divYield:3.6,divGrowth:2.4,divStreak:4,fcfCoverage:2.1},
  {t:'HSY', price:71.5,pe:20,iv:21,payout:62,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:46,macd:true,support:69.0,resist:76.0,divYield:3.0,divGrowth:5.1,divStreak:14,fcfCoverage:1.8},
  {t:'SYY', price:66.2,pe:18,iv:20,payout:55,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:50,macd:true,support:64.0,resist:70.0,divYield:2.8,divGrowth:4.8,divStreak:54,fcfCoverage:2.2},
  {t:'O',   price:52.4,pe:38,iv:18,payout:75,fcf:true,revenue:true,weeklies:true,buyback:false,rsi:51,macd:false,support:50.5,resist:56.0,divYield:5.8,divGrowth:2.1,divStreak:30,fcfCoverage:1.3},
  {t:'VICI',price:28.6,pe:32,iv:19,payout:78,fcf:true,revenue:true,weeklies:true,buyback:false,rsi:50,macd:true,support:27.5,resist:31.0,divYield:5.5,divGrowth:7.4,divStreak:6,fcfCoverage:1.4},
  {t:'NUE', price:68.4,pe:8,iv:26,payout:18,fcf:true,revenue:false,weeklies:true,buyback:true,rsi:44,macd:true,support:66.0,resist:73.0,divYield:1.7,divGrowth:4.8,divStreak:50,fcfCoverage:4.5},
  {t:'SHW', price:76.3,pe:25,iv:22,payout:32,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:55,macd:true,support:74.0,resist:80.0,divYield:0.9,divGrowth:15.0,divStreak:44,fcfCoverage:3.8},
  {t:'EMR', price:67.3,pe:20,iv:22,payout:45,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:53,macd:true,support:65.0,resist:71.0,divYield:2.0,divGrowth:1.5,divStreak:46,fcfCoverage:2.4},
  {t:'ITW', price:72.4,pe:23,iv:21,payout:55,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:52,macd:true,support:70.0,resist:77.0,divYield:2.3,divGrowth:7.5,divStreak:58,fcfCoverage:2.6},
  {t:'WM',  price:69.8,pe:26,iv:17,payout:45,fcf:true,revenue:true,weeklies:true,buyback:true,rsi:57,macd:true,support:68.0,resist:74.0,divYield:1.5,divGrowth:8.0,divStreak:20,fcfCoverage:3.2},
  {t:'APD', price:74.2,pe:22,iv:23,payout:52,fcf:true,revenue:true,weeklies:true,buyback:false,rsi:50,macd:true,support:72.0,resist:78.0,divYield:2.8,divGrowth:8.2,divStreak:40,fcfCoverage:1.9},
  {t:'TSN', price:52.4,pe:12,iv:26,payout:42,fcf:true,revenue:false,weeklies:true,buyback:true,rsi:43,macd:false,support:50.5,resist:56.0,divYield:3.2,divGrowth:2.0,divStreak:10,fcfCoverage:1.8},
  {t:'PSA', price:71.2,pe:28,iv:21,payout:82,fcf:true,revenue:true,weeklies:true,buyback:false,rsi:48,macd:false,support:69.0,resist:76.0,divYield:4.6,divGrowth:12.5,divStreak:14,fcfCoverage:1.2},
  {t:'UPS', price:71.2,pe:16,iv:24,payout:68,fcf:true,revenue:false,weeklies:true,buyback:true,rsi:44,macd:false,support:69.0,resist:76.0,divYield:5.2,divGrowth:2.5,divStreak:14,fcfCoverage:1.5},
];

// ── Finnhub API ───────────────────────────────────────────────
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const RATE_MS = 1200;
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fhGet(ep, params, key) {
  const url = new URL(FINNHUB_BASE + ep);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  url.searchParams.set('token', key);
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`Finnhub ${r.status}`);
  return r.json();
}

// ── Cache ─────────────────────────────────────────────────────
const CACHE_KEY = 'po_screener_v2';
const TTL = 24 * 3600 * 1000;

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > TTL) return null;
    return data;
  } catch { return null; }
}
function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch(e) {}
}
function clearCache() { localStorage.removeItem(CACHE_KEY); }

// ── Payout-Ratio normalisieren ────────────────────────────────
// FIX: Finnhub liefert manchmal 0-1, manchmal 0-100
function normPayout(raw) {
  if (!raw || raw <= 0) return 0;
  if (raw > 1 && raw <= 100) return raw;       // bereits in %
  if (raw > 0 && raw <= 1)   return raw * 100; // als Dezimal
  if (raw > 100) return 99;                     // Fehler/REIT-Sonderfall
  return 0;
}

// ── IV schätzen ───────────────────────────────────────────────
// FIX v2: großzügigere Schätzung, IV-Filter wird weicher angewendet
function estimateIV(beta, weekHigh, weekLow) {
  if (!beta || beta <= 0) beta = 1;
  // Annualisierte Volatilität aus 52-Wochen-Range
  let rangeVol = 0;
  if (weekHigh > 0 && weekLow > 0 && weekHigh > weekLow) {
    const mid = (weekHigh + weekLow) / 2;
    rangeVol = ((weekHigh - weekLow) / mid) * 40; // grobe Annualisierung
  }
  const betaVol = 12 + beta * 10;
  const est = Math.max(betaVol, rangeVol * 0.6);
  return Math.min(75, Math.max(12, Math.round(est)));
}

// ── Hauptscreener ─────────────────────────────────────────────
async function runFullScreener(params, apiKey, onProgress) {
  // Cache prüfen
  const cached = loadCache();
  if (cached && !params.forceRefresh) {
    onProgress({ phase:'cache', pct:100, msg:`⚡ Cache: ${cached.length} Aktien geladen (max. 24h alt)` });
    return applyFilters(cached, params);
  }

  if (!apiKey) {
    onProgress({ phase:'fallback', pct:100, msg:`📋 Kuratierte Liste (kein Finnhub-Key)` });
    return applyFilters(CURATED_50.map(s => ({...s, score: calcScore(s)})), params);
  }

  const universe = getUniverse(params.universe);
  const total = universe.length;
  let passed1 = [], results = [];
  const BATCH = 5;

  // Phase 1: Quote-Filter
  onProgress({ phase:1, pct:0, msg:`Phase 1/2: Kurs-Filter für ${total} Ticker...` });
  for (let i = 0; i < universe.length; i += BATCH) {
    const batch = universe.slice(i, i + BATCH);
    const quotes = await Promise.all(batch.map(sym =>
      fhGet('/quote', { symbol: sym }, apiKey)
        .then(q => ({ sym, price: q.c||0, high52: q.h||0, low52: q.l||0 }))
        .catch(() => ({ sym, price: 0, high52:0, low52:0 }))
    ));
    quotes.forEach(q => {
      // FIX: Apply price filter but also accept stocks slightly outside range
      // (user can tighten later via filter sliders)
      if (q.price >= (params.pmin * 0.9) && q.price <= (params.pmax * 1.1)) {
        passed1.push(q);
      }
    });
    const pct = Math.round((i + batch.length) / total * 45);
    onProgress({ phase:1, pct, msg:`Phase 1: ${i+batch.length}/${total} geprüft — ${passed1.length} im Kursbereich` });
    await sleep(RATE_MS);
  }

  // Phase 2: Fundamentaldaten
  onProgress({ phase:2, pct:45, msg:`Phase 2/2: Fundamentaldaten für ${passed1.length} Kandidaten...` });
  for (let i = 0; i < passed1.length; i += BATCH) {
    const batch = passed1.slice(i, i + BATCH);
    const fetched = await Promise.all(batch.map(async q => {
      try {
        const [metric, profile] = await Promise.all([
          fhGet('/stock/metric', { symbol: q.sym, metric: 'all' }, apiKey),
          fhGet('/stock/profile2', { symbol: q.sym }, apiKey),
        ]);
        const m = metric.metric || {};
        const p = profile || {};

        // FIX: Robuste Extraktion mit Fallbacks
        const pe = m.peNormalizedAnnual || m.peTTM || m.peBasicExclExtraTTM || 0;
        const rawPayout = m.payoutRatioAnnual || m.payoutRatioTTM || 0;
        const payout = normPayout(rawPayout);
        const divYield = m.dividendYieldIndicatedAnnual || m.currentDividendYieldTTM || 0;
        const divGrowth = m['5YDivGrowthRate'] || m['3YDivGrowthRate'] || 0;
        const beta = m.beta || 1;
        const wkHigh = m['52WeekHigh'] || q.high52 || q.price * 1.2;
        const wkLow  = m['52WeekLow']  || q.low52  || q.price * 0.8;
        const iv = estimateIV(beta, wkHigh, wkLow);
        const fcfTTM = m.freeCashFlowTTM || m.freeCashFlowPerShareTTM || 0;
        const revGrowth = m['10YRevenueGrowthRate'] || m['5YRevenueGrowthRate'] || m['3YRevenueGrowthRate'] || 0;

        return {
          t: q.sym,
          name: p.name || q.sym,
          price: q.price,
          pe: pe || 0,
          payout,
          iv,
          divYield,
          divGrowth,
          divStreak: 0,
          fcfCoverage: fcfTTM > 0 ? Math.min(10, fcfTTM / Math.max(0.01, divYield/100*q.price*1e6)) : (fcfTTM > 0 ? 2 : 0),
          fcf: fcfTTM > 0,
          revenue: revGrowth > 0,
          weeklies: true,
          buyback: (m.roeTTM||0) > 8,
          rsi: 50,
          macd: false,
          support: q.price * 0.96,
          resist: q.price * 1.06,
          industry: p.finnhubIndustry || '',
          beta,
        };
      } catch(e) { return null; }
    }));

    results.push(...fetched.filter(Boolean));
    const pct = 45 + Math.round((i + batch.length) / passed1.length * 50);
    onProgress({ phase:2, pct, msg:`Phase 2: ${i+batch.length}/${passed1.length} analysiert — ${results.length} Kandidaten` });
    await sleep(RATE_MS);
  }

  // Curated-Daten für divStreak ergänzen
  const cm = Object.fromEntries(CURATED_50.map(s => [s.t, s]));
  results = results.map(s => {
    const c = cm[s.t];
    if (c) { s.divStreak = c.divStreak || 0; s.macd = c.macd; s.rsi = c.rsi; }
    return { ...s, score: calcScore(s) };
  });

  saveCache(results);
  onProgress({ phase:'done', pct:100, msg:`✓ Screening abgeschlossen — ${results.length} Aktien analysiert` });
  return applyFilters(results, params);
}

function getUniverse(u) {
  if (u === 'dj30')    return DOW30;
  if (u === 'ndx100')  return NASDAQ100;
  if (u === 'sp500')   return SP500_EXTRA;
  return FULL_UNIVERSE; // all
}

// ── Filter ────────────────────────────────────────────────────
// FIX: IV-Filter wird soft angewendet (nur wenn iv > 0)
function applyFilters(stocks, params) {
  return stocks.filter(s => {
    if (!s) return false;
    if (s.price < (params.pmin||15) || s.price > (params.pmax||80)) return false;
    if (params.peMax && s.pe > 0 && s.pe > params.peMax) return false;  // FIX: skip if pe=0
    // FIX: IV-Filter nur wenn IV bekannt (>0), sonst durchlassen
    if (s.iv > 0 && s.iv < (params.ivMin||15)) return false;
    if (s.iv > 0 && s.iv > (params.ivMax||60)) return false;
    if (params.payoutMax && s.payout > params.payoutMax) return false;
    if (params.needFcf && !s.fcf) return false;
    if (params.needRevenue && !s.revenue) return false;
    const y = s.divYield||0;
    if (params.divYield === 'lt2'  && y >= 2)           return false;
    if (params.divYield === '2to4' && (y<2||y>4))       return false;
    if (params.divYield === 'gt4'  && y <= 4)           return false;
    if (params.divYield === 'none' && y > 0)            return false;
    const g = s.divGrowth||0;
    if (params.divGrowth === 'lt2'  && g >= 2)          return false;
    if (params.divGrowth === '2to5' && (g<2||g>5))      return false;
    if (params.divGrowth === 'gt5'  && g <= 5)          return false;
    if ((params.aristocratMin||0) > 0 && (s.divStreak||0) < params.aristocratMin) return false;
    return true;
  }).sort((a,b) => (b.score||0) - (a.score||0));
}

// ── Score ─────────────────────────────────────────────────────
function calcScore(s) {
  let base = 0;
  if (s.revenue) base += 1;
  if (s.fcf)     base += 1;
  const pe = s.pe||0;
  if (pe > 0 && pe <= 20)  base += 1;
  else if (pe > 20 && pe <= 25) base += 0.5;
  const po = s.payout||0;
  if (po > 0 && po <= 60)  base += 0.5;
  if (s.buyback) base += 0.5;
  if (s.weeklies) base += 0.5;
  const iv = s.iv||0;
  if (iv >= 18 && iv <= 55) base += 1;  // etwas weiter als Ludwig's 20-50
  if (s.price >= 15 && s.price <= 80) base += 0.5;
  if ((s.rsi||50) < 70 && (s.rsi||50) > 30) base += 0.5;
  if (s.macd) base += 0.5;
  // Dividenden-Bonus
  const y = s.divYield||0;
  if (y >= 2 && y <= 4) base += 0.5;
  else if (y > 4)       base += 0.3;
  else if (y >= 1)      base += 0.2;
  const g = s.divGrowth||0;
  if (g > 5)      base += 0.6;
  else if (g >= 2) base += 0.3;
  return Math.min(10, +base.toFixed(1));
}

// ══════════════════════════════════════════════════════════════
// PORTFOLIO-ANALYSE — Screenshot/Dump → Roll-Empfehlung
// ══════════════════════════════════════════════════════════════
function analyzePosition(pos) {
  // pos = { ticker, type:'put'|'call', strike, expiry, premium, currentPrice,
  //         currentOptionPrice, daysToExpiry, contracts }
  const {
    ticker, type, strike, expiry, premium, currentPrice,
    currentOptionPrice, daysToExpiry, contracts = 1
  } = pos;

  const prem = +premium || 0;
  const currOpt = +currentOptionPrice || 0;
  const curr = +currentPrice || 0;
  const strike_ = +strike || 0;
  const dte = +daysToExpiry || 0;
  const cont = +contracts || 1;

  // Grundberechnungen
  const inTheMoney = type === 'put'
    ? curr < strike_
    : curr > strike_;

  const intrinsic = type === 'put'
    ? Math.max(0, strike_ - curr)
    : Math.max(0, curr - strike_);

  const timeValue = Math.max(0, currOpt - intrinsic);
  const closeCost = currOpt * 100 * cont;
  const origPremium = prem * cont;
  const unrealizedPnL = origPremium - closeCost;
  const pnlPct = origPremium > 0 ? (unrealizedPnL / origPremium * 100) : 0;
  const bePrice = type === 'put' ? strike_ - prem : strike_ + prem;
  const roll5days = dte <= 5;

  // Empfehlungslogik (Ludwig Kap. 3)
  let action, actionColor, reasoning, rollDetails;

  if (pnlPct >= 70 && dte > 5) {
    action = 'GEWINN MITNEHMEN';
    actionColor = 'green';
    reasoning = `${pnlPct.toFixed(0)}% der Prämie realisiert. Ludwig: Position schließen, neue eröffnen.`;
  } else if (!inTheMoney && dte <= 5) {
    action = 'VERFALL ABWARTEN';
    actionColor = 'green';
    reasoning = `Option läuft wertlos aus — maximaler Gewinn von $${origPremium.toFixed(0)} wird realisiert.`;
  } else if (inTheMoney && dte <= 5) {
    action = 'ROLLEN (DRINGEND)';
    actionColor = 'red';
    reasoning = `Im Geld, nur noch ${dte} Tage. Sofort Stufe 1/2/3 prüfen!`;
    rollDetails = calcRollOptions(pos);
  } else if (inTheMoney && dte > 5 && dte <= 21) {
    action = 'ROLLEN VORBEREITEN';
    actionColor = 'amber';
    reasoning = `Im Geld mit ${dte} Tagen. Roll-Optionen kalkulieren, 5-Tage-Fenster abwarten.`;
    rollDetails = calcRollOptions(pos);
  } else if (!inTheMoney && pnlPct >= 50) {
    action = 'TEILGEWINN / HALTEN';
    actionColor = 'green';
    reasoning = `${pnlPct.toFixed(0)}% realisiert, aus dem Geld. Halten oder Gewinn teilweise mitnehmen.`;
  } else {
    action = 'HALTEN / BEOBACHTEN';
    actionColor = 'blue';
    reasoning = `Position läuft normal. ${dte} Tage verbleibend, ${pnlPct.toFixed(0)}% P&L.`;
  }

  return {
    ticker, type, strike: strike_, expiry, contracts: cont,
    currentPrice: curr, currentOptionPrice: currOpt,
    intrinsic, timeValue, closeCost,
    origPremium, unrealizedPnL, pnlPct,
    bePrice, inTheMoney, daysToExpiry: dte,
    action, actionColor, reasoning, rollDetails,
  };
}

function calcRollOptions(pos) {
  const { strike, currentPrice, currentOptionPrice, type, contracts=1 } = pos;
  const s = +strike, cp = +currentPrice, co = +currentOptionPrice, cont = +contracts;
  const closeCost = co * 100 * cont;

  // Stufe 1: niedrigerer Strike (bei Put) / höherer Strike (bei Call)
  const s1strike = type === 'put'
    ? Math.max(cp * 0.95, s - 2.5).toFixed(2)
    : Math.min(cp * 1.05, s + 2.5).toFixed(2);
  const s1premEst = (co * 1.15 * cont * 100).toFixed(0);
  const s1net = (+s1premEst - closeCost).toFixed(0);

  // Stufe 2: gleicher Strike, längere Laufzeit
  const s2premEst = (co * cont * 100 * 1.05 + 20).toFixed(0);
  const s2net = (+s2premEst - closeCost).toFixed(0);

  // Stufe 3: 2× Kontrakte, niedrigerer Strike
  const s3premEst = (+s1premEst * 2 * 0.88).toFixed(0);
  const s3net = (+s3premEst - closeCost).toFixed(0);

  return [
    { level: 1, label: `Strike $${s1strike}, 30 Tage`, netPrem: +s1net, viable: +s1net >= 0 },
    { level: 2, label: `Strike $${s}, 60 Tage`,        netPrem: +s2net, viable: +s2net >= 0 },
    { level: 3, label: `Strike $${s1strike}, 2× Kont.`, netPrem: +s3net, viable: +s3net >= 0 },
  ];
}

// ── Exports ───────────────────────────────────────────────────
window.ScreenerEngine = {
  runFullScreener, applyFilters, calcScore,
  analyzePosition, calcRollOptions,
  FULL_UNIVERSE, CURATED_50, DOW30, NASDAQ100,
  clearCache, loadCache, saveCache,
};
