// Esport URA12 — wiki fidèle au site original (0W-14L, 3 joueurs actifs)
const { useState: eS } = React;

const TEAM_INFO = [
  ["Nom complet",  "URA12 Esports"],
  ["Abréviation",  "URA"],
  ["Région",       "EU West"],
  ["Localisation", "Arpajon, Essonne, France"],
  ["Fondée en",    "2022"],
  ["Statut",       "Pause stratégique™"],
  ["Manager",      'Kevin "heracles" (autoproclamé)'],
  ["Coach",        "Ayoub (temporaire depuis 2022)"],
  ["Win Rate",     "0%"],
  ["Bilan total",  "0W – 14L"],
];

const PLAYERS = [
  { ign:"heracles",    name:"Kevin",    role:"ADC / Shotcaller autoproclamé", champs:"Smolder, Samira, Tristana",  kda:"2.1 / 7.8 / 3.2", cs:"4.2",
    note:'Connu pour ses calls "foncez" en 3v5. 0 victoire en compétition. Flash forward systématique.' },
  { ign:"skawdark",    name:"Théo",     role:"Jungle / « Le carry mental »",  champs:"Viego, Evelynn, Sett",       kda:"3.4 / 8.1 / 2.0", cs:"5.1",
    note:'A promis de "1v9 ce game" à chaque match. N\'a jamais 1v9. Pathing questionnable.' },
  { ign:"giogioflash", name:"Giovanni", role:"Support / OTP Taric",           champs:"Taric",                      kda:"1.8 / 9.3 / 4.1", cs:"—",
    note:"One trick Taric. A tenté d'autres champions une fois. Ne l'a plus jamais fait. D'où le pseudo « flash » — il flash forward pour stun mais rate 80% du temps." },
];

const FORMER = [
  { ign:"Alxeno_",  name:"Alexis",   role:"Top / Mid", period:"2023 (1 match)",  champs:"K'Santé, Aurelion Sol",
    reason:"Rage quit définitif. A ragé si fort en une seule game (0/8/1 sur K'Santé) qu'il n'a plus jamais voulu rejouer. Toujours sur le serveur Discord." },
  { ign:"perzeval", name:"Stéphane", role:"Top / Mid", period:"2023 (2 matchs)", champs:"Kennen, Taliyah, Ambessa",
    reason:"A quitté pour les mêmes raisons qu'Alxeno_ mais avec encore moins de patience. N'était même pas membre du serveur Discord." },
];

const RIVALS = [
  { name:"RN Esport",                region:"France",   record:"0-3", note:"Némésis absolue. 3 confrontations, 3 défaites. Score moyen : 4-27." },
  { name:"Shadow Wolves Gaming",     region:"Belgique", record:"0-2", note:"Leur ADC a fait un pentakill dans les deux matchs." },
  { name:"Nordic Frost eSports",     region:"Suède",    record:"0-2", note:"Ont surrender à 15 min les deux fois." },
  { name:"Kebab Kings",              region:"Allemagne",record:"0-1", note:"Match de poule. URA12 éliminés en 18 minutes." },
  { name:"Patatas Bravas FC",        region:"Espagne",  record:"0-2", note:"Leur jungler a volé tous les barons. Les deux." },
  { name:"Ctrl+Alt+Defeat",          region:"France",   record:"0-1", note:"Le nom de l'équipe était déjà un spoiler du résultat." },
  { name:"Baguette Smurfs",          region:"France",   record:"0-1", note:"Fondée 2 semaines avant le tournoi. A quand même gagné." },
  { name:"Error 404: Wins Not Found",region:"Pays-Bas", record:"0-2", note:"Ironiquement, c'est URA12 qui n'a pas trouvé de victoire." },
];

