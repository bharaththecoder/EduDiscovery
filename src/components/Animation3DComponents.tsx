import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
//  ⚡ TEEN-ATTRACTING INTERACTIVE ANIMATIONS v2.0
//  Modern, bouncy, Gen-Z aesthetic components
// ═══════════════════════════════════════════════════════════════

// ── Intersection Observer Hook for scroll-triggered animations ──
export function useScrollReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

// ── MAGNETIC BUTTON ─────────────────────────────────────────────
/** Button that subtly pulls toward cursor on hover (Gen-Z aesthetic) */
export function MagneticButton({
  children,
  onClick,
  className = '',
  strength = 0.3,
  style = {},
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
  style?: React.CSSProperties;
} & React.ComponentPropsWithoutRef<typeof motion.button>) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, ...style }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ── SPOTLIGHT CARD ──────────────────────────────────────────────
/** Card with a spotlight effect that follows the mouse */
export function SpotlightCard({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`spotlight-card ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      <div
        className="spotlight-glow"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isHovering
            ? `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(16,185,129,0.15), transparent 40%)`
            : 'none',
          pointerEvents: 'none',
          transition: 'opacity 0.3s',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── SCROLL VELOCITY TEXT ───────────────────────────────────────
/** Text that skews based on scroll velocity for a dynamic feel */
export function VelocityText({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [velocity, setVelocity] = useState(0);
  const lastScroll = useRef(0);

  useEffect(() => {
    let lastTime = performance.now();
    const handleScroll = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      const scrollDelta = window.scrollY - lastScroll.current;
      const v = scrollDelta / delta;
      setVelocity(Math.max(-20, Math.min(20, v * 0.001)));
      lastScroll.current = window.scrollY;
      lastTime = now;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      ref={ref}
      animate={{ skewX: velocity }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── BOUNCE IN ON SCROLL ───────────────────────────────────────
/** Element that bounces in when scrolled into view */
export function BounceIn({
  children,
  delay = 0,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, isInView } = useScrollReveal(0.15);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── STAGGERED CHILDREN ────────────────────────────────────────
/** Container that staggers children's entrance animations */
export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, isInView } = useScrollReveal(0.1);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay }
        }
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── CONFETTI BUTTON ───────────────────────────────────────────
/** Button that triggers confetti on click */
export function ConfettiButton({
  children,
  onClick,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    setShowConfetti(true);
    onClick?.();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
        style={style}
      >
        {children}
      </motion.button>
      {showConfetti && <ConfettiExplosion count={40} />}
    </div>
  );
}

// ── PARALLAX IMAGE ──────────────────────────────────────────────
/** Image with parallax scroll effect */
export function ParallaxImage({
  src,
  alt = '',
  speed = 0.5,
  className = '',
  style = {}
}: {
  src: string;
  alt?: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            setOffset(scrollPercent * 100 * speed);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden', ...style }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          width: '100%',
          height: '120%',
          objectFit: 'cover',
          transform: `translateY(${offset}px)`
        }}
      />
    </div>
  );
}

// ── GLITCH TEXT ───────────────────────────────────────────────
/** Cyberpunk-style glitch text effect */
export function GlitchText({
  text,
  className = '',
  style = {}
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`glitch-text ${className}`} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{text}</span>
      <span className="glitch-before" style={{ position: 'absolute', top: 0, left: 0, clipPath: 'inset(0 0 50% 0)', color: '#00D4FF', animation: 'glitch-anim-1 2s infinite linear alternate-reverse' }}>
        {text}
      </span>
      <span className="glitch-after" style={{ position: 'absolute', top: 0, left: 0, clipPath: 'inset(50% 0 0 0)', color: '#EF4444', animation: 'glitch-anim-2 3s infinite linear alternate-reverse' }}>
        {text}
      </span>
    </div>
  );
}

// ── MORPHING BACKGROUND ───────────────────────────────────────
/** Dynamic background with morphing shapes */
export function MorphingBackground({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`morphing-bg ${className}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div className="morph-shape shape-1" />
      <div className="morph-shape shape-2" />
      <div className="morph-shape shape-3" />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── RIPPLE BUTTON ───────────────────────────────────────────────
/** Button with ripple effect on click */
export function RippleButton({
  children,
  onClick,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`ripple-btn ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple-spread 0.6s ease-out forwards'
          }}
        />
      ))}
      {children}
    </button>
  );
}

// ── FLOATING PARTICLES CANVAS ───────────────────────────────────
/** Canvas-based floating particles with mouse interaction */
export function FloatingParticlesCanvas({
  count = 50,
  color = '#10B981',
  className = '',
  style = {}
}: {
  count?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      particlesRef.current.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99; // friction
        p.vy *= 0.99;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba');
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [count, color]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        ...style
      }}
    />
  );
}

// ── ORBIT RING ─────────────────────────────────────────────────
export function OrbitRing({
  children,
  size = 200,
  color = 'var(--primary)',
  duration = 8,
  thickness = 2,
  reverse = false,
  style = {}
}: {
  children?: React.ReactNode;
  size?: number;
  color?: string;
  duration?: number;
  thickness?: number;
  reverse?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${thickness}px dashed ${color}`,
        animation: `spin ${duration}s linear infinite ${reverse ? 'reverse' : 'normal'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ── FLOATING EMOJI 3D ───────────────────────────────────────────
export function FloatingEmoji3D({
  emoji,
  size = 40,
  style = {},
  className = ''
}: {
  emoji: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -12, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        fontSize: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))',
        ...style
      }}
    >
      {emoji}
    </motion.div>
  );
}

// ── HOLOGRAPHIC BADGE ───────────────────────────────────────────
export function HolographicBadge({
  children,
  style = {},
  className = ''
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`holographic-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '99px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
        border: '1.5px solid rgba(16,185,129,0.4)',
        boxShadow: '0 0 15px rgba(16,185,129,0.2)',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ── ANIMATED COUNTER 3D ─────────────────────────────────────────
export function AnimatedCounter3D({
  value,
  suffix = '',
  label,
  duration = 2
}: {
  value: number | string;
  suffix?: string;
  label?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [numericValue, duration]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)' }}>
        {count}{suffix}
      </div>
      {label && <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{label}</div>}
    </div>
  );
}

// ── CONFETTI EXPLOSION ──────────────────────────────────────────
export function ConfettiExplosion({ count = 30 }: { count?: number }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; angle: number; speed: number }>>([]);

  useEffect(() => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      angle: Math.random() * 360,
      speed: Math.random() * 5 + 2
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: '50%', y: '50%', scale: 1, opacity: 1 }}
          animate={{
            x: `calc(50% + ${Math.cos(p.angle * Math.PI / 180) * p.speed * 20}px)`,
            y: `calc(50% + ${Math.sin(p.angle * Math.PI / 180) * p.speed * 20 + 80}px)`,
            rotate: p.angle * 3,
            opacity: 0,
            scale: 0.5
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
}

// ── STAR FIELD ──────────────────────────────────────────────────
export function StarField({ count = 50, width, height, speed = 1 }: { count?: number; width?: number; height?: number; speed?: number }) {
  const [stars, setStars] = useState<Array<{ id: number; top: string; left: string; size: number; delay: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: count }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5
    }));
    setStars(newStars);
  }, [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map(s => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: (2 + Math.random() * 3) / speed, repeat: Infinity, delay: s.delay }}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            backgroundColor: '#fff',
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );
}

