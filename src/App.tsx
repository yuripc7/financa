import { useState } from 'react';
import { useStore } from './store';
import { useClock } from './hooks/useAnimatedValue';
import { Icon } from './components/Icon';
import { Onboarding, Login } from './screens/Auth';
import { Dashboard } from './screens/Dashboard';
import { Entries, AddTransactionSheet } from './screens/Entries';
import { Reports } from './screens/Reports';
import { Goals } from './screens/Goals';
import { Advisor } from './screens/Advisor';
import { monthSummary, dailySeries, categoryBreakdown, forecast } from './utils';
import { Sparkline, LineChart, ProgressRing, BigNumber } from './components/Charts';
import { brl, dayLabel } from './utils';
import { CATEGORY_MAP } from './store';
import { TxRow, StreakChip } from './screens/Dashboard';

const TABS = [
  { id:'dashboard',  label:'Geral',    icon:'home'    },
  { id:'entries',    label:'Lanç.',    icon:'list'    },
  { id:'reports',    label:'Relatório',icon:'chart'   },
  { id:'goals',      label:'Metas',    icon:'target'  },
  { id:'advisor',    label:'IA',       icon:'sparkle' },
] as const;
type TabId = typeof TABS[number]['id'];

// ─── Mobile App ───────────────────────────────────────────────────────
interface MobileAppProps { initialTab?: TabId; }

