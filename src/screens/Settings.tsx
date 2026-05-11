import { useState } from 'react';
import { useStore, CATEGORIES } from '../store';
import { monthSummary, categoryBreakdown, brl } from '../utils';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/Charts';

export function Settings({ onLogout }: { onLogout: () => void }) {
  const [state, store] = useStore();
  const [tab, setTab] = useState<'profile'|'budget'|'export'>('profile');
  const user = state.currentUser as any;
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() || '??';
  const summary = monthSummary(state.transactions, 0);
  return (
    <div style={{ padding:'20px 18px 100px' }}>
      <div className="fnz-rise" style={{ marginBottom:20 }}>
        <div className="fnz-eyebrow">Configuracoes</div>
        <h1 className="fnz-display" style={{ fontSize:34, margin:'4px 0 0' }}>
          Perfil & <span className="fnz-display-italic" style={{color:'var(--accent)'}}>preferencias</span>
        </h1>
      </div>
      <div className="fnz-rise fnz-card" style={{ padding:20, marginBottom:16, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:56, height:56, borderRadius:999, background:'linear-gradient(135deg,var(--accent),var(--violet))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:17 }}>{user?.name || 'Usuario'}</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginTop:2, fontFamily:'var(--font-mono)' }}>{user?.email}</div>
        </div>
        <div style={{ textAlign:'center', flexShrink:0 }}>
          <ProgressRing value={state.profile.score/100} size={44} thickness={4} color="var(--accent)"/>
          <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)', marginTop:2 }}>score {state.profile.score}</div>
        </div>
      </div>
      <div className="fnz-rise" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', background:'var(--surface-2)', padding:4, borderRadius:12, marginBottom:16 }}>
        {(['profile','budget','export'] as const).map((t,i) => (
          <button key={t} onClick={() => setTab(t)} style={{ background:tab===t?'var(--surface)':'transparent', border:0, padding:'8px 0', borderRadius:9, fontSize:11, fontWeight:600, boxShadow:tab===t?'var(--shadow-sm)':'none', color:'var(--ink)', cursor:'pointer' }}>
            {['Perfil','Orcamento','Exportar'][i]}
          </button>
        ))}
      </div>
      {tab==='profile' && (
        <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <SRow icon="flame" label="Streak" value={state.profile.streakDays + ' dias seguidos'}/>
          <SRow icon="trophy" label="Conquistas" value={state.achievements.filter(a=>a.earned).length + ' de ' + state.achievements.length}/>
          <SRow icon="wallet" label="Mes atual" value={brl(summary.balance)} valueColor={summary.balance>=0?'var(--gain)':'var(--loss)'}/>
          <div className="fnz-card" style={{ padding:16, marginTop:4 }}>
            <div className="fnz-eyebrow" style={{ marginBottom:12 }}>Aparencia</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, fontWeight:500 }}>Modo escuro</span>
              <Toggle value={state.theme==='dark'} onChange={v => {
                const t = v ? 'dark' : 'light';
                store.set({ theme: t });
                document.documentElement.setAttribute('data-theme', t);
              }}/>
            </div>
          </div>
          <div className="fnz-card" style={{ padding:16 }}>
            <div className="fnz-eyebrow" style={{ marginBottom:12 }}>Dados</div>
            <button onClick={() => { if (confirm('Apagar todos os dados e sair?')) { store.reset(); onLogout(); }}}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, background:'none', border:'none', color:'var(--loss)', cursor:'pointer', padding:'6px 0', fontSize:14, fontWeight:500 }}>
              <Icon name="refresh" size={16} color="var(--loss)"/> Resetar todos os dados
            </button>
          </div>
          <button onClick={onLogout} className="fnz-btn ghost" style={{ width:'100%', marginTop:4 }}>
            <Icon name="x" size={16}/> Sair da conta
          </button>
        </div>
      )}
      {tab==='budget' && <BudgetTab state={state} store={store} summary={summary}/>}
      {tab==='export' && <ExportTab state={state}/>}
    </div>
  );
}

