import { useState } from 'react';
import { Icon } from '../components/Icon';

// ─── Onboarding ───────────────────────────────────────────────────────
interface OnboardingProps { onDone: () => void; }
export function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const slides = [
    { eyebrow:'No 01 / Boas-vindas', title:<>Seu dinheiro,<br/><span className="fnz-display-italic" style={{color:'var(--accent)'}}>com clareza.</span></>, copy:'Finança organiza tudo: receitas, despesas, metas e projeções. Sem planilha, sem dor de cabeça.', visual:'hero' },
    { eyebrow:'No 02 / Inteligência', title:<>Categoriza<br/><span className="fnz-display-italic">automaticamente.</span></>, copy:'Lance uma despesa e a IA acerta a categoria. Aprende com você. E ainda projeta seu saldo dos próximos 30 dias.', visual:'ai' },
    { eyebrow:'No 03 / Vamos lá',    title:<>Pronto para<br/><span className="fnz-display-italic" style={{color:'var(--accent)'}}>começar?</span></>,  copy:'Carregamos um mês de exemplo. Você pode editar, apagar ou começar do zero quando quiser.', visual:'go' },
  ];
  const s = slides[step], isLast = step === slides.length - 1;
  return (
    <div className="fnz-mobile" style={{ background:'var(--ink)', color:'var(--bg)' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'60px 24px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ display:'flex', gap:6, marginBottom:40 }}>
          {slides.map((_,i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:999, background: i<=step?'var(--accent)':'rgba(244,241,234,0.18)', transition:'background .3s' }}/>
          ))}
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <OnboardingVisual kind={s.visual} key={step}/>
        </div>
        <div className="fnz-rise" key={step}>
          <div className="fnz-eyebrow" style={{ color:'rgba(244,241,234,0.55)', marginBottom:14 }}>{s.eyebrow}</div>
          <h1 className="fnz-display" style={{ fontSize:44, margin:0, marginBottom:18 }}>{s.title}</h1>
          <p style={{ color:'rgba(244,241,234,0.7)', fontSize:15, lineHeight:1.5, margin:0, marginBottom:28 }}>{s.copy}</p>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button className="fnz-btn accent lg" style={{ flex:1 }} onClick={() => isLast ? onDone() : setStep(step+1)}>
              {isLast ? 'Começar' : 'Continuar'}
              <Icon name="arrow-up-right" size={18}/>
            </button>
            {!isLast && (
              <button onClick={onDone} style={{ background:'transparent', border:0, color:'rgba(244,241,234,0.55)', fontSize:13, padding:'14px 16px' }}>
                Pular
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingVisual({ kind }: { kind: string }) {
  if (kind === 'hero') return (
    <div className="fnz-rise" style={{ textAlign:'center', width:'100%' }}>
      <div className="fnz-eyebrow" style={{ color:'rgba(244,241,234,0.5)', marginBottom:8 }}>Saldo do mês</div>
      <div className="fnz-display" style={{ fontSize:92, color:'var(--bg)', letterSpacing:'-0.04em' }}>
        <span style={{opacity:.4}}>R$</span> 6,4<span style={{fontSize:'0.4em',opacity:.5}}>K</span>
      </div>
      <div style={{ display:'inline-flex', gap:6, alignItems:'center', background:'rgba(108,210,146,0.15)', color:'#6cd292', padding:'6px 12px', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:11, marginTop:10 }}>
        <Icon name="trending-up" size={12} stroke={2}/> +12% vs mês anterior
      </div>
    </div>
  );
  if (kind === 'ai') return (
    <div style={{ width:'100%', maxWidth:300, display:'flex', flexDirection:'column', gap:10 }}>
      {[
        { role:'user', text:'"Burger King R$ 32,40"' },
        { role:'ai',   text:'✓ Lançado como Restaurante · R$ 32,40' },
        { role:'user', text:'"Uber até o trabalho"' },
        { role:'ai',   text:'✓ Transporte · R$ 0 — confirme o valor!' },
      ].map((m, i) => (
        <div key={i} className="fnz-rise" style={{ animationDelay:`${i*0.1}s`, alignSelf: m.role==='user'?'flex-end':'flex-start', maxWidth:'85%', padding:'10px 14px', borderRadius: m.role==='user'?'18px 18px 4px 18px':'4px 18px 18px 18px', background: m.role==='user'?'rgba(244,241,234,0.12)':'rgba(255,91,31,0.18)', fontSize:13, color:'var(--bg)' }}>
          {m.text}
        </div>
      ))}
    </div>
  );
  return (
    <div className="fnz-rise" style={{ textAlign:'center' }}>
      <div style={{ fontSize:80, marginBottom:16 }}>🚀</div>
      <div className="fnz-display" style={{ fontSize:32, color:'var(--bg)' }}>Tudo pronto!</div>
    </div>
  );
}

// ─── PIN Login ────────────────────────────────────────────────────────
interface LoginProps { onDone: () => void; }
export function Login({ onDone }: LoginProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const CORRECT = '1234';
  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === CORRECT) { setTimeout(onDone, 300); }
      else { setTimeout(() => { setShake(true); setTimeout(() => { setPin(''); setShake(false); }, 500); }, 200); }
    }
  };
  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);
  return (
    <div className="fnz-mobile" style={{ background:'var(--ink)', color:'var(--bg)', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', padding:'0 24px', width:'100%', maxWidth:360 }}>
        <div style={{ marginBottom:48 }}>
          <Icon name="lock" size={32} color="var(--accent)"/>
          <div className="fnz-display" style={{ fontSize:32, marginTop:16, color:'var(--bg)' }}>Bem-vindo de volta</div>
          <div style={{ color:'rgba(244,241,234,0.55)', marginTop:8, fontSize:14 }}>Digite seu PIN <span style={{opacity:.45}}>(hint: 1234)</span></div>
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:48, animation: shake ? 'fnz-shake .4s' : 'none' }}>
          {dots.map((filled, i) => (
            <div key={i} style={{ width:16, height:16, borderRadius:999, border:'2px solid rgba(244,241,234,0.4)', background: filled?'var(--accent)':'transparent', transition:'background .15s, transform .15s', transform: filled?'scale(1.15)':'scale(1)' }}/>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, maxWidth:280, margin:'0 auto' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            d ? (
              <button key={i} onClick={() => d === '⌫' ? setPin(p => p.slice(0,-1)) : press(d)}
                style={{ height:64, borderRadius:18, border:'1px solid rgba(244,241,234,0.12)', background:'rgba(244,241,234,0.06)', color:'var(--bg)', fontSize: d==='⌫'?20:26, fontFamily:'var(--font-display)', fontWeight:600, cursor:'pointer', transition:'background .1s, transform .1s' }}
                onMouseDown={e => (e.currentTarget.style.background='rgba(244,241,234,0.15)', e.currentTarget.style.transform='scale(0.94)')}
                onMouseUp={e   => (e.currentTarget.style.background='rgba(244,241,234,0.06)', e.currentTarget.style.transform='scale(1)')}
                onMouseLeave={e=> (e.currentTarget.style.background='rgba(244,241,234,0.06)', e.currentTarget.style.transform='scale(1)')}>
                {d}
              </button>
            ) : <div key={i}/>
          ))}
        </div>
      </div>
      <style>{`@keyframes fnz-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
    </div>
  );
}
