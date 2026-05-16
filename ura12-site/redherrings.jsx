// Fake easter eggs, decoy clues, and red-herring overlays
const { useState: rhS, useEffect: rhE, useRef: rhR } = React;

/* =========================================================
   1. MAX-EGGS CELEBRATION — fires once when all 7 secrets unlocked
   ========================================================= */
const MAX_COLORS = ["#FFD93B", "#FFE066", "#FF8A78", "#FFFFFF", "#FFB35C", "#88D8D8", "#B6E07C"];
const MAX_DURATION_MS = 7500;

function MaxEggsCelebration({ onDone }) {
  const pieces = React.useMemo(() => {
    return Array.from({ length: 140 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.6,
      duration: 3.8 + Math.random() * 2.8,
      rot: Math.floor(Math.random() * 360),
      spin: 360 + Math.floor(Math.random() * 900) * (Math.random() < 0.5 ? -1 : 1),
      drift: Math.floor(Math.random() * 180) - 90,
      size: 6 + Math.floor(Math.random() * 14),
      color: MAX_COLORS[Math.floor(Math.random() * MAX_COLORS.length)],
      isStar: Math.random() < 0.18,
    }));
  }, []);

  const [closing, setClosing] = rhS(false);
  rhE(() => {
    const t1 = setTimeout(() => setClosing(true), MAX_DURATION_MS - 700);
    const t2 = setTimeout(() => onDone && onDone(), MAX_DURATION_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const skip = () => { setClosing(true); setTimeout(() => onDone && onDone(), 300); };

  return (
    <div onClick={skip}
      style={{
        position: "fixed", inset: 0, zIndex: 1600,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, rgba(255,217,59,0.45), rgba(10,5,4,0.85) 70%)",
        cursor: "pointer", overflow: "hidden",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.6s ease",
        fontFamily: "var(--font-display)",
      }}>

      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {pieces.map(p => (
          <div key={p.id} className="rh-max-piece"
            style={{
              left: `${p.left}%`,
              top: -20,
              width: p.isStar ? "auto" : p.size,
              height: p.isStar ? "auto" : p.size * 1.6,
              background: p.isStar ? "transparent" : p.color,
              color: p.color,
              fontSize: p.isStar ? p.size + 18 : undefined,
              transform: `rotate(${p.rot}deg)`,
              "--rh-spin": `${p.spin}deg`,
              "--rh-drift": `${p.drift}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              borderRadius: p.isStar ? 0 : 1,
              boxShadow: p.isStar ? "none" : `0 0 8px ${p.color}`,
              filter: p.isStar ? "drop-shadow(0 0 6px rgba(255,217,59,0.9))" : undefined,
              textShadow: p.isStar ? `0 0 14px ${p.color}` : undefined,
            }}>
            {p.isStar ? "★" : ""}
          </div>
        ))}
      </div>

      {/* gold trophy card */}
      <div onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", zIndex: 2,
          background: "linear-gradient(180deg, #FFF8C8 0%, #FFD93B 65%, #B58A1A 100%)",
          border: "3px solid #5A3A0A",
          borderRadius: 16,
          padding: "30px 46px 24px",
          boxShadow: "8px 10px 0 rgba(0,0,0,0.4), 0 0 120px rgba(255,217,59,0.65)",
          textAlign: "center",
          maxWidth: "92vw",
          transform: "rotate(0.8deg)",
          animation: closing ? "none" : "rh-max-pop 0.85s cubic-bezier(.34,1.6,.64,1)",
        }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "#5A3A0A",
          letterSpacing: 5, marginBottom: 10,
        }}>// ACHIEVEMENT UNLOCKED</div>

        <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 6 }}>🏆</div>

        <div style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 72, lineHeight: 1, color: "#3A2200",
          letterSpacing: 2,
          textShadow: "3px 3px 0 rgba(255,217,59,0.55), 6px 6px 0 rgba(0,0,0,0.3)",
        }}>7 / 7</div>

        <div style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 32, color: "#5A3A0A", letterSpacing: 1,
          marginTop: 6,
        }}>TU AS TOUT TROUVÉ</div>

        <div style={{
          fontFamily: "var(--font-fun)", fontSize: 16,
          color: "#3A2200", marginTop: 10, opacity: 0.85,
        }}>
          archéologue certifié·e d'URA12 — chapeau bas.
        </div>

        <div style={{
          marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 11,
          color: "#5A3A0A", opacity: 0.7,
        }}>(clique pour fermer)</div>
      </div>

      <style>{`
        @keyframes rh-max-fall {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
          100% { transform: translate3d(var(--rh-drift), 115vh, 0) rotate(var(--rh-spin)); }
        }
        @keyframes rh-max-pop {
          0%   { transform: rotate(0.8deg) scale(0.3); opacity: 0; }
          55%  { transform: rotate(0.8deg) scale(1.12); opacity: 1; }
          100% { transform: rotate(0.8deg) scale(1); opacity: 1; }
        }
        .rh-max-piece {
          position: absolute;
          animation-name: rh-max-fall;
          animation-timing-function: linear;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   2. FAKE BOOT OVERLAY — fires on reverse Konami
   ========================================================= */
function FakeBootOverlay({ onDone }) {
  const [phase, setPhase] = rhS("on"); // on -> closing
  rhE(() => {
    const t1 = setTimeout(() => setPhase("closing"), 2000);
    const t2 = setTimeout(() => onDone && onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1700,
      background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 18,
      fontFamily: "var(--font-mono)", color: "#88D8D8",
      opacity: phase === "closing" ? 0 : 1,
      transition: "opacity 0.55s ease",
    }}>
      <div style={{ fontSize: 13, letterSpacing: 4, opacity: 0.6 }}>// URA12 KERNEL</div>
      <div style={{ fontSize: 26, color: "#FF6B5B", letterSpacing: 3 }}>
        system not ready.
      </div>
      <div style={{ fontSize: 11, opacity: 0.5 }}>retry in <span style={{ color: "#FFE066" }}>∞</span>s</div>
    </div>
  );
}

/* =========================================================
   3. PHANTOM 9th STICKER — appears 200ms near a precise corner
   ========================================================= */
function PhantomSticker() {
  // Zone trigger: upper-left of the desktop, 50x50 px, anchored a bit inside
  // so the corner-detection doesn't fire just by leaving the window.
  const [visible, setVisible] = rhS(false);
  const lastShown = rhR(0);

  rhE(() => {
    const TRIGGER_X = 60;   // zone center
    const TRIGGER_Y = 60;
    const TRIGGER_R = 28;   // half-side of the trigger box
    const COOLDOWN_MS = 6000;

    const onMove = (e) => {
      const now = Date.now();
      if (now - lastShown.current < COOLDOWN_MS) return;
      const dx = Math.abs(e.clientX - TRIGGER_X);
      const dy = Math.abs(e.clientY - TRIGGER_Y);
      if (dx < TRIGGER_R && dy < TRIGGER_R) {
        lastShown.current = now;
        setVisible(true);
        setTimeout(() => setVisible(false), 200);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!visible) return null;
  return (
    <div style={{
      position: "fixed",
      left: 22, top: 22,
      pointerEvents: "none",
      zIndex: 60,
      transform: "rotate(-9deg)",
      filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.18)) drop-shadow(0 6px 10px rgba(139,26,18,0.2))",
      animation: "rh-phantom-flash 200ms ease-out forwards",
    }}>
      <div style={{
        width: 88, height: 88,
        background: "white",
        border: "3px solid white",
        borderRadius: 10,
        padding: 4,
        boxShadow: "2px 3px 0 rgba(0,0,0,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <div style={{
          width: 70, height: 70,
          background: "linear-gradient(135deg, #2A1F18, #5A1208 50%, #1A1612)",
          borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontStyle: "italic",
          color: "#FF6B5B", fontSize: 38, fontWeight: "bold",
          textShadow: "0 0 10px rgba(255,107,91,0.8)",
        }}>?</div>
        <div style={{
          position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "#FF6B5B",
          fontFamily: "var(--font-fun)", fontSize: 10,
          padding: "1px 6px", borderRadius: 8,
          whiteSpace: "nowrap"
        }}>???</div>
      </div>
      <style>{`
        @keyframes rh-phantom-flash {
          0%   { opacity: 0; transform: rotate(-9deg) scale(0.7); }
          25%  { opacity: 1; transform: rotate(-9deg) scale(1.05); }
          75%  { opacity: 1; transform: rotate(-9deg) scale(1); }
          100% { opacity: 0; transform: rotate(-9deg) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

window.MaxEggsCelebration = MaxEggsCelebration;
window.FakeBootOverlay    = FakeBootOverlay;
window.PhantomSticker     = PhantomSticker;
