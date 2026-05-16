// Main app shell — desktop, taskbar, window manager, eggs orchestration
const { useState: aS, useEffect: aE, useRef: aR } = React;

const PAGES = {
  home:      { title: "accueil.URA12", icon: "🏠", w: 880, h: 600 },
  members:   { title: "le_roster.URA12", icon: "👥", w: 820, h: 600 },
  dashboard: { title: "mon_profil.URA12", icon: "🎮", w: 920, h: 640 },
  archives:  { title: "archives.URA12 — lecture seule", icon: "📂", w: 800, h: 580 },
  bestof:    { title: "best_of.URA12", icon: "📺", w: 880, h: 580 },
  merch:     { title: "boutique.URA12", icon: "🛒", w: 860, h: 600 },
  casino:    { title: "Marc's Casino", icon: "🎰", w: 860, h: 640 },
  esport:    { title: "esport.URA12", icon: "⚔️", w: 920, h: 640 },
  sondages:  { title: "sondages.URA12", icon: "🗳️", w: 780, h: 580 },
  taxes:     { title: "taxes.URA12", icon: "💸", w: 620, h: 560 },
  admin:     { title: "admin.URA12 — ACCÈS RESTREINT", icon: "⚙️", w: 1020, h: 680 },
  secret:    { title: "??????.URA12", icon: "🔒", w: 700, h: 540 },
};

