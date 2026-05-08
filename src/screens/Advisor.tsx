import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { monthSummary, categoryBreakdown, brl } from '../utils';
import { Icon } from '../components/Icon';

interface Message { role: 'user' | 'assistant'; content: string; }

// ─── Smart mock advisor ───────────────────────────────────────────────
function generateResponse(input: string, context: string): string {
  const q = input.toLowerCase();

  if (q.match(/ol[aá]|oi|hey|bom dia|boa tarde/)) {
    return 'Oi! Sou o **Consultor Finança** 👋 Analisei suas finanças e estou pronto para ajudar.\n\nPosso responder sobre:\n- Gastos por categoria\n- Metas e progresso\n- Como economizar\n- Projeção de saldo';
  }

  if (q.match(/gastar|gast(o|a)|despesa|sair/)) {
    const lines = context.split('\n').filter(l => l.includes('R$') && l.includes('%'));
    return `Aqui estão seus maiores gastos do mês:\n\n${lines.slice(0,4).join('\n')}\n\n**Dica:** Restaurante e mercado juntos costumam representar o maior potencial de corte. Tente cozinhar mais em casa — economia típica de 30-40%.`;
  }

  if (q.match(/meta|objetivo|poupan|guardar/)) {
    return 'Suas metas estão progredindo! 🎯\n\n**Reserva de emergência** está em 62% — prioridade máxima.\n**Viagem Japão** ainda precisa de impulso (35%).\n\nSugestão: destine pelo menos **10% da renda** mensalmente para metas. Com R$ 8.500 de salário, isso seria ~R$ 850/mês divididos entre suas metas.';
  }

  if (q.match(/economiz|cortar|reduzir|poupar/)) {
    return '**3 cortes rápidos que recomendo:**\n\n- 🍔 **Delivery** — você gastou ~R$ 250 neste mês. Cozinhar 3x por semana economiza ~R$ 150/mês\n- 📱 **Assinaturas** — revise netflix/spotify compartilhados: pode economizar R$ 60/mês\n- 🚗 **Transporte** — Uber diário some rápido. Considere transporte público 2x/semana\n\nTotal potencial: **~R$ 300/mês** a mais na sua reserva.';
  }

  if (q.match(/invest|render|aplicar|rend(a|imento)/)) {
    return 'Com seu saldo atual positivo, aqui minha sugestão de alocação:\n\n**1º Reserva de emergência** (prioridade) — CDB ou Tesouro Selic, liquidez diária\n**2º Médio prazo** (metas como Japão) — Tesouro IPCA+ ou LCI/LCA\n**3º Longo prazo** — Fundos de índice (ETFs como BOVA11)\n\nEvite investir antes de completar a reserva de emergência!';
  }

  if (q.match(/saldo|balanc|balan[çc]o|sobr(a|ou)/)) {
    const lines = context.split('\n');
    const balLine = lines.find(l => l.includes('Saldo:'));
    return `${balLine ? balLine : 'Seu saldo está positivo este mês.'}\n\nIsso significa que você está **no azul** — parabéns! 🎉 Aproveite para acelerar suas metas ou construir mais reserva.`;
  }

  if (q.match(/projeç|forecast|futuro|próximo mês/)) {
    return 'Baseado nos seus padrões e contas recorrentes, **projeção para os próximos 30 dias:**\n\n- Contas fixas: ~R$ 2.630 (aluguel, internet, saúde, academia)\n- Gastos variáveis estimados: ~R$ 1.200\n- Receita esperada: R$ 8.500\n\n**Saldo projetado: ~R$ 4.670** — confortável! Mas fique atento à renovação do plano de saúde no dia 20.';
  }

  if (q.match(/categor|onde|mercado|comida|restaurante/)) {
    return 'Analisando suas despesas deste mês:\n\n🛒 **Mercado** é o maior gasto fixo variável (~32% das despesas)\n🍽️ **Restaurante + Delivery** somam ~18% — acima do recomendado (10-12%)\n🚗 **Transporte** em 8% — razoável\n\n**Oportunidade:** reduzir delivery de R$ 254 para R$ 150 liberaria R$ 100/mês automaticamente.';
  }

  // Default
  return `Analisei sua pergunta sobre **"${input}"**. Com base nos seus dados:\n\nSeu padrão financeiro este mês está **controlado** — receitas cobrem as despesas com folga positiva. Continue acompanhando as categorias de restaurante e mercado, que são onde mais variam.\n\nPosso aprofundar em: gastos, metas, economia, investimentos ou projeção.`;
}

