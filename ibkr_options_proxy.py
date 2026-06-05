#!/usr/bin/env python3
"""
ibkr_options_proxy.py — IBKR Options Proxy für PremiumOptions App
Starten: source ~/ibkr-proxy-env311/bin/activate && python3 ibkr_options_proxy.py
"""
 
import ssl, os, tempfile
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
 
try:
    import ib_insync as ibi
    IBKR_AVAILABLE = True
except ImportError:
    IBKR_AVAILABLE = False
 
app = Flask(__name__)
CORS(app, origins="*")
 
TWS_HOST = "127.0.0.1"
TWS_PORTS = [7496, 7497, 4001, 4002]
 
def ib_call(fn):
    """Führt eine synchrone ib_insync-Funktion in einem eigenen Event-Loop aus."""
    import asyncio
    # Neuen Event-Loop für diesen Thread erstellen
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_with_ib(fn))
    finally:
        loop.close()
        asyncio.set_event_loop(None)
 
async def _with_ib(fn):
    """Verbindet zu TWS, führt fn(ib) aus, trennt wieder."""
    ib = ibi.IB()
    last_err = None
    for port in TWS_PORTS:
        try:
            await ib.connectAsync(TWS_HOST, port, clientId=43, timeout=15)
            break
        except Exception as e:
            last_err = e
            continue
    else:
        raise ConnectionError(f"TWS nicht erreichbar auf {TWS_PORTS}. Letzter Fehler: {last_err}")
    try:
        return await fn(ib)
    finally:
        ib.disconnect()
 
def get_third_fridays(n=12):
    results = []
    now = datetime.now()
    year, month = now.year, now.month
    while len(results) < n:
        d = datetime(year, month, 1)
        fridays = 0
        while fridays < 3:
            if d.weekday() == 4:
                fridays += 1
            if fridays < 3:
                d += timedelta(days=1)
        if d > now:
            results.append(d.strftime("%Y-%m-%d"))
        month += 1
        if month > 12:
            month = 1
            year += 1
    return results[:n]
 
@app.route("/health")
def health():
    if not IBKR_AVAILABLE:
        return jsonify({"status": "error", "ibkr": "ib_insync nicht installiert"})
    try:
        async def _check(ib):
            return ib.client.serverVersion()
        version = ib_call(_check)
        return jsonify({"status": "ok", "ibkr": "verbunden", "server": version, "version": "1.2.0"})
    except Exception as e:
        return jsonify({"status": "disconnected", "ibkr": str(e), "version": "1.2.0"})
 
@app.route("/quote/<symbol>")
def get_quote(symbol):
    symbol = symbol.upper()
    try:
        async def _quote(ib):
            contract = ibi.Stock(symbol, "SMART", "USD")
            await ib.qualifyContractsAsync(contract)
            ticker = ib.reqMktData(contract, "", False, False)
            await __import__('asyncio').sleep(2.5)
            price = ticker.marketPrice()
            if not price or price != price:
                price = ticker.close or ticker.last or 0
            ib.cancelMktData(contract)
            return {
                "symbol": symbol,
                "price": round(float(price), 2),
                "bid": round(float(ticker.bid or 0), 2),
                "ask": round(float(ticker.ask or 0), 2),
                "close": round(float(ticker.close or 0), 2),
            }
        return jsonify(ib_call(_quote))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
@app.route("/expirations/<symbol>")
def get_expirations(symbol):
    symbol = symbol.upper()
    try:
        async def _exps(ib):
            stock = ibi.Stock(symbol, "SMART", "USD")
            await ib.qualifyContractsAsync(stock)
            chains = await ib.reqSecDefOptParamsAsync(symbol, "", "STK", stock.conId)
            if not chains:
                return get_third_fridays(12)
            chain = next((c for c in chains if c.exchange == "SMART"), chains[0])
            return sorted([
                f"{e[:4]}-{e[4:6]}-{e[6:]}"
                for e in chain.expirations
                if datetime.strptime(e, "%Y%m%d") > datetime.now()
            ])[:12]
        exps = ib_call(_exps)
        return jsonify({"symbol": symbol, "expirations": exps, "source": "ibkr"})
    except Exception as e:
        return jsonify({
            "symbol": symbol,
            "expirations": get_third_fridays(12),
            "source": "calculated",
            "note": str(e)
        })
 