export function MobileApp({ initialTab = 'dashboard' }: MobileAppProps) {
  const [state, store] = useStore();
  const [phase, setPhase] = useState<'onboarding'|'login'|'app'>(
    !state.onboarded ? 'onboarding' : (!state.authed ? 'login' : 'app')
  );
  const [tab, setTab]       = useState<TabId>(initialTab);
  const [showAddTx, setShowAddTx] = useState(false);

  if (phase === 'onboarding') return <Onboarding onDone={() => { store.set({ onboarded:true }); setPhase('login'); }}/>;
  if (phase === 'login')      return <Login      onDone={() => { store.set({ authed:true });    setPhase('app');   }}/>;

  return (
    <div className="fnz-mobile" style={{ fontFamily:'var(--font-sans)', color:'var(--ink)' }}>
      <div className="fnz-mobile-content fnz-scroll" key={tab}>
        <div className="fnz-page-enter">
          {tab==='dashboard' && <Dashboard onOpenAddTx={() => setShowAddTx(true)} onTabChange={(t: string) => setTab(t as TabId)}/>}
          {tab==='entries'   && <Entries   onOpenAddTx={() => setShowAddTx(true)}/>}
          {tab==='reports'   && <Reports/>}
          {tab==='goals'     && <Goals/>}
          {tab==='advisor'   && <Advisor/>}
        </div>
      </div>

      {/* FAB — only on dashboard */}
      {tab === 'dashboard' && (
        <button onClick={() => setShowAddTx(true)} className="fnz-fab-pulse" style={{ position:'absolute', bottom:96, right:18, zIndex:50, width:56, height:56, borderRadius:999, background:'var(--accent)', color:'white', border:0, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'transform .15s' }}
          onMouseDown={e => e.currentTarget.style.transform='scale(0.88)'}
          onMouseUp={e   => e.currentTarget.style.transform='scale(1)'}
          onMouseLeave={e=> e.currentTarget.style.transform='scale(1)'}>
          <Icon name="plus" size={26} stroke={2.4}/>
        </button>
      )}

      {/* Tab bar */}
      <nav className="fnz-tabbar">
        {TABS.map(t => (
          <button key={t.id} className={'fnz-tab' + (tab===t.id?' active':'')} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={20} stroke={tab===t.id ? 2 : 1.5}/>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {showAddTx && <AddTransactionSheet open={showAddTx} onClose={() => setShowAddTx(false)}/>}
    </div>
  );
}

// ─── Phone Frame with real-time clock ────────────────────────────────
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const time = useClock();
  return (
    <div style={{ width:'100%', height:'100%', background:'var(--bg)', borderRadius:56, overflow:'hidden', position:'relative', boxShadow:'0 0 0 12px #0a0908, 0 0 0 13px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.25)' }}>
      {/* Dynamic island */}
      <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', width:120, height:32, borderRadius:999, background:'#000', zIndex:30 }}/>
      {/* Status bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:54, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 28px 0', zIndex:25, fontSize:15, fontWeight:600, fontFamily:'-apple-system, sans-serif', color:'var(--ink)', pointerEvents:'none' }}>
        <span style={{ transition:'all .5s' }}>{time}</span>
        <span style={{ display:'flex', gap:5, alignItems:'center' }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="4" width="3" height="7" rx="0.5"/><rect x="9" y="2" width="3" height="9" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.4"/><rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/><rect x="22" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.4"/></svg>
        </span>
      </div>
      <div style={{ paddingTop:0, height:'100%', position:'relative' }}>{children}</div>
      {/* Home indicator */}
      <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', width:134, height:5, borderRadius:999, background:'var(--ink)', opacity:.55, zIndex:30 }}/>
    </div>
  );
}

// ─── Desktop App ──────────────────────────────────────────────────────
const DESKTOP_TABS = [
  { id:'dashboard', label:'Visão Geral',  icon:'home'    },
  { id:'entries',   label:'Lançamentos',  icon:'list'    },
  { id:'reports',   label:'Relatório',    icon:'chart'   },
  { id:'goals',     label:'Metas',        icon:'target'  },
  { id:'advisor',   label:'Consultor IA', icon:'sparkle' },
] as const;

export function DesktopApp() {
  const [state, store] = useStore();
  const [tab, setTab]   = useState<TabId>('dashboard');
  const [showAddTx, setShowAddTx] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>('light');

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const summary = monthSummary(state.transactions, 0);

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', background:'var(--bg)', color:'var(--ink)', fontFamily:'var(--font-sans)', overflow:'hidden', position:'relative' }}>
      {/* Sidebar */}
      <aside style={{ width:240, flexShrink:0, background:'var(--surface)', borderRight:'0.5px solid var(--line)', padding:'28px 18px 24px', display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ padding:'0 8px 28px', display:'flex', alignItems:'baseline', gap:8 }}>
          <div className="fnz-display" style={{ fontSize:26, letterSpacing:'-0.04em' }}>
            Finança<span style={{color:'var(--accent)'}}>.</span>
          </div>
          <span className="fnz-pill" style={{ fontSize:9, height:18, padding:'0 6px' }}>v2</span>
        </div>

        {DESKTOP_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as TabId)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, border:0, background: tab===t.id?'var(--surface-2)':'transparent', color: tab===t.id?'var(--ink)':'var(--muted)', fontSize:13, fontWeight:500, textAlign:'left', cursor:'pointer', transition:'background .12s, color .2s' }}>
            <Icon name={t.icon} size={17} stroke={1.6}/>
            <span>{t.label}</span>
            {tab===t.id && <span style={{ marginLeft:'auto', width:4, height:4, background:'var(--accent)', borderRadius:999 }}/>}
          </button>
        ))}

        <div style={{ flex:1 }}/>

        <button onClick={() => setShowAddTx(true)} className="fnz-btn accent" style={{ width:'100%' }}>
          <Icon name="plus" size={16} stroke={2.4}/> Novo lançamento
        </button>

        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button onClick={toggleTheme} className="fnz-iconbtn" style={{ flex:1, borderRadius:10 }}>
            <Icon name={theme==='light'?'moon':'sun'} size={16}/>
          </button>
          <button onClick={() => { store.reset(); window.location.reload(); }} className="fnz-iconbtn" style={{ flex:1, borderRadius:10 }}>
            <Icon name="refresh" size={16}/>
          </button>
        </div>

        <div className="fnz-card" style={{ padding:14, marginTop:4, background:'var(--surface-2)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:999, background:'var(--ink)', color:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>
            {state.profile.name[0]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600 }}>{state.profile.name}</div>
            <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)' }}>
              🔥 {state.profile.streakDays} dias · score {state.profile.score}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:'auto', position:'relative' }} className="fnz-scroll">
        {/* Topbar */}
        <div style={{ padding:'20px 32px', borderBottom:'0.5px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg)', position:'sticky', top:0, zIndex:10 }}>
          <div>
            <div className="fnz-eyebrow">{summary.label}</div>
            <h1 className="fnz-display" style={{ fontSize:24, margin:'2px 0 0' }}>
              {DESKTOP_TABS.find(t => t.id === tab)?.label}
            </h1>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className="fnz-iconbtn"><Icon name="search" size={16}/></button>
            <button className="fnz-iconbtn"><Icon name="bell" size={16}/></button>
            <button onClick={() => store.set({ hideBalance: !state.hideBalance })} className="fnz-iconbtn">
              <Icon name={state.hideBalance?'eye-off':'eye'} size={16}/>
            </button>
          </div>
        </div>

        <div style={{ padding:'24px 32px 60px' }} key={tab} className="fnz-page-enter">
          {tab==='dashboard' && <DesktopDashboard state={state} onOpenAddTx={() => setShowAddTx(true)} onTabChange={(t: string) => setTab(t as TabId)}/>}
          {tab==='entries'   && <Entries   onOpenAddTx={() => setShowAddTx(true)}/>}
          {tab==='reports'   && <Reports/>}
          {tab==='goals'     && <Goals/>}
          {tab==='advisor'   && <div style={{ maxWidth:720, height:'calc(100vh - 130px)', margin:'0 auto', display:'flex', flexDirection:'column' }}><Advisor/></div>}
        </div>
      </main>

      {showAddTx && <div style={{ position:'absolute', inset:0, zIndex:100 }}><AddTransactionSheet open={showAddTx} onClose={() => setShowAddTx(false)}/></div>}
    </div>
  );
}

