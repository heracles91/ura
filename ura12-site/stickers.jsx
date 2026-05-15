// Floating draggable stickers + speech bubble + click-sequence egg manager
const { useState: stkS, useEffect: stkE, useRef: stkR } = React;

const STICKER_QUIPS = {
  kevin:  ["wait wait wait check this", "we keeping the name", "one more game?"],
  yuan:   ["actually, the spreadsheet says…", "let me run the numbers", "i made a chart"],
  alexis: ["ok hear me out", "plot twist incoming", "i'll reply in 2031"],
  ayoub:  ["bro it's literally one line", "the bot is up. now it's down.", "patience."],
  anton:  ["pinned message from november", "i have receipts", "october 2022 says hi"],
  marc:   ["BRO LISTEN", "i walked into a lamppost", "(volume too high)"],
  theo:   ["i was thinking in the shower", "back from the woods", "have you considered…"],
  giovanni:["i'll be there in 5 (lying)", "gn 🌙 (it's 6am)", "the vibes are immaculate"]
};

const SECRET_SEQUENCE = ["kevin", "ayoub", "yuan", "giovanni", "marc", "theo", "anton", "alexis"];

function FloatingStickers({ onSequenceComplete, onEggFound, eggsFound, hintMode, visible }) {
  const [seq, setSeq] = stkS([]);
  const [bubble, setBubble] = stkS(null); // { id, x, y, msg }

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
    const msg = quips[Math.floor(Math.random() * quips.length)];
    const rect = ev.currentTarget.getBoundingClientRect();
    setBubble({ id: m.id, x: rect.left + 80, y: rect.top - 40, msg });
    setTimeout(() => setBubble(b => b && b.id === m.id ? null : b), 2200);

    // sequence
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
              <div dangerouslySetInnerHTML={{ __html: window.shapeSvg(m.shape, m.color, 70) }}/>
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
