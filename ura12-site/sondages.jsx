// Sondages — votes en temps réel via Supabase
const { useState: pS, useEffect: pE, useRef: pR } = React;

function SondagesPage({ user }) {
  const [polls, setPolls]   = pS(null);
  const [votes, setVotes]   = pS([]);
  const [toast, setToast]   = pS(null);
  const chanRef = pR(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const loadData = async () => {
    const [{ data: pollData }, { data: voteData }] = await Promise.all([
      window._supa.from('polls').select('*').order('sort_order', { ascending: true }),
      window._supa.from('poll_votes').select('*'),
    ]);
    if (pollData) setPolls(pollData.filter(p => p.active));
    if (voteData) setVotes(voteData);
  };

  pE(() => {
    loadData();

    // abonnement temps réel
    chanRef.current = window._supa
      .channel('poll-votes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, () => {
        window._supa.from('poll_votes').select('*').then(({ data }) => { if (data) setVotes(data); });
      })
      .subscribe();

    return () => {
      if (chanRef.current) window._supa.removeChannel(chanRef.current);
    };
  }, []);

  const castVote = async (pollId, votedForSlug) => {
    if (!user) { showToast("Connecte-toi d'abord.", false); return; }
    if (user.id === votedForSlug) { showToast("Tu ne peux pas voter pour toi-même.", false); return; }

    const existing = votes.find(v => v.poll_id === pollId && v.voter_slug === user.id);
    const { error } = existing
      ? await window._supa.from('poll_votes').update({ voted_for_slug: votedForSlug }).eq('id', existing.id)
      : await window._supa.from('poll_votes').insert({ poll_id: pollId, voter_slug: user.id, voted_for_slug: votedForSlug });

    if (error) { showToast("Erreur : " + error.message, false); return; }
    showToast("Vote enregistré ! 🗳");
    // la subscription temps réel mettra à jour les votes
  };

  if (!polls) return (
    <div style={{ padding: 30, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>chargement…</div>
  );

  if (polls.length === 0) return (
    <div style={{ padding: 30, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
      Aucun sondage actif pour le moment.
    </div>
  );

  // leaderboard global : combien de fois élu(e) dans n'importe quel sondage
  const leaderboard = window.MEMBERS.map(m => ({
    ...m,
    totalVotes: votes.filter(v => v.voted_for_slug === m.id).length,
    pollsWon:   polls.filter(p => {
      const pVotes = votes.filter(v => v.poll_id === p.id);
      if (pVotes.length === 0) return false;
      const counts = {};
      pVotes.forEach(v => { counts[v.voted_for_slug] = (counts[v.voted_for_slug] || 0) + 1; });
      const max = Math.max(...Object.values(counts));
      return counts[m.id] === max && counts[m.id] > 0;
    }).length,
  })).sort((a, b) => b.pollsWon - a.pollsWon || b.totalVotes - a.totalVotes);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", height: "100%" }}>

      {/* Leaderboard */}
      <div style={{ background: "#2A1F18", color: "var(--cream)", padding: 12, overflowY: "auto", borderRight: "1px solid #5A1208" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#FFB8A4", marginBottom: 10 }}>// classement</div>
        {leaderboard.map((m, i) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#888", width: 14 }}>#{i+1}</div>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 11, flexShrink: 0 }}>{m.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
              <div style={{ fontSize: 10, color: "#FFB8A4", fontFamily: "var(--font-mono)" }}>{m.pollsWon}🏆 {m.totalVotes}v</div>
            </div>
          </div>
        ))}
      </div>

      {/* Polls */}
      <div style={{ overflowY: "auto", padding: 16, background: "var(--cream)" }}>
        {!user && (
          <div style={{ marginBottom: 14, padding: 10, background: "#FFF8E8", border: "1px dashed #C9B488", borderRadius: 6, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
            ⚠ Connecte-toi pour voter.
          </div>
        )}

        {polls.map(poll => {
          const pollVotes  = votes.filter(v => v.poll_id === poll.id);
          const myVote     = user ? pollVotes.find(v => v.voter_slug === user.id) : null;
          const totalVotes = pollVotes.length;

          // Comptage par membre
          const counts = {};
          window.MEMBERS.forEach(m => { counts[m.id] = 0; });
          pollVotes.forEach(v => { counts[v.voted_for_slug] = (counts[v.voted_for_slug] || 0) + 1; });
          const maxVotes = Math.max(0, ...Object.values(counts));
          const leader   = maxVotes > 0 ? window.MEMBERS.find(m => counts[m.id] === maxVotes) : null;

          return (
            <div key={poll.id} className="panel-sunken" style={{ marginBottom: 14, borderRadius: 8, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "12px 16px", background: "linear-gradient(180deg, #FFF1D6, #FFE6BE)", borderBottom: "1px solid #C9B488", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{poll.emoji || '🤔'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 17, color: "var(--red-3)" }}>{poll.question}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)", marginTop: 2 }}>
                    {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                    {myVote && <span style={{ marginLeft: 8, color: "var(--moss)", fontWeight: "bold" }}>✓ Voté pour {window.MEMBERS.find(m => m.id === myVote.voted_for_slug)?.name || myVote.voted_for_slug}</span>}
                  </div>
                </div>
              </div>

              {/* Vote buttons */}
              <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {window.MEMBERS.map(m => {
                  const vCount  = counts[m.id] || 0;
                  const pct     = totalVotes > 0 ? Math.round(vCount / totalVotes * 100) : 0;
                  const isMyVote = myVote?.voted_for_slug === m.id;
                  const isWinner = m === leader && vCount > 0;
                  return (
                    <button key={m.id}
                      onClick={() => castVote(poll.id, m.id)}
                      disabled={!user || user.id === m.id}
                      style={{
                        padding: 8, borderRadius: 8, cursor: (user && user.id !== m.id) ? "pointer" : "default",
                        border: "2px solid " + (isMyVote ? m.color : isWinner ? "#8A7A55" : "#DDD"),
                        background: isMyVote ? "linear-gradient(180deg, #FFF, #FFE6BE)" : "white",
                        opacity: (!user || user.id === m.id) ? 0.5 : 1,
                        transition: "transform .1s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => { if (user && user.id !== m.id) e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
                      {isWinner && <div style={{ position: "absolute", top: -6, right: -6, fontSize: 14 }}>👑</div>}
                      <div style={{ width: 36, height: 36, margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        dangerouslySetInnerHTML={{ __html: window.shapeSvg(m.shape, m.color, 30) }}/>
                      <div style={{ fontSize: 11, fontWeight: "bold", color: "var(--ink)" }}>{m.name}</div>
                      {/* Barre de progression */}
                      <div style={{ marginTop: 4, height: 4, background: "#EEE", borderRadius: 2 }}>
                        <div style={{ width: pct + "%", height: "100%", background: m.color, borderRadius: 2, transition: "width .4s" }}/>
                      </div>
                      <div style={{ fontSize: 9, color: "var(--ink-soft)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{vCount}v · {pct}%</div>
                    </button>
                  );
                })}
              </div>

              {leader && (
                <div style={{ padding: "8px 16px", background: "#FFF8E8", borderTop: "1px dashed #C9B488", fontSize: 12, fontFamily: "var(--font-fun)", color: "var(--ink-soft)" }}>
                  👑 <b>{leader.name}</b> est en tête avec <b>{counts[leader.id]}</b> vote{counts[leader.id] !== 1 ? 's' : ''}.
                </div>
              )}
            </div>
          );
        })}

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 56, left: "50%", transform: "translateX(-50%)",
            background: toast.ok ? "linear-gradient(180deg, #B6E07C, #3F6B1A)" : "linear-gradient(180deg, #FF8A78, #C42B1C)",
            color: "white", fontWeight: "bold", padding: "10px 18px",
            border: "1px solid rgba(0,0,0,0.3)", borderRadius: 6,
            fontFamily: "var(--font-ui)", zIndex: 900, animation: "pop 0.25s cubic-bezier(.34,1.6,.64,1)"
          }}>{toast.msg}</div>
        )}
      </div>
    </div>
  );
}

window.SondagesPage = SondagesPage;
