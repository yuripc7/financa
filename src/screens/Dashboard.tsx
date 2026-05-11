import { useStore } from '../store';
import { useState } from 'react';
import { monthSummary, dailySeries, categoryBreakdown, brl, dayLabel } from '../utils';
import { CATEGORY_MAP as CAT_MAP } from '../store';
import { BigNumber, Donut, LineChart, Sparkline, ProgressRing } from '../components/Charts';
import { Icon } from '../components/Icon';

interface DashboardProps { onOpenAddTx: () => void; onTabChange?: (tab: string) => void; }

export function Dashboard({ onOpenAddTx, onTabChange }: DashboardProps) {
  const [state, store] = useStore();
  const summary   = monthSummary(state.transactions, 0);
  const lastMonth = monthSummary(state.transactions, -1);
  const series    = dailySeries(state.transactions, 14);
  const breakdown = categoryBreakdown(summary.transactions, 'expense').slice(0, 5);
  const recent    = state.transactions.slice(0, 4);
  const cumulative = series.reduce<number[]>((arr, d, i) => { arr.push((arr[i-1]||0)+d.net); return arr; }, []);
  const monthDelta = summary.balance - lastMonth.balance;
  const deltaPct   = lastMonth.balance ? (monthDelta / Math.abs(lastMonth.balance)) * 100 : 0;
  const upcoming = [...state.recurring].sort((a,b)=>{const t=new Date().getDate();const ad=a.day<t?a.day+31:a.day,bd=b.day<t?b.day+31:b.day;return ad-bd;}).slice(0,3);
  return (
    <div className="fnz-rise-stagger" style={{ padding:'20px 18px 100px', display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <div>
            <div className="fnz-eyebrow">{summary.label}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
              <span style={{ fontSize:13, color:'var(--muted)' }}>Saldo do mes</span>
              <button onClick={() => store.set({ hideBalance: !state.hideBalance })} style={{ background:'transparent', border:0, padding:0, color:'var(--muted)', cursor:'pointer' }}>
                <Icon name={state.hideBalance?'eye-off':'eye'} size={14}/>
              </button>
            </div>
          </div>
          <StreakChip days={state.profile.streakDays}/>
        </div>
        <div className="fnz-display" style={{ fontSize:76, lineHeight:0.92, marginTop:6, color:summary.balance>=0?'var(--ink)':'var(--loss)', transition:'color .3s' }}>
          {state.hideBalance ? <span style={{letterSpacing:'0.05em'}}>R$ ...</span> : <BigNumber value={summary.balance}/>}
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:12 }}>
          <span className="fnz-pill" style={{ background:monthDelta>=0?'var(--gain-soft)':'var(--loss-soft)', color:monthDelta>=0?'var(--gain)':'var(--loss)', border:0, fontFamily:'var(--font-mono)', fontWeight:600 }}>
            <Icon name={monthDelta>=0?'trending-up':'trending-down'} size={11} stroke={2.2}/>
            {monthDelta>=0?'+':''}{deltaPct.toFixed(1)}%
          </span>
          <span style={{ fontSize:11, color:'var(--muted)' }}>vs {lastMonth.label.split(' ')[0]}</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div className="fnz-card" style={{ padding:14 }}>
          <div className="fnz-eyebrow">Entradas</div>
          <div className="fnz-display" style={{ fontSize:26, marginTop:4 }}><span style={{opacity:.4,fontWeight:400}}>R$</span>{(summary.income/1000).toFixed(1)}<span style={{fontSize:'0.55em',opacity:.5}}>k</span></div>
          <Sparkline values={series.map(d=>d.income)} width={130} height={28} color="var(--gain)" strokeWidth={1.6}/>
        </div>
        <div className="fnz-card" style={{ padding:14 }}>
          <div className="fnz-eyebrow">Saidas</div>
          <div className="fnz-display" style={{ fontSize:26, marginTop:4 }}><span style={{opacity:.4,fontWeight:400}}>R$</span>{(summary.expense/1000).toFixed(1)}<span style={{fontSize:'0.55em',opacity:.5}}>k</span></div>
          <Sparkline values={series.map(d=>d.expense)} width={130} height={28} color="var(--accent)" strokeWidth={1.6}/>
        </div>
      </div>

      <div className="fnz-card" style={{ padding:18 }}>
        <div className="fnz-eyebrow" style={{ marginBottom:10 }}>Saldo 14 dias</div>
        <LineChart data={cumulative.map((v,i)=>({value:v,label:i}))} width={300} height={140} color="var(--ink)"/>
      </div>

      <div className="fnz-card" style={{ padding:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div><div className="fnz-eyebrow">Onde foi</div><h3 className="fnz-display" style={{ fontSize:22, margin:0, marginTop:2 }}>Top categorias</h3></div>
          <button onClick={() => onTabChange?.('reports')} className="fnz-iconbtn" style={{ width:32, height:32 }}><Icon name="chevron-right" size={16}/></button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Donut data={breakdown.map(b=>({...b,color:b.color}))} size={120} thickness={16} centerLabel="Total" centerValue={'R$'+(summary.expense/1000).toFixed(1)+'k'}/>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
            {breakdown.slice(0,4).map(b => (
              <div key={b.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:b.color }}/>
                <div style={{ flex:1, fontSize:12 }}>{b.label}</div>
                <div className="fnz-mono" style={{ fontSize:11, color:'var(--muted)' }}>{((b.amount/summary.expense)*100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fnz-card" style={{ padding:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div><div className="fnz-eyebrow">A pagar</div><h3 className="fnz-display" style={{ fontSize:22, margin:0, marginTop:2 }}>Proximas</h3></div>
          <Icon name="calendar" size={18} color="var(--muted)"/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {upcoming.map(r => {
            const cat = CAT_MAP[r.categoryId];
            return (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:cat.color+'22', color:cat.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontFamily:'var(--font-mono)', fontWeight:600 }}>
                  {r.day.toString().padStart(2,'0')}
                </div>
                <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:500 }}>{r.title}</div><div style={{ fontSize:11, color:'var(--muted)' }}>{cat.label}</div></div>
                <div className="fnz-mono" style={{ fontSize:14, fontWeight:600, color:r.kind==='income'?'var(--gain)':'var(--ink)' }}>
                  {r.kind==='income'?'+':'-'}{brl(r.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 4px 12px' }}>
          <div className="fnz-eyebrow">Recentes</div>
          <button onClick={() => onTabChange?.('entries')} style={{ background:'transparent', border:0, color:'var(--muted)', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer' }}>Ver todos</button>
        </div>
        <div className="fnz-card" style={{ padding:4 }}>
          {recent.map((t, i) => <TxRow key={t.id} tx={t} isLast={i===recent.length-1} onDelete={() => { if(confirm('Excluir?')) store.removeTransaction(t.id); }}/>)}
        </div>
      </div>

      <div className="fnz-card" style={{ padding:20, background:'linear-gradient(135deg,var(--ink) 0%,var(--ink-2) 100%)', color:'var(--bg)', border:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ position:'relative' }}>
            <ProgressRing value={state.profile.score/100} size={68} thickness={5} color="var(--accent)"/>
            <div className="fnz-display" style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'var(--bg)' }}>{state.profile.score}</div>
          </div>
          <div style={{ flex:1 }}>
            <div className="fnz-eyebrow" style={{ color:'rgba(244,241,234,0.55)' }}>Score Financa</div>
            <div className="fnz-display" style={{ fontSize:22, marginTop:2 }}>Saude <span className="fnz-display-italic" style={{color:'var(--accent)'}}>boa</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreakChip({ days }: { days: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'var(--accent-ink)', padding:'6px 10px', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:600 }}>
      <Icon name="flame" size={12} stroke={2.2}/> {days} dias
    </div>
  );
}

export function TxRow({ tx, isLast=false, onClick, onDelete }: { tx:any; isLast?:boolean; onClick?:()=>void; onDelete?:()=>void }) {
  const cat = CAT_MAP[tx.categoryId] || CAT_MAP['outros'];
  return (
    <div style={{ borderBottom:isLast?'none':'0.5px solid var(--line)', display:'flex', alignItems:'stretch' }}>
      <button onClick={onClick} style={{ flex:1, display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'transparent', border:0, textAlign:'left', transition:'background .12s', cursor:'pointer', minWidth:0 }}
        onMouseDown={e=>e.currentTarget.style.background='var(--surface-2)'}
        onMouseUp={e=>e.currentTarget.style.background='transparent'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <div style={{ width:38, height:38, borderRadius:10, background:cat.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{cat.emoji}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{tx.description}</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{dayLabel(tx.date)} - {cat.label}</div>
        </div>
        <div className="fnz-mono" style={{ fontSize:14, fontWeight:600, color:tx.kind==='income'?'var(--gain)':'var(--ink)' }}>
          {tx.kind==='income'?'+':'-'}{brl(tx.amount)}
        </div>
      </button>
      {onDelete && (
        <button onClick={onDelete} style={{ width:44, background:'transparent', border:'none', color:'var(--loss)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity:0.5, transition:'opacity .15s' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='1'}
          onMouseLeave={e=>e.currentTarget.style.opacity='0.5'}>
          <Icon name="x" size={15} stroke={2.5}/>
        </button>
      )}
    </div>
  );
}