const TOURNAMENTS = [
  { name:"Arpajon Open Cup 2022",     date:"Mars 2022",      format:"Bo1 – Élimination directe",       place:"Dernier (8/8)",
    matches:[{ opp:"RN Esport",              score:"0-1", kills:"3-21",  dur:"22 min" }] },
  { name:"Essonne League Saison 1",   date:"Juin–Août 2022", format:"Phase de groupes Bo1 + Playoffs", place:"Dernier du groupe D (0-4)",
    matches:[{ opp:"RN Esport",              score:"0-1", kills:"5-24",  dur:"19 min" },
             { opp:"Shadow Wolves Gaming",   score:"0-1", kills:"7-31",  dur:"26 min" },
             { opp:"Kebab Kings",            score:"0-1", kills:"2-18",  dur:"18 min" },
             { opp:"Ctrl+Alt+Defeat",        score:"0-1", kills:"6-22",  dur:"24 min" }] },
  { name:"Île-de-France Invitational", date:"Novembre 2022", format:"Round Robin Bo1",                 place:"6ème (6/6)",
    matches:[{ opp:"Shadow Wolves Gaming",   score:"0-1", kills:"4-29",  dur:"21 min" },
             { opp:"Nordic Frost eSports",   score:"0-1", kills:"8-19",  dur:"15 min (FF)" },
             { opp:"Baguette Smurfs",        score:"0-1", kills:"9-23",  dur:"28 min" }] },
  { name:"EU West Clash Spring 2023", date:"Février 2023",   format:"Bracket Bo1",                     place:"Éliminés au 1er tour",
    matches:[{ opp:"Patatas Bravas FC",      score:"0-1", kills:"5-20",  dur:"23 min" }] },
  { name:"RN Esport Revenge Series",  date:"Mai 2023",       format:"Showmatch Bo1",                   place:"Défaite",
    matches:[{ opp:"RN Esport",              score:"0-1", kills:"2-31",  dur:"17 min" }] },
  { name:"Essonne League Saison 2",   date:"Sept–Nov 2023",  format:"Phase de groupes + Playoffs",     place:"Dernier du groupe A (0-3)",
    matches:[{ opp:"Nordic Frost eSports",      score:"0-1", kills:"6-15", dur:"15 min (FF)" },
             { opp:"Error 404: Wins Not Found", score:"0-1", kills:"3-22", dur:"20 min" },
             { opp:"Patatas Bravas FC",          score:"0-1", kills:"7-25", dur:"27 min" }] },
  { name:"Arpajon LAN Party 2024",    date:"Janvier 2024",   format:"Double Élimination",              place:"Dernier (éliminés en 2 matchs)",
    matches:[{ opp:"Error 404: Wins Not Found", score:"0-1", kills:"4-19", dur:"22 min" },
             { opp:"Baguette Smurfs (Losers)",  score:"0-1", kills:"8-16", dur:"31 min (record URA12)" }] },
];

const TIMELINE = [
  { date:"Janvier 2022",  event:'Fondation de URA12 Esports. Kevin annonce : « On va tout casser en compétitif ».' },
  { date:"Mars 2022",     event:"Premier match officiel. Défaite 3-21 contre RN Esport. Kevin blame le ping." },
  { date:"Juin 2022",     event:"Inscription à l'Essonne League. Le trio originel tente de recruter des top/mid. Sans succès." },
  { date:"Août 2022",     event:'Fin saison 1 — 0-4. Le groupe D est rebaptisé « le groupe de la mort » (pour URA12).' },
  { date:"Novembre 2022", event:"Île-de-France Invitational. Premier (et dernier) FF à 15 minutes contre Nordic Frost." },
  { date:"Février 2023",  event:"EU West Clash Spring. Éliminés au 1er tour. Giovanni flash forward pour un stun — rate tout le monde." },
  { date:"Mars 2023",     event:"Alxeno_ (Alexis) rejoint comme toplaner. Rage si fort en une game (0/8/1 K'Santé) qu'il refuse de rejouer." },
  { date:"Avril 2023",    event:"perzeval (Stéphane) tente 2 matchs avant de rage quit. N'était même pas sur le Discord." },
  { date:"Mai 2023",      event:'Showmatch revanche contre RN Esport. Score : 2-31. Kevin : « On progresse, la dernière fois c\'était 3-21. »' },
  { date:"Sept. 2023",    event:"Essonne League S2. Théo promet de « carry depuis la jungle ». Résultat : 0-3." },
  { date:"Janvier 2024",  event:"Arpajon LAN Party. Match le plus long de l'histoire URA12 : 31 minutes. Toujours une défaite." },
  { date:"2024–présent",  event:'L\'équipe est en « pause stratégique ». Kevin affirme que « le retour sera légendaire ».' },
];

