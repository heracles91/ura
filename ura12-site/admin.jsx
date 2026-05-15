// Admin panel — CRUD complet via edge function Supabase
const { useState: adS, useEffect: adE, useRef: adR } = React;

/* ── helpers UI ─────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
    {children}
  </div>
);
const Input = (props) => (
  <input {...props} style={{ width: "100%", padding: "7px 9px", border: "1px inset #AAA", borderRadius: 4, fontFamily: "var(--font-ui)", fontSize: 13, background: "white", boxSizing: "border-box", ...props.style }}/>
);
const Textarea = (props) => (
  <textarea {...props} style={{ width: "100%", padding: "7px 9px", border: "1px inset #AAA", borderRadius: 4, fontFamily: "var(--font-ui)", fontSize: 13, background: "white", resize: "vertical", boxSizing: "border-box", ...props.style }}/>
);
const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: "100%", padding: "7px 9px", border: "1px inset #AAA", borderRadius: 4, fontFamily: "var(--font-ui)", fontSize: 13, background: "white" }}>
    {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

function useAdminToast() {
  const [toast, setT] = adS(null);
  const show = (msg, ok = true) => { setT({ msg, ok }); setTimeout(() => setT(null), 3000); };
  const el = toast ? (
    <div style={{
      position: "fixed", bottom: 56, left: "50%", transform: "translateX(-50%)",
      background: toast.ok ? "linear-gradient(180deg,#B6E07C,#3F6B1A)" : "linear-gradient(180deg,#FF8A78,#C42B1C)",
      color: "white", fontWeight: "bold", padding: "10px 20px", borderRadius: 6,
      fontFamily: "var(--font-ui)", zIndex: 9999, animation: "pop .25s cubic-bezier(.34,1.6,.64,1)",
      border: "1px solid rgba(0,0,0,0.3)",
    }}>{toast.msg}</div>
  ) : null;
  return [show, el];
}

function DeleteBtn({ onClick }) {
  const [confirm, setC] = adS(false);
  return confirm
    ? <><button className="gloss-btn" style={{ padding: "4px 8px", fontSize: 11, background: "linear-gradient(180deg,#FF8A78,#C42B1C)", marginRight: 4 }} onClick={onClick}>Confirmer</button>
       <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => setC(false)}>Annuler</button></>
    : <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => setC(true)}>🗑 Suppr.</button>;
}

/* ── Membres ─────────────────────────────────────────────── */
function AdminMembers({ showToast }) {
  const [rows, setRows] = adS([]);
  const [editing, setEditing] = adS(null);
  const blank = () => ({ slug:'', name:'', role:'', bio:'', join_date:'', color:'#E14B3A', speech_bubble:'', level:1, xp:0, max_xp:1000, message_count:0, strengths:'', weaknesses:'', sort_order:0 });
  const [form, setForm] = adS(blank());

  const load = () => { window._supa.from('members').select('*').order('sort_order').then(({ data }) => { if (data) setRows(data); }); };
  adE(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    const data = { ...form,
      level: parseInt(form.level) || 1, xp: parseInt(form.xp) || 0, max_xp: parseInt(form.max_xp) || 1000,
      message_count: parseInt(form.message_count) || 0, sort_order: parseInt(form.sort_order) || 0,
      strengths:  form.strengths  ? form.strengths.split(',').map(s => s.trim()).filter(Boolean)  : [],
      weaknesses: form.weaknesses ? form.weaknesses.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    const { error } = editing
      ? await window._admin.update('members', editing, data)
      : await window._admin.create('members', data);
    if (error) { showToast('Erreur: ' + (error.message || JSON.stringify(error)), false); return; }
    showToast(editing ? 'Membre mis à jour !' : 'Membre créé !');
    setEditing(null); setForm(blank()); load();
  };

  const del = async (id) => {
    const { error } = await window._admin.delete('members', id);
    if (error) { showToast('Erreur suppression', false); return; }
    showToast('Supprimé.'); load();
  };

  const startEdit = (row) => {
    setEditing(row.id);
    setForm({ ...row,
      strengths:  Array.isArray(row.strengths)  ? row.strengths.join(', ')  : '',
      weaknesses: Array.isArray(row.weaknesses) ? row.weaknesses.join(', ') : '',
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, height: "100%", overflow: "hidden" }}>
      {/* List */}
      <div style={{ overflowY: "auto" }}>
        {rows.map(r => (
          <div key={r.id} className="panel-sunken" style={{ padding: 10, borderRadius: 6, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", flexShrink: 0 }}>{r.name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold" }}>{r.name} <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)" }}>@{r.slug}</span></div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.role} · Lv{r.level}</div>
            </div>
            <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => startEdit(r)}>✏ Edit</button>
            <DeleteBtn onClick={() => del(r.id)} />
          </div>
        ))}
      </div>
      {/* Form */}
      <div style={{ overflowY: "auto", padding: 14, background: "#FFF8E8", borderRadius: 8, border: "1px solid #C9B488" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--red-3)", marginBottom: 12 }}>{editing ? "Modifier membre" : "Nouveau membre"}</div>
        {[['slug','Slug'],['name','Nom'],['role','Rôle'],['join_date','Date de rejointe (YYYY-MM-DD)'],['speech_bubble','Catchphrase']].map(([k, l]) => (
          <Field key={k} label={l}><Input value={form[k]||''} onChange={e => set(k, e.target.value)}/></Field>
        ))}
        <Field label="Couleur hex"><Input type="color" value={form.color||'#E14B3A'} onChange={e => set('color', e.target.value)} style={{ height: 36 }}/></Field>
        <Field label="Bio"><Textarea value={form.bio||''} onChange={e => set('bio', e.target.value)} rows={3}/></Field>
        <Field label="Points forts (séparés par virgule)"><Input value={form.strengths||''} onChange={e => set('strengths', e.target.value)}/></Field>
        <Field label="Points faibles (séparés par virgule)"><Input value={form.weaknesses||''} onChange={e => set('weaknesses', e.target.value)}/></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <Field label="Level"><Input type="number" value={form.level} onChange={e => set('level', e.target.value)}/></Field>
          <Field label="XP"><Input type="number" value={form.xp} onChange={e => set('xp', e.target.value)}/></Field>
          <Field label="XP Max"><Input type="number" value={form.max_xp} onChange={e => set('max_xp', e.target.value)}/></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Field label="Messages"><Input type="number" value={form.message_count} onChange={e => set('message_count', e.target.value)}/></Field>
          <Field label="Ordre"><Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}/></Field>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button className="gloss-btn green" onClick={save} style={{ flex: 1 }}>{editing ? "Mettre à jour" : "Créer"}</button>
          {editing && <button className="gloss-btn cream" onClick={() => { setEditing(null); setForm(blank()); }}>Annuler</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Archives ────────────────────────────────────────────── */
function AdminArchives({ showToast }) {
  const [rows, setRows]     = adS([]);
  const [yearFilter, setYF] = adS('all');
  const [editing, setEditing] = adS(null);
  const [uploading, setUpload] = adS(false);
  const fileRef = adR(null);
  const blank = () => ({ author:'', content:'', timestamp:'', year: new Date().getFullYear().toString(), channel:'general', type:'text', image_url:'', sort_order:0 });
  const [form, setForm] = adS(blank());

  const load = () => { window._supa.from('archives').select('*').order('sort_order').then(({ data }) => { if (data) setRows(data); }); };
  adE(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const years = ['all', ...new Set(rows.map(r => r.year).filter(Boolean))].sort();

  const handleImageUpload = async (file) => {
    setUpload(true);
    const { url, error } = await window._admin.uploadImage(file);
    setUpload(false);
    if (error) { showToast("Erreur upload: " + error.message, false); return; }
    set('image_url', url);
    showToast("Image uploadée !");
  };

  const save = async () => {
    const data = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    const { error } = editing
      ? await window._admin.update('archives', editing, data)
      : await window._admin.create('archives', data);
    if (error) { showToast('Erreur: ' + (error.message || JSON.stringify(error)), false); return; }
    showToast(editing ? 'Archive mise à jour !' : 'Message créé !');
    setEditing(null); setForm(blank()); load();
  };

  const del = async (id) => {
    const { error } = await window._admin.delete('archives', id);
    if (error) { showToast('Erreur', false); return; }
    showToast('Supprimé.'); load();
  };

  const filtered = yearFilter === 'all' ? rows : rows.filter(r => r.year === yearFilter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, height: "100%", overflow: "hidden" }}>
      <div style={{ overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {years.map(y => (
            <button key={y} className={"gloss-btn " + (yearFilter===y ? "" : "cream")}
              style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => setYF(y)}>{y==='all' ? 'Tout' : y}</button>
          ))}
        </div>
        {filtered.map(r => (
          <div key={r.id} className="panel-sunken" style={{ padding: 10, borderRadius: 6, marginBottom: 6, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: 12, color: (window.MEMBERS.find(m=>m.id===r.author)||{}).color||"var(--ink)" }}>
                {r.author} <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)", fontWeight: "normal" }}>{r.year} #{r.channel} {r.timestamp}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{(r.content||'').slice(0,80)}{r.content?.length>80?'…':''}</div>
              {r.image_url && <img src={r.image_url} alt="" style={{ marginTop: 4, maxWidth: 120, maxHeight: 80, borderRadius: 4, border: "1px solid #C9B488" }} onError={e=>e.target.style.display='none'}/>}
            </div>
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => { setEditing(r.id); setForm({...r, sort_order: r.sort_order||0}); }}>✏</button>
              <DeleteBtn onClick={() => del(r.id)} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ overflowY: "auto", padding: 14, background: "#FFF8E8", borderRadius: 8, border: "1px solid #C9B488" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--red-3)", marginBottom: 12 }}>{editing ? "Modifier message" : "Nouveau message"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Field label="Auteur (slug)"><Input value={form.author} onChange={e => set('author', e.target.value)}/></Field>
          <Field label="Timestamp (HH:MM)"><Input value={form.timestamp} onChange={e => set('timestamp', e.target.value)}/></Field>
          <Field label="Année"><Input value={form.year} onChange={e => set('year', e.target.value)}/></Field>
          <Field label="Channel"><Input value={form.channel} onChange={e => set('channel', e.target.value)}/></Field>
        </div>
        <Field label="Type">
          <Select value={form.type} onChange={v => set('type', v)} options={['text','image','system','pin','meme']}/>
        </Field>
        <Field label="Contenu"><Textarea value={form.content} onChange={e => set('content', e.target.value)} rows={3}/></Field>
        <Field label="Image URL">
          <Input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://…"/>
        </Field>
        <div style={{ marginBottom: 10 }}>
          <input type="file" ref={fileRef} style={{ display: "none" }} accept="image/*"
            onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])}/>
          <button className="gloss-btn cream" style={{ padding: "5px 10px", fontSize: 11 }}
            onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? "Upload…" : "📁 Uploader une image"}
          </button>
          {form.image_url && (
            <img src={form.image_url} alt="" style={{ display: "block", marginTop: 6, maxWidth: "100%", maxHeight: 120, borderRadius: 4, border: "1px solid #C9B488" }}
              onError={e => e.target.style.display='none'}/>
          )}
        </div>
        <Field label="Ordre"><Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}/></Field>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="gloss-btn green" onClick={save} style={{ flex: 1 }}>{editing ? "Mettre à jour" : "Créer"}</button>
          {editing && <button className="gloss-btn cream" onClick={() => { setEditing(null); setForm(blank()); }}>Annuler</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Videos ──────────────────────────────────────────────── */
function AdminVideos({ showToast }) {
  const [rows, setRows]   = adS([]);
  const [editing, setE]   = adS(null);
  const blank = () => ({ title:'', youtube_id:'', category:'Highlights', date:'', description:'', sort_order:0 });
  const [form, setForm]   = adS(blank());

  const load = () => { window._supa.from('videos').select('*').order('sort_order').then(({ data }) => { if (data) setRows(data); }); };
  adE(() => { load(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    const data = { ...form, sort_order: parseInt(form.sort_order)||0 };
    const { error } = editing ? await window._admin.update('videos', editing, data) : await window._admin.create('videos', data);
    if (error) { showToast('Erreur: ' + (error.message||''), false); return; }
    showToast('Vidéo sauvegardée !'); setE(null); setForm(blank()); load();
  };
  const del = async (id) => {
    const { error } = await window._admin.delete('videos', id);
    if (error) { showToast('Erreur', false); return; }
    showToast('Supprimée.'); load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, height: "100%", overflow: "hidden" }}>
      <div style={{ overflowY: "auto" }}>
        {rows.map(r => (
          <div key={r.id} className="panel-sunken" style={{ padding: 10, borderRadius: 6, marginBottom: 6, display: "flex", gap: 10, alignItems: "center" }}>
            {r.youtube_id && (
              <img src={`https://img.youtube.com/vi/${r.youtube_id}/default.jpg`} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} onError={e=>e.target.style.display='none'}/>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: 13 }}>{r.title}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)" }}>{r.category} · {r.date} · {r.youtube_id}</div>
            </div>
            <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => { setE(r.id); setForm({...r}); }}>✏</button>
            <DeleteBtn onClick={() => del(r.id)} />
          </div>
        ))}
      </div>
      <div style={{ overflowY: "auto", padding: 14, background: "#FFF8E8", borderRadius: 8, border: "1px solid #C9B488" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--red-3)", marginBottom: 12 }}>{editing ? "Modifier vidéo" : "Nouvelle vidéo"}</div>
        <Field label="Titre"><Input value={form.title} onChange={e => set('title', e.target.value)}/></Field>
        <Field label="YouTube ID"><Input value={form.youtube_id} onChange={e => set('youtube_id', e.target.value)} placeholder="dQw4w9WgXcQ"/></Field>
        {form.youtube_id && <img src={`https://img.youtube.com/vi/${form.youtube_id}/hqdefault.jpg`} alt="" style={{ width: "100%", borderRadius: 4, marginBottom: 10 }} onError={e=>e.target.style.display='none'}/>}
        <Field label="Catégorie"><Input value={form.category} onChange={e => set('category', e.target.value)}/></Field>
        <Field label="Année/Date"><Input value={form.date} onChange={e => set('date', e.target.value)} placeholder="2024 ou 2024-06-15"/></Field>
        <Field label="Description"><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}/></Field>
        <Field label="Ordre"><Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}/></Field>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="gloss-btn green" onClick={save} style={{ flex: 1 }}>{editing ? "Mettre à jour" : "Créer"}</button>
          {editing && <button className="gloss-btn cream" onClick={() => { setE(null); setForm(blank()); }}>Annuler</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Merch ───────────────────────────────────────────────── */
function AdminMerch({ showToast }) {
  const [rows, setRows] = adS([]);
  const [editing, setE] = adS(null);
  const blank = () => ({ name:'', price:'', description:'', real_product:false, icon:'', tag:'', sort_order:0 });
  const [form, setForm] = adS(blank());

  const load = () => { window._supa.from('merch_products').select('*').order('sort_order').then(({ data }) => { if (data) setRows(data); }); };
  adE(() => { load(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    const data = { ...form, price: parseFloat(form.price)||0, sort_order: parseInt(form.sort_order)||0 };
    const { error } = editing ? await window._admin.update('merch_products', editing, data) : await window._admin.create('merch_products', data);
    if (error) { showToast('Erreur: ' + (error.message||''), false); return; }
    showToast('Produit sauvegardé !'); setE(null); setForm(blank()); load();
  };
  const del = async (id) => {
    const { error } = await window._admin.delete('merch_products', id);
    if (error) { showToast('Erreur', false); return; }
    showToast('Supprimé.'); load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, height: "100%", overflow: "hidden" }}>
      <div style={{ overflowY: "auto" }}>
        {rows.map(r => (
          <div key={r.id} className="panel-sunken" style={{ padding: 10, borderRadius: 6, marginBottom: 6, display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 28 }}>{r.icon || '📦'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold" }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>€{Number(r.price).toFixed(2)} · {r.real_product ? '✓ réel' : 'concept'} · {r.tag}</div>
            </div>
            <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => { setE(r.id); setForm({...r}); }}>✏</button>
            <DeleteBtn onClick={() => del(r.id)} />
          </div>
        ))}
      </div>
      <div style={{ overflowY: "auto", padding: 14, background: "#FFF8E8", borderRadius: 8, border: "1px solid #C9B488" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--red-3)", marginBottom: 12 }}>{editing ? "Modifier produit" : "Nouveau produit"}</div>
        <Field label="Nom"><Input value={form.name} onChange={e => set('name', e.target.value)}/></Field>
        <Field label="Prix (€)"><Input type="number" value={form.price} onChange={e => set('price', e.target.value)}/></Field>
        <Field label="Description"><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}/></Field>
        <Field label="Icône emoji"><Input value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🎽"/></Field>
        <Field label="Tag"><Input value={form.tag} onChange={e => set('tag', e.target.value)}/></Field>
        <Field label="Ordre"><Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}/></Field>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <input type="checkbox" checked={!!form.real_product} onChange={e => set('real_product', e.target.checked)} id="realp"/>
          <label htmlFor="realp" style={{ fontSize: 13 }}>Produit réel (en stock)</label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="gloss-btn green" onClick={save} style={{ flex: 1 }}>{editing ? "Mettre à jour" : "Créer"}</button>
          {editing && <button className="gloss-btn cream" onClick={() => { setE(null); setForm(blank()); }}>Annuler</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Polls ───────────────────────────────────────────────── */
function AdminPolls({ showToast }) {
  const [rows, setRows] = adS([]);
  const [editing, setE] = adS(null);
  const blank = () => ({ question:'', emoji:'🤔', active:true, sort_order:0 });
  const [form, setForm] = adS(blank());

  const load = () => { window._supa.from('polls').select('*').order('sort_order').then(({ data }) => { if (data) setRows(data); }); };
  adE(() => { load(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    const data = { ...form, sort_order: parseInt(form.sort_order)||0 };
    const { error } = editing ? await window._admin.update('polls', editing, data) : await window._admin.create('polls', data);
    if (error) { showToast('Erreur: ' + (error.message||''), false); return; }
    showToast('Sondage sauvegardé !'); setE(null); setForm(blank()); load();
  };
  const del = async (id) => {
    // delete votes first
    await window._supa.from('poll_votes').delete().eq('poll_id', id);
    const { error } = await window._admin.delete('polls', id);
    if (error) { showToast('Erreur', false); return; }
    showToast('Supprimé.'); load();
  };
  const toggle = async (id, active) => {
    await window._admin.update('polls', id, { active: !active });
    load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, height: "100%", overflow: "hidden" }}>
      <div style={{ overflowY: "auto" }}>
        {rows.map(r => (
          <div key={r.id} className="panel-sunken" style={{ padding: 10, borderRadius: 6, marginBottom: 6, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>{r.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: 13 }}>{r.question}</div>
              <span className={"pill" + (r.active ? " red" : "")} style={{ fontSize: 9 }}>{r.active ? "actif" : "inactif"}</span>
            </div>
            <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => toggle(r.id, r.active)}>{r.active ? "🙈 Masquer" : "👁 Activer"}</button>
            <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => { setE(r.id); setForm({...r}); }}>✏</button>
            <DeleteBtn onClick={() => del(r.id)} />
          </div>
        ))}
      </div>
      <div style={{ overflowY: "auto", padding: 14, background: "#FFF8E8", borderRadius: 8, border: "1px solid #C9B488" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--red-3)", marginBottom: 12 }}>{editing ? "Modifier" : "Nouveau sondage"}</div>
        <Field label="Question"><Textarea value={form.question} onChange={e => set('question', e.target.value)} rows={2}/></Field>
        <Field label="Emoji"><Input value={form.emoji} onChange={e => set('emoji', e.target.value)} style={{ width: 60 }}/></Field>
        <Field label="Ordre"><Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}/></Field>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked)} id="pollact"/>
          <label htmlFor="pollact" style={{ fontSize: 13 }}>Actif (visible)</label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="gloss-btn green" onClick={save} style={{ flex: 1 }}>{editing ? "Mettre à jour" : "Créer"}</button>
          {editing && <button className="gloss-btn cream" onClick={() => { setE(null); setForm(blank()); }}>Annuler</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Timeline ────────────────────────────────────────────── */
function AdminTimeline({ showToast }) {
  const [rows, setRows] = adS([]);
  const [editing, setE] = adS(null);
  const blank = () => ({ date:'', title:'', description:'', icon:'⭐', category:'milestone', link:'', members:'', sort_order:0 });
  const [form, setForm] = adS(blank());

  const load = () => { window._supa.from('timeline_events').select('*').order('sort_order').then(({ data }) => { if (data) setRows(data); }); };
  adE(() => { load(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    const data = { ...form,
      sort_order: parseInt(form.sort_order)||0,
      members: form.members ? form.members.split(',').map(s=>s.trim()).filter(Boolean) : [],
    };
    const { error } = editing ? await window._admin.update('timeline_events', editing, data) : await window._admin.create('timeline_events', data);
    if (error) { showToast('Erreur: ' + (error.message||''), false); return; }
    showToast('Événement sauvegardé !'); setE(null); setForm(blank()); load();
  };
  const del = async (id) => {
    const { error } = await window._admin.delete('timeline_events', id);
    if (error) { showToast('Erreur', false); return; }
    showToast('Supprimé.'); load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, height: "100%", overflow: "hidden" }}>
      <div style={{ overflowY: "auto" }}>
        {rows.map(r => (
          <div key={r.id} className="panel-sunken" style={{ padding: 10, borderRadius: 6, marginBottom: 6, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold" }}>{r.title}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>{r.date} · {r.category}</div>
            </div>
            <button className="gloss-btn cream" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => { setE(r.id); setForm({...r, members: Array.isArray(r.members) ? r.members.join(', ') : ''}); }}>✏</button>
            <DeleteBtn onClick={() => del(r.id)} />
          </div>
        ))}
      </div>
      <div style={{ overflowY: "auto", padding: 14, background: "#FFF8E8", borderRadius: 8, border: "1px solid #C9B488" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--red-3)", marginBottom: 12 }}>{editing ? "Modifier" : "Nouvel événement"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: 8 }}>
          <Field label="Date (YYYY-MM-DD)"><Input value={form.date} onChange={e => set('date', e.target.value)}/></Field>
          <Field label="Icône"><Input value={form.icon} onChange={e => set('icon', e.target.value)}/></Field>
        </div>
        <Field label="Titre"><Input value={form.title} onChange={e => set('title', e.target.value)}/></Field>
        <Field label="Description"><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}/></Field>
        <Field label="Catégorie">
          <Select value={form.category} onChange={v => set('category', v)}
            options={['milestone','origin','archive','member','esport','video','casino']}/>
        </Field>
        <Field label="Membres (slugs, virgule)"><Input value={form.members} onChange={e => set('members', e.target.value)}/></Field>
        <Field label="Lien (optionnel)"><Input value={form.link} onChange={e => set('link', e.target.value)}/></Field>
        <Field label="Ordre"><Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}/></Field>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="gloss-btn green" onClick={save} style={{ flex: 1 }}>{editing ? "Mettre à jour" : "Créer"}</button>
          {editing && <button className="gloss-btn cream" onClick={() => { setE(null); setForm(blank()); }}>Annuler</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Casino reset ────────────────────────────────────────── */
function AdminCasino({ showToast }) {
  const [resetting, setR] = adS(false);
  const reset = async () => {
    setR(true);
    const newVersion = String(Date.now());
    const { error } = await window._admin.update('admin_config', null, { key: 'casino_reset_version', value: newVersion });
    // If update fails (row doesn't exist), try create
    if (error) {
      await window._admin.create('admin_config', { key: 'casino_reset_version', value: newVersion });
    }
    setR(false);
    showToast('Casino réinitialisé pour tous les joueurs !');
  };
  return (
    <div style={{ padding: 20 }}>
      <div className="kicker">// reset casino</div>
      <h2 className="section-h">Réinitialiser le Casino</h2>
      <div style={{ padding: 14, background: "#FFF8E8", border: "1px dashed #C9B488", borderRadius: 8, marginBottom: 14, fontSize: 13, fontFamily: "var(--font-fun)", color: "var(--ink-soft)" }}>
        Cette action réinitialise le solde de TOUS les joueurs à 500 URA₿. Elle est irréversible.
      </div>
      <button className="gloss-btn" onClick={reset} disabled={resetting}
        style={{ background: "linear-gradient(180deg,#FF8A78,#C42B1C)" }}>
        {resetting ? "Réinitialisation…" : "🎰 Tout remettre à zéro"}
      </button>
    </div>
  );
}

/* ── Admin shell ─────────────────────────────────────────── */
const SECTIONS = [
  { id:"members",  label:"Membres",  icon:"👥", desc:"Profils, stats, XP" },
  { id:"archives", label:"Archives", icon:"📂", desc:"Messages + images" },
  { id:"videos",   label:"Vidéos",   icon:"📺", desc:"YouTube + catégories" },
  { id:"merch",    label:"Merch",    icon:"🛒", desc:"Produits, prix" },
  { id:"polls",    label:"Sondages", icon:"🗳", desc:"Questions, visibilité" },
  { id:"timeline", label:"Timeline", icon:"⭐", desc:"Événements dashboard" },
  { id:"casino",   label:"Casino",   icon:"🎰", desc:"Reset soldes" },
];

function AdminPage() {
  const [loggedIn, setLoggedIn] = adS(window._admin.isLoggedIn());
  const [pwd, setPwd]           = adS('');
  const [section, setSection]   = adS(null);
  const [loggingIn, setLI]      = adS(false);
  const [showToast, toastEl]    = useAdminToast();

  const login = async () => {
    setLI(true);
    const ok = await window._admin.verify(pwd);
    setLI(false);
    if (ok) { setLoggedIn(true); }
    else { showToast('Mot de passe incorrect.', false); }
  };

  if (!loggedIn) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--cream)" }}>
      <div className="win" style={{ position: "static", width: 360 }}>
        <div className="win-titlebar">
          <div className="win-icon">⚙</div>
          <div className="win-title">admin.URA12 — authentification</div>
          <div className="win-buttons"><button className="win-btn close">✕</button></div>
        </div>
        <div className="win-body" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-fun)", fontSize: 14, marginBottom: 14, color: "var(--ink-soft)" }}>
            Zone réservée à Kevin & co. Mot de passe admin requis.
          </div>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="••••••••••••"
            autoFocus
            style={{ width: "100%", padding: "10px 12px", fontSize: 16, fontFamily: "var(--font-mono)", border: "2px inset #888", borderRadius: 4, background: "white", marginBottom: 12 }}/>
          <button className="gloss-btn green" onClick={login} disabled={loggingIn} style={{ width: "100%" }}>
            {loggingIn ? "Vérification…" : "Accéder →"}
          </button>
        </div>
      </div>
      {toastEl}
    </div>
  );

  const ActiveSection = { members: AdminMembers, archives: AdminArchives, videos: AdminVideos, merch: AdminMerch, polls: AdminPolls, timeline: AdminTimeline, casino: AdminCasino }[section];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--cream)" }}>
      {/* Header */}
      <div style={{ padding: "8px 14px", background: "linear-gradient(180deg, #FFF1D6, #FFE6BE)", borderBottom: "1px solid #C9B488", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--red-3)", flex: 1 }}>
          {section ? SECTIONS.find(s=>s.id===section)?.label : "Panneau Admin"}
        </div>
        {section && <button className="gloss-btn cream" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setSection(null)}>← Retour</button>}
        <button className="gloss-btn cream" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => { window._admin.logout(); setLoggedIn(false); }}>Déco.</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", padding: section ? 14 : 0 }}>
        {!section ? (
          <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            {SECTIONS.map(s => (
              <div key={s.id} onClick={() => setSection(s.id)}
                className="panel-sunken"
                style={{ padding: 16, borderRadius: 8, cursor: "pointer", textAlign: "center", transition: "transform .15s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontWeight: "bold", fontSize: 14 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        ) : ActiveSection ? (
          <ActiveSection showToast={showToast} />
        ) : null}
      </div>
      {toastEl}
    </div>
  );
}

window.AdminPage = AdminPage;
