import { useState } from 'react';
import { useStore } from '../store';
import { brl } from '../utils';
import { ProgressRing } from '../components/Charts';
import { Icon } from '../components/Icon';

export function Goals() {
  const [state, store] = useStore();
  const [tab, setTab]           = useState<'goals'|'achievements'|'splits'|'recurring'>('goals');
  const [showAdd, setShowAdd]   = useState(false);
  const [editGoal, setEditGoal] = useState<any>(null);
  const [showAddRec, setShowAddRec] = useState(false);

  const totalSaved  = state.goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const overallPct  = totalTarget ? totalSaved / totalTarget : 0;

  const deleteGoal = (id: string) => {
    if (!confirm('Excluir esta meta?')) return;
    store.set({ goals: state.goals.filter(g => g.id !== id) });
  };
  const deleteSplit = (id: string) => {
    if (!confirm('Excluir este split?')) return;
    store.set({ splits: state.splits.filter(s => s.id !== id) });
  };
  const deleteRecurring = (id: string) => {
    if (!confirm('Excluir esta recorrencia?')) return;
    store.set({ recurring: state.recurring.filter(r => r.id !== id) });
  };

  return (
    <div style={{ padding:'20px 18px 100px' }}>
      <div className="fnz-rise fnz-card" style={{ padding:22, background:'linear-gradient(135deg,var(--ink) 0%,var(--ink-2) 100%)', color:'var(--bg)', border:0, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ position:'relative' }}>
            <ProgressRing value={overallPct} size={88} thickness={7} color="var(--accent)"/>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
              <div className="fnz-display" style={{ fontSize:24, color:'var(--bg)' }}>{Math.round(overallPct*100)}<span style={{fontSize:14,opacity:.5}}>%</span></div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div className="fnz-eyebrow" style={{color:'rgba(244,241,234,.55)'}}>Total guardado</div>
            <div className="fnz-display" style={{ fontSize:28, lineHeight:1, color:'var(--bg)' }}>{brl(totalSaved)}</div>
            <div style={{ fontSize:11, color:'rgba(244,241,234,.6)', marginTop:4, fontFamily:'var(--font-mono)' }}>de {brl(totalTarget)}</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, paddingTop:18, marginTop:16, borderTop:'1px solid rgba(244,241,234,.1)' }}>
          {[{v:state.profile.streakDays,l:'dias seguidos',icon:'flame'},{v:state.goals.filter(g=>g.current>=g.target).length,l:'metas batidas',icon:'trophy'},{v:state.achievements.filter(a=>a.earned).length,l:'conquistas',icon:'sparkle'}].map((s,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <Icon name={s.icon} size={14} color="var(--accent)" stroke={2}/>
              <div className="fnz-display" style={{ fontSize:22, color:'var(--bg)', marginTop:2 }}>{s.v}</div>
              <div style={{ fontSize:9, color:'rgba(244,241,234,.55)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fnz-rise" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', background:'var(--surface-2)', padding:4, borderRadius:12, marginBottom:14 }}>
        {(['goals','achievements','splits','recurring'] as const).map((t,i) => (
          <button key={t} onClick={() => setTab(t)} style={{ background:tab===t?'var(--surface)':'transparent', border:0, padding:'8px 4px', borderRadius:9, fontSize:11, fontWeight:600, boxShadow:tab===t?'var(--shadow-sm)':'none', color:'var(--ink)', cursor:'pointer' }}>
            {['Metas','Conquistas','Dividir','Fixas'][i]}
          </button>
        ))}
      </div>

      {tab==='goals' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {state.goals.map(g => {
            const pct = Math.min(1, g.current / g.target);
            const done = g.current >= g.target;
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
            return (
              <div key={g.id} className="fnz-card" style={{ padding:18 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:g.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{g.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:15 }}>{g.title}</div>
                    <div style={{ fontSize:11, color:done?'var(--gain)':'var(--muted)', marginTop:2 }}>
                      {done ? 'Concluida!' : daysLeft > 0 ? daysLeft + ' dias restantes' : 'Venceu'}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button onClick={() => setEditGoal(g)} className="fnz-iconbtn" style={{ width:30, height:30, borderRadius:8 }}>
                      <Icon name="settings" size={13}/>
                    </button>
                    <button onClick={() => deleteGoal(g.id)} className="fnz-iconbtn" style={{ width:30, height:30, borderRadius:8, color:'var(--loss)' }}>
                      <Icon name="x" size={14} stroke={2.5}/>
                    </button>
                  </div>
                </div>
                <div className="fnz-progress-bar" style={{ marginBottom:8 }}>
                  <div className="fnz-progress-fill" style={{ width:(pct*100)+'%', background:done?'var(--gain)':g.color }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span className="fnz-mono" style={{ color:'var(--muted)' }}>{brl(g.current)} guardados</span>
                  <span className="fnz-mono" style={{ fontWeight:700 }}>{brl(g.target)}</span>
                </div>
                {!done && (
                  <button onClick={() => {
                    const v = parseFloat(prompt('Quanto depositar?') || '0');
                    if (v > 0) store.updateGoal(g.id, { current: Math.min(g.target, g.current + v) });
                  }} className="fnz-btn ghost sm" style={{ marginTop:12, width:'100%' }}>
                    <Icon name="plus" size={14}/> Depositar
                  </button>
                )}
              </div>
            );
          })}
          <button onClick={() => setShowAdd(true)} className="fnz-btn ghost" style={{ width:'100%' }}>
            <Icon name="plus" size={16}/> Nova meta
          </button>
        </div>
      )}

      {tab==='achievements' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {state.achievements.map(a => (
            <div key={a.id} className="fnz-card" style={{ padding:16, display:'flex', alignItems:'center', gap:14, opacity:a.earned?1:.5 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:a.earned?'var(--gain-soft)':'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{a.emoji}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>{a.title}</div><div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{a.desc}</div></div>
              {a.earned && <Icon name="check" size={18} color="var(--gain)" stroke={2.5}/>}
            </div>
          ))}
        </div>
      )}

      {tab==='splits' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {state.splits.map(s => (
            <div key={s.id} className="fnz-card" style={{ padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div style={{ fontWeight:600, fontSize:15 }}>{s.title}</div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <span className="fnz-pill" style={{ background:s.status==='paid'?'var(--gain-soft)':'var(--loss-soft)', color:s.status==='paid'?'var(--gain)':'var(--loss)', border:0 }}>
                    {s.status==='paid'?'Pago':'Pendente'}
                  </span>
                  <button onClick={() => deleteSplit(s.id)} className="fnz-iconbtn" style={{ width:28, height:28, borderRadius:8, color:'var(--loss)' }}>
                    <Icon name="x" size={13} stroke={2.5}/>
                  </button>
                </div>
              </div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>Com {s.with.join(', ')} - Total {brl(s.total)}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div><div className="fnz-eyebrow">Sua parte</div><div className="fnz-display" style={{ fontSize:24, marginTop:2 }}>{brl(s.yourShare)}</div></div>
                {s.status==='pending' && (
                  <button onClick={() => store.set({ splits: state.splits.map(sp => sp.id===s.id?{...sp,status:'paid'}:sp) })} className="fnz-btn accent sm">Marcar pago</button>
                )}
              </div>
            </div>
          ))}
          <AddSplitInline state={state} store={store}/>
        </div>
      )}

      {tab==='recurring' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:13, color:'var(--muted)', padding:'4px 0 8px', lineHeight:1.5 }}>Lancamentos que se repetem todo mes.</div>
          {state.recurring.map(r => {
            const icons: Record<string,string> = {moradia:'🏠',lazer:'🎬',saude:'💊',salario:'💼',freela:'🧾',mercado:'🛒',educacao:'📚',outros:'✦'};
            return (
              <div key={r.id} className="fnz-card" style={{ padding:14, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:r.kind==='income'?'var(--gain-soft)':'var(--loss-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  {icons[r.categoryId]||'✦'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{r.title}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>Todo dia {r.day}</div>
                </div>
                <div className="fnz-mono" style={{ fontSize:14, fontWeight:700, color:r.kind==='income'?'var(--gain)':'var(--ink)', marginRight:8 }}>
                  {r.kind==='income'?'+':'-'}{brl(r.amount)}
                </div>
                <button onClick={() => deleteRecurring(r.id)} className="fnz-iconbtn" style={{ width:30, height:30, borderRadius:8, color:'var(--loss)', flexShrink:0 }}>
                  <Icon name="x" size={13} stroke={2.5}/>
                </button>
              </div>
            );
          })}
          <button onClick={() => setShowAddRec(true)} className="fnz-btn ghost" style={{ width:'100%' }}>
            <Icon name="plus" size={16}/> Nova recorrencia
          </button>
        </div>
      )}

      {showAdd    && <GoalSheet onClose={() => setShowAdd(false)}    state={state} store={store}/>}
      {editGoal   && <GoalSheet onClose={() => setEditGoal(null)}    state={state} store={store} goal={editGoal}/>}
      {showAddRec && <RecurringSheet onClose={() => setShowAddRec(false)} state={state} store={store}/>}
    </div>
  );
}

function GoalSheet({ onClose, state, store, goal }: any) {
  const isEdit = !!goal;
  const [title,    setTitle]    = useState(goal?.title || '');
  const [target,   setTarget]   = useState(goal?.target?.toString() || '');
  const [deadline, setDeadline] = useState(goal?.deadline?.slice(0,10) || '');
  const [emoji,    setEmoji]    = useState(goal?.emoji || '🎯');
  const [color,    setColor]    = useState(goal?.color || '#1d6f3c');
  const EMOJIS = ['🎯','🏖️','💻','🚗','🏠','📚','💍','✈️','🛡️','💰','🎓','📱','🏋️','🎮','🌍'];
  const COLORS = ['#1d6f3c','#c0341d','#5b3aa6','#c89a3a','#2a6fdb','#e35aa2','#1d8a8a','#ff5b1f'];
  const submit = () => {
    const t = parseFloat(target.replace(',', '.'));
    if (!title || isNaN(t) || t <= 0) return;
    if (isEdit) {
      store.set({ goals: state.goals.map((g: any) => g.id === goal.id ? { ...g, title, target:t, deadline:deadline||g.deadline, emoji, color } : g) });
    } else {
      store.addGoal({ title, target:t, deadline:deadline||new Date(Date.now()+3.15e10).toISOString(), emoji, color });
    }
    onClose();
  };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200 }}>
      <div className="fnz-backdrop" onClick={onClose}/>
      <div className="fnz-sheet" style={{ padding:'8px 20px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'var(--line-2)', margin:'0 auto 20px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div className="fnz-eyebrow">{isEdit ? 'Editar meta' : 'Nova meta'}</div>
          {isEdit && (
            <button onClick={() => { if(confirm('Excluir?')) { store.set({ goals: state.goals.filter((g:any)=>g.id!==goal.id) }); onClose(); }}}
              style={{ background:'none', border:'none', color:'var(--loss)', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              <Icon name="x" size={13} stroke={2.5}/> Excluir
            </button>
          )}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)} style={{ width:38, height:38, borderRadius:10, border:emoji===e?'2px solid var(--accent)':'1px solid var(--line-2)', background:emoji===e?'rgba(255,91,31,0.1)':'transparent', fontSize:20, cursor:'pointer' }}>{e}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ width:24, height:24, borderRadius:999, background:c, border:color===c?'3px solid var(--ink)':'2px solid transparent', cursor:'pointer' }}/>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div><label style={LS}>Nome</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Reserva, Viagem, Carro..." className="fnz-input"/></div>
          <div><label style={LS}>Valor alvo (R$)</label><input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Ex: 10000" type="number" className="fnz-input"/></div>
          <div><label style={LS}>Prazo</label><input value={deadline} onChange={e=>setDeadline(e.target.value)} type="date" className="fnz-input"/></div>
        </div>
        <button onClick={submit} className="fnz-btn accent" style={{ width:'100%', marginTop:18, height:52 }}>
          <Icon name="check" size={18}/> {isEdit ? 'Salvar' : 'Criar meta'}
        </button>
      </div>
    </div>
  );
}

