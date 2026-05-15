// Casino URA12 — roulette européenne + balance localStorage
const { useState: cS, useEffect: cE, useRef: cR } = React;

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const getColor = n => n === 0 ? 'green' : RED_NUMS.has(n) ? 'red' : 'black';

const CHIPS = [5, 10, 25, 50, 100];

const KEVIN_QUOTES = [
  "wait wait wait check this", "c'est chaud mais ça peut revenir", "mets tout sur le rouge",
  "j'ai fait pareil hier et j'ai gagné", "non mais là c'est stratégique",
];
const GIO_QUOTES = [
  "i'll be there in 5 (lost everything)", "gn 🌙 (lost at 6am)",
  "the vibes were immaculate (they were not)", "je reviens tout de suite",
];

function loadState() {
  try {
    return {
      balance: parseInt(localStorage.getItem('ura_casino_balance') || '500'),
      stats:   JSON.parse(localStorage.getItem('ura_casino_stats') || '{"games":0,"wins":0,"biggestWin":0,"biggestLoss":0}'),
      history: JSON.parse(localStorage.getItem('ura_casino_history') || '[]'),
    };
  } catch { return { balance: 500, stats: { games: 0, wins: 0, biggestWin: 0, biggestLoss: 0 }, history: [] }; }
}
function saveState(balance, stats, history) {
  localStorage.setItem('ura_casino_balance', String(balance));
  localStorage.setItem('ura_casino_stats', JSON.stringify(stats));
  localStorage.setItem('ura_casino_history', JSON.stringify(history.slice(-30)));
}

