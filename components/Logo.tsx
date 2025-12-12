
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
  layout?: 'horizontal' | 'vertical' | 'icon';
  slogan?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
    className = "h-12", 
    variant = 'color', 
    layout = 'horizontal',
    slogan = false
}) => {
  // Configuración de Colores
  const isWhite = variant === 'white';
  
  // IDs únicos para gradientes para evitar conflictos en el DOM
  const uniqueId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const gradId = `goldGradient-${uniqueId}`;

  const Defs = () => (
    <defs>
      {/* Gradiente Dorado de Lujo (Explosión) */}
      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isWhite ? "#FFFFFF" : "#FBF7E6"} />   {/* Cream/White */}
        <stop offset="25%" stopColor={isWhite ? "#FDE68A" : "#D97706"} />  {/* Dark Gold */}
        <stop offset="50%" stopColor={isWhite ? "#FFFBEB" : "#F59E0B"} />  {/* Bright Gold */}
        <stop offset="75%" stopColor={isWhite ? "#FDE68A" : "#B45309"} />  {/* Bronze */}
        <stop offset="100%" stopColor={isWhite ? "#FFFFFF" : "#FDE68A"} /> {/* Light Gold */}
      </linearGradient>
      
      {/* Filtro para brillo extra */}
      <filter id={`glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  // Partículas "Explotando" (Glitter Dust) - Simétrico
  const ExplosionParticles = () => (
    <g fill={`url(#${gradId})`} opacity="0.9">
       {/* Left Burst */}
       <circle cx="20" cy="60" r="0.8" opacity="0.6" />
       <circle cx="35" cy="30" r="1.2" filter={`url(#glow-${uniqueId})`} />
       <path d="M35,30 L36,28 L37,30 L39,31 L37,32 L36,34 L35,32 L33,31 Z" fill={isWhite ? "white" : "#FEF3C7"} opacity="0.8" /> 
       <circle cx="45" cy="80" r="0.6" />
       <circle cx="60" cy="20" r="0.8" />
       
       {/* Right Burst */}
       <circle cx="180" cy="60" r="0.8" opacity="0.6" />
       <circle cx="165" cy="30" r="1.2" filter={`url(#glow-${uniqueId})`} />
       <path d="M165,30 L166,28 L167,30 L169,31 L167,32 L166,34 L165,32 L163,31 Z" fill={isWhite ? "white" : "#FEF3C7"} opacity="0.8" />
       <circle cx="155" cy="80" r="0.6" />
       <circle cx="140" cy="20" r="0.8" />

       {/* Center Halo Particles */}
       <circle cx="100" cy="10" r="1" filter={`url(#glow-${uniqueId})`} />
       <circle cx="85" cy="15" r="0.5" />
       <circle cx="115" cy="15" r="0.5" />
       
       {/* Top Star */}
       <path d="M100,5 L101.5,0 L103,5 L108,6.5 L103,8 L101.5,13 L100,8 L95,6.5 Z" fill={isWhite ? "white" : "#FEF3C7"} /> 
    </g>
  );

  // Flor de Loto Realista y Artística (Capas Detalladas)
  const LotusIcon = () => (
    // Centered at x=50 within local group coordinates
    <g transform="translate(50, 0)">
       {/* Base Shadow/Glow */}
       <ellipse cx="50" cy="75" rx="45" ry="10" fill={`url(#${gradId})`} opacity="0.2" filter={`url(#glow-${uniqueId})`} />

       {/* Layer 1: Outer Wide Petals (Base) */}
       <path d="M50 75 Q 10 65 5 45 Q 0 60 50 85 Z" fill={`url(#${gradId})`} opacity="0.6" />
       <path d="M50 75 Q 90 65 95 45 Q 100 60 50 85 Z" fill={`url(#${gradId})`} opacity="0.6" />

       {/* Layer 2: Middle Petals (Volume) */}
       <path d="M50 75 Q 20 55 15 35 Q 5 45 50 75 Z" fill={`url(#${gradId})`} opacity="0.8" />
       <path d="M50 75 Q 80 55 85 35 Q 95 45 50 75 Z" fill={`url(#${gradId})`} opacity="0.8" />

       {/* Layer 3: Inner Petals (Cupping the center) */}
       <path d="M50 70 Q 30 50 30 30 Q 20 35 50 70 Z" fill={`url(#${gradId})`} opacity="0.9" />
       <path d="M50 70 Q 70 50 70 30 Q 80 35 50 70 Z" fill={`url(#${gradId})`} opacity="0.9" />

       {/* Layer 4: Central Bud (The core) */}
       <path d="M50 10 Q 70 40 50 70 Q 30 40 50 10 Z" fill={`url(#${gradId})`} />
       
       {/* Highlight on Central Bud */}
       <path d="M50 15 Q 55 30 50 50" fill="none" stroke={isWhite ? "white" : "#FFFBEB"} strokeWidth="0.5" opacity="0.6" />
    </g>
  );

  // --- VERTICAL LAYOUT (Standard/Centered) ---
  if (layout === 'vertical' || layout === 'icon') {
      return (
        <svg viewBox="0 0 200 180" className={`${className} drop-shadow-sm`} xmlns="http://www.w3.org/2000/svg">
            <Defs />
            
            {/* Background Burst effect */}
            <ExplosionParticles />
            
            {/* Lotus Top - Translate 50 to center the 100px wide lotus group in 200px viewbox */}
            <g transform="translate(50, 10)">
                <LotusIcon />
            </g>
            
            {/* Maine Text */}
            <text 
                x="100" 
                y="125" 
                textAnchor="middle" 
                fill={`url(#${gradId})`}
                fontFamily="'Great Vibes', cursive" 
                fontWeight="normal" 
                fontSize="55" 
                style={{ filter: `url(#glow-${uniqueId})` }}
            >
                Maine
            </text>
            
            {/* Spa Center Text */}
            <text 
                x="100" 
                y="150" 
                textAnchor="middle" 
                fill={isWhite ? 'white' : '#1e293b'} 
                fontFamily="sans-serif" 
                fontWeight="700" 
                fontSize="10" 
                letterSpacing="5"
                style={{ textTransform: 'uppercase' }}
            >
                SPA CENTER
            </text>

            {/* Slogan */}
            {slogan && (
                <text 
                    x="100" 
                    y="170" 
                    textAnchor="middle" 
                    fill={isWhite ? '#cbd5e1' : '#64748b'}
                    fontFamily="sans-serif" 
                    fontStyle="italic"
                    fontSize="8" 
                >
                    Tu cuerpo habla por ti
                </text>
            )}
        </svg>
      );
  }

  // --- HORIZONTAL LAYOUT (Header) ---
  return (
    <svg viewBox="0 0 300 80" className={`${className} drop-shadow-sm`} xmlns="http://www.w3.org/2000/svg">
        <Defs />
        
        {/* Lotus Left - Scale down slightly and position */}
        <g transform="translate(0, -5) scale(0.7)">
            <LotusIcon />
            {/* Extra particle for header flair */}
            <circle cx="50" cy="10" r="1.5" fill={isWhite ? "white" : "#FDE68A"} filter={`url(#glow-${uniqueId})`} />
        </g>

        {/* Text Right */}
        <g transform="translate(80, 10)">
            <text 
                x="0" 
                y="40" 
                fill={`url(#${gradId})`}
                fontFamily="'Great Vibes', cursive" 
                fontWeight="normal" 
                fontSize="50" 
                style={{ filter: `url(#glow-${uniqueId})` }}
            >
                Maine
            </text>
            <text 
                x="5" 
                y="60" 
                fill={isWhite ? 'white' : '#1e293b'} 
                fontFamily="sans-serif" 
                fontWeight="700" 
                fontSize="10" 
                letterSpacing="4"
                style={{ textTransform: 'uppercase' }}
            >
                SPA CENTER
            </text>
        </g>
    </svg>
  );
};

export default Logo;
