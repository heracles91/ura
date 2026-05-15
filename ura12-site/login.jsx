// Login screen — pick your character + password
const { useState: lS, useEffect: lE } = React;

function LoginScreen({ onLogin }) {
  const [picked, setPicked] = lS(null);
  const [pw, setPw] = lS("");
  const [err, setErr] = lS("");
  const [stage, setStage] = lS("pick"); // pick | pw | loading
  const [boot, setBoot] = lS(false);

  const submit = (e) => {
    e && e.preventDefault();
    if (!picked) return;
    if (pw.length < 1) { setErr("password required (any non-empty value works, this is a vibe gate)"); return; }
    setStage("loading");
    setBoot(true);
    setTimeout(() => onLogin(picked), 1800);
  };

  if (boot) {
    return (
      <div className="boot">
        <div className="boot-logo">URA<span style={{ color: "#FF8A78" }}>12</span></div>
        <div style={{ fontSize: 12, color: "#FFB8A4", letterSpacing: 3 }}>WELCOMING {(picked || "").toUpperCase()}…</div>
        <div className="boot-bar"><div className="boot-bar-inner"/></div>
        <div style={{ fontSize: 11, color: "#88D8D8" }}>loading 5 years of memories…</div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 700,
      background:
        "radial-gradient(ellipse at 50% 0%, rgba(225,75,58,0.35), transparent 60%), linear-gradient(180deg, #2A1F18 0%, #0A0504 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 20, padding: 20
    }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)", pointerEvents: "none" }}/>

      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 60, color: "white",
          letterSpacing: 4, textShadow: "0 0 24px rgba(225,75,58,0.6), 4px 4px 0 var(--red-3)"
        }}>URA<span style={{ color: "#FF8A78" }}>12</span></div>
        <div style={{ fontFamily: "var(--font-mono)", color: "#FFE6BE", fontSize: 13, letterSpacing: 3 }}>// 5 YEARS // EST. 17.05.2021</div>
      </div>

      <div className="win" style={{ position: "static", width: 560, maxWidth: "92vw" }}>
        <div className="win-titlebar">
          <div className="win-icon">U</div>
          <div className="win-title">{stage === "pick" ? "select user — who are you?" : `password required — ${picked}`}</div>
          <div className="win-buttons"><button className="win-btn">_</button><button className="win-btn">□</button><button className="win-btn close">✕</button></div>
        </div>
        <div className="win-body" style={{ padding: 16 }}>
          {stage === "pick" && (
            <>
              <div style={{ fontFamily: "var(--font-fun)", fontSize: 14, marginBottom: 10 }}>👋 hello, friend. tap your face.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {window.MEMBERS.map(m => (
                  <button key={m.id}
                    onClick={() => { setPicked(m.id); setStage("pw"); setErr(""); }}
                    style={{
                      background: picked === m.id ? "linear-gradient(180deg, #FFF, #FFE6BE)" : "white",
                      border: "1px solid " + (picked === m.id ? "var(--red-2)" : "#BBB"),
                      borderRadius: 8, padding: 10, cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      transition: "transform .15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = ""}
                  >
                    <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}
                      dangerouslySetInnerHTML={{ __html: window.shapeSvg(m.shape, m.color, 56) }}/>
                    <div style={{ fontWeight: "bold", fontSize: 13 }}>{m.name}</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: 8, fontSize: 11, color: "var(--ink-soft)", fontFamily: "var(--font-mono)", borderTop: "1px dashed #C9B488" }}>
                not in the list? you're not in URA12. it's an exclusive club.
              </div>
            </>
          )}

          {stage === "pw" && (
            <form onSubmit={submit}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, #FFFFFF, #FFE6BE)", border: "1px solid #8A7A55", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                  dangerouslySetInnerHTML={{ __html: window.shapeSvg(window.MEMBERS.find(x => x.id === picked).shape, window.MEMBERS.find(x => x.id === picked).color, 64) }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "var(--red-3)" }}>{window.MEMBERS.find(x => x.id === picked).name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-soft)" }}>@{window.MEMBERS.find(x => x.id === picked).handle}</div>
                  <div style={{ fontFamily: "var(--font-fun)", fontSize: 12, marginTop: 4 }}>password hint: it's the first thing kevin ever typed in here.</div>
                </div>
              </div>
              <input
                autoFocus
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setErr(""); }}
                placeholder="••••••••"
                style={{
                  marginTop: 14, width: "100%",
                  padding: "10px 12px",
                  fontSize: 16, fontFamily: "var(--font-mono)",
                  background: "white",
                  border: "2px inset #888",
                  borderRadius: 4
                }}
              />
              {err && <div style={{ color: "var(--red-2)", fontSize: 11, marginTop: 4 }}>{err}</div>}
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" className="gloss-btn cream" onClick={() => { setStage("pick"); setPw(""); }}>← back</button>
                <button type="submit" className="gloss-btn green">Sign in →</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", color: "#FFB8A4", fontSize: 11, opacity: 0.7 }}>
        (psst — try the konami code on the desktop. or click stickers in order. or type "ura" anywhere.)
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