function BudgetTab({ state, store, summary }: any) {
  const cats = CATEGORIES.filter(c => c.kind === 'expense');
  const bd = categoryBreakdown(summary.transactions, 'expense');
  const getLimit = (id: string) => state.budgetLimits?.find((b: any) => b.categoryId === id)?.limit || 0;
  const getSpent = (id: string) => bd.find((b: any) => b.id === id)?.amount || 0;
  const setLimit = (id: string, val: number) => {
    const limits = (state.budgetLimits || []).filter((b: any) => b.categoryId !== id);
    if (val > 0) limits.push({ categoryId: id, limit: val });
    store.set({ budgetLimits: limits });
  };
  return (
    <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5, padding:'4px 0 8px' }}>
        Defina limites mensais por categoria. Alerta visual quando ultrapassar.
      </div>
      {cats.map(cat => {
        const limit = getLimit(cat.id), spent = getSpent(cat.id);
        const pct = limit > 0 ? Math.min(1, spent/limit) : 0;
        const over = limit > 0 && spent > limit;
        return (
          <div key={cat.id} className="fnz-card" style={{ padding:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:limit>0?10:0 }}>
              <span style={{ fontSize:20 }}>{cat.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{cat.label}</div>
                {limit>0 && <div style={{ fontSize:11, color:over?'var(--loss)':'var(--muted)', fontFamily:'var(--font-mono)' }}>
                  {brl(spent)} / {brl(limit)} {over && '! Limite excedido'}
                </div>}
              </div>
              <BInput value={limit} onChange={v => setLimit(cat.id, v)} color={cat.color}/>
            </div>
            {limit > 0 && (
              <div style={{ height:4, borderRadius:999, background:'var(--surface-2)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:(pct*100)+'%', background:over?'var(--loss)':cat.color, borderRadius:999, transition:'width 1s' }}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BInput({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState('');
  if (editing) return (
    <input autoFocus value={tmp} onChange={e => setTmp(e.target.value)}
      onBlur={() => { onChange(parseFloat(tmp.replace(',', '.')) || 0); setEditing(false); }}
      onKeyDown={e => e.key === 'Enter' && (onChange(parseFloat(tmp.replace(',', '.')) || 0), setEditing(false))}
      style={{ width:90, height:32, borderRadius:8, border:'1.5px solid '+color, background:'transparent', textAlign:'right', paddingRight:8, fontFamily:'var(--font-mono)', fontSize:13, color:'var(--ink)', outline:'none' }}
      placeholder="R$ 0"/>
  );
  return (
    <button onClick={() => { setTmp(value ? value.toString() : ''); setEditing(true); }}
      style={{ height:32, padding:'0 10px', borderRadius:8, border:'1.5px solid '+(value?color:'var(--line-2)'), background:value?(color+'18'):'transparent', fontFamily:'var(--font-mono)', fontSize:13, color:value?color:'var(--muted)', cursor:'pointer', minWidth:80, textAlign:'right' }}>
      {value ? brl(value) : '+ Limite'}
    </button>
  );
}

function ExportTab({ state }: any) {
  const [done, setDone] = useState(false);
  const NL = String.fromCharCode(10);
  const exportCSV = () => {
    const header = 'Data,Descricao,Categoria,Tipo,Valor' + NL;
    const rows = state.transactions.map((t: any) => {
      const d = new Date(t.date).toLocaleDateString('pt-BR');
      const kind = t.kind === 'income' ? 'Receita' : 'Despesa';
      return d + ',' + t.description + ',' + t.categoryId + ',' + kind + ',' + t.amount.toFixed(2).replace('.', ',');
    }).join(NL);
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financa_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };
  const exportJSON = () => {
    const data = { exportedAt: new Date().toISOString(), transactions: state.transactions, goals: state.goals, recurring: state.recurring };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financa_backup_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const total = state.transactions.length;
  const months = [...new Set(state.transactions.map((t: any) => new Date(t.date).toISOString().slice(0,7)))].length;
  return (
    <div className="fnz-rise-stagger" style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div className="fnz-card" style={{ padding:16, textAlign:'center' }}>
          <div className="fnz-display" style={{ fontSize:32 }}>{total}</div>
          <div style={{ fontSize:11, color:'var(--muted)', fontFamily:'var(--font-mono)', marginTop:2 }}>transacoes</div>
        </div>
        <div className="fnz-card" style={{ padding:16, textAlign:'center' }}>
          <div className="fnz-display" style={{ fontSize:32 }}>{months}</div>
          <div style={{ fontSize:11, color:'var(--muted)', fontFamily:'var(--font-mono)', marginTop:2 }}>meses</div>
        </div>
      </div>
      <div className="fnz-card" style={{ padding:18 }}>
        <div className="fnz-eyebrow" style={{ marginBottom:12 }}>Exportar planilha</div>
        <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5, marginBottom:14 }}>Baixe todas as transacoes em CSV.</p>
        <button onClick={exportCSV} className="fnz-btn accent" style={{ width:'100%', height:48 }}>
          {done ? <><Icon name="check" size={16}/> Exportado!</> : <><Icon name="arrow-up-right" size={16}/> Exportar CSV</>}
        </button>
      </div>
      <div className="fnz-card" style={{ padding:18 }}>
        <div className="fnz-eyebrow" style={{ marginBottom:12 }}>Backup completo</div>
        <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5, marginBottom:14 }}>Exporta tudo em JSON para backup.</p>
        <button onClick={exportJSON} className="fnz-btn ghost" style={{ width:'100%', height:48 }}>
          <Icon name="arrow-up-right" size={16}/> Exportar JSON
        </button>
      </div>
    </div>
  );
}

function SRow({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <div className="fnz-card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon name={icon} size={16} color="var(--muted)"/>
      </div>
      <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:500 }}>{label}</div></div>
      <div style={{ fontSize:14, fontWeight:600, fontFamily:'var(--font-mono)', color:valueColor||'var(--ink)' }}>{value}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width:44, height:24, borderRadius:999, background:value?'var(--accent)':'var(--line-2)', border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:999, background:'white', position:'absolute', top:3, left:value?23:3, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </button>
  );
}