function CasinoPage() {
  const init = loadState();
  const [balance, setBalance] = cS(init.balance);
  const [stats, setStats]     = cS(init.stats);
  const [history, setHistory] = cS(init.history);

  const [chip, setChip]     = cS(10);
  const [bet, setBet]       = cS('red');   // 'red' | 'black' | 'green'
  const [spinning, setSpin] = cS(false);
  const [result, setResult] = cS(null);    // { number, color, won, delta }
  const [display, setDisplay] = cS(null);  // number shown during spin animation
  const timerRef = cR(null);

  // cleanup interval on unmount
  cE(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // check server reset version
  cE(() => {
    let mounted = true;
    window._supa.from('admin_config').select('value').eq('key', 'casino_reset_version').single()
      .then(({ data }) => {
        if (!mounted || !data) return;
        const serverV = data.value;
        const localV  = localStorage.getItem('ura_casino_reset_version');
        if (serverV !== localV) {
          localStorage.removeItem('ura_casino_balance');
          localStorage.removeItem('ura_casino_stats');
          localStorage.removeItem('ura_casino_history');
          localStorage.setItem('ura_casino_reset_version', serverV);
          const fresh = loadState();
          setBalance(fresh.balance); setStats(fresh.stats); setHistory(fresh.history);
        }
      });
    return () => { mounted = false; };
  }, []);

  const spin = () => {
    if (spinning || balance < chip) return;
    setSpin(true); setResult(null);
    let ticks = 0;
    timerRef.current = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 37));
      ticks++;
      if (ticks > 22) {
        clearInterval(timerRef.current);
        const num   = Math.floor(Math.random() * 37);
        const color = getColor(num);
        const won   = bet === color;
        const mult  = bet === 'green' ? 36 : 2;
        const delta = won ? chip * (mult - 1) : -chip;
        const newBal = Math.max(0, balance + delta);
        const newStats = {
          games:      stats.games + 1,
          wins:       stats.wins + (won ? 1 : 0),
          biggestWin:  won  ? Math.max(stats.biggestWin, delta)  : stats.biggestWin,
          biggestLoss: !won ? Math.max(stats.biggestLoss, -delta) : stats.biggestLoss,
        };
        const newHistory = [...history, { n: num, c: color, bet, delta, won }];
        setDisplay(num);
        setResult({ number: num, color, won, delta });
        setBalance(newBal);
        setStats(newStats);
        setHistory(newHistory);
        saveState(newBal, newStats, newHistory);
        setSpin(false);
      }
    }, 80);
  };

  const betColors = { red: '#C42B1C', black: '#1A1612', green: '#3F6B1A' };
  const histSlice = history.slice(-20).reverse();

  return (
    <div style={{ padding: 16, background: "linear-gradient(180deg, #1A1612, #2A1F18)", minHeight: "100%", color: "var(--cream)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

        {/* Left: wheel + betting */}
        <div className="col gap-3">
          {/* Wheel */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 220, height: 220, borderRadius: "50%",
              border: "6px solid #8A7A55",
              background: "conic-gradient(" + Array.from({length: 37}, (_, i) => {
                const col = getColor(i) === 'red' ? '#8C140A' : getColor(i) === 'green' ? '#2A4810' : '#1A1612';
                const start = (i / 37 * 360).toFixed(1);
                const end   = ((i + 1) / 37 * 360).toFixed(1);
                return `${col} ${start}deg ${end}deg`;
              }).join(', ') + ")",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(225,75,58,0.3), inset 0 0 20px rgba(0,0,0,0.5)",
              position: "relative",
              animation: spinning ? "spin-wheel 0.4s linear infinite" : "none",
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "radial-gradient(circle, #2A1F18, #1A0605)",
                border: "4px solid #8A7A55",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontStyle: "italic",
                fontSize: display !== null ? 28 : 14,
                color: display !== null ? (getColor(display) === 'red' ? '#FF8A78' : getColor(display) === 'green' ? '#B6E07C' : '#CCC') : '#888',
                fontWeight: "bold",
                textShadow: "0 0 10px currentColor",
                zIndex: 1,
              }}>
                {display !== null ? display : '?'}
              </div>
            </div>
            <style>{`@keyframes spin-wheel { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {result && (
              <div style={{
                padding: "10px 20px", borderRadius: 8, textAlign: "center",
                background: result.won ? "rgba(63,107,26,0.3)" : "rgba(139,26,18,0.3)",
                border: "1px solid " + (result.won ? "#6FA53A" : "#C42B1C"),
                animation: "pop 0.3s cubic-bezier(.34,1.6,.64,1)",
              }}>
                <div style={{ fontSize: 11, color: "#FFB8A4", fontFamily: "var(--font-mono)" }}>
                  numéro {result.number} — {result.color === 'red' ? '🔴 rouge' : result.color === 'black' ? '⚫ noir' : '🟢 zéro'}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, fontWeight: "bold", color: result.won ? "#B6E07C" : "#FF8A78" }}>
                  {result.won ? `+${result.delta} URA₿` : `${result.delta} URA₿`}
                </div>
                {!result.won && <div style={{ fontSize: 11, color: "#FFB8A4", fontFamily: "var(--font-fun)", marginTop: 2 }}>
                  "{GIO_QUOTES[Math.floor(Math.random()*GIO_QUOTES.length)]}"
                </div>}
              </div>
            )}
          </div>

          {/* Betting */}
          <div className="panel-sunken" style={{ padding: 14, borderRadius: 6, background: "rgba(255,248,232,0.05)", border: "1px solid #5A1208" }}>
            <div className="kicker" style={{ color: "#FFB8A4" }}>// mise</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {CHIPS.map(c => (
                <button key={c} onClick={() => setChip(c)}
                  style={{ padding: "4px 10px", borderRadius: 20, border: "1px solid " + (chip === c ? "#FFE6BE" : "#5A1208"), background: chip === c ? "#FFE6BE" : "transparent", color: chip === c ? "#1A1612" : "#FFE6BE", fontFamily: "var(--font-mono)", fontWeight: "bold", fontSize: 12, cursor: "pointer" }}>
                  {c}₿
                </button>
              ))}
            </div>
            <div className="kicker" style={{ color: "#FFB8A4" }}>// pari</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[['red','🔴 Rouge','x2'],['black','⚫ Noir','x2'],['green','🟢 Zéro','x35']].map(([id, label, mult]) => (
                <button key={id} onClick={() => setBet(id)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 6, cursor: "pointer",
                    border: "2px solid " + (bet === id ? "#FFE6BE" : betColors[id]),
                    background: bet === id ? betColors[id] : "transparent",
                    color: bet === id ? "white" : "#FFE6BE",
                    fontFamily: "var(--font-fun)", fontSize: 12, fontWeight: "bold",
                    boxShadow: bet === id ? "0 0 10px " + betColors[id] : "none",
                  }}>
                  {label}<br/><span style={{ fontSize: 10, opacity: 0.8 }}>{mult}</span>
                </button>
              ))}
            </div>
            <button className="gloss-btn" onClick={spin}
              style={{ width: "100%", fontSize: 16, opacity: (spinning || balance < chip) ? 0.5 : 1 }}
              disabled={spinning || balance < chip}>
              {spinning ? "En cours…" : `Lancer (mise: ${chip}₿)`}
            </button>
            {balance < chip && <div style={{ fontSize: 11, color: "#FF8A78", marginTop: 6, fontFamily: "var(--font-mono)", textAlign: "center" }}>solde insuffisant</div>}
          </div>
        </div>

        {/* Right: balance + stats + history */}
        <div className="col gap-3">
          {/* Balance */}
          <div style={{ padding: 16, borderRadius: 6, background: "#0A0504", border: "1px solid #5A1208", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#FFB8A4", fontFamily: "var(--font-mono)", letterSpacing: 2 }}>SOLDE</div>
            <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 42, color: balance > 500 ? "#B6E07C" : balance < 200 ? "#FF8A78" : "#FFE6BE", textShadow: "0 0 20px currentColor", lineHeight: 1.1 }}>
              {balance}
            </div>
            <div style={{ fontSize: 11, color: "#FFB8A4", fontFamily: "var(--font-mono)" }}>URA₿</div>
          </div>

          {/* Stats */}
          <div style={{ padding: 12, borderRadius: 6, background: "rgba(255,248,232,0.04)", border: "1px solid #5A1208" }}>
            <div className="kicker" style={{ color: "#FFB8A4" }}>// stats</div>
            {[
              ['Parties',    stats.games],
              ['Victoires',  stats.wins],
              ['Win rate',   stats.games > 0 ? Math.round(stats.wins/stats.games*100)+'%' : '—'],
              ['Meilleur gain', stats.biggestWin > 0 ? '+'+stats.biggestWin+'₿' : '—'],
              ['Pire perte', stats.biggestLoss > 0 ? '-'+stats.biggestLoss+'₿' : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--font-mono)", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#FFB8A4" }}>{l}</span>
                <span style={{ fontWeight: "bold" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Quote */}
          {stats.games > 0 && (
            <div style={{ padding: 10, borderRadius: 6, border: "1px dashed #5A1208", fontSize: 12, fontFamily: "var(--font-fun)", color: "#FFB8A4", textAlign: "center" }}>
              "{KEVIN_QUOTES[stats.games % KEVIN_QUOTES.length]}" — kevin
            </div>
          )}

          {/* History strip */}
          <div>
            <div className="kicker" style={{ color: "#FFB8A4" }}>// derniers résultats</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              {histSlice.slice(0, 20).map((h, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: 4, fontSize: 10, fontWeight: "bold",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  background: h.c === 'red' ? '#8C140A' : h.c === 'green' ? '#2A4810' : '#1A1612',
                  border: "1px solid " + (h.won ? "#B6E07C" : "#5A1208"),
                  color: h.won ? "#B6E07C" : "#FFB8A4",
                }}>{h.n}</div>
              ))}
            </div>
          </div>

          {/* Hall of Shame */}
          <div style={{ padding: 12, borderRadius: 6, background: "rgba(255,248,232,0.03)", border: "1px solid #5A1208" }}>
            <div className="kicker" style={{ color: "#FFB8A4" }}>// hall of shame</div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#888", marginTop: 4 }}>
              Giovanni — dette totale: <span style={{ color: "#FF8A78" }}>84€</span><br/>
              après avoir doublé sa mise conseillé par Kevin.
            </div>
          </div>

          {balance === 0 && (
            <button className="gloss-btn cream" onClick={() => {
              setBalance(500);
              saveState(500, stats, history);
            }}>Relance (500₿ offerts)</button>
          )}
        </div>
      </div>
    </div>
  );
}

window.CasinoPage = CasinoPage;
