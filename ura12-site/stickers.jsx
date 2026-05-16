// Floating draggable stickers + speech bubble + click-sequence egg manager
const { useState: stkS, useEffect: stkE, useRef: stkR } = React;

const STICKER_QUIPS = {
  kevin:  ["Ah ouais je m'en rappelle", "Tqt tqt tqt tqt"],
  yuan:   ["J'ai rêvé de toi hier soir..", "Tu connais ce parfum ?"],
  alexis: ["Comment va mon pote ?", "Bon mon pote, tu connais déjà hein"],
  ayoub:  ["J'ai jamais dit ça !", "Nan moi je condamne", "Les femmes sont aussi fortes que les hommes"],
  anton:  ["Si seulement j'avais le pouvoir de la vitesse", "Regardez qui m'a envoyé un msg", "Les femmes c'est trop bien"],
  marc:   ["Je le jure sur mon prénom", "Si j'ai tort je m'appelle pas Marc", "Lisez \"Moi quand je me réincarne en Sexy Dragon\""],
  theo:   ["Devine j'ai croisé qui aujourd'hui", "Ayoub y a une organisation qui t'appelle"],
  giovanni:["Et c'est moi le Roi ?", "Donc là on va rien dire ?", "Nom d'un Zeus !"]
};

const SECRET_SEQUENCE = ["kevin", "ayoub", "yuan", "giovanni", "marc", "theo", "anton", "alexis"];