export function Advisor() {
  const [state] = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Oi! Sou o **Consultor Finança**. Posso analisar seus gastos, projetar saldo, sugerir cortes e te ajudar a planejar metas. O que quer saber?' },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const summary   = monthSummary(state.transactions, 0);
  const lastSum   = monthSummary(state.transactions, -1);
  const breakdown = categoryBreakdown(summary.transactions, 'expense').slice(0, 6);

  const context = `DADOS DO USUÁRIO (${summary.label}):
- Receitas: ${brl(summary.income)}
- Despesas: ${brl(summary.expense)}
- Saldo: ${brl(summary.balance)}
- Mês anterior: ${brl(lastSum.balance)}

TOP DESPESAS:
${breakdown.map(b => `- ${b.emoji} ${b.label}: ${brl(b.amount)} (${((b.amount/summary.expense)*100).toFixed(0)}%)`).join('\n')}

METAS:
${state.goals.map(g => `- ${g.emoji} ${g.title}: ${brl(g.current)}/${brl(g.target)} (${Math.round(g.current/g.target*100)}%)`).join('\n')}`;

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    // Simulate thinking delay for realism
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const reply = generateResponse(text, context);
    setMessages(m => [...m, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  const suggestions = ['Como estão meus gastos?', 'Como economizar?', 'Projeção do mês', 'Onde investir?'];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>
      {/* Header */}
      <div style={{ padding:'20px 18px 12px', borderBottom:'0.5px solid var(--line)', flexShrink:0 }}>
        <div className="fnz-eyebrow">Inteligência financeira</div>
        <h1 className="fnz-display" style={{ fontSize:28, margin:0, marginTop:4 }}>
          Consultor <span className="fnz-display-italic" style={{color:'var(--accent)'}}>IA</span>
        </h1>
        <div style={{ display:'flex', gap:6, marginTop:10, overflowX:'auto', paddingBottom:4 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} style={{ flexShrink:0, height:28, padding:'0 12px', borderRadius:999, border:'1px solid var(--line-2)', background:'var(--surface-2)', fontSize:11, fontWeight:500, color:'var(--muted)', cursor:'pointer', whiteSpace:'nowrap', transition:'border-color .15s, color .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line-2)';e.currentTarget.style.color='var(--muted)'}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="fnz-scroll" style={{ flex:1, overflowY:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map((m, i) => <ChatBubble key={i} msg={m} idx={i}/>)}
        {loading && <TypingDots/>}
      </div>

      {/* Input */}
      <div style={{ padding:'12px 18px 16px', borderTop:'0.5px solid var(--line)', flexShrink:0, display:'flex', gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send(input)}
          placeholder="Pergunte sobre suas finanças…" className="fnz-input" style={{ flex:1, height:44 }}/>
        <button onClick={() => send(input)} className="fnz-iconbtn" style={{ background: input.trim()?'var(--accent)':'var(--surface-2)', color: input.trim()?'white':'var(--muted)', border:0, transition:'background .2s', flexShrink:0 }}>
          <Icon name="send" size={16}/>
        </button>
      </div>
    </div>
  );
}

function ChatBubble({ msg, idx }: { msg: Message; idx: number }) {
  const isUser = msg.role === 'user';
  const [shown, setShown] = useState(idx === 0 ? msg.content : '');

  useEffect(() => {
    if (isUser || idx === 0) { setShown(msg.content); return; }
    let i = 0; setShown('');
    const id = setInterval(() => {
      i += 4;
      setShown(msg.content.slice(0, i));
      if (i >= msg.content.length) clearInterval(id);
    }, 10);
    return () => clearInterval(id);
  }, [msg.content]);

  return (
    <div className="fnz-rise" style={{ alignSelf: isUser?'flex-end':'flex-start', maxWidth:'85%' }}>
      {!isUser && <div className="fnz-eyebrow" style={{ fontSize:9, marginBottom:4, paddingLeft:12, color:'var(--accent)' }}>✦ Consultor</div>}
      <div style={{ padding:'12px 14px', borderRadius: isUser?'18px 18px 4px 18px':'4px 18px 18px 18px', background: isUser?'var(--ink)':'var(--surface)', color: isUser?'var(--bg)':'var(--ink)', border: isUser?0:'0.5px solid var(--line)', fontSize:14, lineHeight:1.55, boxShadow: isUser?'none':'var(--shadow-sm)', whiteSpace:'pre-wrap' }}>
        <Markdown text={shown}/>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ padding:'14px 18px', borderRadius:'4px 18px 18px 18px', background:'var(--surface)', border:'0.5px solid var(--line)', display:'flex', gap:5, alignItems:'center', alignSelf:'flex-start' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:6, height:6, borderRadius:999, background:'var(--muted-2)', animation:`fnz-dot 1.2s ease-in-out ${i*0.2}s infinite` }}/>
      ))}
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        const isBullet = /^[-*]\s/.test(line);
        if (isBullet) return (
          <div key={i} style={{ display:'flex', gap:8, paddingLeft:4, paddingTop: i===0?0:2 }}>
            <span style={{opacity:.5}}>•</span>
            <span style={{flex:1}}>{renderInline(line.replace(/^[-*]\s/,''))}</span>
          </div>
        );
        return <div key={i} style={{ paddingTop: i===0?0:6 }}>{renderInline(line)}</div>;
      })}
    </>
  );
}

function renderInline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
    p.startsWith('**') && p.endsWith('**')
      ? <b key={j} style={{fontWeight:700}}>{p.slice(2,-2)}</b>
      : <span key={j}>{p}</span>
  );
}