// ── WAVE DIVIDER ────────────────────────────────────────────────
export function WaveDivider() {
  return (
    <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, transform: 'rotate(180deg)' }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: 'relative', display: 'block', width: 'calc(100% + 1.3px)', height: '50px' }}>
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,55.05,16.3,87.6,22.05,161,34.8,248.8,42.8,321.39,56.44Z" style={{ fill: 'var(--surface-alt, #0f172a)' }}></path>
      </svg>
    </div>
  );
}

// ── GLASS TILT PANEL ────────────────────────────────────────────
export function GlassTiltPanel({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── INTERACTIVE FLUID PARTICLES ─────────────────────────────────
export function InteractiveFluidParticles({
  count = 30,
  color = 'rgba(16,185,129,0.15)',
  className = '',
  style = {}
}: {
  count?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <FloatingParticlesCanvas
      count={count}
      color={color}
      className={className}
      style={style}
    />
  );
}

// ── RADAR SWEEP ─────────────────────────────────────────────────
export function RadarSweep() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '1px solid rgba(16,185,129,0.3)',
        position: 'absolute',
        animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
      }} />
    </div>
  );
}

// ── GLOW BUTTON ─────────────────────────────────────────────────
export function GlowButton({
  children,
  onClick,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className={`glow-button ${className}`}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        background: 'var(--primary)',
        color: '#fff',
        boxShadow: '0 0 15px rgba(16,185,129,0.5)',
        cursor: 'pointer',
        ...style
      }}
    >
      {children}
    </button>
  );
}

// ── NEON CARD ───────────────────────────────────────────────────
export function NeonCard({
  children,
  color,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`neon-card ${className}`}
      style={{
        borderRadius: '16px',
        border: `1px solid ${color || 'rgba(16,185,129,0.3)'}`,
        boxShadow: `0 0 20px ${color ? color.replace('0.3', '0.1').replace('1)', '0.1') : 'rgba(16,185,129,0.1)'}`,
        padding: '24px',
        background: 'var(--surface)',
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ── PERSPECTIVE 3D CARD FOLD OUT ───────────────────────────────
export function Perspective3DCardFoldOut({
  children,
  active,
  style = {}
}: {
  children: React.ReactNode;
  active?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={active ? { rotateY: 0, scale: 1, opacity: 1 } : { rotateY: 45, scale: 0.95, opacity: 0.5 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000, ...style }}
    >
      {children}
    </motion.div>
  );
}