const TRIVIA = [
  "URA12 détient le record du plus faible winrate de l'Essonne League (0%).",
  "Le match le plus court : 15 minutes (FF contre Nordic Frost eSports).",
  "Le match le plus long : 31 minutes contre Baguette Smurfs — célébré comme un accomplissement par le roster.",
  "Giovanni (giogioflash) est OTP Taric. Flash forward pour stun dans 100% de ses matchs. Taux de réussite du stun : ~20%.",
  "Théo (skawdark) a déclaré « je carry depuis la jungle » au début de chaque match. Taux de carry effectif : 0%.",
  "Kevin s'est autoproclamé Coach, Manager, Shotcaller et Analyste tout en jouant ADC avec un KDA de 2.1/7.8/3.2.",
  "Taux de rétention des remplaçants : 0%. Durée moyenne d'un remplaçant : 1.5 matchs.",
  "Alxeno_ (Alexis) a ragé si fort en une game qu'il a juré de ne plus jamais jouer compétitif. Il est toujours sur le Discord.",
  "perzeval n'était pas sur le Discord. Il est venu, a ragé, est parti. Personne ne sait comment il a été recruté.",
  "Une boulangerie d'Arpajon a refusé de sponsoriser l'équipe après avoir consulté le palmarès.",
  "Le Discord URA12 contient plus de messages post-défaite que stratégiques (ratio estimé : 47:1).",
  "Kevin a un jour blâmé une défaite sur « le vent qui faisait bouger les rideaux et créait un reflet sur l'écran ».",
];

const REFS = [
  "Essonne League — Classement officiel Saison 1, Groupe D (archivé)",
  "RN Esport Twitter — « GG EZ » (posté après chaque match contre URA12)",
  "Boulangerie d'Arpajon — Communiqué de refus de sponsoring, mars 2023",
  "Kevin (heracles) — Interview post-défaite, « Le vent et les rideaux », mai 2023",
  "Essonne League — Classement officiel Saison 2, Groupe A (archivé)",
  "Giovanni (giogioflash) — Stats Flash Forward, op.gg (données compilées manuellement)",
  "Discord URA12 — Canal #copium — 2847 messages analysés",
  "Théo (skawdark) — « Je carry ce game » (déclaration répétée, non sourcée car trop fréquente)",
];

const totalKills  = TOURNAMENTS.flatMap(t => t.matches).reduce((a, m) => a + parseInt(m.kills.split('-')[0]), 0);
const totalDeaths = TOURNAMENTS.flatMap(t => t.matches).reduce((a, m) => a + parseInt(m.kills.split('-')[1]), 0);

const SECTIONS = [
  { id:'history',      label:'History' },
  { id:'timeline',     label:'Timeline' },
  { id:'roster',       label:'Roster' },
  { id:'organisation', label:'Organisation' },
  { id:'tournois',     label:'Tournois' },
  { id:'rivaux',       label:'Rivaux' },
  { id:'trivia',       label:'Trivia' },
  { id:'refs',         label:'Références' },
];