function RecurringSheet({ onClose, state, store }: any) {
  const [title,  setTitle]  = useState('');
  const [amount, setAmount] = useState('');
  const [day,    setDay]    = useState('1');
  const [catId,  setCatId]  = useState('moradia');
  const [kind,   setKind]   = useState<'expense'|'income'>('expense');
  const CATS = [{id:'moradia',l:'Moradia',e:'🏠'},{id:'lazer',l:'Lazer',e:'🎬'},{id:'saude',l:'Saude',e:'💊'},{id:'salario',l:'Salario',e:'💼'},{id:'freela',l:'Freela',e:'🧾'},{id:'mercado',l:'Mercado',e:'🛒'},{id:'educacao',l:'Educacao',e:'📚'},{id:'outros',l:'Outros',e:'✦'}];
  const submit = () => {
    const amt = parseFloat(amount.replace(',','.'));
    if (!title || isNaN(amt) || amt <= 0) return;
    store.set({ recurring: [...state.recurring, { id:'r'+Date.now(), title, amount:amt, day:parseInt(day)||1, categoryId:catId, kind }] });
    onClose();
  };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200 }}>
      <div className="fnz-backdrop" onClick={onClose}/>
      <div className="fnz-sheet" style={{ padding:'8px 20px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'var(--line-2)', margin:'0 auto 20px' }}/>
        <div className="fnz-eyebrow" style={{ marginBottom:16 }}>Nova recorrencia</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--surface-2)', padding:4, borderRadius:12, marginBottom:14 }}>
          {(['expense','income'] as const).map((k,i) => (
            <button key={k} onClick={() => setKind(k)} style={{ background:kind===k?'var(--surface)':'transparent', border:0, padding:'8px', borderRadius:9, fontSize:12, fontWeight:600, color:'var(--ink)', boxShadow:kind===k?'var(--shadow-sm)':'none', cursor:'pointer' }}>
              {['Despesa','Receita'][i]}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
          <div><label style={LS}>Titulo</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Aluguel, Netflix..." className="fnz-input"/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div><label style={LS}>Valor (R$)</label><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00" type="number" className="fnz-input"/></div>
            <div><label style={LS}>Dia do mes</label><input value={day} onChange={e=>setDay(e.target.value)} placeholder="1-31" type="number" min="1" max="31" className="fnz-input"/></div>
          </div>
          <div>
            <label style={LS}>Categoria</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
              {CATS.map(c => (
                <button key={c.id} onClick={() => setCatId(c.id)} style={{ display:'flex', alignItems:'center', gap:4, height:30, padding:'0 10px', borderRadius:999, border:catId===c.id?'1.5px solid var(--accent)':'1px solid var(--line-2)', background:catId===c.id?'rgba(255,91,31,0.1)':'transparent', fontSize:11, fontWeight:600, color:catId===c.id?'var(--accent)':'var(--muted)', cursor:'pointer' }}>
                  {c.e} {c.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={submit} className="fnz-btn accent" style={{ width:'100%', height:52 }}>
          <Icon name="check" size={18}/> Criar recorrencia
        </button>
      </div>
    </div>
  );
}

function AddSplitInline({ state, store }: any) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('');
  if (!show) return (
    <button onClick={() => setShow(true)} className="fnz-btn ghost" style={{ width:'100%' }}>
      <Icon name="users" size={16}/> Novo split
    </button>
  );
  const submit = () => {
    const t = parseFloat(total.replace(',','.'));
    const ps = people.split(',').map(p=>p.trim()).filter(Boolean);
    if (!title || isNaN(t) || t<=0 || !ps.length) return;
    store.set({ splits: [...state.splits, { id:'s'+Date.now(), title, total:t, with:ps, yourShare:t/(ps.length+1), status:'pending' }] });
    setShow(false); setTitle(''); setTotal(''); setPeople('');
  };
  return (
    <div className="fnz-card" style={{ padding:16, border:'1.5px dashed var(--line-2)' }}>
      <div className="fnz-eyebrow" style={{ marginBottom:12 }}>Novo split</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titulo (ex: Jantar)" className="fnz-input" style={{ height:42 }}/>
        <input value={total} onChange={e=>setTotal(e.target.value)} placeholder="Total (R$)" type="number" className="fnz-input" style={{ height:42 }}/>
        <input value={people} onChange={e=>setPeople(e.target.value)} placeholder="Com quem? (separar por virgula)" className="fnz-input" style={{ height:42 }}/>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={submit} className="fnz-btn accent sm" style={{ flex:1 }}><Icon name="check" size={14}/> Criar</button>
          <button onClick={() => setShow(false)} className="fnz-btn ghost sm" style={{ flex:1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const LS: React.CSSProperties = { fontSize:11, fontWeight:600, color:'var(--muted)', display:'block', marginBottom:5, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em' };
