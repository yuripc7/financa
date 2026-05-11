import { useState } from 'react';
import { Icon } from '../components/Icon';
import { registerUser, loginUser, validateEmail, validatePassword } from '../auth';
import type { StoredUser } from '../auth';

interface OnboardingProps { onDone: () => void; }
export function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const slides = [
    { eyebrow:'No 01 / Boas-vindas', title:<>Seu dinheiro,<br/><span className="fnz-display-italic" style={{color:'var(--accent)'}}>com clareza.</span></>, copy:'Finança organiza tudo: receitas, despesas, metas e projeções. Sem planilha, sem dor de cabeça.', emoji:'💰' },
    { eyebrow:'No 02 / Inteligência', title:<>Categoriza<br/><span className="fnz-display-italic">automaticamente.</span></>, copy:'Lance uma despesa e a IA acerta a categoria. E ainda projeta seu saldo dos próximos 30 dias.', emoji:'🤖' },
    { eyebrow:'No 03 / Vamos lá', title:<>Pronto para<br/><span className="fnz-display-italic" style={{color:'var(--accent)'}}>começar?</span></>, copy:'Crie sua conta gratuita em menos de 1 minuto. Seus dados ficam no seu dispositivo.', emoji:'🚀' },
  ];
  const s = slides[step], isLast = step === slides.length - 1;
  return (
    <div className="fnz-mobile" style={{ background:'var(--ink)', color:'var(--bg)' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'60px 28px 32px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:48 }}>
          {slides.map((_,i) => <div key={i} style={{ flex:1, height:3, borderRadius:999, background: i<=step?'var(--accent)':'rgba(244,241,234,0.18)', transition:'background .3s' }}/>)}
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="fnz-rise" key={step} style={{ fontSize:100, textAlign:'center' }}>{s.emoji}</div>
        </div>
        <div className="fnz-rise" key={`t${step}`}>
          <div className="fnz-eyebrow" style={{ color:'rgba(244,241,234,0.55)', marginBottom:14 }}>{s.eyebrow}</div>
          <h1 className="fnz-display" style={{ fontSize:42, margin:'0 0 16px', lineHeight:1.0 }}>{s.title}</h1>
          <p style={{ color:'rgba(244,241,234,0.7)', fontSize:15, lineHeight:1.6, margin:'0 0 32px' }}>{s.copy}</p>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button className="fnz-btn accent lg" style={{ flex:1 }} onClick={() => isLast ? onDone() : setStep(step+1)}>
              {isLast ? 'Criar minha conta' : 'Continuar'} <Icon name="arrow-up-right" size={18}/>
            </button>
            {!isLast && <button onClick={onDone} style={{ background:'transparent', border:0, color:'rgba(244,241,234,0.5)', fontSize:13, padding:'14px 16px', cursor:'pointer' }}>Pular</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthScreenProps { onDone: (user: StoredUser) => void; }
export function AuthScreen({ onDone }: AuthScreenProps) {
  const [mode, setMode] = useState<'login'|'register'|'forgot'>('login');
  return (
    <div className="fnz-mobile" style={{ background:'var(--bg)' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'0 24px 40px' }} className="fnz-scroll">
        <div style={{ paddingTop:64, paddingBottom:36, textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:10 }}>💰</div>
          <div className="fnz-display" style={{ fontSize:38, letterSpacing:'-0.04em' }}>
            Finança<span style={{color:'var(--accent)'}}>.</span>
          </div>
          <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Controle financeiro pessoal</div>
        </div>
        {mode==='login'    && <LoginForm    onDone={onDone} onRegister={()=>setMode('register')} onForgot={()=>setMode('forgot')}/>}
        {mode==='register' && <RegisterForm onDone={onDone} onLogin={()=>setMode('login')}/>}
        {mode==='forgot'   && <ForgotForm   onBack={()=>setMode('login')}/>}
      </div>
    </div>
  );
}

function LoginForm({ onDone, onRegister, onForgot }: { onDone:(u:StoredUser)=>void; onRegister:()=>void; onForgot:()=>void }) {
  const [email,setEmail]     = useState('');
  const [password,setPassword] = useState('');
  const [showPw,setShowPw]   = useState(false);
  const [error,setError]     = useState('');
  const [loading,setLoading] = useState(false);
  const submit = async () => {
    setError('');
    if (!email||!password) { setError('Preencha todos os campos.'); return; }
    if (!validateEmail(email)) { setError('E-mail inválido.'); return; }
    setLoading(true);
    await new Promise(r=>setTimeout(r,600));
    const res = loginUser(email, password);
    setLoading(false);
    if (typeof res==='string') { setError(res); return; }
    onDone(res);
  };
  return (
    <div className="fnz-rise-stagger">
      <div style={{ marginBottom:22 }}>
        <h2 className="fnz-display" style={{ fontSize:28, margin:0 }}>Entrar</h2>
        <p style={{ color:'var(--muted)', fontSize:13, margin:'5px 0 0' }}>Bem-vindo de volta!</p>
      </div>
      {error && <ErrBanner msg={error} onClose={()=>setError('')}/>}
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:12 }}>
        <Field label="E-mail" value={email} onChange={setEmail} placeholder="seu@email.com" type="email" autoComplete="email" onEnter={submit}/>
        <div>
          <label style={labelStyle}>Senha</label>
          <div style={{ position:'relative' }}>
            <input value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
              type={showPw?'text':'password'} placeholder="••••••" className="fnz-input" style={{ paddingRight:46 }} autoComplete="current-password"/>
            <button onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute',right:13,top:14,background:'none',border:'none',color:'var(--muted)',cursor:'pointer' }}>
              <Icon name={showPw?'eye-off':'eye'} size={16}/>
            </button>
          </div>
        </div>
      </div>
      <button onClick={onForgot} style={{ background:'none',border:'none',color:'var(--accent)',fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:18,padding:0,display:'block' }}>Esqueci minha senha</button>
      <button onClick={submit} className="fnz-btn accent" style={{ width:'100%',height:52 }} disabled={loading}>
        {loading?<Spin/>:<><Icon name="arrow-up-right" size={18}/> Entrar</>}
      </button>
      <p style={{ textAlign:'center',marginTop:22,fontSize:14,color:'var(--muted)' }}>
        Não tem conta?{' '}
        <button onClick={onRegister} style={{ background:'none',border:'none',color:'var(--accent)',fontWeight:700,fontSize:14,cursor:'pointer',padding:0 }}>Criar conta grátis</button>
      </p>
      <div style={{ marginTop:28,padding:'14px 16px',borderRadius:12,background:'var(--surface-2)',border:'1px dashed var(--line-2)' }}>
        <div style={{ fontSize:10,fontWeight:600,color:'var(--muted)',fontFamily:'var(--font-mono)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5 }}>Primeiro acesso?</div>
        <div style={{ fontSize:12,color:'var(--muted)',lineHeight:1.5 }}>Clique em "Criar conta grátis" e cadastre seu e-mail e senha.</div>
      </div>
    </div>
  );
}

function RegisterForm({ onDone, onLogin }: { onDone:(u:StoredUser)=>void; onLogin:()=>void }) {
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[pw,setPw]=useState(''),[confirm,setConfirm]=useState(''),[showPw,setShowPw]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  const strength=pw.length===0?0:pw.length<6?1:pw.length<10?2:3;
  const strLabel=['','Fraca','Média','Forte'],strColor=['','var(--loss)','var(--gold)','var(--gain)'];
  const submit=async()=>{
    setError('');
    if(!name.trim()){setError('Digite seu nome.');return;}
    if(!validateEmail(email)){setError('E-mail inválido.');return;}
    const pErr=validatePassword(pw);if(pErr){setError(pErr);return;}
    if(pw!==confirm){setError('As senhas não coincidem.');return;}
    setLoading(true);await new Promise(r=>setTimeout(r,700));
    const res=registerUser(name,email,pw);setLoading(false);
    if(typeof res==='string'){setError(res);return;}onDone(res);
  };
  return(
    <div className="fnz-rise-stagger">
      <div style={{marginBottom:22}}><h2 className="fnz-display" style={{fontSize:28,margin:0}}>Criar conta</h2><p style={{color:'var(--muted)',fontSize:13,margin:'5px 0 0'}}>Grátis, sem cartão.</p></div>
      {error&&<ErrBanner msg={error} onClose={()=>setError('')}/>}
      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
        <Field label="Nome" value={name} onChange={setName} placeholder="Seu nome completo" autoComplete="name"/>
        <Field label="E-mail" value={email} onChange={setEmail} placeholder="seu@email.com" type="email" autoComplete="email"/>
        <div>
          <label style={labelStyle}>Senha</label>
          <div style={{position:'relative'}}>
            <input value={pw} onChange={e=>setPw(e.target.value)} type={showPw?'text':'password'} placeholder="Mínimo 6 caracteres" className="fnz-input" style={{paddingRight:46}} autoComplete="new-password"/>
            <button onClick={()=>setShowPw(s=>!s)} style={{position:'absolute',right:13,top:14,background:'none',border:'none',color:'var(--muted)',cursor:'pointer'}}><Icon name={showPw?'eye-off':'eye'} size={16}/></button>
          </div>
          {pw.length>0&&(<div style={{display:'flex',gap:4,marginTop:6,alignItems:'center'}}>{[1,2,3].map(i=><div key={i} style={{flex:1,height:3,borderRadius:999,background:strength>=i?strColor[strength]:'var(--line-2)',transition:'background .3s'}}/>)}<span style={{fontSize:10,fontFamily:'var(--font-mono)',color:strColor[strength],marginLeft:6,fontWeight:700}}>{strLabel[strength]}</span></div>)}
        </div>
        <Field label="Confirmar senha" value={confirm} onChange={setConfirm} placeholder="Repita a senha" type="password" autoComplete="new-password"/>
      </div>
      <button onClick={submit} className="fnz-btn accent" style={{width:'100%',height:52}} disabled={loading}>{loading?<Spin/>:<><Icon name="check" size={18}/> Criar minha conta</>}</button>
      <p style={{textAlign:'center',marginTop:22,fontSize:14,color:'var(--muted)'}}>Já tem conta?{' '}<button onClick={onLogin} style={{background:'none',border:'none',color:'var(--accent)',fontWeight:700,fontSize:14,cursor:'pointer',padding:0}}>Entrar</button></p>
    </div>
  );
}

function ForgotForm({onBack}:{onBack:()=>void}){
  const [email,setEmail]=useState(''),[sent,setSent]=useState(false),[loading,setLoading]=useState(false);
  const submit=async()=>{if(!validateEmail(email))return;setLoading(true);await new Promise(r=>setTimeout(r,900));setLoading(false);setSent(true);};
  return(<div className="fnz-rise-stagger"><button onClick={onBack} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,padding:0,marginBottom:24}}><Icon name="chevron-left" size={16}/> Voltar</button>
    {!sent?(<><h2 className="fnz-display" style={{fontSize:28,margin:'0 0 8px'}}>Recuperar senha</h2><p style={{color:'var(--muted)',fontSize:13,lineHeight:1.5,margin:'0 0 22px'}}>Como seus dados são locais, não há recuperação por e-mail real — mas você pode criar uma nova conta.</p><Field label="E-mail cadastrado" value={email} onChange={setEmail} placeholder="seu@email.com" type="email"/><button onClick={submit} className="fnz-btn accent" style={{width:'100%',height:52,marginTop:16}} disabled={loading}>{loading?<Spin/>:'Continuar'}</button></>) : (<div style={{textAlign:'center',paddingTop:16}}><div style={{fontSize:60,marginBottom:16}}>✉️</div><div className="fnz-display" style={{fontSize:26,marginBottom:10}}>Verifique seu e-mail!</div><p style={{color:'var(--muted)',fontSize:13,lineHeight:1.5,marginBottom:24}}>Instruções enviadas (simulação local).</p><button onClick={onBack} className="fnz-btn ghost" style={{width:'100%',height:48}}>Voltar ao login</button></div>)}
  </div>);
}

const labelStyle:React.CSSProperties={fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--font-mono)',textTransform:'uppercase',letterSpacing:'0.08em'};
function Field({label,value,onChange,placeholder,type='text',autoComplete,onEnter}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;autoComplete?:string;onEnter?:()=>void}){
  return(<div><label style={labelStyle}>{label}</label><input value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onEnter?.()} type={type} placeholder={placeholder} className="fnz-input" autoComplete={autoComplete}/></div>);
}
function ErrBanner({msg,onClose}:{msg:string;onClose:()=>void}){
  return(<div className="fnz-rise" style={{display:'flex',alignItems:'center',gap:10,padding:'11px 13px',borderRadius:10,background:'var(--loss-soft)',border:'1px solid var(--loss)',marginBottom:14}}><Icon name="x" size={13} color="var(--loss)" stroke={2.5}/><span style={{flex:1,fontSize:13,color:'var(--loss)',fontWeight:500}}>{msg}</span><button onClick={onClose} style={{background:'none',border:'none',color:'var(--loss)',cursor:'pointer',padding:0}}><Icon name="x" size={13}/></button></div>);
}
function Spin(){
  return <div style={{width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'fnz-spin .7s linear infinite'}}/>;
}
