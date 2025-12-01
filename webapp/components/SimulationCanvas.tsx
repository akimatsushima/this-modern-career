import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LAYERS, INITIAL_DISTRIBUTION, MAX_CAREER_STAGE, PHASE_DELAY } from '../constants';
import { Agent, SimConfig, SlotCoordinate } from '../types';

interface SimulationCanvasProps {
  isRunning: boolean;
  simConfig: SimConfig;
  triggerNextTurn: boolean;
  onTurnComplete: (stage: number, gameOver: boolean) => void;
  onStatsUpdate: (stats: { total: number; peers: number; userLayer: number }) => void;
  setPhaseMessage: (msg: string) => void;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ 
  isRunning, 
  simConfig, 
  triggerNextTurn,
  onTurnComplete,
  onStatsUpdate,
  setPhaseMessage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [showScrollControls, setShowScrollControls] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [slotCoords, setSlotCoords] = useState<Map<string, SlotCoordinate>>(new Map());
  const [turn, setTurn] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [peerCounts, setPeerCounts] = useState<Record<number, number>>({});
  
  const agentsRef = useRef<Agent[]>([]);
  const nextAgentIdRef = useRef(1);

  const configRef = useRef(simConfig);
  
  useEffect(() => {
    configRef.current = simConfig;
  }, [simConfig]);

  // Initialization
  const initWorld = useCallback(() => {
    const newAgents: Agent[] = [];
    nextAgentIdRef.current = 1;

    LAYERS.forEach(layer => {
      const dist = INITIAL_DISTRIBUTION[layer.id];
      const layerConfigs: {age: number}[] = [];

      if (dist) {
        Object.entries(dist).forEach(([ageStr, count]) => {
          const age = parseInt(ageStr);
          for (let c = 0; c < count; c++) layerConfigs.push({ age });
        });
      }

      while (layerConfigs.length < layer.capacity) {
        layerConfigs.push({ age: Math.floor(Math.random() * (MAX_CAREER_STAGE + 1)) });
      }

      for (let i = layerConfigs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [layerConfigs[i], layerConfigs[j]] = [layerConfigs[j], layerConfigs[i]];
      }

      layerConfigs.forEach((config, slotIdx) => {
        if (slotIdx < layer.capacity) {
          newAgents.push({
            id: nextAgentIdRef.current++,
            layerId: layer.id,
            slotIdx,
            stage: config.age,
            merit: Math.random(),
            isUser: false,
            isPeer: false,
            status: 'active',
            isNew: false
          });
        }
      });
    });

    const l1Agents = newAgents.filter(a => a.layerId === 1);
    if (l1Agents.length > 0) {
        const userAgent = l1Agents[Math.floor(Math.random() * l1Agents.length)];
        userAgent.isUser = true;
        userAgent.merit = configRef.current.userMerit;
        userAgent.stage = 0;

        newAgents.forEach(a => {
            if (a.layerId === 1 && !a.isUser && a.stage === 0) {
                a.isPeer = true;
            }
        });
    }

    agentsRef.current = newAgents;
    setAgents([...newAgents]);
    setTurn(0);
    setPhaseMessage("Ready");
    updatePeerCounts(newAgents);
  }, [setPhaseMessage]);


  const updatePeerCounts = (currentAgents: Agent[]) => {
      const counts: Record<number, number> = {};
      LAYERS.forEach(l => counts[l.id] = 0);
      currentAgents.forEach(a => {
          if (a.isPeer && a.status === 'active') {
              counts[a.layerId] = (counts[a.layerId] || 0) + 1;
          }
      });
      setPeerCounts(counts);
  };


  // Coordinates
  const updateCoordinates = useCallback(() => {
    if (!containerRef.current) return;
    const newCoords = new Map<string, SlotCoordinate>();

    LAYERS.forEach(layer => {
      for (let i = 0; i < layer.capacity; i++) {
        const slotEl = document.getElementById(`slot-${layer.id}-${i}`);
        if (slotEl) {
           let top = 0;
           let left = 0;
           let el = slotEl as HTMLElement | null;
           
           // Traverse up to container to get offset relative to container
           while (el && el !== containerRef.current) {
               top += el.offsetTop;
               left += el.offsetLeft;
               el = el.offsetParent as HTMLElement;
           }

           newCoords.set(`${layer.id}-${i}`, {
             top: top + (window.innerWidth < 768 ? 1 : 2),
             left: left + (window.innerWidth < 768 ? 1 : 2)
           });
        }
      }
    });
    setSlotCoords(newCoords);
  }, []);

