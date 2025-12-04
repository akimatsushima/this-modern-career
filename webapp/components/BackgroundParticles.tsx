import React, { useRef, useEffect } from 'react';

const DOT_RADIUS_MIN = 2;  
const DOT_RADIUS_MAX = 12; 

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  id: number;
}

interface TreeLink {
  sourceId: number;
  targetId: number;
  active: boolean;
}

interface Props {
  className?: string;
  config?: {
    particleColor: string;
    particleOpacity: number;
    lineColor: string;
    lineOpacity: number;
    particleCount: number;
    connectionDistance: number;
    breakDistance: number;
    driftDelay: number;
    baseSpeed: number;
  };
  isRunning?: boolean;
}

const BackgroundParticles: React.FC<Props> = ({ 
  className = "",
  isRunning = false,
  config = {
    particleColor: '#3B82F6', 
    particleOpacity: 0.5,
    lineColor: '#93C5FD', 
    lineOpacity: 0.5,
    particleCount: 10,
    connectionDistance: 150,
    breakDistance: 250,
    driftDelay: 1000, 
    baseSpeed: 0.5
  }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const treeLinksRef = useRef<TreeLink[]>([]);
  const parentMapRef = useRef<Record<number, number>>({});
  
  const startTimeRef = useRef<number>(Date.now());
  const isMovingRef = useRef<boolean>(false);
  
  // --- NEW: Track if we have already built the tree ---
  const hasInitializedRef = useRef<boolean>(false);

  // Helper: Hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const randomRadius = () => DOT_RADIUS_MIN + Math.random() * (DOT_RADIUS_MAX - DOT_RADIUS_MIN);

  const initSimulation = (width: number, height: number) => {
    const particles: Particle[] = [];
    const treeLinks: TreeLink[] = [];
    let idCounter = 0;

    // --- 1. Generate the Hierarchy Tree (1 -> 5 -> 25) ---
    const startY = height * 0.10; 
    const levelHeight = Math.min(height * 0.12, 100); 
    
    // Level 1: Root
    const root = {
      x: width / 2,
      y: startY,
      vx: 0, vy: 0,
      radius: randomRadius(),
      id: idCounter++
    };
    particles.push(root);

    // Level 2: 5 Nodes
    const level2Count = 5;
    const level2Width = Math.min(width * 0.9, 800); 
    const level2Start = (width - level2Width) / 2;
    const level2Step = level2Width / (level2Count - 1);

    for (let i = 0; i < level2Count; i++) {
      const p2 = {
        x: level2Start + (i * level2Step),
        y: startY + levelHeight,
        vx: 0, vy: 0,
        radius: randomRadius(),
        id: idCounter++
      };
      particles.push(p2);
      treeLinks.push({ sourceId: root.id, targetId: p2.id, active: true });

      // Level 3: 5 Children per Level 2 Node
      const childrenPerNode = 5;
      const clusterWidth = level2Step * 0.8; 
      const clusterStart = p2.x - (clusterWidth / 2);
      const clusterStep = clusterWidth / (childrenPerNode - 1);

      for (let j = 0; j < childrenPerNode; j++) {
        const p3 = {
          x: clusterStart + (j * clusterStep),
          y: startY + (levelHeight * 2) + (Math.random() - 0.5) * (levelHeight * 0.3),
          vx: 0, vy: 0,
          radius: randomRadius(),
          id: idCounter++
        };
        particles.push(p3);
        treeLinks.push({ sourceId: p2.id, targetId: p3.id, active: true });
      }
    }

    // --- 2. Add extra ambient particles ---
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.baseSpeed,
        vy: (Math.random() - 0.5) * config.baseSpeed,
        radius: randomRadius(),
        id: idCounter++
      });
    }

    particlesRef.current = particles;
    treeLinksRef.current = treeLinks;
    
    const parentMap: Record<number, number> = {};
    treeLinks.forEach(link => {
      parentMap[link.targetId] = link.sourceId;
    });
    parentMapRef.current = parentMap;
    
    startTimeRef.current = Date.now();
    isMovingRef.current = false;
  };

  const drawSurfaceLine = (
      ctx: CanvasRenderingContext2D, 
      p1: Particle, 
      p2: Particle, 
      strokeStyle: string
    ) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    
    const startX = p1.x + Math.cos(angle) * p1.radius;
    const startY = p1.y + Math.sin(angle) * p1.radius;
    
    const endX = p2.x - Math.cos(angle) * p2.radius;
    const endY = p2.y - Math.sin(angle) * p2.radius;

    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const rgb = hexToRgb(config.particleColor);
    const lineRgb = hexToRgb(config.lineColor);
    
    ctx.clearRect(0, 0, width, height);

    // Responsive distances: reduce link distances on small screens
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const connectionDistance = isMobile ? Math.max(50, Math.round(config.connectionDistance * 0.67)) : config.connectionDistance;
    const breakDistance = isMobile ? Math.max(80, Math.round(config.breakDistance * 0.72)) : config.breakDistance;

    if (!isMovingRef.current && Date.now() - startTimeRef.current > config.driftDelay) {
      isMovingRef.current = true;
      particlesRef.current.forEach(p => {
        p.vx = (Math.random() - 0.5) * config.baseSpeed;
        p.vy = (Math.random() - 0.5) * config.baseSpeed;
      });
    }

    // Update & Draw Particles
    particlesRef.current.forEach(p => {
      if (isMovingRef.current) {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary Clamping
        if (p.x - p.radius < 0) {
          p.x = p.radius; 
          p.vx *= -1;
        } else if (p.x + p.radius > width) {
          p.x = width - p.radius;
          p.vx *= -1;
        }

        if (p.y - p.radius < 0) {
          p.y = p.radius; 
          p.vy *= -1;
        } else if (p.y + p.radius > height) {
          p.y = height - p.radius;
          p.vy *= -1;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, ${config.particleOpacity})`;
      ctx.fill();
    });

    // Draw Links
    ctx.lineWidth = 1;
    
    // Initial Tree Links
    treeLinksRef.current.forEach(link => {
      if (!link.active) return;
      const p1 = particlesRef.current.find(p => p.id === link.sourceId);
      const p2 = particlesRef.current.find(p => p.id === link.targetId);
      
      if (p1 && p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > breakDistance && isMovingRef.current) {
          link.active = false; 
        } else {
           drawSurfaceLine(ctx, p1, p2, `rgba(${lineRgb?.r}, ${lineRgb?.g}, ${lineRgb?.b}, ${config.lineOpacity})`);
        }
      }
    });

    // Dynamic Links: only form new (ambient) connections after 5s.
    // This ensures the first 5 seconds show only the main tree (parent->child) links.
    const linkAllowed = (Date.now() - startTimeRef.current > 5000);

    if (linkAllowed) {
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const p1Parent = parentMapRef.current[p1.id];
            const p2Parent = parentMapRef.current[p2.id];

            // Skip sibling connections (same parent)
            if (p1Parent !== undefined && p1Parent === p2Parent) continue;

            // Skip parent-child pairs too (they are rendered as the main tree links)
            if (p2Parent === p1.id || p1Parent === p2.id) continue;

            const opacity = config.lineOpacity * (1 - dist / connectionDistance);
            drawSurfaceLine(ctx, p1, p2, `rgba(${lineRgb?.r}, ${lineRgb?.g}, ${lineRgb?.b}, ${opacity})`);
          }
        }
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Update canvas size to match new window size
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      ctx?.scale(dpr, dpr);
      
      // ---Only initialize the tree ONCE ---
      // If we resize after the first load, we SKIP initSimulation.
      // The particles will simply continue moving in the new space.
      if (!hasInitializedRef.current) {
        initSimulation(rect.width, rect.height);
        hasInitializedRef.current = true;
      }
    };

    handleResize();
    requestRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas 
      ref={canvasRef} 
      className={`block w-full h-full pointer-events-none ${className}`}
    />
  );
};

export default BackgroundParticles;