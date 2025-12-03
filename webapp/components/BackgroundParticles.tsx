import React, { useRef, useEffect } from 'react';

// Tunable visual constants (set just these two)
const DOT_RADIUS_MIN = 2;  // smallest dots
const DOT_RADIUS_MAX = 12; // largest dots

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
    particleCount: number; // Extra ambient particles
    connectionDistance: number; // Max distance for new dynamic lines
    breakDistance: number; // Distance at which original tree lines snap
    driftDelay: number; // ms before particles start moving
    baseSpeed: number;
  };
}

const BackgroundParticles: React.FC<Props> = ({ 
  className = "",
  config = {
    particleColor: '#3B82F6', // Blue-500
    particleOpacity: 0.6,
    lineColor: '#93C5FD', // Blue-300
    lineOpacity: 0.4,
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

  // Helper: Hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const initSimulation = (width: number, height: number) => {
    const particles: Particle[] = [];
    const treeLinks: TreeLink[] = [];
    let idCounter = 0;

      // Helper: uniform random radius between global min/max
      const randomRadius = () => DOT_RADIUS_MIN + Math.random() * (DOT_RADIUS_MAX - DOT_RADIUS_MIN);

    // --- 1. Generate the Hierarchy Tree (1 -> 5 -> 25) ---
    // Adjusted tree height scaling
    const startY = height * 0.10; // Start 10% down the screen
    const levelHeight = Math.min(height * 0.12, 100); // Reduce level height slightly
    
    // Level 1: Root
      const rootRadius = randomRadius();
    const root = {
      x: width / 2,
      y: startY,
      vx: 0, vy: 0,
      radius: rootRadius,
      id: idCounter++
    };
    particles.push(root);

    // Level 2: 5 Nodes
    const level2Count = 5;
    const level2Width = Math.min(width * 0.9, 800); 
    const level2Start = (width - level2Width) / 2;
    const level2Step = level2Width / (level2Count - 1);

    for (let i = 0; i < level2Count; i++) {
        const level2Radius = randomRadius();
      const p2 = {
        x: level2Start + (i * level2Step),
        y: startY + levelHeight,
        vx: 0, vy: 0,
        radius: level2Radius,
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
          const level3Radius = randomRadius();
        const p3 = {
          x: clusterStart + (j * clusterStep),
          // Slight vertical jitter so the bottom layer isn't a perfect line
          y: startY + (levelHeight * 2) + (Math.random() - 0.5) * (levelHeight * 0.3),
          vx: 0, vy: 0,
          radius: level3Radius,
          id: idCounter++
        };
        particles.push(p3);
        treeLinks.push({ sourceId: p2.id, targetId: p3.id, active: true });
      }
    }

    // --- 2. Add extra ambient particles ---
    for (let i = 0; i < config.particleCount; i++) {
        const ambientRadius = randomRadius();
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.baseSpeed,
        vy: (Math.random() - 0.5) * config.baseSpeed,
        radius: ambientRadius,
        id: idCounter++
      });
    }

    // Replace the ref content completely so we don't accumulate duplicates on resize
    particlesRef.current = particles;
    treeLinksRef.current = treeLinks;
    // Build quick lookup of parent relationships so we can identify siblings
    const parentMap: Record<number, number> = {};
    treeLinks.forEach(link => {
      // link.sourceId is the parent of link.targetId in our generated tree
      parentMap[link.targetId] = link.sourceId;
    });
    parentMapRef.current = parentMap;
    startTimeRef.current = Date.now();
    isMovingRef.current = false;
  };

  // Helper: Draw line from SURFACE to SURFACE
  const drawSurfaceLine = (
      ctx: CanvasRenderingContext2D, 
      p1: Particle, 
      p2: Particle, 
      strokeStyle: string
    ) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    
    // Offset start and end points by the radius of the circle
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

    // Check Start Delay (Transition from Tree to Chaos)
    if (!isMovingRef.current && Date.now() - startTimeRef.current > config.driftDelay) {
      isMovingRef.current = true;
      // Explode: Assign random velocities to the static tree nodes
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

        // --- PHYSICS FIX: Boundary Clamping ---
        // Prevent particles from getting stuck in walls ("Sticky Walls" bug)
        
        // 1. Left/Right
        if (p.x - p.radius < 0) {
          p.x = p.radius; // Push back inside
          p.vx *= -1;
        } else if (p.x + p.radius > width) {
          p.x = width - p.radius; // Push back inside
          p.vx *= -1;
        }

        // 2. Top/Bottom
        if (p.y - p.radius < 0) {
          p.y = p.radius; // Push back inside
          p.vy *= -1;
        } else if (p.y + p.radius > height) {
          p.y = height - p.radius; // Push back inside
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
    
    // 1. Initial Tree Links (Break if stretched too far)
    treeLinksRef.current.forEach(link => {
      if (!link.active) return;
      const p1 = particlesRef.current.find(p => p.id === link.sourceId);
      const p2 = particlesRef.current.find(p => p.id === link.targetId);
      
      if (p1 && p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > config.breakDistance && isMovingRef.current) {
          link.active = false; // Snap!
        } else {
           drawSurfaceLine(ctx, p1, p2, `rgba(${lineRgb?.r}, ${lineRgb?.g}, ${lineRgb?.b}, ${config.lineOpacity})`);
        }
      }
    });

    // 2. Dynamic Proximity Links (Form when close)
    if (isMovingRef.current) {
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDistance) {
            // Skip drawing dynamic links between direct siblings (share same parent)
            const p1Parent = parentMapRef.current[p1.id];
            const p2Parent = parentMapRef.current[p2.id];
            if (p1Parent !== undefined && p1Parent === p2Parent) {
              continue; // they're siblings — don't connect
            }
            const opacity = config.lineOpacity * (1 - dist / config.connectionDistance);
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
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      ctx?.scale(dpr, dpr);
      
      initSimulation(rect.width, rect.height);
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
      // Allow overriding 'fixed' via props, but default to 'block w-full h-full'
      className={`block w-full h-full pointer-events-none ${className}`}
    />
  );
};

export default BackgroundParticles;