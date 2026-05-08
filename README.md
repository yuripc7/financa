# Finança 💰

App de **controle financeiro pessoal** moderno — React + TypeScript + Vite. Design editorial, animações fluidas, Consultor IA e suporte mobile + desktop.

## ✨ Funcionalidades

- 📊 **Dashboard** — saldo animado, gráfico cumulativo, breakdown por categoria
- 💸 **Lançamentos** — busca, filtros por categoria e tipo, auto-categorização por palavras-chave
- 📈 **Relatórios** — comparativo 6 meses, projeção 30 dias, breakdown com barras animadas
- 🎯 **Metas** — progresso visual, conquistas, divisão de despesas (splits)
- 🤖 **Consultor IA** — análise inteligente dos seus dados financeiros com resposta contextual
- 🌙 **Dark mode** — toggle no sidebar desktop
- 📱 **Responsivo** — mobile (app) + desktop (sidebar) automático

## 🚀 Rodando localmente

```bash
git clone https://github.com/yuripc7/financa.git
cd financa
npm install
npm run dev
```

Abra http://localhost:5173

## 🚀 Deploy

### Vercel (recomendado)
1. Importe o repo em [vercel.com/new](https://vercel.com/new)
2. Framework: **Vite** (detectado automaticamente)
3. Deploy — sem configurações extras

### GitHub Pages
```bash
npm run build
# suba a pasta dist/ como GitHub Pages (Actions)
```

## 🏗️ Estrutura

```
src/
├── main.tsx              ← Entry point (detecção mobile/desktop)
├── App.tsx               ← MobileApp + DesktopApp + frames
├── store.ts              ← Estado global (localStorage + subscriber)
├── utils.ts              ← Formatadores, agregações, forecast
├── styles.css            ← Design system (tokens, animações)
├── hooks/
│   └── useAnimatedValue.ts  ← Contador animado + relógio em tempo real
├── components/
│   ├── Icon.tsx          ← Ícones SVG inline
│   └── Charts.tsx        ← Donut, Sparkline, LineChart, BarPair
└── screens/
    ├── Auth.tsx          ← Onboarding + PIN login
    ├── Dashboard.tsx     ← Visão geral
    ├── Entries.tsx       ← Lançamentos + modal de adição
    ├── Reports.tsx       ← Relatório financeiro
    ├── Goals.tsx         ← Metas + conquistas + splits
    └── Advisor.tsx       ← Consultor IA com mock inteligente
```

## 🛠️ Tecnologias

- **React 18** + **TypeScript** — tipagem completa
- **Vite 6** — build ultrarrápido
- **CSS puro** — design tokens, dark mode, animações
- **localStorage** — persistência sem servidor
- **SVG inline** — gráficos sem dependências externas

## 📝 Notas

- O Consultor IA usa respostas inteligentes baseadas nos seus dados reais (sem API key necessária)
- Os dados de exemplo são gerados automaticamente — limpe-os pelo botão de reset no sidebar
- PIN padrão: **1234**