@app.route("/chain/<symbol>/<expiration>")
def get_chain(symbol, expiration):
    symbol = symbol.upper()
    opt_type = request.args.get("type", "put")
    try:
        async def _chain(ib):
            exp_ibkr = expiration.replace("-", "")
            # Kurs
            stock = ibi.Stock(symbol, "SMART", "USD")
            await ib.qualifyContractsAsync(stock)
            ticker = ib.reqMktData(stock, "", False, False)
            await __import__('asyncio').sleep(2.5)
            stock_price = ticker.marketPrice()
            if not stock_price or stock_price != stock_price:
                stock_price = ticker.close or 0
            ib.cancelMktData(stock)
            if stock_price <= 0:
                raise ValueError("Kein Kurs verfügbar")
 
            # Strike-Range
            step = 5.0 if stock_price > 400 else 2.5 if stock_price > 150 else 1.0
            min_s = round(stock_price * 0.80 / step) * step
            max_s = round(stock_price * 1.15 / step) * step
 
            rights = ["P", "C"] if opt_type == "all" else ["P" if opt_type == "put" else "C"]
            contracts = []
            s = min_s
            while s <= max_s:
                for right in rights:
                    contracts.append(ibi.Option(symbol, exp_ibkr, s, right, "SMART"))
                s = round(s + step, 2)
 
            qualified = await ib.qualifyContractsAsync(*contracts)
            if not qualified:
                raise ValueError("Keine Kontrakte gefunden")
 
            results = []
            for i in range(0, len(qualified), 10):
                batch = qualified[i:i+10]
                tickers = [ib.reqMktData(c, "106", False, False) for c in batch]
                await __import__('asyncio').sleep(2.5)
                for contract, t in zip(batch, tickers):
                    ib.cancelMktData(contract)
                    bid = float(t.bid or 0)
                    ask = float(t.ask or 0)
                    last = float(t.last or 0)
                    mid = (bid + ask) / 2 if bid > 0 and ask > 0 else last
                    if mid <= 0:
                        continue
                    greeks = t.modelGreeks or t.bidGreeks or t.askGreeks
                    results.append({
                        "option_type": "put" if contract.right == "P" else "call",
                        "strike": float(contract.strike),
                        "bid": round(bid, 2),
                        "ask": round(ask, 2),
                        "last": round(last, 2),
                        "mid": round(mid, 2),
                        "open_interest": int(t.volume or 0),
                        "greeks": {
                            "delta": round(float(greeks.delta), 4) if greeks and greeks.delta else 0,
                            "mid_iv": round(float(greeks.impliedVol), 4) if greeks and greeks.impliedVol else 0,
                            "gamma": round(float(greeks.gamma), 6) if greeks and greeks.gamma else 0,
                            "theta": round(float(greeks.theta), 4) if greeks and greeks.theta else 0,
                        }
                    })
 
            return {
                "symbol": symbol,
                "expiration": expiration,
                "stock_price": round(float(stock_price), 2),
                "options": sorted(results, key=lambda x: (x["option_type"], x["strike"])),
                "count": len(results),
                "source": "ibkr_live"
            }
        return jsonify(ib_call(_chain))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
def create_ssl_cert():
    cert = os.path.join(tempfile.gettempdir(), "ibkr_proxy.crt")
    key  = os.path.join(tempfile.gettempdir(), "ibkr_proxy.key")
    if os.path.exists(cert) and os.path.exists(key):
        return cert, key
    try:
        from OpenSSL import crypto
        k = crypto.PKey(); k.generate_key(crypto.TYPE_RSA, 2048)
        c = crypto.X509(); c.get_subject().CN = "localhost"
        c.set_serial_number(1000); c.gmtime_adj_notBefore(0)
        c.gmtime_adj_notAfter(365*24*60*60)
        c.set_issuer(c.get_subject()); c.set_pubkey(k); c.sign(k, 'sha256')
        open(cert,"wb").write(crypto.dump_certificate(crypto.FILETYPE_PEM, c))
        open(key,"wb").write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
        return cert, key
    except:
        return None, None
 
if __name__ == "__main__":
    print("="*55)
    print("  PremiumOptions IBKR Proxy v1.2")
    print("="*55)
    print(f"  TWS-Ports: {TWS_PORTS}")
    print("  Browser: https://localhost:5001/health")
    print("="*55)
    cert, key = create_ssl_cert()
    print("\n  ✓ HTTP auf http://localhost:5001 (ngrok macht HTTPS)\n")
    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)
 
