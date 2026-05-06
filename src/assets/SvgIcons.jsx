// src/assets/SvgIcons.jsx
// 内联 SVG 卡牌/敌人/UI 图标，暗黑血腥献祭主题

/* ============ 卡牌类型图标 ============ */

export function SwordIcon({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32"><defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c0c0c0"/><stop offset="100%" stopColor="#ff6080"/></linearGradient></defs><path d="M4 28 L16 6 L18 4 L20 6 L22 4 L24 6 L26 4 L28 6 L16 28 Z" fill="url(#sg)" stroke="#fff" strokeWidth="0.5" opacity="0.9"/><rect x="18" y="26" width="4" height="6" rx="1" fill="#8B4513"/><rect x="17" y="24" width="6" height="3" rx="1" fill="#A0522D"/></svg>
}

export function ShieldIcon({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32"><defs><linearGradient id="shg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8f5cff"/><stop offset="100%" stopColor="#c084fc"/></linearGradient></defs><path d="M16 2 L28 8 L28 16 Q28 26 16 30 Q4 26 4 16 L4 8 Z" fill="url(#shg)" stroke="#a78bfa" strokeWidth="1"/><path d="M12 14 L15 18 L20 11" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export function CurseIcon({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32"><defs><radialGradient id="curg"><stop offset="0%" stopColor="#ff2040"/><stop offset="100%" stopColor="#4a0020"/></radialGradient></defs><circle cx="16" cy="16" r="13" fill="url(#curg)" stroke="#ff4060" strokeWidth="1"/><path d="M10 10 L22 22 M22 10 L10 22" stroke="#ffb3c0" strokeWidth="2.5" strokeLinecap="round"/></svg>
}

/* ============ 敌人插画 ============ */

export function SlimeSvg({ size = 48 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><defs><radialGradient id="slg" cx="0.4" cy="0.3"><stop offset="0%" stopColor="#6eb5ff"/><stop offset="100%" stopColor="#1a3a5c"/></radialGradient></defs><ellipse cx="24" cy="32" rx="18" ry="14" fill="url(#slg)" stroke="#8ed0ff" strokeWidth="1"/><ellipse cx="24" cy="28" rx="16" ry="12" fill="url(#slg)" opacity="0.6"/><circle cx="17" cy="26" r="3" fill="#fff"/><circle cx="31" cy="26" r="3" fill="#fff"/><circle cx="18" cy="26" r="1.5" fill="#0a0a1a"/><circle cx="32" cy="26" r="1.5" fill="#0a0a1a"/></svg>
}

export function FangSvg({ size = 48 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><defs><linearGradient id="fgg"><stop offset="0%" stopColor="#d4a574"/><stop offset="100%" stopColor="#5c3a1e"/></linearGradient></defs><ellipse cx="24" cy="26" rx="16" ry="12" fill="url(#fgg)" stroke="#e8c9a0" strokeWidth="1"/><path d="M14 18 L10 8 L18 16" fill="#ff6030"/><path d="M34 18 L38 8 L30 16" fill="#ff6030"/><circle cx="18" cy="23" r="2.5" fill="#ff2040"/><circle cx="30" cy="23" r="2.5" fill="#ff2040"/></svg>
}

export function PriestSvg({ size = 48 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><defs><linearGradient id="prg"><stop offset="0%" stopColor="#2a1a3a"/><stop offset="100%" stopColor="#0a0a1a"/></linearGradient><radialGradient id="prh"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#2a1a3a"/></radialGradient></defs><rect x="12" y="10" width="24" height="30" rx="6" fill="url(#prg)" stroke="#4a3a5a" strokeWidth="1.5"/><circle cx="24" cy="14" r="10" fill="url(#prh)" stroke="#8f5cff" strokeWidth="1"/><circle cx="20" cy="12" r="2.5" fill="#ff4060"/><circle cx="28" cy="12" r="2.5" fill="#ff4060"/><path d="M20 20 L28 20" stroke="#c084fc" strokeWidth="1.5"/></svg>
}

export function BossSvg({ size = 56 }) {
  return <svg width={size} height={size} viewBox="0 0 56 56"><defs><radialGradient id="bsg"><stop offset="0%" stopColor="#ff2040"/><stop offset="60%" stopColor="#8a0020"/><stop offset="100%" stopColor="#1a0008"/></radialGradient></defs><circle cx="28" cy="28" r="24" fill="url(#bsg)" stroke="#ff4060" strokeWidth="2"/><circle cx="19" cy="22" r="4" fill="#0a0a0a"/><circle cx="37" cy="22" r="4" fill="#0a0a0a"/><circle cx="19" cy="22" r="1.5" fill="#fff"/><circle cx="37" cy="22" r="1.5" fill="#fff"/><circle cx="28" cy="30" r="4" fill="#0a0a0a"/><circle cx="28" cy="30" r="1.5" fill="#ff4060"/><path d="M18 38 Q28 44 38 38" stroke="#ff6080" strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M8 16 L14 14 M48 16 L42 14" stroke="#ff4060" strokeWidth="1.5" strokeDasharray="3 2"/></svg>
}

/* ============ UI 装饰图标 ============ */

export function EnergyOrb({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 18 18"><defs><radialGradient id="eog"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#4a1a8a"/></radialGradient></defs><circle cx="9" cy="9" r="8" fill="url(#eog)" stroke="#a78bfa" strokeWidth="1"/><path d="M9 3 L12 9 L9.5 9 L10 15 L6 9 L8.5 9 Z" fill="#fff" opacity="0.8"/></svg>
}

export function HeartIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 18 18"><defs><radialGradient id="hrg"><stop offset="0%" stopColor="#ff4060"/><stop offset="100%" stopColor="#8a0020"/></radialGradient></defs><path d="M9 15 Q1 10 1 5 Q1 1 5 1 Q8 1 9 4 Q10 1 13 1 Q17 1 17 5 Q17 10 9 15Z" fill="url(#hrg)" stroke="#ff6080" strokeWidth="0.8"/></svg>
}

export function EyeIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 18 18"><defs><radialGradient id="eyg"><stop offset="0%" stopColor="#ffb347"/><stop offset="100%" stopColor="#8a4000"/></radialGradient></defs><ellipse cx="9" cy="9" rx="8" ry="6" fill="url(#eyg)" stroke="#ffc670" strokeWidth="1"/><circle cx="9" cy="9" r="3" fill="#0a0a0a"/><circle cx="9" cy="9" r="1.5" fill="#ff2040"/><path d="M1 6 Q9 1 17 6 M1 12 Q9 17 17 12" stroke="#ff4060" strokeWidth="0.8" fill="none"/></svg>
}

/* ============ 背景装饰 ============ */

export function BloodDrop({ size = 12, style }) {
  return <svg width={size} height={size} viewBox="0 0 12 12" style={style}><defs><radialGradient id="bdg"><stop offset="0%" stopColor="#ff4060"/><stop offset="100%" stopColor="#8a0020"/></radialGradient></defs><path d="M6 11 Q1 7 1 4 Q1 1 6 1 Q11 1 11 4 Q11 7 6 11Z" fill="url(#bdg)" opacity="0.6"/></svg>
}

export function RuneCircle({ size = 40 }) {
  return <svg width={size} height={size} viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="none" stroke="#ff4060" strokeWidth="1.5" opacity="0.3" strokeDasharray="8 4"/><circle cx="20" cy="20" r="10" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.3"/><path d="M20 2 L22 8 L20 12 M20 38 L18 32 L20 28 M2 20 L8 18 L12 20 M38 20 L32 22 L28 20" stroke="#ff6080" strokeWidth="1" fill="none" opacity="0.4"/></svg>
}

export function ShadowParticle({ size = 6, style }) {
  return <svg width={size} height={size} viewBox="0 0 6 6" style={style}><circle cx="3" cy="3" r="3" fill="#a78bfa" opacity="0.15"/></svg>
}

/* ============ 卡牌正面模板 ============ */

export function CardBackSvg({ size = 60 }) {
  return <svg width={size} height={size * 1.4} viewBox="0 0 60 84"><defs><linearGradient id="cbg"><stop offset="0%" stopColor="#3a1a4a"/><stop offset="100%" stopColor="#0a0a1a"/></linearGradient></defs><rect x="1" y="1" width="58" height="82" rx="6" fill="url(#cbg)" stroke="#4a2a5a" strokeWidth="1.5"/><circle cx="30" cy="42" r="20" fill="none" stroke="#ff4060" strokeWidth="1.5" opacity="0.4"/><circle cx="30" cy="42" r="14" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.3"/><path d="M20 28 L24 24 L28 28 L24 32 Z M40 56 L36 52 L32 56 L36 60 Z" fill="#ff4060" opacity="0.5"/></svg>
}

/* ============ 特效覆盖 ============ */

export function GlowOverlay({ size = 100, color = '#ff4060' }) {
  return <svg width={size} height={size} viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="48" ry="48" fill={color} opacity="0.08"/></svg>
}

export function SacrificeSigil({ size = 32 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 2 L18 10 L26 6 L22 14 L30 16 L22 18 L26 26 L18 22 L16 30 L14 22 L6 26 L10 18 L2 16 L10 14 L6 6 L14 10 Z" fill="#ff2040" opacity="0.5" stroke="#ff6080" strokeWidth="0.5"/></svg>
}