// ─── Desktop Dashboard ────────────────────────────────────────────────
function DesktopDashboard({ state, onOpenAddTx, onTabChange }: any) {
  const summary     = monthSummary(state.transactions, 0);
  const lastSummary = monthSummary(state.transactions, -1);
  const series      = dailySeries(state.transactions, 30);
  const breakdown   = categoryBreakdown(summary.transactions, 'expense');
  const fc          = forecast(state, 30);
  const cumulative  = series.reduce<number[]>((arr, d, i) => { arr.push((arr[i-1]||0)+d.net); return arr; }, []);
  const recent      = state.transactions.slice(0, 6);
  const monthDelta  = summary.balance - lastSummary.balance;
  const deltaPct    = lastSummary.balance ? (monthDelta / Math.abs(lastSummary.balance)) * 100 : 0;

  return (
    <div className="fnz-rise-stagger" style={{ display:'grid', gridTemplateColumns:'minmax(0,2fr) minmax(0,1fr)', gap:18 }}>
      {/* Left */}
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {/* Hero */}
        <div className="fnz-card" style={{ padding:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div className="fnz-eyebrow">{summary.label} · Saldo</div>
              <div className="fnz-display" style={{ fontSize:68, lineHeight:.9, marginTop:8, color: summary.balance>=0?'var(--ink)':'var(--loss)' }}>
                {state.hideBalance ? 'R$ ••••' : <BigNumber value={summary.balance}/>}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:14 }}>
                <span className="fnz-pill" style={{ background: monthDelta>=0?'var(--gain-soft)':'var(--loss-soft)', color: monthDelta>=0?'var(--gain)':'var(--loss)', border:0, fontFamily:'var(--font-mono)', fontWeight:600 }}>
                  {monthDelta>=0?'+':''}{deltaPct.toFixed(1)}%
                </span>
                <span style={{ fontSize:12, color:'var(--muted)' }}>vs {lastSummary.label.split(' ')[0]}</span>
              </div>
            </div>
            <StreakChip days={state.profile.streakDays}/>
          </div>
          <div style={{ marginTop:20 }}>
            <LineChart data={cumulative.map((v,i)=>({value:v,label:i}))} width={580} height={120} color="var(--ink)" showAxis={false}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16 }}>
            {[
              { label:'Entradas', value:summary.income,  kind:'income',  spark:series.map(d=>d.income) },
              { label:'Saídas',   value:summary.expense, kind:'expense', spark:series.map(d=>d.expense) },
            ].map(k => (
              <div key={k.label} style={{ padding:'14px 16px', borderRadius:14, background:'var(--surface-2)' }}>
                <div className="fnz-eyebrow">{k.label}</div>
                <div className="fnz-display" style={{ fontSize:28, marginTop:4 }}>
                  <span style={{opacity:.4,fontWeight:400}}>R$</span>{(k.value/1000).toFixed(1)}<span style={{fontSize:'.55em',opacity:.5}}>k</span>
                </div>
                <Sparkline values={k.spark} width={200} height={28} color={k.kind==='income'?'var(--gain)':'var(--accent)'} strokeWidth={1.6}/>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="fnz-card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'0.5px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div className="fnz-eyebrow">Lançamentos recentes</div>
            <button onClick={() => onTabChange('entries')} style={{ background:'transparent', border:0, color:'var(--muted)', fontSize:11, fontFamily:'var(--font-mono)', cursor:'pointer' }}>Ver todos →</button>
          </div>
          {recent.map((t: any, i: number) => <TxRow key={t.id} tx={t} isLast={i===recent.length-1}/>)}
        </div>
      </div>

      {/* Right */}
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {/* Forecast */}
        <div className="fnz-card" style={{ padding:20, background:'var(--ink)', color:'var(--bg)', border:0 }}>
          <div className="fnz-eyebrow" style={{color:'rgba(244,241,234,.55)'}}>Projeção 30d</div>
          <div className="fnz-display" style={{ fontSize:32, marginTop:4, color: fc[fc.length-1].value>=0?'var(--bg)':'#ff6a5b' }}>
            R$ {Math.abs(fc[fc.length-1].value/1000).toFixed(1)}k
          </div>
          <LineChart data={fc.map(f=>({value:f.value,label:f.label}))} width={200} height={80} color="var(--accent)" showAxis={false}/>
        </div>

        {/* Breakdown */}
        <div className="fnz-card" style={{ padding:20 }}>
          <div className="fnz-eyebrow" style={{marginBottom:14}}>Categorias</div>
          {breakdown.slice(0,6).map(b => {
            const pct = (b.amount/summary.expense)*100;
            return (
              <div key={b.id} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span>{b.emoji} {b.label}</span>
                  <span className="fnz-mono">{brl(b.amount)}</span>
                </div>
                <div className="fnz-progress-bar">
                  <div className="fnz-progress-fill" style={{ width:`${pct}%`, background:b.color }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score */}
        <div className="fnz-card" style={{ padding:20 }}>
          <div className="fnz-eyebrow" style={{marginBottom:12}}>Score Finança</div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ position:'relative' }}>
              <ProgressRing value={state.profile.score/100} size={72} thickness={6} color="var(--accent)"/>
              <div className="fnz-display" style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {state.profile.score}
              </div>
            </div>
            <div>
              <div className="fnz-display" style={{fontSize:20}}>Saúde <span className="fnz-display-italic" style={{color:'var(--accent)'}}>boa</span></div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:4}}>Reserva · gasto fixo · diversif.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Web frame ────────────────────────────────────────────────────────
export function WebFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width:1280, height:820, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,0.20)', background:'var(--bg)', display:'flex', flexDirection:'column', border:'0.5px solid rgba(0,0,0,0.1)' }}>
      <div style={{ height:40, background:'#dcd6c8', display:'flex', alignItems:'center', gap:8, padding:'0 14px', flexShrink:0, borderBottom:'0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', gap:7 }}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i) => <div key={i} style={{width:12,height:12,borderRadius:999,background:c}}/>)}
        </div>
        <div style={{ flex:1, height:24, background:'rgba(0,0,0,0.06)', borderRadius:7, marginLeft:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'rgba(0,0,0,0.5)', fontFamily:'var(--font-mono)' }}>
          🔒 financa.app/dashboard
        </div>
        <div style={{width:80}}/>
      </div>
      <div style={{flex:1,overflow:'hidden',position:'relative'}}>{children}</div>
    </div>
  );
}