const DESKTOP_ICONS = [
  { id: "home",      label: "Accueil",       icon: "🏠" },
  { id: "members",   label: "Le Roster",     icon: "👥" },
  { id: "dashboard", label: "Mon Profil",    icon: "🎮" },
  { id: "archives",  label: "Archives",      icon: "📂" },
  { id: "bestof",    label: "Bande Best-of", icon: "📺" },
  { id: "merch",     label: "La Boutique",   icon: "🛒" },
  { id: "casino",    label: "Casino",        icon: "🎰" },
  { id: "esport",    label: "Esport",        icon: "⚔️" },
  { id: "sondages",  label: "Sondages",      icon: "🗳️" },
  { id: "taxes",     label: "Taxes",         icon: "💸" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "stickersVisible": true,
  "showHints": false,
  "skipLogin": false,
  "showMarquee": true,
  "themeIntensity": "heavy"
}/*EDITMODE-END*/;

// ── Loading wrapper ──────────────────────────────────────────────────────────
function AppWrapper() {
  const [loaded, aS_loaded] = React.useState(false);

  React.useEffect(() => {
    window.membersReady.then(() => {
      // Dismiss XP boot screen
      const boot = document.getElementById('ura-boot');
      if (boot) {
        boot.style.opacity = '0';
        boot.style.transition = 'opacity 0.5s';
        setTimeout(() => { if (boot.parentNode) boot.parentNode.removeChild(boot); }, 500);
      }
      aS_loaded(true);
    });
  }, []);

  return loaded ? <App /> : null;
}

// ── Music tracks ─────────────────────────────────────────────────────────────
const TRACKS = [
  "Attack on Titan Final Season OP - My War [8-bit; VRC6].mp3",
  "Black Clover - Opening 1 Haruka Mirai [8 bit Cover] [Chiptune].mp3",
  "Jujutsu kaisen OP - Kaikai Kitan [8-bit Cover].mp3",
  "Kaguya-sama Love is War OP 1 - Love Dramatic (Full) [8-bit; VRC6] [16-bit; SNES].mp3",
  "Steins;Gate Op - Hacking to The Gate (8-Bit).mp3",
  "Vinland Saga - Opening MUKANJYO [8 bit Cover] [Chiptune].mp3",
  "We are! [8 bit cover] - One Piece OP 1.mp3",
  "Your Lie in April Hikaru Nara (In 8-bitChiptune).mp3",
];

// ── Main app (only mounts after window.MEMBERS is populated) ─────────────────
function App() {
  const [tweak, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const [user, setUser] = aS(() => tweak.skipLogin ? window.MEMBERS[0] : null);
  const [showLogin, setShowLogin] = aS(!tweak.skipLogin);

  // ── Music player ──
  const audioRef = aR(null);
  const [trackIdx, setTrackIdx] = aS(() => Math.floor(Math.random() * TRACKS.length));
  const [musicOn, setMusicOn] = aS(true);
  const [musicStarted, setMusicStarted] = aS(false);

  const startMusic = () => {
    if (musicStarted) return;
    setMusicStarted(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  const toggleMusic = () => {
    setMusicOn(on => {
      if (audioRef.current) {
        if (on) audioRef.current.pause();
        else { audioRef.current.play().catch(() => {}); setMusicStarted(true); }
      }
      return !on;
    });
  };

  const nextTrack = () => {
    setTrackIdx(i => (i + 1) % TRACKS.length);
  };

  aE(() => {
    if (!audioRef.current) return;
    audioRef.current.src = 'music/' + encodeURIComponent(TRACKS[trackIdx]);
    audioRef.current.volume = 0.35;
    if (musicOn && musicStarted) audioRef.current.play().catch(() => {});
  }, [trackIdx]);
  // ────────────────────

  const [windows, setWindows] = aS(() => [
    { id: "home", x: 80, y: 50, ...PAGES.home, z: 5, open: true, min: false }
  ]);
  const [zCounter, setZ] = aS(10);
  const [activeId, setActiveId] = aS("home");
  const [memberDetailId, setMemberDetailId] = aS(null);

  const [eggs, setEggs] = aS(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ura12_eggs') || '[]')); }
    catch { return new Set(); }
  });
  const TOTAL_EGGS = 7;
  const findEgg = (name) => setEggs(prev => {
    if (prev.has(name)) return prev;
    const n = new Set(prev); n.add(name);
    try { localStorage.setItem('ura12_eggs', JSON.stringify([...n])); } catch {}
    showToast(`🔓 Secret débloqué : ${name} (${n.size}/${TOTAL_EGGS})`);
    return n;
  });

  const [toast, setToast] = aS(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2800);
  };

  const [glitching, setGlitching] = aS(false);
  const triggerGlitch = (ms = 700) => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), ms);
  };

  aE(() => {
    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let buf = [];
    let typed = "";
    const onKey = (e) => {
      buf.push(e.key); buf = buf.slice(-KONAMI.length);
      if (buf.length === KONAMI.length && buf.every((k, i) => k.toLowerCase() === KONAMI[i].toLowerCase())) {
        findEgg("code konami");
        triggerGlitch(900);
        setTimeout(() => openWindow("secret"), 800);
      }
      if (e.key && e.key.length === 1) {
        typed = (typed + e.key).slice(-3).toLowerCase();
        if (typed === "ura") findEgg("tapé 'ura'");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openWindow = (id) => {
    setWindows(prev => {
      const exists = prev.find(w => w.id === id);
      if (exists) {
        return prev.map(w => w.id === id ? { ...w, open: true, min: false, z: zCounter + 1 } : w);
      }
      const idx = prev.length;
      const cfg = PAGES[id];
      return [...prev, { id, x: 70 + (idx * 36) % 220, y: 50 + (idx * 28) % 140, ...cfg, z: zCounter + 1, open: true, min: false }];
    });
    setZ(z => z + 1);
    setActiveId(id);
  };

  const closeWindow = (id, mode) => {
    if (mode === "x") {
      setWindows(prev => prev.filter(w => w.id !== id));
    } else if (mode === "min") {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, min: true } : w));
    } else {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 38 } : w));
    }
  };

  const moveWindow = (id, x, y) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const focusWindow = (id) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, z: zCounter + 1, min: false } : w));
    setZ(z => z + 1);
    setActiveId(id);
  };

  const [showBirthday, setShowBirthday] = aS(false);
  const onLogin = (memberId) => {
    setUser(window.MEMBERS.find(m => m.id === memberId));
    setShowLogin(false);
    findEgg("connexion");
    startMusic();
    if (Date.now() >= window.URA_BIRTHDAY_TS) setShowBirthday(true);
  };

  const onSequenceComplete = () => {
    findEgg("séquence de stickers");
    triggerGlitch(800);
    setTimeout(() => openWindow("secret"), 600);
  };

  const [cornerCount, setCornerCount] = aS(0);
  const onCornerClick = () => {
    setCornerCount(c => {
      if (c + 1 >= 3) { findEgg("coin caché"); return 0; }
      return c + 1;
    });
  };

  const onMarqueeClick = () => findEgg("le défilant");

  const visibleWindows = windows.filter(w => w.open);
  const taskItems = windows;

  const [now, setNow] = aS(new Date());
  aE(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const [startOpen, setStartOpen] = aS(false);

  return (
    <>
      {showLogin && <window.LoginScreen onLogin={onLogin} />}

      <div onClick={() => setStartOpen(false)}>
        {DESKTOP_ICONS.map((d, i) => (
          <div key={d.id}
            className={"desktop-icon" + (activeId === d.id ? " active" : "")}
            style={{ left: 18, top: 18 + i * 86 }}
            onDoubleClick={() => openWindow(d.id)}
            onClick={(e) => { e.stopPropagation(); }}
          >
            <div className="ico">{d.icon}</div>
            <div className="lbl">{d.label}</div>
          </div>
        ))}
        <div className="desktop-icon"
          style={{ right: 18, top: 18, left: "auto" }}
          onClick={(e) => { e.stopPropagation(); findEgg("le vieux dossier"); }}
          title="il y a quelque chose d'ancien ici..."
        >
          <div className="ico" style={{ background: "linear-gradient(135deg, #DDD, #888)", color: "#333" }}>?</div>
          <div className="lbl">_old.zip</div>
        </div>
      </div>

      {!showLogin && <window.DesktopArtefacts />}

      <window.FloatingStickers
        onSequenceComplete={onSequenceComplete}
        eggsFound={eggs.size}
        hintMode={tweak.showHints}
        visible={tweak.stickersVisible && !showLogin}
      />

      {visibleWindows.map(w => (
        <window.Window key={w.id}
          id={w.id} title={w.title} icon={w.icon}
          x={w.x} y={w.y} w={w.w} h={w.h} z={w.z}
          active={activeId === w.id}
          minimized={!!w.min}
          onFocus={() => focusWindow(w.id)}
          onClose={(mode) => closeWindow(w.id, mode)}
          onMove={moveWindow}
        >
          {w.id === "home"      && <window.HomePage      user={user} eggsFound={eggs.size} totalEggs={TOTAL_EGGS} onJump={openWindow} />}
          {w.id === "members"   && <window.MembersPage   onPickMember={(id) => setMemberDetailId(id)} selected={memberDetailId} />}
          {w.id === "dashboard" && <window.DashboardPage user={user} eggsFound={eggs.size} totalEggs={TOTAL_EGGS} />}
          {w.id === "archives"  && <window.ArchivesPage />}
          {w.id === "bestof"    && <window.BestOfPage />}
          {w.id === "merch"     && <window.MerchPage />}
          {w.id === "casino"    && <window.CasinoPage />}
          {w.id === "esport"    && <window.EsportPage />}
          {w.id === "sondages"  && <window.SondagesPage user={user} />}
          {w.id === "taxes"     && <window.TaxesPage user={user} />}
          {w.id === "admin"     && <window.AdminPage />}
          {w.id === "secret"    && <window.SecretPage />}
        </window.Window>
      ))}

      {memberDetailId && <window.MemberDetail member={window.MEMBERS.find(m => m.id === memberDetailId)} onClose={() => setMemberDetailId(null)} />}

      {showBirthday && <window.BirthdayCelebration user={user} onDone={() => setShowBirthday(false)} />}

      {toast && (
        <div style={{
          position: "fixed", bottom: 56, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(180deg, #FF8A78 0%, #C42B1C 100%)",
          color: "white", fontWeight: "bold", padding: "10px 18px",
          border: "1px solid #5A1208", borderRadius: 6,
          boxShadow: "0 4px 14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
          textShadow: "1px 1px 0 rgba(0,0,0,0.4)", fontFamily: "var(--font-ui)",
          zIndex: 900, animation: "pop 0.25s cubic-bezier(.34,1.6,.64,1)"
        }}>{toast}</div>
      )}

      {glitching && <div className="world-glitch"/>}

      <div onClick={onCornerClick}
        style={{ position: "fixed", right: 6, bottom: 42, width: 16, height: 16, zIndex: 999, cursor: "default" }}/>

      {/* Taskbar */}
      <div className="taskbar">
        <button className="start-btn" onClick={(e) => { e.stopPropagation(); setStartOpen(s => !s); }}>
          <span className="start-logo">U</span>start
        </button>
        <div className="task-items">
          {taskItems.map(t => (
            <div key={t.id} className={"task-item " + (activeId === t.id && !t.min ? "active" : "")}
              onClick={() => {
                if (t.min) { setWindows(prev => prev.map(w => w.id === t.id ? { ...w, min: false, z: zCounter + 1 } : w)); setZ(z => z + 1); setActiveId(t.id); }
                else if (activeId === t.id) { setWindows(prev => prev.map(w => w.id === t.id ? { ...w, min: true } : w)); }
                else { focusWindow(t.id); }
              }}>
              <span>{t.icon}</span>{t.title}
            </div>
          ))}
        </div>
        {tweak.showMarquee && (
          <div onClick={onMarqueeClick} className="marquee" style={{ width: 360, padding: 0, height: 38, display: "flex", alignItems: "center", borderTop: 0, borderBottom: 0, borderRight: 0 }}>
            <span>★ URA12 — cinq ans de souvenirs ★ {eggs.size}/{TOTAL_EGGS} secrets débloqués ★ essaie le code Konami ★ clique les stickers dans le bon ordre ★ tape "ura" n'importe où ★ </span>
          </div>
        )}
        <div className="tray">
          <button onClick={toggleMusic} title={musicOn ? "Couper la musique" : "Activer la musique"}
            style={{ background:"none", border:"none", cursor:"pointer", color:"white", fontSize:14, padding:"0 2px", opacity: musicStarted ? 1 : 0.6 }}>
            {musicOn && musicStarted ? "♫" : "♩"}
          </button>
          {musicOn && musicStarted && (
            <button onClick={nextTrack} title="Piste suivante"
              style={{ background:"none", border:"none", cursor:"pointer", color:"white", fontSize:11, padding:"0 2px", opacity:0.7 }}>
              ▶▶
            </button>
          )}
          <span style={{ opacity:0.4 }}>|</span>
          <span className="tray-icon">♥</span>
          <span>URA12</span>
          <span style={{ opacity: 0.6 }}>|</span>
          <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      {/* Audio player */}
      <audio ref={audioRef}
        src={'music/' + encodeURIComponent(TRACKS[trackIdx])}
        onEnded={nextTrack}
        style={{ display:"none" }}
      />

      {/* Start menu */}
      {startOpen && (
        <div onClick={() => setStartOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 850 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed", left: 0, bottom: 38, width: 320,
              background: "linear-gradient(180deg, #FFF8E8, #FFE6BE)",
              border: "1px solid #5A1208", borderRadius: "8px 8px 0 0",
              boxShadow: "4px -4px 0 rgba(0,0,0,0.2), 0 -8px 24px rgba(139,26,18,0.3)",
              overflow: "hidden", fontFamily: "var(--font-ui)"
            }}>
            <div style={{
              padding: "10px 14px",
              background: "linear-gradient(180deg, #F25A48 0%, #C42B1C 50%, #8C140A 100%)",
              color: "white", display: "flex", alignItems: "center", gap: 10,
              borderBottom: "1px solid #5A1208"
            }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #FFF, #FFE6BE)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red-3)", fontWeight: "bold", border: "1px solid rgba(0,0,0,0.3)" }}>
                {user ? user.name[0] : "?"}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16 }}>{user ? user.name : "guest"}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.85 }}>connecté à URA12</div>
              </div>
            </div>
            <div style={{ padding: 8 }}>
              {DESKTOP_ICONS.map(d => (
                <div key={d.id} onClick={() => { openWindow(d.id); setStartOpen(false); }}
                  style={{ padding: "8px 10px", display: "flex", gap: 10, alignItems: "center", borderRadius: 4, cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(225,75,58,0.18)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}
                >
                  <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #FFF, #FFE6BE)", border: "1px solid #8A7A55", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>{d.icon}</div>
                  <div style={{ fontWeight: "bold", fontSize: 13 }}>{d.label}</div>
                </div>
              ))}
              <div style={{ borderTop: "1px dashed #C9B488", marginTop: 6, paddingTop: 6 }}>
                <div onClick={() => { openWindow("admin"); setStartOpen(false); }}
                  style={{ padding: "8px 10px", display: "flex", gap: 10, alignItems: "center", borderRadius: 4, cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(225,75,58,0.18)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}
                >
                  <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #FFF, #FFE6BE)", border: "1px solid #8A7A55", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>⚙️</div>
                  <div style={{ fontWeight: "bold", fontSize: 13 }}>Admin</div>
                </div>
                <div onClick={() => { setShowLogin(true); setUser(null); setStartOpen(false); }}
                  style={{ padding: "8px 10px", display: "flex", gap: 10, alignItems: "center", borderRadius: 4, cursor: "pointer", color: "var(--red-2)", fontWeight: "bold", fontSize: 12 }}>
                  ⏻ Déconnexion
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tweaks panel */}
      <window.TweaksPanel>
        <window.TweakSection label="Theme">
          <window.TweakRadio label="Sticker layer" value={tweak.stickersVisible ? "on" : "off"}
            options={[{value:"on",label:"On"},{value:"off",label:"Off"}]}
            onChange={(v) => setTweak("stickersVisible", v === "on")}/>
          <window.TweakToggle label="Show egg hints" value={tweak.showHints} onChange={(v) => setTweak("showHints", v)}/>
          <window.TweakToggle label="Marquee in taskbar" value={tweak.showMarquee} onChange={(v) => setTweak("showMarquee", v)}/>
          <window.TweakToggle label="Passer la connexion (dev)" value={tweak.skipLogin} onChange={(v) => setTweak("skipLogin", v)}/>
        </window.TweakSection>
        <window.TweakSection label="Navigation rapide">
          {Object.keys(PAGES).filter(k => k !== "secret").map(k => (
            <window.TweakButton key={k} label={`Ouvrir ${k}`} onClick={() => openWindow(k)}/>
          ))}
        </window.TweakSection>
        <window.TweakSection label="Secrets trouvés">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {eggs.size}/{TOTAL_EGGS} découverts<br/>
            <span style={{ opacity: 0.7 }}>{[...eggs].map(e => "✓ " + e).join(" • ") || "aucun pour l'instant"}</span>
          </div>
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AppWrapper />);
