import { useState } from 'react';
import { useStore } from '../store';
import { brl } from '../utils';
import { ProgressRing } from '../components/Charts';
import { Icon } from '../components/Icon';

export function Goals() {
  const [state, store] = useStore();
  const [tab, setTab]   = useState<'goals'|'achievements'|'splits'>('goals');
  const [showAdd, setShowAdd] = useState(false);

  const totalSaved  = state.goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const overallPct  = totalTarget ? totalSaved / totalTarget : 0;

  return (
    <div style={{ padding:'20px 18px 100px' }}>
      {/* Header */}
      <div className="fnz-rise" style={{ marginBottom:14 }}>
        <div className="fnz-eyebrow">Metas & Hábitos</div>
        <h1 className="fnz-display" style={{ fontSize:36, margin:0, marginTop:4 }}>
          Caminho<br/><span className="fnz-display-italic" style={{color:'var(--accent)'}}>pra liberdade.</span>
        </h1>
      </div>

      {/* Hero arc */}
      <div className="fnz-rise fnz-card" style={{ padding:22, background:'linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%)', color:'var(--bg)', border:0, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ position:'relative' }}>
            <ProgressRing value={overallPct} size={88} thickness={7} color="var(--accent)"/>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
              <div className="fnz-display" style={{ fontSize:24, color:'var(--bg)' }}>
                {Math.round(overallPct*100)}<span style={{fontSize:14,opacity:.5}}>%</span>
              </div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div className="fnz-eyebrow" style={{color:'rgba(244,241,234,0.55)'}}>Total guardado</div>
            <div className="fnz-display" style={{ fontSize:28, lineHeight:1, color:'var(--bg)' }}>{brl(totalSaved)}</div>
            <div style={{ fontSize:11, color:'rgba(244,241,234,0.6)', marginTop:4, fontFamily:'var(--font-mono)' }}>de {brl(totalTarget)}</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, paddingTop:18, marginTop:16, borderTop:'1px solid rgba(244,241,234,0.1)' }}>
          {[
            { v:state.profile.streakDays, l:'dias seguidos', icon:'flame' },
            { v:state.goals.filter(g=>g.current>=g.target).length, l:'metas batidas', icon:'trophy' },
            { v:state.achievements.filter(a=>a.earned).length, l:'conquistas', icon:'sparkle' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <Icon name={s.icon} size={14} color="var(--accent)" stroke={2}/>
              <div className="fnz-display" style={{ fontSize:22, color:'var(--bg)', marginTop:2 }}>{s.v}</div>
              <div style={{ fontSize:9, color:'rgba(244,241,234,0.55)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="fnz-rise" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', background:'var(--surface-2)', padding:4, borderRadius:12, marginBottom:14 }}>
        {(['goals','achievements','splits'] as const).map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{ background:tab===t?'var(--surface)':'transparent', border:0, padding:'8px 0', borderRadius:9, fontSize:12, fontWeight:600, boxShadow:tab===t?'var(--shadow-sm)':'none', color:'var(--ink)', cursor:'pointer' }}>
            {['Metas','Conquistas','Dividir'][i]}
          </button>
        ))}
      </div>

      {/* Goals list */}
      {tab === 'goals' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {state.goals.map(g => {
            const pct = Math.min(1, g.current / g.target);
            const done = g.current >= g.target;
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
            return (
              <div key={g.id} className="fnz-card" style={{ padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:42, height:42, borderRadius:12, background:g.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{g.emoji}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:15 }}>{g.title}</div>
                      <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>
                        {done ? '🎉 Concluída!' : `${daysLeft > 0 ? daysLeft + ' dias' : 'Venceu'}`}
                      </div>
                    </div>
                  </div>
                  {done && <span className="fnz-pill" style={{ background:g.color+'18', color:g.color, border:0 }}>✓ Concluída</span>}
                </div>
                <div style={{ marginBottom:8 }}>
                  <div className="fnz-progress-bar">
                    <div className="fnz-progress-fill" style={{ width:`${pct*100}%`, background:g.color }}/>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span className="fnz-mono" style={{ color:'var(--muted)' }}>{brl(g.current)} guardados</span>
                  <span className="fnz-mono" style={{ fontWeight:700 }}>{brl(g.target)}</span>
                </div>
                {!done && (
                  <button onClick={() => {
                    const v = parseFloat(prompt('Quanto deseja adicionar?') || '0');
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

      {/* Achievements */}
      {tab === 'achievements' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {state.achievements.map(a => (
            <div key={a.id} className="fnz-card" style={{ padding:16, display:'flex', alignItems:'center', gap:14, opacity: a.earned?1:0.5 }}>
              <div style={{ width:44, height:44, borderRadius:12, background: a.earned?'var(--gain-soft)':'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {a.emoji}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{a.title}</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{a.desc}</div>
              </div>
              {a.earned && <Icon name="check" size={18} color="var(--gain)" stroke={2.5}/>}
            </div>
          ))}
        </div>
      )}

      {/* Splits */}
      {tab === 'splits' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {state.splits.map(s => (
            <div key={s.id} className="fnz-card" style={{ padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div style={{ fontWeight:600, fontSize:15 }}>{s.title}</div>
                <span className="fnz-pill" style={{ background: s.status==='paid'?'var(--gain-soft)':'var(--loss-soft)', color: s.status==='paid'?'var(--gain)':'var(--loss)', border:0 }}>
                  {s.status==='paid' ? '✓ Pago' : 'Pendente'}
                </span>
              </div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>
                Com {s.with.join(', ')} · Total {brl(s.total)}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div className="fnz-eyebrow">Sua parte</div>
                  <div className="fnz-display" style={{ fontSize:24, marginTop:2 }}>{brl(s.yourShare)}</div>
                </div>
                {s.status === 'pending' && (
                  <button className="fnz-btn accent sm">Marcar pago</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add goal modal */}
      {showAdd && <AddGoalSheet onClose={() => setShowAdd(false)}/>}
    </div>
  );
}

function AddGoalSheet({ onClose }: { onClose: () => void }) {
  const [, store] = useStore();
  const [title, setTitle]    = useState('');
  const [target, setTarget]  = useState('');
  const [deadline, setDeadline] = useState('');
  const [emoji, setEmoji]    = useState('🎯');
  const emojis = ['🎯','🏖️','💻','🚗','🏠','📚','💍','✈️','🛡️','💰'];

  const submit = () => {
    const t = parseFloat(target.replace(',','.'));
    if (!title || isNaN(t) || t <= 0) return;
    store.addGoal({ title, target:t, deadline: deadline || new Date(Date.now()+3.15e10).toISOString(), emoji, color:'#1d6f3c' });
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200 }}>
      <div className="fnz-backdrop" onClick={onClose}/>
      <div className="fnz-sheet" style={{ padding:'8px 20px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'var(--line-2)', margin:'0 auto 20px' }}/>
        <div className="fnz-eyebrow" style={{ marginBottom:16 }}>Nova meta</div>
        <div style={{ display:'flex', gap:10, flexDirection:'column' }}>
          <div style={{ display:'flex', gap:8 }}>
            {emojis.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{ width:36, height:36, borderRadius:10, border: emoji===e?'2px solid var(--accent)':'1px solid var(--line-2)', background:'transparent', fontSize:18, cursor:'pointer' }}>{e}</button>
            ))}
          </div>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nome da meta" className="fnz-input"/>
          <input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Valor alvo (R$)" type="number" className="fnz-input"/>
          <input value={deadline} onChange={e=>setDeadline(e.target.value)} type="date" className="fnz-input"/>
        </div>
        <button onClick={submit} className="fnz-btn accent" style={{ width:'100%', marginTop:16, height:52 }}>
          <Icon name="check" size={18}/> Criar meta
        </button>
      </div>
    </div>
  );
}
