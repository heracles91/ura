// Dashboard, Archives, BestOf, Merch, Secret — data from Supabase
const { useState: uS, useEffect: uE, useRef: uR } = React;

const PALETTE = ["#E14B3A","#2E8B8B","#E8A93B","#7B4FBF","#6FA53A","#E8762F","#3A6FB6","#D14B8A"];

function LoadingPane() {
  return (
    <div style={{ padding: 30, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
      chargement…
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function DashboardPage({ user, eggsFound, totalEggs }) {
  const [memories, setMemories] = uS(null);

  uE(() => {
    window._supa.from('timeline_events').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMemories(data.map(row => ({
            date: row.date
              ? new Date(row.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—',
            t:   row.title || '',
            who: (row.members && row.members[0]) || 'all',
            c:   row.description || '',
          })));
        } else {
          setMemories([
            { date: "17 mai 2021",      t: "Serveur créé",        who: "kevin",  c: "le crew original a débarqué." },
            { date: "3 août 2021",      t: "Première nuit blanche", who: "marc", c: "14h vc. micros allumés. personne n'a dormi." },
            { date: "25 déc. 2021",     t: "Secret Santa I",    who: "yuan",   c: "coordonné sur tableur. sans faute." },
            { date: "11 juin 2022",     t: "L'Incident",        who: "alexis", c: "on n'en parle pas. (si, chaque jour.)" },
            { date: "2 oct. 2023",      t: "Première rencontre IRL", who: "ayoub", c: "5/8 présents. légendaire." },
            { date: "14 mars 2024",     t: "Bot v3 déployé",    who: "ayoub",  c: "il a arrêté de dire 'pong'." },
            { date: "22 sept. 2024",    t: "Mariage de Marc",   who: "marc",   c: "speech écrit dans #wedding-prep." },
            { date: "17 mai 2026",      t: "5 ANS",             who: "all",    c: "on l'a fait. d'une manière ou d'une autre." },
          ]);
        }
      });
  }, []);

  if (!user) return <div style={{ padding: 30 }}>Pas connecté — connecte-toi d'abord.</div>;
  if (!memories) return <LoadingPane />;

  const m = user;
  const achievements = [
    { id: "founder",     name: "Founding Member",  desc: "Là dès le début.",              got: true,                     icon: "★" },
    { id: "100h",        name: "Voice Marathoner",  desc: "100h+ en VC.",                  got: m.stats.vc_hours > 100,   icon: "🎙" },
    { id: "wordsmith",   name: "Wordsmith",         desc: "20k+ messages.",                got: m.stats.messages > 20000, icon: "✍" },
    { id: "ghost",       name: "Ghost Mode",        desc: "Disparu 30+ jours.",            got: m.id === "theo",          icon: "👻" },
    { id: "earlybird",   name: "Early Bird",        desc: "Premier online 10 jours de suite.", got: m.id === "yuan",      icon: "☀" },
    { id: "explorer",   name: "Site Explorer",      desc: `${eggsFound}/${totalEggs} secrets.`, got: eggsFound > 0, icon: "🔍", progress: eggsFound / totalEggs },
    { id: "anniversary", name: "Half-Decade Club",  desc: "5 ans au compteur.",            got: true,                     icon: "🎂" },
    { id: "casino",      name: "Flambeur",          desc: "A joué au Casino.",             got: !!localStorage.getItem('ura_casino_stats'), icon: "🎰" },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14 }}>
        <div className="panel-sunken" style={{ padding: 14, borderRadius: 6, background: "linear-gradient(180deg, #FFF8E8, #FFE6BE)" }}>
          <div style={{
            width: "100%", aspectRatio: "1",
            background: "radial-gradient(circle at 30% 20%, #FFFFFF, #FFE6BE 60%, #E8A93B 100%)",
            border: "2px solid #8A7A55", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 -8px 16px rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.15)"
          }} dangerouslySetInnerHTML={{ __html: window.shapeSvg(m.shape, m.color, 140) }}/>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24, color: "var(--red-3)" }}>{m.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-soft)" }}>@{m.handle}</div>
            <div className="pill red" style={{ marginTop: 6 }}>{m.title}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              <span>LVL {m.level}</span><span>{Math.round(m.xp*100)}% → LVL {m.level+1}</span>
            </div>
            <div style={{ height: 14, background: "#1A1612", border: "1px solid #5A1208", borderRadius: 3, overflow: "hidden", marginTop: 4, position: "relative" }}>
              <div style={{ width: `${m.xp*100}%`, height: "100%", background: "linear-gradient(90deg, #FF8A78, #C42B1C)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }}/>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, fontFamily: "var(--font-mono)" }}>
            <DBStat label="MSGS"   v={m.stats.messages.toLocaleString()} />
            <DBStat label="VC HRS" v={m.stats.vc_hours} />
            <DBStat label="LEVEL"  v={m.level} />
            <DBStat label="XP"     v={`${Math.round(m.xp*100)}%`} />
          </div>
        </div>

        <div className="col gap-3">
          <div className="panel-sunken" style={{ padding: 14, borderRadius: 6 }}>
            <div className="kicker">// succès</div>
            <h3 className="section-h" style={{ fontSize: 18 }}>Vitrine des Trophées</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {achievements.map((a) => (
                <div key={a.id} style={{
                  padding: 10, borderRadius: 6,
                  border: "1px solid " + (a.got ? "#8A7A55" : "#CCC"),
                  background: a.got ? "linear-gradient(180deg, #FFF8E8, #FFE6BE)" : "#F0EDE6",
                  opacity: a.got ? 1 : 0.55,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", marginBottom: 6,
                    background: a.got ? "linear-gradient(180deg, #FF8A78, #C42B1C)" : "#888",
                    border: "2px solid " + (a.got ? "#5A1208" : "#666"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 18,
                  }}>{a.icon}</div>
                  <div style={{ fontWeight: "bold", fontSize: 12 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-soft)", lineHeight: 1.3, marginTop: 2 }}>{a.desc}</div>
                  {typeof a.progress === "number" && (
                    <div style={{ marginTop: 4, height: 4, background: "#DDD", borderRadius: 2 }}>
                      <div style={{ width: `${a.progress*100}%`, height: "100%", background: "var(--red-2)", borderRadius: 2 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-sunken" style={{ padding: 14, borderRadius: 6 }}>
            <div className="kicker">// chronologie</div>
            <h3 className="section-h" style={{ fontSize: 18 }}>La Route des Souvenirs</h3>
            <div style={{ position: "relative", paddingLeft: 24 }}>
              <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 3, background: "linear-gradient(180deg, var(--red-2), var(--gold))" }}/>
              {memories.map((mem, i) => (
                <div key={i} style={{ position: "relative", marginBottom: 10 }}>
                  <div style={{ position: "absolute", left: -19, top: 4, width: 12, height: 12, background: "var(--red-2)", border: "2px solid var(--ink)", borderRadius: "50%" }}/>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 1 }}>{mem.date}</span>
                    <span style={{ fontWeight: "bold", fontSize: 13 }}>{mem.t}</span>
                    <span className="pill" style={{ fontSize: 10 }}>{mem.who}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", fontFamily: "var(--font-fun)" }}>{mem.c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DBStat({ label, v }) {
  return (
    <div style={{ background: "white", border: "1px solid #BBB", borderRadius: 4, padding: "6px 8px" }}>
      <div style={{ color: "var(--ink-soft)", fontSize: 9 }}>{label}</div>
      <div style={{ fontWeight: "bold", fontSize: 14 }}>{v}</div>
    </div>
  );
}

/* =========================================================
   ARCHIVES — par année ET par channel (filtrables)
   ========================================================= */
function ArchivesPage() {
  const [grouped, setGrouped] = uS(null); // { year: { channel: [msg] } }
  const [year, setYear] = uS(null);
  const [channel, setChannel] = uS(null);

  uE(() => {
    window._supa.from('archives').select('*').order('sort_order', { ascending: true })
      .then(({ data: rows }) => {
        if (!rows || rows.length === 0) { setGrouped({}); return; }
        const g = {};
        rows.forEach(row => {
          const y  = row.year    || '????';
          const ch = row.channel || 'general';
          if (!g[y])    g[y] = {};
          if (!g[y][ch]) g[y][ch] = [];
          const entry = { at: row.timestamp || '' };
          if (row.type === 'pin')    { entry.sys = row.content; }
          else if (row.type === 'system') { entry.who = row.author; entry.t = row.content; entry.system = true; }
          else { entry.who = row.author; entry.t = row.content; if (row.image_url) entry.img = row.image_url; }
          g[y][ch].push(entry);
        });
        const firstYear = Object.keys(g).sort()[0];
        setGrouped(g);
        if (firstYear) {
          setYear(firstYear);
          const firstCh = Object.keys(g[firstYear]).sort()[0] || 'general';
          setChannel(firstCh);
        }
      });
  }, []);

  if (!grouped) return <LoadingPane />;

  const years = Object.keys(grouped).sort();
  const channelsForYear = year ? Object.keys(grouped[year] || {}).sort() : [];
  const log = (year && channel && grouped[year]?.[channel]) || [];

  const handleYearChange = (y) => {
    setYear(y);
    const chs = Object.keys(grouped[y] || {}).sort();
    setChannel(chs[0] || 'general');
  };

  const colorOf = (id) => (window.MEMBERS.find(x => x.id === id) || {}).color || "#888";
  const nameOf  = (id) => (window.MEMBERS.find(x => x.id === id) || {}).name  || id;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", height: "100%" }}>
      {/* Sidebar */}
      <div style={{ background: "#2A1F18", color: "var(--cream)", padding: 10, overflowY: "auto" }}>
        <div className="kicker" style={{ color: "#FFB8A4" }}>// channels</div>
        {channelsForYear.length > 0 ? channelsForYear.map(ch => (
          <div key={ch}
            onClick={() => setChannel(ch)}
            style={{
              padding: "6px 8px", borderRadius: 4, cursor: "pointer", marginBottom: 2,
              background: channel === ch ? "rgba(225,75,58,0.3)" : "transparent",
              color: channel === ch ? "white" : "#FFE6BE",
              fontFamily: "var(--font-mono)", fontSize: 12
            }}>#{ch}</div>
        )) : (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#FFB8A4", padding: "4px 0" }}>—</div>
        )}

        <div className="kicker" style={{ color: "#FFB8A4", marginTop: 14 }}>// aller à l'année</div>
        <div className="col gap-2" style={{ marginTop: 6 }}>
          {years.length > 0 ? years.map(y => (
            <button key={y} className={"gloss-btn " + (year === y ? "" : "cream")}
              style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => handleYearChange(y)}>{y}</button>
          )) : <div style={{ fontSize: 11, color: "#FFB8A4" }}>aucune donnée</div>}
        </div>
      </div>

      {/* Chat */}
      <div style={{ background: "#FFF8E8", overflowY: "auto", padding: 14, fontFamily: "var(--font-ui)" }}>
        <div style={{ paddingBottom: 10, borderBottom: "1px solid #C9B488", marginBottom: 10 }}>
          <div style={{ fontWeight: "bold" }}>#{channel || '—'} — {year || '—'}</div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>retour tout au début. de la poussière partout.</div>
        </div>

        {log.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--ink-soft)", fontStyle: "italic", padding: 10 }}>
            aucun message pour ce salon / cette année.
          </div>
        )}

        {log.map((row, i) => row.sys ? (
          <div key={i} style={{ fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic", padding: "4px 0" }}>
            {row.sys} <span style={{ float: "right", fontFamily: "var(--font-mono)" }}>{row.at}</span>
          </div>
        ) : row.system ? (
          <div key={i} style={{ fontSize: 11, color: "var(--moss)", padding: "4px 0" }}>
            → <b>{nameOf(row.who)}</b> {row.t}
            <span style={{ float: "right", fontFamily: "var(--font-mono)" }}>{row.at}</span>
          </div>
        ) : (
          <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0" }}>
            <div style={{
              width: 36, height: 36, background: "white", border: "1.5px solid var(--ink)",
              borderRadius: 8, flexShrink: 0, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {(() => {
                const mm = window.MEMBERS.find(x => x.id === row.who);
                return mm
                  ? <img src={window.memberImg(mm, 'pdp')} alt={mm.name} draggable={false}
                      style={{ width: 32, height: 32, objectFit: "contain", pointerEvents: "none", userSelect: "none" }}/>
                  : <span style={{ color: "var(--ink)", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>{nameOf(row.who)[0]}</span>;
              })()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: "bold", color: colorOf(row.who) }}>{nameOf(row.who)}</span>
                <span style={{ fontSize: 10, color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>{row.at}</span>
              </div>
              <div style={{ fontSize: 13 }}>{row.t}</div>
              {row.img && (
                <img src={row.img} alt=""
                  style={{ marginTop: 6, maxWidth: 320, maxHeight: 240, borderRadius: 4, border: "1px solid #C9B488", display: "block" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 14, padding: 10, background: "white", border: "1px solid #C9B488", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: "var(--ink-soft)", fontStyle: "italic" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>🔒</span>
          <span>l'archive est en lecture seule. ces messages ne peuvent pas être retirés.</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BEST-OF — thumbnails YouTube + lecteur inline
   ========================================================= */
function BestOfPage() {
  const [rows, setRows]     = uS(null);
  const [hover, setHover]   = uS(null);
  const [playing, setPlaying] = uS(null); // youtube_id en lecture

  uE(() => {
    window._supa.from('videos').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) { setRows([]); return; }
        const grouped = {};
        data.forEach((v, idx) => {
          const cat = v.category || 'Divers';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({
            id:   v.id,
            t:    v.title       || 'Sans titre',
            d:    v.date
              ? new Date(v.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
              : '—',
            c:    PALETTE[idx % PALETTE.length],
            yt:   v.youtube_id  || null,
            desc: v.description || '',
          });
        });
        setRows(Object.entries(grouped).map(([title, videos]) => ({ title, videos })));
      });
  }, []);

  if (!rows) return (
    <div style={{ background: "#1A1612", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoadingPane />
    </div>
  );

  return (
    <div style={{ background: "#1A1612", color: "var(--cream)", height: "100%", overflowY: "auto" }}>
      {/* Hero */}
      <div style={{
        height: 220, padding: 24, display: "flex", flexDirection: "column", justifyContent: "flex-end",
        position: "relative", borderBottom: "1px solid #5A1208",
        background: "linear-gradient(180deg, #2A1F18, #1A1612)",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 40%, #C42B1C 0%, transparent 60%)", pointerEvents: "none" }}/>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#FFB8A4", letterSpacing: 3 }}>// FEATURED</div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 42, color: "white", lineHeight: 1, marginTop: 4, textShadow: "3px 3px 0 #5A1208" }}>
          La Bande des Cinq Ans
        </div>
        <div style={{ fontFamily: "var(--font-fun)", fontSize: 14, color: "#FFE6BE", marginTop: 6, maxWidth: 560 }}>
          Un supercut de chaque cri, chaque soupir, chaque "attends, tu enregistres ?". Visionnage obligatoire.
        </div>
      </div>

      {rows.length === 0 && (
        <div style={{ padding: 30, fontFamily: "var(--font-mono)", color: "#FFB8A4", textAlign: "center" }}>
          aucune vidéo pour l'instant — ajoutes-en via le panneau admin.
        </div>
      )}

      {rows.map((row, ri) => (
        <div key={ri} style={{ padding: "16px 20px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "white", marginBottom: 8 }}>{row.title}</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
            {row.videos.map((v, vi) => {
              const id  = v.id || `${ri}-${vi}`;
              const hov = hover === id;
              return (
                <div key={id}
                  onMouseEnter={() => setHover(id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => v.yt && setPlaying(v.yt)}
                  style={{
                    width: 220, height: 130, flexShrink: 0, borderRadius: 6,
                    border: "1px solid " + (hov ? "white" : "#5A1208"),
                    cursor: v.yt ? "pointer" : "default",
                    overflow: "hidden", position: "relative",
                    transition: "transform .2s, box-shadow .2s",
                    transform: hov ? "scale(1.06)" : "scale(1)",
                    boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
                    background: `linear-gradient(135deg, ${v.c} 0%, #1A1612 100%)`,
                  }}>
                  {/* Thumbnail YouTube */}
                  {v.yt && (
                    <img
                      src={`https://img.youtube.com/vi/${v.yt}/hqdefault.jpg`}
                      alt=""
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  {/* Overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 70%)" }}/>
                  {/* Date badge */}
                  <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "white", fontFamily: "var(--font-mono)", fontSize: 10, padding: "2px 6px", borderRadius: 3 }}>{v.d}</div>
                  {/* Title */}
                  <div style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
                    <div style={{ fontWeight: "bold", fontSize: 12, color: "white", lineHeight: 1.2, textShadow: "1px 1px 0 rgba(0,0,0,0.9)" }}>{v.t}</div>
                  </div>
                  {/* Play button on hover */}
                  {hov && v.yt && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(225,75,58,0.9)", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, boxShadow: "0 4px 14px rgba(0,0,0,0.5)" }}>▶</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Lecteur inline */}
      {playing && (
        <div className="dialog-veil" onClick={() => setPlaying(null)} style={{ zIndex: 2000 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "min(854px, 96vw)", aspectRatio: "16/9", background: "#000", borderRadius: 8, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
            <button
              onClick={() => setPlaying(null)}
              style={{ position: "absolute", top: 8, right: 8, zIndex: 10, background: "rgba(0,0,0,0.7)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, width: 28, height: 28, cursor: "pointer", fontSize: 14, fontFamily: "var(--font-mono)" }}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${playing}?autoplay=1&rel=0`}
              style={{ width: "100%", height: "100%", display: "block", border: "none" }}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MERCH
   ========================================================= */
function MerchPage() {
  const [items, setItems] = uS(null);

  uE(() => {
    window._supa.from('merch_products').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) { setItems([]); return; }
        setItems(data.map((row, idx) => ({
          id:    row.id,
          name:  row.name  || 'Produit',
          price: row.price != null ? '€' + Number(row.price).toFixed(2) : '—',
          real:  row.real_product || false,
          desc:  row.description  || '',
          tag:   row.tag  || '',
          icon:  row.icon || '',
          c:     PALETTE[idx % PALETTE.length],
        })));
      });
  }, []);

  if (!items) return <LoadingPane />;

  return (
    <div style={{ padding: 18, background: "linear-gradient(180deg, #FFF8E8, #FFE6BE)", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="kicker">// la boutique</div>
          <h2 className="section-h" style={{ marginBottom: 0 }}>URA12 Official® Merch</h2>
          <div style={{ fontFamily: "var(--font-fun)", fontSize: 13, color: "var(--ink-soft)" }}>
            {items.filter(i => i.real).length} vrai{items.filter(i => i.real).length !== 1 ? 's' : ''}, {items.filter(i => !i.real).length} mensonge{items.filter(i => !i.real).length !== 1 ? 's' : ''}.
          </div>
        </div>
      </div>

      {items.length === 0 && (
        <div style={{ marginTop: 30, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>aucun produit pour l'instant.</div>
      )}

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {items.map(it => (
          <div key={it.id} className="panel-sunken" style={{ padding: 0, borderRadius: 6, overflow: "hidden", background: "white", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 160, background: `linear-gradient(135deg, ${it.c} 0%, #1A1612 130%)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 6px, transparent 6px 12px)" }}/>
              {it.icon ? (
                <div style={{ fontSize: 48 }}>{it.icon}</div>
              ) : (
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, color: "white", textShadow: "3px 3px 0 rgba(0,0,0,0.4)", letterSpacing: 4 }}>URA12</div>
              )}
              {it.real && <div style={{ position: "absolute", top: 8, right: 8, background: "linear-gradient(180deg, #B6E07C, #3F6B1A)", color: "white", fontFamily: "var(--font-mono)", fontWeight: "bold", fontSize: 10, padding: "3px 8px", borderRadius: 3, border: "1px solid #2A4810" }}>EN STOCK</div>}
              {!it.real && <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#FFE6BE", fontFamily: "var(--font-mono)", fontSize: 10, padding: "3px 8px", borderRadius: 3, transform: "rotate(8deg)" }}>concept seulement</div>}
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                <div style={{ fontWeight: "bold", fontSize: 14 }}>{it.name}</div>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--red-3)", fontSize: 18 }}>{it.price}</div>
              </div>
              <div style={{ fontFamily: "var(--font-fun)", fontSize: 12, color: "var(--ink-soft)", marginTop: 4, flex: 1 }}>{it.desc}</div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                <span className={"pill" + (it.real ? " red" : "")} style={{ fontSize: 9 }}>{it.tag}</span>
                <button className={"gloss-btn " + (it.real ? "green" : "cream")} style={{ padding: "5px 10px", fontSize: 11 }}>{it.real ? "Ajouter au panier" : "Wishlist"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SECRET PAGE
   ========================================================= */
function SecretPage() {
  return (
    <div style={{ padding: 0, height: "100%", background: "#0A0504", color: "#FFE6BE", fontFamily: "var(--font-mono)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(225,75,58,0.08) 0 1px, transparent 1px 3px)", pointerEvents: "none" }}/>
      <div style={{ padding: 30 }}>
        <div className="glitch" data-text="// CLASSIFIED // URA12.SECRET.LOG"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, color: "white" }}>
          // CLASSIFIED // URA12.SECRET.LOG
        </div>
        <div style={{ marginTop: 8, color: "#FFB8A4" }}>accès accordé. tu as trouvé le chemin.</div>
        <div style={{ marginTop: 20, padding: 16, background: "rgba(225,75,58,0.08)", border: "1px dashed #C42B1C", borderRadius: 4 }}>
          <div style={{ color: "#FF8A78", marginBottom: 6 }}>{"> ENTRY 001 — kevin // 17.05.2021"}</div>
          <div>{"if anyone reads this in 5 years, hi."}</div>
          <div>{"you're probably older. probably tired."}</div>
          <div>{"i hope we're still here."}</div>
        </div>
        <div style={{ marginTop: 12, padding: 16, background: "rgba(46,139,139,0.08)", border: "1px dashed #2E8B8B", borderRadius: 4 }}>
          <div style={{ color: "#88D8D8", marginBottom: 6 }}>{"> ENTRY 002 — yuan // 17.05.2026"}</div>
          <div>{"we are."}</div>
          <div>{"i made the spreadsheet for the next 5."}</div>
        </div>
        <div style={{ marginTop: 12, padding: 16, background: "rgba(232,169,59,0.08)", border: "1px dashed #E8A93B", borderRadius: 4 }}>
          <div style={{ color: "#FFD27F", marginBottom: 6 }}>{"> ENTRY 003 — all // ongoing"}</div>
          <div>{"to the next 5 years of bad ideas, late nights,"}</div>
          <div>{"and the 14h vc that never really ended."}</div>
          <div style={{ marginTop: 6 }}>{"// ura forever"}</div>
        </div>
        <div style={{ marginTop: 30, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 64, color: "white", textShadow: "0 0 30px rgba(225,75,58,0.7)" }}>♥</div>
          <div style={{ color: "#FFB8A4", fontSize: 11, marginTop: 4 }}>(cette page n'existe pas dans le menu. elle est entre toi et nous.)</div>
        </div>
      </div>
    </div>
  );
}

window.DashboardPage = DashboardPage;
window.ArchivesPage  = ArchivesPage;
window.BestOfPage    = BestOfPage;
window.MerchPage     = MerchPage;
window.SecretPage    = SecretPage;
