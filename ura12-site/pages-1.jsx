// Pages: Home, Members, Dashboard, Archives, BestOf, Merch, Secret
const { useState: useS, useEffect: useE, useRef: useR, useMemo: useM } = React;

/* =========================================================
   HOME PAGE — countdown, welcome, hero
   ========================================================= */
function HomePage({ user, onJump, eggsFound, totalEggs }) {
  const target = new Date("2026-05-17T20:00:00").getTime();
  const [now, setNow] = useS(Date.now());
  useE(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const unlocked = diff <= 0;

  const [glitchKick, setGlitchKick] = useS(false);
  useE(() => { setGlitchKick(true); const t = setTimeout(() => setGlitchKick(false), 600); return () => clearTimeout(t); }, [s % 5 === 0]);

  return (
    <div style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* hero band */}
      <div style={{
        background: "linear-gradient(180deg, #FFF1D6 0%, #FFE6BE 100%)",
        borderBottom: "1px solid #C9B488",
        padding: "20px 24px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg, #C42B1C 0 2px, transparent 2px 14px)" }} />
        <div className="kicker">URA12 // est. 17 mai 2021</div>
        <h1 style={{
          margin: "0 0 4px",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 46,
          lineHeight: 1,
          color: "var(--red-3)",
          letterSpacing: 1,
          textShadow: "2px 2px 0 rgba(225,75,58,0.25), 4px 4px 0 rgba(0,0,0,0.08)"
        }}>
          Bon retour, {user?.name || "ami(e)"}.
        </h1>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-fun)", fontSize: 16, color: "var(--ink-soft)" }}>
          5 ans de salons vocaux délirants, de catastrophes hebdomadaires, et exactement 2 neurones en état de marche (partagés). ❤
        </p>
      </div>

      {/* Countdown box */}
      <div style={{ padding: "24px", display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>
        <div className="panel-sunken" style={{
          flex: "1 1 480px",
          padding: 20,
          background: "linear-gradient(180deg, #1A1612 0%, #2A1F18 100%)",
          color: "var(--cream)",
          borderRadius: 6,
          border: "2px inset #5A1208",
          position: "relative",
          overflow: "hidden"
        }}>
          <div className="kicker" style={{ color: "#FFB8A4" }}>
            { unlocked ? "// LE JOUR EST ARRIVÉ" : "// COMPTE À REBOURS" }
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontWeight: "bold",
            fontSize: 13,
            color: "#FFE6BE",
            marginBottom: 10
          }}>17 / 05 / 2026 — 20:00 CET</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[["JOURS", d], ["HEURES", h], ["MIN", m], ["SEC", s]].map(([lbl, val]) => (
              <div key={lbl} style={{
                background: "#0A0504",
                border: "1px solid #5A1208",
                borderRadius: 4,
                padding: "10px 4px",
                textAlign: "center",
                boxShadow: "inset 0 0 18px rgba(225,75,58,0.25)"
              }}>
                <div className={glitchKick ? "glitch" : ""} data-text={String(val).padStart(2, "0")}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: "bold",
                    fontSize: 38,
                    color: "#FF6B5B",
                    textShadow: "0 0 14px rgba(255,107,91,0.7), 0 0 4px rgba(255,107,91,0.9)",
                    lineHeight: 1
                  }}>
                  {String(val).padStart(2, "0")}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#FFB8A4", letterSpacing: 2, marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "#FFB8A4" }}>
            {unlocked ? "🎉 CONTENU SECRET DÉBLOQUÉ — consulte le bureau" : "contenu secret se déverrouille à T-0"}
          </div>
        </div>

        <div className="panel-sunken" style={{ flex: "1 1 280px", padding: 16, borderRadius: 6 }}>
          <div className="kicker">// liens rapides</div>
          <div className="col gap-2">
            <button className="gloss-btn" onClick={() => onJump("members")}>👥 Le Roster</button>
            <button className="gloss-btn cream" onClick={() => onJump("archives")}>📂 Ouvrir les Archives</button>
            <button className="gloss-btn cream" onClick={() => onJump("bestof")}>📺 Bande Best-of</button>
            <button className="gloss-btn green" onClick={() => onJump("merch")}>🛒 La Boutique</button>
          </div>
          <div style={{ marginTop: 14, padding: 8, background: "#FFF8E8", border: "1px dashed #C9B488", borderRadius: 4, fontSize: 12, color: "var(--ink-soft)" }}>
            <b>🔍 Secrets trouvés :</b> {eggsFound} / {totalEggs}<br/>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
              indice : les formes connaissent le chemin.
            </span>
          </div>
        </div>
      </div>

      <div className="marquee">
        <span>★ URA12 — cinq ans de n'importe quoi ★ plus long VC : 14h 22m (Gio s'est endormi micro allumé) ★ total messages : 251 667 ★ clique sur les stickers ★ essaie le code Konami ★ marc dit bonjour ★ </span>
      </div>

      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {[
          { k: "251 667", l: "messages échangés", t: "en dm, dans les salons et le maudit #vent" },
          { k: "11 803h", l: "vocal", t: "≈ 1,34 an d'audio pur. vraiment maudit." },
          { k: "4 276", l: "mèmes épinglés", t: "94% de niche, 6% incompréhensibles." },
          { k: "1", l: "mariage (pour l'instant)", t: "shoutout giovanni & jason" },
        ].map((s, i) => (
          <div key={i} className="panel-sunken" style={{ padding: 14, borderRadius: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--red-2)", lineHeight: 1 }}>{s.k}</div>
            <div style={{ fontWeight: "bold", marginTop: 4, fontSize: 12 }}>{s.l}</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2, fontFamily: "var(--font-fun)" }}>{s.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MEMBERS PAGE
   ========================================================= */
function MembersPage({ onPickMember, selected }) {
  const [hover, setHover] = useS(null);
  return (
    <div style={{ padding: 18 }}>
      <div className="kicker">// le roster — 8 / 8 en ligne</div>
      <h2 className="section-h">Le Crew</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {window.MEMBERS.map((m) => (
          <div key={m.id}
            className="panel-sunken"
            onMouseEnter={() => setHover(m.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onPickMember(m.id)}
            style={{
              padding: 12,
              borderRadius: 6,
              cursor: "pointer",
              transition: "transform .15s, box-shadow .15s",
              transform: hover === m.id ? "translateY(-3px)" : "none",
              boxShadow: hover === m.id ? "3px 5px 0 rgba(0,0,0,0.18)" : "1px 1px 0 rgba(0,0,0,0.08)",
              border: selected === m.id ? "2px solid var(--red-2)" : "1px solid #BBB"
            }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 64, height: 64,
                background: "linear-gradient(135deg, #FFFFFF, #FFE6BE)",
                borderRadius: 8,
                border: "1px solid #8A7A55",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.08)",
                flexShrink: 0,
              }}
              dangerouslySetInnerHTML={{ __html: window.shapeSvg(m.shape, m.color, 50) }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: "bold", fontSize: 18, color: "var(--ink)" }}>{m.name}</div>
                  <span className="pill red">Lv {m.level}</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-soft)" }}>@{m.handle}</div>
                <div style={{ fontFamily: "var(--font-fun)", fontSize: 12, marginTop: 2, color: "var(--red-3)" }}>{m.title}</div>
              </div>
            </div>
            {/* XP bar */}
            <div style={{ marginTop: 10, height: 8, background: "#1A1612", border: "1px solid #5A1208", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${m.xp * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #FF8A78, #C42B1C)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)"
              }}/>
            </div>
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, fontSize: 10, fontFamily: "var(--font-mono)" }}>
              <div><b>{m.stats.messages.toLocaleString()}</b><br/><span style={{ color: "var(--ink-soft)" }}>msgs</span></div>
              <div><b>{m.stats.vc_hours}h</b><br/><span style={{ color: "var(--ink-soft)" }}>vc</span></div>
              <div><b>{m.stats.memes}</b><br/><span style={{ color: "var(--ink-soft)" }}>memes</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MEMBER DETAIL DIALOG
   ========================================================= */
function MemberDetail({ member, onClose }) {
  if (!member) return null;
  return (
    <div className="dialog-veil" onClick={onClose}>
      <div className="win" style={{ width: 520, position: "relative", maxHeight: "82vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="win-titlebar">
          <div className="win-icon" style={{ background: member.color, color: "white", fontFamily: "var(--font-mono)" }}>{member.name[0]}</div>
          <div className="win-title">{member.name}.profile</div>
          <div className="win-buttons">
            <button className="win-btn close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="win-body" style={{ padding: 18 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 96, height: 96,
              background: "linear-gradient(135deg, #FFFFFF, #FFE6BE)",
              border: "1px solid #8A7A55",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.08), 2px 2px 0 rgba(0,0,0,0.15)",
              flexShrink: 0
            }} dangerouslySetInnerHTML={{ __html: window.shapeSvg(member.shape, member.color, 78) }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, color: "var(--red-3)" }}>{member.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>@{member.handle} • arrivé le {member.joined}</div>
              <div style={{ fontFamily: "var(--font-fun)", fontSize: 14, color: "var(--red-3)", marginTop: 4 }}>“{member.catch}”</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="pill red">Lv {member.level}</span>
                <span className="pill">{member.title}</span>
                <span className="pill">XP {Math.round(member.xp*100)}%</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: 10, background: "#FFF8E8", border: "1px dashed #C9B488", borderRadius: 4, fontFamily: "var(--font-fun)", fontSize: 14 }}>
            {member.bio}
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="panel-sunken" style={{ padding: 10, borderRadius: 4 }}>
              <div className="kicker" style={{ color: "var(--moss)" }}>// points forts</div>
              {member.strengths.map((s, i) => <div key={i} style={{ fontSize: 12 }}>✓ {s}</div>)}
            </div>
            <div className="panel-sunken" style={{ padding: 10, borderRadius: 4 }}>
              <div className="kicker" style={{ color: "var(--red-2)" }}>// points faibles</div>
              {member.weaknesses.map((s, i) => <div key={i} style={{ fontSize: 12 }}>✗ {s}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomePage = HomePage;
window.MembersPage = MembersPage;
window.MemberDetail = MemberDetail;