  useEffect(() => {
      if(!containerRef.current) return;
      const resizeObserver = new ResizeObserver(() => {
          updateCoordinates();
          // Recalculate scroll bounds on size changes
          if (wrapperRef.current && containerRef.current) {
            const wrapperH = wrapperRef.current.clientHeight;
            const contentH = containerRef.current.scrollHeight;
            const m = Math.max(0, contentH - wrapperH);
            setMaxOffset(m);

            // Determine visibility of the top and "Chief Exec Level" (layer 5)
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const layerTop = document.getElementById('layer-1');
            const layerChief = document.getElementById('layer-5');
            const topVisible = layerTop ? (layerTop.getBoundingClientRect().top >= wrapperRect.top) : true;
            const chiefVisible = layerChief ? (layerChief.getBoundingClientRect().bottom <= wrapperRect.bottom) : true;

            const needsControls = window.innerWidth < 768 && (m > 0 || !topVisible || !chiefVisible);
            setShowScrollControls(needsControls);

            if (offsetY > m) setOffsetY(m);
          }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
  }, [updateCoordinates]);

  useEffect(() => {
    initWorld();
    setTimeout(updateCoordinates, 100);
    // Initial bounds calc
    setTimeout(() => {
      if (wrapperRef.current && containerRef.current) {
        const wrapperH = wrapperRef.current.clientHeight;
        const contentH = containerRef.current.scrollHeight;
        const m = Math.max(0, contentH - wrapperH);
        setMaxOffset(m);
        // Also check visibility of top and Chief Exec Level
        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const layerTop = document.getElementById('layer-1');
        const layerChief = document.getElementById('layer-5');
        const topVisible = layerTop ? (layerTop.getBoundingClientRect().top >= wrapperRect.top) : true;
        const chiefVisible = layerChief ? (layerChief.getBoundingClientRect().bottom <= wrapperRect.bottom) : true;
        const needsControls = window.innerWidth < 768 && (m > 0 || !topVisible || !chiefVisible);
        setShowScrollControls(needsControls);
        if (offsetY > m) setOffsetY(m);
      }
    }, 120);
  }, [initWorld, updateCoordinates]);


  // Logic Cycle
  const runTurn = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    let currentAgents = [...agentsRef.current];
    
    currentAgents.forEach(a => { if(a.isNew) a.isNew = false; });
    
    const luck = configRef.current.luck;

    // Phase 1: Retirement
    setPhaseMessage("Phase: Retirements");
    
    currentAgents.forEach(a => {
        if (a.status === 'active') a.stage += 1;
    });

    currentAgents = currentAgents.filter(a => a.status !== 'retired');

    currentAgents.forEach(a => {
        const mustRetire = a.stage > MAX_CAREER_STAGE;
        if (mustRetire) {
            a.status = 'retired';
        }
    });
    
    const user = currentAgents.find(a => a.isUser);
    const isGameOver = !user || user.status === 'retired';

    agentsRef.current = [...currentAgents];
    setAgents([...agentsRef.current]); 
    updatePeerCounts(currentAgents);
    
    await new Promise(r => setTimeout(r, PHASE_DELAY));

    if (!isGameOver) {
        // Phase 2: Promotions
        setPhaseMessage("Phase: Promotions");
        
        let moves = true;
        let pass = 0;

        while (moves && pass < 20) {
            moves = false;
            pass++;
            
            for (let lvl = 5; lvl > 1; lvl--) {
                const layer = LAYERS.find(l => l.id === lvl);
                if (!layer) continue;

                const activeInLayer = currentAgents.filter(a => a.layerId === lvl && a.status === 'active');
                const vacancies = layer.capacity - activeInLayer.length;

                if (vacancies > 0) {
                    const candidates = currentAgents.filter(a => a.layerId === lvl - 1 && a.status === 'active');
                    
                    const scored = candidates.map(c => {
                        const noise = Math.random();
                        const score = (c.merit * (1 - luck)) + (noise * luck);
                        return { agent: c, score };
                    });

                    scored.sort((a, b) => b.score - a.score);
                    const winners = scored.slice(0, vacancies);

                    if (winners.length > 0) {
                        moves = true;
                        
                        const occupiedSlots = new Set(
                            currentAgents
                                .filter(a => a.layerId === lvl && a.status === 'active')
                                .map(a => a.slotIdx)
                        );

                        winners.forEach(w => {
                            const agent = w.agent;
                            agent.layerId = lvl;
                            
                            let newSlot = 0;
                            while(occupiedSlots.has(newSlot)) {
                                newSlot++;
                            }
                            
                            agent.slotIdx = newSlot;
                            occupiedSlots.add(newSlot);
                        });
                    }
                }
            }
        }
        
        agentsRef.current = [...currentAgents];
        setAgents([...agentsRef.current]);
        updatePeerCounts(currentAgents);
        await new Promise(r => setTimeout(r, PHASE_DELAY));

        // Phase 3: New Hires
        setPhaseMessage("Phase: New Hires");
        
        const l1 = LAYERS.find(l => l.id === 1)!;
        const l1Active = currentAgents.filter(a => a.layerId === 1 && a.status === 'active');
        const l1Vacancies = l1.capacity - l1Active.length;
        const l1Occupied = new Set(l1Active.map(a => a.slotIdx));

        for (let i=0; i < l1Vacancies; i++) {
            let newSlot = 0;
            while(l1Occupied.has(newSlot)) newSlot++;
            l1Occupied.add(newSlot);
            
            currentAgents.push({
                id: nextAgentIdRef.current++,
                layerId: 1,
                slotIdx: newSlot,
                stage: 0,
                merit: Math.random(), 
                isUser: false,
                isPeer: false,
                status: 'active',
                isNew: true
            });
        }
        
        agentsRef.current = [...currentAgents];
        setAgents([...agentsRef.current]);
        updatePeerCounts(currentAgents);
        await new Promise(r => setTimeout(r, 1500));
    }

    setPhaseMessage(isGameOver ? "Career Finished" : "Ready");
    setIsAnimating(false);
    
    const newTurn = turn + 1;
    setTurn(newTurn);
    
    const activePeers = currentAgents.filter(a => a.isPeer && a.status === 'active').length;
    const userAgent = currentAgents.find(a => a.isUser);
    
    onStatsUpdate({
        total: currentAgents.filter(a => a.status === 'active').length,
        peers: activePeers,
        userLayer: userAgent && userAgent.status === 'active' ? userAgent.layerId : 0
    });

    onTurnComplete(newTurn, isGameOver);

  }, [isAnimating, turn, onTurnComplete, onStatsUpdate, setPhaseMessage]);