function EsportPage() {
  const [expanded, setExpanded] = eS(null);
  const [section, setSection]   = eS('history');

  const kicker = { fontFamily:"var(--font-mono)", fontSize:10, textTransform:"uppercase", letterSpacing:2, color:"var(--ink-soft)", marginBottom:4 };
  const h2     = { fontFamily:"var(--font-display)", fontStyle:"italic", fontWeight:"bold", fontSize:18, color:"var(--red-3)", margin:"14px 0 8px" };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", height:"100%" }}>

      {/* ── Sidebar ── */}
      <div style={{ background:"#2A1F18", color:"var(--cream)", overflowY:"auto", borderRight:"1px solid #5A1208", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:14, borderBottom:"1px solid #5A1208" }}>
          <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:18, color:"white", marginBottom:2 }}>URA12 Esports</div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"#FFB8A4", letterSpacing:1, marginBottom:10 }}>// COMPETITIVE DIVISION</div>
          {TEAM_INFO.map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:10, fontFamily:"var(--font-mono)", padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color:"#FFB8A4" }}>{k}</span>
              <span style={{ fontWeight:"bold", color:(k==="Win Rate"||k==="Bilan total")?"#FF8A78":"white", textAlign:"right", maxWidth:100 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop:12, padding:8, background:"rgba(225,75,58,0.1)", border:"1px dashed #C42B1C", borderRadius:4, fontSize:10, fontFamily:"var(--font-fun)", color:"#FFB8A4", lineHeight:1.5 }}>
            « L'important c'est pas de gagner, c'est de participer. »<br/>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:9, opacity:0.7 }}>— Kevin, après chaque défaite</span>
          </div>
        </div>

        <div style={{ padding:8 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"#888", textTransform:"uppercase", letterSpacing:2, marginBottom:6, padding:"0 4px" }}>Sommaire</div>
          {SECTIONS.map((s, i) => (
            <div key={s.id} onClick={() => setSection(s.id)}
              style={{ padding:"5px 8px", fontSize:11, fontFamily:"var(--font-ui)", cursor:"pointer", borderRadius:3,
                background: section===s.id ? "rgba(225,75,58,0.25)" : "transparent",
                color: section===s.id ? "#FFE6BE" : "#FFB8A4",
                borderLeft: section===s.id ? "2px solid #E14B3A" : "2px solid transparent" }}>
              {i+1}. {s.label}
            </div>
          ))}
        </div>

        <div style={{ marginTop:"auto", padding:12, borderTop:"1px solid #5A1208", fontFamily:"var(--font-mono)", fontSize:10 }}>
          <div style={{ color:"#FFB8A4" }}>Kills totaux</div>
          <div style={{ color:"#FF8A78", fontWeight:"bold" }}>{totalKills} / {totalDeaths}</div>
          <div style={{ color:"#888", fontSize:9 }}>ratio : {(totalKills/totalDeaths).toFixed(2)}</div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ overflowY:"auto", padding:16, background:"var(--cream)" }}>

        {/* HISTORY */}
        {section==='history' && (<>
          <div style={kicker}>// historique</div>
          <h2 style={h2}>History</h2>
          <div style={{ fontSize:13, lineHeight:1.7, color:"var(--ink-soft)" }}>
            <p style={{ marginBottom:10 }}><strong>URA12 Esports</strong> est une organisation esportive française fondée début 2022 à Arpajon, dans l'Essonne. Initialement créée comme « projet sérieux de compétition League of Legends » par <strong>heracles</strong> (Kevin), l'équipe s'est rapidement distinguée par son palmarès historiquement négatif, accumulant un record de <strong>0 victoire en 14 matchs officiels</strong> sur l'ensemble de sa carrière compétitive.</p>
            <p style={{ marginBottom:10 }}>Le roster originel — <strong>heracles</strong> (ADC), <strong>skawdark</strong> (Jungle) et <strong>giogioflash</strong> (Support / OTP Taric) — n'a jamais réussi à recruter un roster complet de 5 joueurs de manière durable. Deux remplaçants ont tenté l'aventure : <strong>Alxeno_</strong> (Alexis), membre du Discord, qui a ragé si fort lors de sa première et unique game qu'il n'a plus jamais voulu rejouer, et <strong>perzeval</strong> (Stéphane), qui a quitté pour les mêmes raisons après seulement 2 matchs — lui n'était même pas membre du serveur.</p>
            <p style={{ marginBottom:10 }}>Malgré un bilan catastrophique, l'équipe est connue dans la scène locale pour son enthousiasme indéfectible et sa capacité à s'inscrire à chaque tournoi disponible. Leur rivalité avec <strong>RN Esport</strong> (0-3) est devenue légendaire dans les cercles de l'Essonne.</p>
            <p>Depuis janvier 2024, l'équipe est en « pause stratégique ». Aucun match n'a été programmé depuis.</p>
          </div>
        </>)}

        {/* TIMELINE */}
        {section==='timeline' && (<>
          <div style={kicker}>// chronologie</div>
          <h2 style={h2}>Timeline</h2>
          <div style={{ borderLeft:"2px solid var(--red-2)", paddingLeft:16, marginLeft:4 }}>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ marginBottom:14, position:"relative" }}>
                <div style={{ position:"absolute", left:-21, top:5, width:10, height:10, borderRadius:"50%", background:"var(--red-2)", border:"2px solid var(--cream)" }}/>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--red-2)", fontWeight:"bold", marginBottom:2 }}>{t.date}</div>
                <div style={{ fontSize:13, color:"var(--ink-soft)", lineHeight:1.5 }}>{t.event}</div>
              </div>
            ))}
          </div>
        </>)}

        {/* ROSTER */}
        {section==='roster' && (<>
          <div style={kicker}>// roster actif (3 joueurs)</div>
          <h2 style={h2}>Roster actif</h2>
          <div style={{ overflowX:"auto", marginBottom:20 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"var(--font-mono)" }}>
              <thead>
                <tr style={{ background:"var(--panel)", borderBottom:"2px solid #C9B488" }}>
                  {["IGN","Nom","Rôle","Champions","KDA","CS/min"].map(h => (
                    <th key={h} style={{ padding:"6px 10px", textAlign:"left", fontSize:10, color:"var(--ink-soft)", textTransform:"uppercase", letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAYERS.map((p, i) => [
                  <tr key={p.ign} style={{ borderBottom:"1px solid #E8DCBF", cursor:"pointer", background:expanded===i?"#FFF8E8":i%2===0?"white":"var(--cream)" }}
                    onClick={() => setExpanded(expanded===i?null:i)}>
                    <td style={{ padding:"8px 10px", color:"var(--red-2)", fontWeight:"bold" }}>{p.ign}</td>
                    <td style={{ padding:"8px 10px", fontFamily:"var(--font-ui)", fontWeight:"bold" }}>{p.name}</td>
                    <td style={{ padding:"8px 10px", fontSize:11 }}>{p.role}</td>
                    <td style={{ padding:"8px 10px", color:"var(--ink-soft)" }}>{p.champs}</td>
                    <td style={{ padding:"8px 10px", color:"var(--red-2)", fontWeight:"bold" }}>{p.kda}</td>
                    <td style={{ padding:"8px 10px" }}>{p.cs}</td>
                  </tr>,
                  expanded===i && (
                    <tr key={p.ign+"_n"}>
                      <td colSpan={6} style={{ padding:"10px 16px", background:"#FFF1D6", borderBottom:"2px solid #C9B488", fontFamily:"var(--font-fun)", fontSize:13, color:"var(--ink-soft)", fontStyle:"italic" }}>
                        « {p.note} »
                      </td>
                    </tr>
                  ),
                ])}
              </tbody>
            </table>
          </div>

          <div style={kicker}>// anciens membres</div>
          <h2 style={{ ...h2, fontSize:15 }}>Anciens joueurs</h2>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"var(--panel)", borderBottom:"1px solid #C9B488" }}>
                {["IGN","Nom","Rôle","Champions","Période","Raison du départ"].map(h => (
                  <th key={h} style={{ padding:"5px 10px", textAlign:"left", fontSize:10, color:"var(--ink-soft)", textTransform:"uppercase", letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMER.map((p, i) => (
                <tr key={p.ign} style={{ borderBottom:"1px solid #E8DCBF", background:i%2===0?"white":"var(--cream)" }}>
                  <td style={{ padding:"6px 10px", fontFamily:"var(--font-mono)", color:"var(--ink-soft)" }}>{p.ign}</td>
                  <td style={{ padding:"6px 10px", fontWeight:"bold" }}>{p.name}</td>
                  <td style={{ padding:"6px 10px", fontSize:11 }}>{p.role}</td>
                  <td style={{ padding:"6px 10px", fontSize:11, color:"var(--ink-soft)" }}>{p.champs}</td>
                  <td style={{ padding:"6px 10px", fontSize:11 }}>{p.period}</td>
                  <td style={{ padding:"6px 10px", fontSize:11, fontFamily:"var(--font-fun)", color:"var(--red-2)", maxWidth:220 }}>{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ORGANISATION */}
        {section==='organisation' && (<>
          <div style={kicker}>// infrastructure</div>
          <h2 style={h2}>Organisation</h2>
          <div style={{ fontSize:13, lineHeight:1.7, color:"var(--ink-soft)" }}>
            <p style={{ marginBottom:10 }}>URA12 Esports opère depuis un appartement à Arpajon (91). L'infrastructure comprend :</p>
            <ul style={{ paddingLeft:20, marginBottom:14 }}>
              {["3 PC de bureau (dont un qui lag en teamfight)","1 serveur Discord (qui sert aussi de QG opérationnel)","0 sponsor","0 coach (Ayoub assure ce rôle « temporairement » depuis 2022)","0 analyste (Théo regarde les replays « quand il a le temps », c'est-à-dire jamais)","Budget total estimé : le prix de 3 abonnements internet"]
                .map((item, i) => <li key={i} style={{ marginBottom:4 }}>{item}</li>)}
            </ul>
            <p>L'organisation a tenté de recruter un sponsor local en 2023, approchant une boulangerie d'Arpajon. La boulangerie a décliné après avoir consulté le palmarès de l'équipe.</p>
          </div>
        </>)}

        {/* TOURNOIS */}
        {section==='tournois' && (<>
          <div style={kicker}>// palmarès complet</div>
          <h2 style={h2}>Tournois</h2>
          {TOURNAMENTS.map((t, ti) => (
            <div key={ti} className="panel-sunken" style={{ marginBottom:14, borderRadius:6, overflow:"hidden" }}>
              <div style={{ padding:"10px 14px", background:"linear-gradient(180deg,#FFF1D6,#FFE6BE)", borderBottom:"1px solid #C9B488", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:"bold", fontSize:13 }}>{t.name}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-soft)", marginTop:2 }}>{t.date} · {t.format}</div>
                </div>
                <span className="pill red" style={{ fontSize:10, whiteSpace:"nowrap" }}>{t.place}</span>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"var(--font-mono)" }}>
                <thead>
                  <tr style={{ background:"rgba(0,0,0,0.03)", borderBottom:"1px solid #E8DCBF" }}>
                    {["Adversaire","Score","Kills","Durée"].map(h => (
                      <th key={h} style={{ padding:"4px 12px", textAlign:"left", fontSize:10, color:"var(--ink-soft)", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.matches.map((m, mi) => (
                    <tr key={mi} style={{ borderBottom:"1px solid #E8DCBF" }}>
                      <td style={{ padding:"6px 12px", fontFamily:"var(--font-ui)", fontWeight:"bold" }}>{m.opp}</td>
                      <td style={{ padding:"6px 12px" }}><span className="pill red" style={{ fontSize:10 }}>{m.score}</span></td>
                      <td style={{ padding:"6px 12px", color:"var(--red-2)" }}>{m.kills}</td>
                      <td style={{ padding:"6px 12px", color:"var(--ink-soft)", fontSize:11 }}>{m.dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div style={{ padding:14, background:"rgba(196,43,28,0.06)", border:"1px solid rgba(196,43,28,0.2)", borderRadius:6, textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:16, color:"var(--red-2)", fontWeight:"bold" }}>Bilan total : 0W – 14L (Win Rate : 0.00%)</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-soft)", marginTop:4 }}>
              Kills totaux : {totalKills} — Deaths : {totalDeaths} — Ratio : {(totalKills/totalDeaths).toFixed(2)}
            </div>
          </div>
        </>)}

        {/* RIVAUX */}
        {section==='rivaux' && (<>
          <div style={kicker}>// head-to-head records</div>
          <h2 style={h2}>Rivaux</h2>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"var(--panel)", borderBottom:"2px solid #C9B488" }}>
                {["Équipe","Région","Bilan","Notes"].map(h => (
                  <th key={h} style={{ padding:"6px 12px", textAlign:"left", fontSize:10, color:"var(--ink-soft)", textTransform:"uppercase", letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RIVALS.map((r, i) => (
                <tr key={r.name} style={{ borderBottom:"1px solid #E8DCBF", background:i%2===0?"white":"var(--cream)" }}>
                  <td style={{ padding:"8px 12px", fontWeight:"bold" }}>{r.name}</td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"var(--ink-soft)" }}>{r.region}</td>
                  <td style={{ padding:"8px 12px" }}><span className="pill red" style={{ fontFamily:"var(--font-mono)", fontSize:10 }}>{r.record}</span></td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"var(--ink-soft)", fontFamily:"var(--font-fun)" }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* TRIVIA */}
        {section==='trivia' && (<>
          <div style={kicker}>// fun facts</div>
          <h2 style={h2}>Trivia</h2>
          {TRIVIA.map((f, i) => (
            <div key={i} className="panel-sunken" style={{ padding:"10px 14px", borderRadius:4, marginBottom:8, fontSize:13, color:"var(--ink-soft)", fontFamily:"var(--font-fun)", display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ color:"var(--red-2)", fontWeight:"bold", fontFamily:"var(--font-mono)", fontSize:11, flexShrink:0, marginTop:1 }}>#{i+1}</span>
              {f}
            </div>
          ))}
        </>)}

        {/* REFS */}
        {section==='refs' && (<>
          <div style={kicker}>// sources</div>
          <h2 style={h2}>Références</h2>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-soft)" }}>
            {REFS.map((r, i) => <div key={i} style={{ marginBottom:6 }}>[{i+1}] {r}</div>)}
          </div>
          <div style={{ marginTop:20, padding:12, borderTop:"1px dashed #C9B488", textAlign:"center", fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-soft)" }}>
            Cet article est une ébauche. Vous pouvez aider URA12pedia à l'améliorer. Mais honnêtement, il n'y a pas grand-chose à ajouter.
          </div>
        </>)}

      </div>
    </div>
  );
}

window.EsportPage = EsportPage;
