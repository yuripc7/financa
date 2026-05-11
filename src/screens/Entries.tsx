import { useState } from 'react';
import { useStore, CATEGORIES, CATEGORY_MAP, guessCategory } from '../store';
import { brl, dayLabel, monthSummary } from '../utils';
import { categoryBreakdown } from '../utils';
import { Icon } from '../components/Icon';
import { TxRow } from './Dashboard';
import type { Transaction } from '../types';

interface EntriesProps { onOpenAddTx: () => void; }

export function Entries({ onOpenAddTx }: EntriesProps) {
  const [state, store] = useStore();
  const [filter, setFilter] = useState<'all'|'income'|'expense'>('all');
  const [query,  setQuery]  = useState('');
  const [catFilter, setCatFilter] = useState<string|null>(null);

  const filtered = state.transactions.filter(t => {
    if (filter !== 'all' && t.kind !== filter) return false;
    if (catFilter && t.categoryId !== catFilter) return false;
    if (query && !t.description.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const groups: Record<string, Transaction[]> = {};
  filtered.forEach(t => { const d = dayLabel(t.date); (groups[d] = groups[d]||[]).push(t); });
  const topCats = categoryBreakdown(state.transactions, 'expense').slice(0, 6);

  return (
    <div style={{ padding:'20px 18px 100px' }}>
      <div className="fnz-rise" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:16 }}>
        <div>
          <div className="fnz-eyebrow">Movimentacoes</div>
          <h1 className="fnz-display" style={{ fontSize:36, margin:0, marginTop:4 }}>Lancamentos</h1>
        </div>
        <button onClick={onOpenAddTx} className="fnz-iconbtn" style={{ background:'var(--accent)', color:'white', border:0, width:44, height:44 }}>
          <Icon name="plus" size={22} stroke={2.4}/>
        </button>
      </div>

      <div className="fnz-rise" style={{ position:'relative', marginBottom:12 }}>
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar lancamento..." className="fnz-input" style={{ paddingLeft:40, height:44 }}/>
        <div style={{ position:'absolute', left:14, top:14, pointerEvents:'none' }}><Icon name="search" size={16} color="var(--muted)"/></div>
      </div>

      <div className="fnz-rise" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', background:'var(--surface-2)', padding:4, borderRadius:12, marginBottom:12 }}>
        {(['all','income','expense'] as const).map((o,i) => (
          <button key={o} onClick={() => setFilter(o)} style={{ background:filter===o?'var(--surface)':'transparent', border:0, padding:'8px 0', borderRadius:9, fontSize:12, fontWeight:600, color:'var(--ink)', boxShadow:filter===o?'var(--shadow-sm)':'none', cursor:'pointer' }}>
            {['Tudo','Entradas','Saidas'][i]}
          </button>
        ))}
      </div>

      <div className="fnz-rise" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:14 }}>
        <button onClick={() => setCatFilter(null)} style={{ flexShrink:0, height:28, padding:'0 12px', borderRadius:999, border:catFilter===null?'1.5px solid var(--ink)':'1px solid var(--line-2)', background:catFilter===null?'var(--ink)':'transparent', color:catFilter===null?'var(--bg)':'var(--muted)', fontSize:11, fontWeight:600, cursor:'pointer' }}>Todas</button>
        {topCats.map(c => (
          <button key={c.id} onClick={() => setCatFilter(catFilter===c.id?null:c.id)} style={{ flexShrink:0, display:'flex', alignItems:'center', gap:4, height:28, padding:'0 10px', borderRadius:999, border:catFilter===c.id?'1.5px solid '+c.color:'1px solid var(--line-2)', background:catFilter===c.id?(c.color+'18'):'transparent', fontSize:11, fontWeight:600, color:catFilter===c.id?c.color:'var(--muted)', cursor:'pointer', whiteSpace:'nowrap' }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {Object.entries(groups).map(([day, txs]) => (
        <div key={day} style={{ marginBottom:16 }}>
          <div className="fnz-eyebrow" style={{ padding:'0 4px 8px' }}>{day}</div>
          <div className="fnz-card" style={{ padding:4 }}>
            {txs.map((t, i) => <TxRow key={t.id} tx={t} isLast={i===txs.length-1} onDelete={() => { if(confirm('Excluir este lancamento?')) store.removeTransaction(t.id); }}/>)}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
          <div style={{ fontSize:14 }}>Nenhum lancamento encontrado</div>
        </div>
      )}
    </div>
  );
}

interface AddTxSheetProps { open: boolean; onClose: () => void; }

export function AddTransactionSheet({ open, onClose }: AddTxSheetProps) {
  const [, store] = useStore();
  const [kind, setKind]   = useState<'expense'|'income'>('expense');
  const [desc, setDesc]   = useState('');
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState('');
  const [date, setDate]   = useState(new Date().toISOString().slice(0,10));
  if (!open) return null;
  const guessed = guessCategory(desc);
  const effectiveCat = catId || guessed || 'outros';
  const cats = CATEGORIES.filter(c => c.kind === kind);
  const submit = () => {
    const amt = parseFloat(amount.replace(',', '.'));
    if (!desc || isNaN(amt) || amt <= 0) return;
    store.addTransaction({ description:desc, amount:amt, categoryId:effectiveCat, kind, date:new Date(date).toISOString() });
    setDesc(''); setAmount(''); setCatId(''); setKind('expense');
    onClose();
  };
  return (
    <div style={{ position:'absolute', inset:0, zIndex:100 }}>
      <div className="fnz-backdrop" onClick={onClose}/>
      <div className="fnz-sheet" style={{ padding:'8px 20px 24px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'var(--line-2)', margin:'0 auto 20px' }}/>
        <div className="fnz-eyebrow" style={{ marginBottom:16 }}>Novo lancamento</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--surface-2)', padding:4, borderRadius:12, marginBottom:16 }}>
          {(['expense','income'] as const).map((k,i) => (
            <button key={k} onClick={() => { setKind(k); setCatId(''); }} style={{ padding:'10px 0', borderRadius:9, border:0, background:kind===k?'var(--surface)':'transparent', fontWeight:600, fontSize:13, color:'var(--ink)', boxShadow:kind===k?'var(--shadow-sm)':'none', cursor:'pointer' }}>
              {['Despesa','Receita'][i]}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <input value={desc} onChange={e=>{setDesc(e.target.value);setCatId('');}} placeholder="Descricao (ex: iFood, Salario...)" className="fnz-input"/>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Valor (R$)" type="number" min="0" step="0.01" className="fnz-input"/>
          <input value={date} onChange={e=>setDate(e.target.value)} type="date" className="fnz-input"/>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {cats.map(c => (
              <button key={c.id} onClick={() => setCatId(c.id===catId?'':c.id)} style={{ display:'flex', alignItems:'center', gap:4, height:30, padding:'0 10px', borderRadius:999, border:effectiveCat===c.id?'1.5px solid '+c.color:'1px solid var(--line-2)', background:effectiveCat===c.id?(c.color+'18'):'transparent', fontSize:11, fontWeight:600, color:effectiveCat===c.id?c.color:'var(--muted)', cursor:'pointer', position:'relative' }}>
                {c.emoji} {c.label}
                {c.id===guessed&&catId!==c.id&&<span style={{ position:'absolute', top:-4, right:-4, width:8, height:8, background:'var(--accent)', borderRadius:999 }}/>}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} className="fnz-btn accent" style={{ width:'100%', marginTop:20, height:52 }}>
          <Icon name="check" size={18}/> Salvar lancamento
        </button>
      </div>
    </div>
  );
}