function FloatingStickers({ onSequenceComplete, onEggFound, eggsFound, hintMode, visible }) {
  const [seq, setSeq] = stkS([]);
  const [bubble, setBubble] = stkS(null); // { id, x, y, msg }
  const marcClicks = stkR([]); // timestamps of recent Marc clicks (red herring)

  // initial random-ish positions, scattered around the desktop
  const initial = stkS(() => {
    return window.MEMBERS.map((m, i) => {
      // place around screen edges
      const positions = [
        { x: 40, y: 80 }, { x: 240, y: 60 }, { x: window.innerWidth - 200, y: 120 },
        { x: window.innerWidth - 130, y: 360 }, { x: 80, y: window.innerHeight - 220 },
        { x: 320, y: window.innerHeight - 180 }, { x: window.innerWidth - 280, y: window.innerHeight - 200 },
        { x: window.innerWidth / 2 - 50, y: window.innerHeight - 240 }
      ];
      return { ...m, ...positions[i] };
    });
  })[0];

  const [positions, setPositions] = stkS(initial);

  const onPick = (m, ev) => {
    ev.stopPropagation();
    // bubble
    const quips = STICKER_QUIPS[m.id] || ["hi"];
    let msg = quips[Math.floor(Math.random() * quips.length)];

    // RED HERRING: 7 rapid clicks on Marc (within 3s) → special bubble
    const canon = window.memberKey(m) || m.id;
    if (canon === "marc") {
      const now = Date.now();
      marcClicks.current = [...marcClicks.current.filter(t => now - t < 3000), now];
      if (marcClicks.current.length >= 7) {
        msg = "j'ai dit non.";
        marcClicks.current = [];
      }
    }

    const rect = ev.currentTarget.getBoundingClientRect();
    setBubble({ id: m.id, x: rect.left + 80, y: rect.top - 40, msg });
    setTimeout(() => setBubble(b => b && b.id === m.id ? null : b), 2200);

    // sequence — original m.id comparison (works as long as slugs match SECRET_SEQUENCE)
    setSeq(prev => {
      const nextSeq = [...prev, m.id].slice(-SECRET_SEQUENCE.length);
      if (nextSeq.length === SECRET_SEQUENCE.length && nextSeq.every((x, i) => x === SECRET_SEQUENCE[i])) {
        onSequenceComplete();
        return [];
      }
      return nextSeq;
    });
  };

  const onDragStart = (id, ev) => {
    ev.preventDefault(); ev.stopPropagation();
    const startX = ev.clientX, startY = ev.clientY;
    const me = positions.find(p => p.id === id);
    const startPx = me.x, startPy = me.y;
    let moved = false;
    const move = (e) => {
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      setPositions(prev => prev.map(p => p.id === id ? { ...p, x: startPx + dx, y: startPy + dy } : p));
    };
    const up = (e) => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      if (!moved) onPick(me, { stopPropagation: () => {}, currentTarget: { getBoundingClientRect: () => ({ left: startPx, top: startPy }) } });
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  if (!visible) return null;

  return (
    <>
      {positions.map((m, i) => {
        const rot = ((i % 4) - 2) * 6;
        const isHinted = hintMode && SECRET_SEQUENCE.includes(m.id);
        return (
          <div key={m.id}
            className="sticker floating-sticker"
            onMouseDown={(e) => onDragStart(m.id, e)}
            style={{
              left: m.x, top: m.y,
              transform: `rotate(${rot}deg)`,
              "--hover-rot": `${-rot}deg`,
              animation: isHinted ? "pulse-hint 1.6s ease-in-out infinite" : undefined,
            }}
            title={m.name}
          >
            <div style={{
              width: 88, height: 88,
              background: "white",
              border: "3px solid white",
              borderRadius: 10,
              padding: 4,
              boxShadow: "2px 3px 0 rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative"
            }}>
              <img src={window.memberImg(m, 'full')} alt={m.name} draggable={false}
                onError={(e) => { console.warn("sticker img 404:", e.currentTarget.src, "for", m); }}
                style={{ width: 70, height: 70, objectFit: "contain", pointerEvents: "none", userSelect: "none" }}/>
              <div style={{
                position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
                background: "var(--ink)", color: "white",
                fontFamily: "var(--font-fun)", fontSize: 10,
                padding: "1px 6px", borderRadius: 8,
                whiteSpace: "nowrap"
              }}>{m.name}</div>
            </div>
          </div>
        );
      })}
      {bubble && (
        <div className="speech" style={{ left: bubble.x, top: bubble.y, position: "fixed", zIndex: 600 }}>
          {bubble.msg}
        </div>
      )}
      <style>{`
        @keyframes pulse-hint {
          0%, 100% { filter: drop-shadow(2px 3px 0 rgba(0,0,0,0.18)) drop-shadow(0 6px 10px rgba(139,26,18,0.2)); }
          50% { filter: drop-shadow(2px 3px 0 rgba(0,0,0,0.18)) drop-shadow(0 0 18px rgba(255,107,91,0.9)); }
        }
      `}</style>
    </>
  );
}

window.FloatingStickers = FloatingStickers;
window.SECRET_SEQUENCE = SECRET_SEQUENCE;

// ── Decorative artefacts — scattered, non-interactive ─────────────────────────
const ARTEFACT_FILES = [
  "ballon", "camping", "erwin", "haltere", "lol",
  "parfum", "popcorn", "sword", "voc", "yumeko"
];

function DesktopArtefacts() {
  const layout = stkS(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    // Hand-tuned anchors so artefacts hug edges/corners and avoid
    // the central area where windows open & the left desktop-icon column.
    const anchors = [
      { x: 0.18, y: 0.08 },
      { x: 0.42, y: 0.04 },
      { x: 0.66, y: 0.10 },
      { x: 0.88, y: 0.22 },
      { x: 0.92, y: 0.58 },
      { x: 0.74, y: 0.82 },
      { x: 0.48, y: 0.86 },
      { x: 0.22, y: 0.82 },
      { x: 0.10, y: 0.55 },
      { x: 0.30, y: 0.42 },
    ];
    return ARTEFACT_FILES.map((name, i) => {
      const a = anchors[i % anchors.length];
      const size = 56 + Math.floor(Math.random() * 28); // 56..84
      const rot  = Math.floor(Math.random() * 24) - 12; // -12..+12 deg
      return {
        name,
        x: Math.max(8, Math.min(W - size - 8, a.x * W - size / 2)),
        y: Math.max(8, Math.min(H - 60 - size, a.y * H - size / 2)),
        size,
        rot,
      };
    });
  })[0];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1,
      pointerEvents: "none", userSelect: "none", overflow: "hidden",
    }}>
      {layout.map((a) => (
        <img key={a.name}
          src={`images/artefacts/${a.name}.png`}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: "absolute",
            left: a.x, top: a.y,
            width: a.size, height: a.size,
            objectFit: "contain",
            transform: `rotate(${a.rot}deg)`,
            filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.22))",
            opacity: 0.92,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      ))}
    </div>
  );
}

window.DesktopArtefacts = DesktopArtefacts;
