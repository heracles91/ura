// Birthday celebration overlay — plays on every login after URA_BIRTHDAY_TS
const { useState: bdS, useEffect: bdE, useMemo: bdM } = React;

const BD_COLORS = ["#FF6B5B", "#FFE066", "#88D8D8", "#B6E07C", "#FFFFFF", "#FF8AC2", "#A88AFF"];
const BD_EMOJIS = ["🎉", "🎂", "✨", "🎈", "🥳", "🍰", "🎁", "🎊"];
const BD_DURATION_MS = 6500;

function BirthdayCelebration({ user, onDone }) {
  // Confetti pieces — generated once, animated via CSS keyframes
  const pieces = bdM(() => {
    const N = 90;
    return Array.from({ length: N }, (_, i) => {
      const isEmoji = Math.random() < 0.22;
      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 3.2 + Math.random() * 2.4,
        rot: Math.floor(Math.random() * 360),
        spin: 240 + Math.floor(Math.random() * 720) * (Math.random() < 0.5 ? -1 : 1),
        drift: Math.floor(Math.random() * 120) - 60,
        size: 8 + Math.floor(Math.random() * 10),
        color: BD_COLORS[Math.floor(Math.random() * BD_COLORS.length)],
        emoji: isEmoji ? BD_EMOJIS[Math.floor(Math.random() * BD_EMOJIS.length)] : null,
      };
    });
  }, []);

  const [closing, setClosing] = bdS(false);
  bdE(() => {
    const t1 = setTimeout(() => setClosing(true), BD_DURATION_MS - 600);
    const t2 = setTimeout(() => onDone && onDone(), BD_DURATION_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const skip = () => { setClosing(true); setTimeout(() => onDone && onDone(), 280); };

  return (
    <div
      onClick={skip}
      style={{
        position: "fixed", inset: 0, zIndex: 1500,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, rgba(225,75,58,0.45), rgba(10,5,4,0.78) 70%)",
        pointerEvents: "auto",
        cursor: "pointer",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.5s ease",
        overflow: "hidden",
        fontFamily: "var(--font-display)",
      }}
    >
      {/* Confetti / emoji rain */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {pieces.map(p => (
          <div key={p.id} className="bd-piece"
            style={{
              left: `${p.left}%`,
              top: -24,
              width: p.emoji ? "auto" : p.size,
              height: p.emoji ? "auto" : p.size * 1.5,
              background: p.emoji ? "transparent" : p.color,
              fontSize: p.emoji ? p.size + 14 : undefined,
              transform: `rotate(${p.rot}deg)`,
              "--bd-spin": `${p.spin}deg`,
              "--bd-drift": `${p.drift}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              borderRadius: p.emoji ? 0 : 2,
              boxShadow: p.emoji ? "none" : "0 0 4px rgba(0,0,0,0.25)",
              filter: p.emoji ? "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" : undefined,
            }}>
            {p.emoji || ""}
          </div>
        ))}
      </div>

      {/* Greeting card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", zIndex: 2,
          background: "linear-gradient(180deg, #FFF8E8 0%, #FFE6BE 100%)",
          border: "3px solid #5A1208",
          borderRadius: 14,
          padding: "26px 38px 22px",
          boxShadow: "6px 8px 0 rgba(0,0,0,0.35), 0 0 80px rgba(255,107,91,0.45)",
          textAlign: "center",
          maxWidth: "92vw",
          animation: closing ? "none" : "bd-pop 0.7s cubic-bezier(.34,1.6,.64,1)",
          transform: "rotate(-1.2deg)",
        }}
      >
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--red-3)",
          letterSpacing: 4,
          marginBottom: 6,
        }}>// 17.05.2021 → 17.05.2026</div>

        <div style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 64,
          lineHeight: 1,
          color: "var(--red-3)",
          letterSpacing: 2,
          textShadow: "3px 3px 0 rgba(225,75,58,0.25), 6px 6px 0 rgba(0,0,0,0.12)",
          marginBottom: 4,
        }}>
          BON ANNIVERSAIRE
        </div>

        <div style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 86,
          lineHeight: 1,
          color: "var(--ink)",
          letterSpacing: 3,
          textShadow: "4px 4px 0 #FF6B5B, 8px 8px 0 rgba(0,0,0,0.15)",
          margin: "10px 0 14px",
        }}>
          URA<span style={{ color: "var(--red-3)" }}>12</span>
        </div>

        <div style={{
          fontFamily: "var(--font-fun)",
          fontSize: 22,
          color: "var(--ink)",
        }}>
          🎂 5 ans, {user?.name || "ami(e)"} 🎂
        </div>

        <div style={{
          marginTop: 14,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-soft)",
          opacity: 0.7,
        }}>
          (clique pour fermer)
        </div>
      </div>

      <style>{`
        @keyframes bd-fall {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
          100% { transform: translate3d(var(--bd-drift), 110vh, 0) rotate(var(--bd-spin)); }
        }
        @keyframes bd-pop {
          0%   { transform: rotate(-1.2deg) scale(0.4); opacity: 0; }
          60%  { transform: rotate(-1.2deg) scale(1.08); opacity: 1; }
          100% { transform: rotate(-1.2deg) scale(1); opacity: 1; }
        }
        .bd-piece {
          position: absolute;
          animation-name: bd-fall;
          animation-timing-function: linear;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}

window.BirthdayCelebration = BirthdayCelebration;
