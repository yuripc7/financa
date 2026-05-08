import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { MobileApp, DesktopApp, PhoneFrame, WebFrame } from './App';
import { store } from './store';

// ─── Responsive: detect mobile vs desktop viewport ────────────────────
function Root() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const obs = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', obs);
    return () => window.removeEventListener('resize', obs);
  }, []);

  // On mobile viewports → show app directly (no frames)
  if (isMobile) {
    return (
      <div style={{ width:'100vw', height:'100vh', overflow:'hidden' }}>
        <MobileApp/>
      </div>
    );
  }

  // On desktop → show the full design canvas experience
  return <DesktopRoot/>;
}

function DesktopRoot() {
  // Initialize store auth state
  useEffect(() => {
    store.set({ onboarded: true, authed: true });
  }, []);

  return (
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden' }}>
      <DesktopApp/>
    </div>
  );
}

const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>
    <Root/>
  </StrictMode>
);
