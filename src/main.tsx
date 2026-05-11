import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { MobileApp, DesktopApp } from './App';

function Root() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const obs = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', obs);
    return () => window.removeEventListener('resize', obs);
  }, []);
  if (isMobile) return (
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden' }}><MobileApp/></div>
  );
  return <DesktopRoot/>;
}

function DesktopRoot() {
  return (
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden' }}><DesktopApp/></div>
  );
}

const root = document.getElementById('root')!;
createRoot(root).render(<StrictMode><Root/></StrictMode>);
