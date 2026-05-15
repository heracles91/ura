// Taxes URA12 — impôt 12% satirique
const { useState: tS, useEffect: tE } = React;

const TAX_RATE = 0.12;
const SOURCES  = [
  "CDI", "Freelance", "Crypto (si ça monte)", "Crypto (si ça descend, ça compte quand même)",
  "Allocation chômage", "Vente de pieds", "NFT (vraiment ?)", "Gains Casino URA₿",
  "Prime de présence vocal", "Pourboires de Kevin", "Autre",
];

const STEPS = [
  "Vérification de l'identité fiscale…",
  "Calcul de la dette envers URA12…",
  "Émission du reçu officiel…",
  "Validation par le Conseil…",
  "Signature numérique appliquée…",
  "Paiement enregistré. Merci. 💸",
];

function TaxesPage({ user }) {
  const [source, setSource]   = tS(SOURCES[0]);
  const [revenue, setRevenue] = tS('');
  const [history, setHistory] = tS([]);
  const [loading, setLoading] = tS(false);
  const [step, setStep]       = tS(0);
  const [receipt, setReceipt] = tS(null);

  tE(() => {
    window._supa.from('tax_payments').select('*').order('paid_at', { ascending: false })
      .then(({ data }) => { if (data) setHistory(data); });
  }, []);

  const rev    = parseFloat(revenue) || 0;
  const taxAmt = Math.round(rev * TAX_RATE * 100) / 100;

  const submit = async () => {
    if (!user)   { alert("Connecte-toi d'abord."); return; }
    if (rev <= 0) { alert("Entre un revenu valide."); return; }

    setLoading(true);
    setStep(0);

    // animation par étapes
    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 420));
      setStep(i);
    }

    const { data, error } = await window._supa.functions.invoke('admin', {
      body: { action: 'pay_tax', member_slug: user.id, source, revenue: rev }
    });

    setLoading(false);
    if (error || !data) {
      alert("Erreur lors du paiement : " + (error?.message || 'inconnu'));
      return;
    }
    setReceipt({ source, revenue: rev, tax: taxAmt, ref: data.reference || ('URA-' + Date.now()), paid_at: new Date().toISOString() });
    setRevenue('');
    // refresh history
    window._supa.from('tax_payments').select('*').order('paid_at', { ascending: false })
      .then(({ data: h }) => { if (h) setHistory(h); });
  };

  const memberOf = slug => window.MEMBERS.find(m => m.id === slug);

  return (
    <div style={{ padding: 16, background: "var(--cream)", minHeight: "100%", overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

        {/* Form */}
        <div>
          <div className="kicker">// bureau des impôts URA12</div>
          <h2 className="section-h">Déclarez. Payez. Dormez.</h2>

          <div className="panel-sunken" style={{ padding: 16, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ padding: 10, background: "#FFF1D6", border: "1px dashed #C9B488", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-fun)", color: "var(--red-3)", marginBottom: 14 }}>
              ⚠ Tout revenu déclaré est soumis à une taxe solidaire de 12%. Le non-paiement entraîne une perte de statut, de dignité, et de la clé du vocal Kevin.
            </div>

            {!user && (
              <div style={{ padding: 10, borderRadius: 4, background: "#FFE6BE", border: "1px solid #C9B488", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 14 }}>
                Connecte-toi pour déclarer tes revenus.
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-soft)", display: "block", marginBottom: 4 }}>Source de revenus</label>
              <select value={source} onChange={e => setSource(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px inset #AAA", borderRadius: 4, fontFamily: "var(--font-ui)", fontSize: 13, background: "white" }}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-soft)", display: "block", marginBottom: 4 }}>Revenu déclaré (€)</label>
              <input type="number" min="0" step="0.01" value={revenue}
                onChange={e => setRevenue(e.target.value)} placeholder="0.00"
                style={{ width: "100%", padding: "8px 10px", border: "2px inset #AAA", borderRadius: 4, fontSize: 18, fontFamily: "var(--font-mono)", background: "white" }}/>
            </div>

            {/* Calcul */}
            <div style={{ padding: 12, background: "#1A1612", borderRadius: 6, marginBottom: 14, fontFamily: "var(--font-mono)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#FFE6BE", fontSize: 13, marginBottom: 6 }}>
                <span>Revenu brut</span><span>{rev.toFixed(2)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#FFB8A4", fontSize: 13, marginBottom: 6 }}>
                <span>Taux URA12</span><span>12%</span>
              </div>
              <div style={{ borderTop: "1px solid #5A1208", paddingTop: 8, display: "flex", justifyContent: "space-between", color: "#FF8A78", fontSize: 18, fontWeight: "bold" }}>
                <span>À payer</span>
                <span style={{ textShadow: "0 0 10px rgba(255,107,91,0.6)" }}>{taxAmt.toFixed(2)} €</span>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 12, background: "#FFF8E8", borderRadius: 6, border: "1px solid #C9B488", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {STEPS.slice(0, step + 1).map((s, i) => (
                  <div key={i} style={{ padding: "2px 0", color: i === step ? "var(--red-2)" : "var(--moss)" }}>
                    {i < step ? "✓" : "▶"} {s}
                  </div>
                ))}
              </div>
            ) : (
              <button className="gloss-btn green" onClick={submit} disabled={!user || rev <= 0}
                style={{ width: "100%", opacity: (!user || rev <= 0) ? 0.5 : 1 }}>
                💸 Payer {taxAmt.toFixed(2)} € d'impôts
              </button>
            )}
          </div>
        </div>

        {/* Historique */}
        <div>
          <div className="kicker">// historique des paiements</div>
          <h2 className="section-h" style={{ fontSize: 18 }}>Reçus</h2>
          {history.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>Aucun paiement enregistré.</div>
          ) : (
            <div style={{ maxHeight: 420, overflowY: "auto" }} className="col gap-2">
              {history.map(h => {
                const m = memberOf(h.member_slug);
                return (
                  <div key={h.id} className="panel-sunken" style={{ padding: 10, borderRadius: 6, fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 3, background: m?.color || "#888", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 10 }}>{m?.name?.[0] || '?'}</div>
                        <span style={{ fontWeight: "bold" }}>{m?.name || h.member_slug}</span>
                      </div>
                      <span className="pill red" style={{ fontSize: 9 }}>-{Number(h.tax_amount).toFixed(2)} €</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)", marginTop: 4 }}>
                      {h.source} · rev. {Number(h.revenue).toFixed(2)} €<br/>
                      {new Date(h.paid_at).toLocaleDateString('fr-FR')} · {h.reference}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reçu modal */}
      {receipt && (
        <div className="dialog-veil" onClick={() => setReceipt(null)}>
          <div className="win" style={{ width: 420, position: "relative" }} onClick={e => e.stopPropagation()}>
            <div className="win-titlebar">
              <div className="win-icon">💸</div>
              <div className="win-title">recu_fiscal.URA12</div>
              <div className="win-buttons"><button className="win-btn close" onClick={() => setReceipt(null)}>✕</button></div>
            </div>
            <div className="win-body" style={{ padding: 20 }}>
              <div style={{ border: "2px dashed #C9B488", borderRadius: 8, padding: 16, textAlign: "center", position: "relative" }}>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "var(--red-3)", marginBottom: 4 }}>Reçu Officiel</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)", marginBottom: 14 }}>BUREAU FISCAL URA12 // ANNÉE EN COURS</div>
                {[
                  ["Contribuable", user?.name || '—'],
                  ["Source",       receipt.source],
                  ["Revenu brut",  receipt.revenue.toFixed(2) + " €"],
                  ["Taux",         "12%"],
                  ["Montant payé", receipt.tax.toFixed(2) + " €"],
                  ["Référence",    receipt.ref],
                  ["Date",         new Date(receipt.paid_at).toLocaleDateString('fr-FR')],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "var(--font-mono)", padding: "4px 0", borderBottom: "1px dotted #C9B488" }}>
                    <span style={{ color: "var(--ink-soft)" }}>{k}</span><span style={{ fontWeight: "bold" }}>{v}</span>
                  </div>
                ))}
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-15deg)",
                  fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 52, color: "rgba(63,107,26,0.18)", fontWeight: "bold", pointerEvents: "none", letterSpacing: 4,
                }}>PAYÉ</div>
              </div>
              <button className="gloss-btn green" onClick={() => setReceipt(null)} style={{ width: "100%", marginTop: 12 }}>Fermer le reçu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.TaxesPage = TaxesPage;