  useEffect(() => {
    if (triggerNextTurn && !isAnimating) {
        runTurn();
    }
  }, [triggerNextTurn, isAnimating, runTurn]);

  useEffect(() => {
    if (!isRunning) {
        initWorld();
        setTimeout(updateCoordinates, 50);
    }
  }, [isRunning, initWorld, updateCoordinates]);

  
  return (
    <div className="w-full h-full bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center relative">
      {/* Mobile scroll controls */}
      {showScrollControls && (
        <div className="absolute top-2 right-2 md:hidden z-30 flex flex-col gap-1">
          <button
            className="bg-slate-700 text-white text-[10px] px-2 py-1 rounded shadow hover:bg-slate-600 disabled:opacity-40"
            onClick={() => setOffsetY(prev => Math.max(0, prev - 40))}
            disabled={offsetY <= 0}
          >
            ▲
          </button>
          <button
            className="bg-slate-700 text-white text-[10px] px-2 py-1 rounded shadow hover:bg-slate-600 disabled:opacity-40"
            onClick={() => setOffsetY(prev => Math.min(maxOffset, prev + 40))}
            disabled={offsetY >= maxOffset}
          >
            ▼
          </button>
        </div>
      )}

      <div ref={wrapperRef} className="w-full h-full md:h-auto overflow-hidden">
        <div 
          ref={containerRef}
          className="sediment-container"
          style={{ transform: `translateY(${-offsetY}px)`, transition: 'transform 150ms ease-out' }}
        >
        {LAYERS.map(layer => (
          <div key={layer.id} className="layer" id={`layer-${layer.id}`}>
             <div className="layer-label">
                {/* Desktop: stacked label */}
                <div className="hidden md:block">
                  <span className="text-white block mb-1 text-xs">{layer.name}</span>
                  <span className="text-xs">
                      <span className="text-blue-400">Peers: {peerCounts[layer.id] || 0}</span>
                      <span className="text-slate-500"> / {layer.capacity}</span>
                  </span>
                </div>
                {/* Mobile: inline single line */}
                <div className="flex md:hidden items-center gap-2 whitespace-nowrap">
                  <span className="text-slate-200 text-[10px]">{layer.name}</span>
                  <span className="text-[10px] whitespace-nowrap">
                      <span className="text-blue-400">Peers: {peerCounts[layer.id] || 0}</span>
                      <span className="text-slate-500"> / {layer.capacity}</span>
                  </span>
                </div>
             </div>
             
             {Array.from({ length: layer.capacity }).map((_, idx) => (
                <div
                    key={`${layer.id}-${idx}`}
                    id={`slot-${layer.id}-${idx}`}
                    className="slot"
                    style={{ width: (window.innerWidth < 768 ? layer.size -1 : layer.size + 4), height: (window.innerWidth < 768 ? layer.size + 0 : layer.size + 4) }}
                />
            ))}
          </div>
        ))}

        {agents.map(agent => {
            if (agent.status === 'dead') return null;
            
            const coords = slotCoords.get(`${agent.layerId}-${agent.slotIdx}`);
            if (!coords) return null;

            let className = "agent";
            if (agent.status === 'retired') {
                className += " ghost";
                if (agent.isUser) className += " user";
                else if (agent.isPeer) className += " peer";
            } else if (agent.isUser) {
                className += " user";
            } else if (agent.isPeer) {
                className += " peer";
            } else {
                className += " normal";
            }

            if (agent.isNew && agent.status === 'active') {
                className += " new-hire";
            }

            const dot = (window.innerWidth < 768 ? 4 : 6);
            return (
                <div
                    key={agent.id}
                    className={className}
                    style={{
                        top: coords.top,
                        left: coords.left,
                        width: dot,
                        height: dot
                    }}
                />
            );
        })}
        </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;