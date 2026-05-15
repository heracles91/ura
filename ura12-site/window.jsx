// Reusable window chrome + draggable container
const { useState, useEffect, useRef, useCallback, useMemo } = React;

function Window({ id, title, icon, x, y, w, h, z, active, minimized, onFocus, onClose, onMove, children, accentIcon }) {
  const dragRef = useRef(null);
  const [drag, setDrag] = useState(null);

  const onMouseDown = (e) => {
    if (e.target.closest(".win-buttons")) return;
    onFocus();
    const startX = e.clientX, startY = e.clientY;
    const startWX = x, startWY = y;
    setDrag({ startX, startY, startWX, startWY });
    const move = (ev) => {
      onMove(id, startWX + (ev.clientX - startX), startWY + (ev.clientY - startY));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      setDrag(null);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      ref={dragRef}
      className={"win" + (drag ? " dragging" : "")}
      style={{ left: x, top: y, width: w, height: h, zIndex: z, opacity: active ? 1 : 0.985, display: minimized ? "none" : "flex", flexDirection: "column" }}
      onMouseDown={onFocus}
    >
      <div className="win-titlebar" onMouseDown={onMouseDown}>
        <div className="win-icon" style={{ background: accentIcon || undefined, color: accentIcon ? "white" : undefined }}>{icon}</div>
        <div className="win-title">{title}</div>
        <div className="win-buttons">
          <button className="win-btn" title="Réduire" onClick={(e) => { e.stopPropagation(); onClose("min"); }}>_</button>
          <button className="win-btn" title="Agrandir" onClick={(e) => { e.stopPropagation(); onClose("max"); }}>□</button>
          <button className="win-btn close" title="Fermer" onClick={(e) => { e.stopPropagation(); onClose("x"); }}>✕</button>
        </div>
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}

window.Window = Window;
