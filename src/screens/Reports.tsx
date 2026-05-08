import { useState } from 'react';
import { useStore } from '../store';
import { CATEGORY_MAP } from '../store';
import { monthSummary, categoryBreakdown, forecast, brl } from '../utils';
import { LineChart, BarPair } from '../components/Charts';
import { Icon } from '../components/Icon';

export function Reports() {
  const [state] = useStore();
  const [offset, setOffset] = useState(0);

  const summary     = monthSummary(state.transactions, offset);
  const prevSummary = monthSummary(state.transactions, offset - 1);
  const breakdown   = categoryBreakdown(summary.transactions, 'expense');
  const fc          = forecast(state, 30);
  const fcEnd       = fc[fc.length - 1].value;

  const months = Array.from({ length: 6 }, (_, i) => {
    const m = monthSummary(state.transactions, -(5-i));
    return { label: m.label.split(' ')[0].slice(0,3), income: m.income, expense: m.expense };
  });

  const maxBreakdown = breakdown[0]?.amount || 1;
  const expDelta = prevSummary.expense ? ((summary.expense - prevSummary.expense) / prevSummary.expense) * 100 : 0;

  return (
    <div className="fnz-rise-stagger" style={{ padding:'20px 18px 100px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div className="fnz-eyebrow">Relatório</div>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => setOffset(o => o - 1)} className="fnz-iconbtn" style={{ width:32, height:32 }}>
              <Icon name="chevron-left" size={14}/>
            </button>
            <button onClick={() => setOffset(o => Math.min(0, o + 1))} className="fnz-iconbtn" style={{ width:32, height:32, opacity: offset>=0?0.4:1 }} disabled={offset>=0}>
              <Icon name="chevron-right" size={14}/>
            </button>
          </div>
        </div>
        <h1 className="fnz-display" style={{ fontSize:38, margin:0, textTransform:'capitalize' }}>
          {summary.label.split(' ')[0]}<br/>
          <span className="fnz-display-italic" style={{color:'var(--muted)',fontSize:'0.5em'}}>{summary.label.split(' ')[2]}</span>
        </h1>
      </div>

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { label:'Receitas', value:summary.income, color:'var(--gain)', delta: null },
          { label:'Despesas', value:summary.expense, color:'var(--loss)', delta:expDelta },
        ].map((k, i) => (
          <div key={i} className="fnz-card" style={{ padding:14 }}>
            <div className="fnz-eyebrow">{k.label}</div>
            <div className="fnz-display" style={{ fontSize:24, marginTop:4, color:k.color }}>
              {brl(k.value)}
            </div>
            {k.delta != null && (
              <div style={{ fontSize:11, color: k.delta>=0?'var(--loss)':'var(--gain)', fontFamily:'var(--font-mono)', marginTop:4 }}>
                {k.delta>=0?'▲':'▼'} {Math.abs(k.delta).toFixed(1)}% vs anterior
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bar comparison */}
      <div className="fnz-card" style={{ padding:18 }}>
        <div className="fnz-eyebrow" style={{ marginBottom:12 }}>Receitas vs Despesas · 6 meses</div>
        <BarPair data={months} width={300} height={150}/>
        <div style={{ display:'flex', gap:16, marginTop:8, fontSize:11, fontFamily:'var(--font-mono)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:6, color:'var(--gain)' }}><span style={{width:10,height:10,background:'var(--gain)',borderRadius:2}}/> Entradas</span>
          <span style={{ display:'flex', alignItems:'center', gap:6, color:'var(--accent)' }}><span style={{width:10,height:10,background:'var(--accent)',borderRadius:2}}/> Saídas</span>
        </div>
      </div>

      {/* Forecast */}
      <div className="fnz-card" style={{ padding:18, background:'var(--ink)', color:'var(--bg)', border:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div>
            <div className="fnz-eyebrow" style={{color:'rgba(244,241,234,0.55)'}}>Projeção · 30d</div>
            <div className="fnz-display" style={{ fontSize:36, marginTop:4, color: fcEnd>=0?'var(--bg)':'#ff6a5b' }}>
              {fcEnd>=0?'':'−'}R$ {Math.abs(fcEnd/1000).toFixed(1)}<span style={{fontSize:'0.5em',opacity:.5}}>k</span>
            </div>
            <div style={{ fontSize:11, color:'rgba(244,241,234,0.55)', marginTop:4, fontFamily:'var(--font-mono)' }}>
              Saldo estimado em 30 dias
            </div>
          </div>
          <span className="fnz-pill" style={{background:'rgba(255,122,61,0.18)', color:'var(--accent)', border:0}}>
            <Icon name="sparkle" size={11} stroke={2}/> IA
          </span>
        </div>
        <LineChart data={fc.map(f=>({value:f.value,label:f.label}))} width={300} height={120} color="var(--accent)" forecastFrom={1} showAxis={false}/>
      </div>

      {/* Category breakdown */}
      <div className="fnz-card" style={{ padding:18 }}>
        <div className="fnz-eyebrow" style={{ marginBottom:14 }}>Despesas por categoria</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {breakdown.slice(0,8).map(b => {
            const pct = (b.amount / summary.expense) * 100;
            return (
              <div key={b.id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>{b.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:500 }}>{b.label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span className="fnz-mono" style={{ fontSize:12, color:'var(--muted)' }}>{pct.toFixed(0)}%</span>
                    <span className="fnz-mono" style={{ fontSize:13, fontWeight:600 }}>{brl(b.amount)}</span>
                  </div>
                </div>
                <div className="fnz-progress-bar">
                  <div className="fnz-progress-fill" style={{ width:`${pct}%`, background:b.color }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saldo */}
      <div className="fnz-card" style={{ padding:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div className="fnz-eyebrow">Saldo do período</div>
          <div className="fnz-display" style={{ fontSize:32, marginTop:4, color: summary.balance>=0?'var(--gain)':'var(--loss)' }}>
            {brl(summary.balance)}
          </div>
        </div>
        <Icon name={summary.balance>=0?'trending-up':'trending-down'} size={40} color={summary.balance>=0?'var(--gain)':'var(--loss)'} stroke={1.2}/>
      </div>
    </div>
  );
}
