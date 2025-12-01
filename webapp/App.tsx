import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';

import Navbar from './components/Navbar';
import SimulationCanvas from './components/SimulationCanvas';
import DataVizPanel from './components/DataVizPanel';
import HierarchyChart from './components/HierarchyChart';
import PageSection from './components/ui/PageSection';
import BodyText from './components/ui/BodyText';
import SectionHeading from './components/ui/SectionHeading';
import ScrollStepCard from './components/ui/ScrollStepCard';
import PrimaryButton from './components/ui/PrimaryButton';
import { SimConfig } from './types';

function App() {
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  
  const [simConfig, setSimConfig] = useState<SimConfig>({ luck: 0, userMerit: 1 });
  const [triggerTurn, setTriggerTurn] = useState(false);
  const [simRunning, setSimRunning] = useState(true);
  const [turnCount, setTurnCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, peers: 0, userLayer: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [phaseMessage, setPhaseMessage] = useState("Ready");

  const simSectionRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const handleTurnComplete = (stage: number, gameOver: boolean) => {
    setTurnCount(stage);
    setTriggerTurn(false);
    setIsGameOver(gameOver);
  };

  const handleRestart = () => {
    setSimRunning(false);
    setTimeout(() => {
        setSimRunning(true);
        setTurnCount(0);
        setIsGameOver(false);
        setPhaseMessage("Ready");
    }, 100);
  };

  const handlePageReset = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSimRunning(false);
    setSimConfig({ luck: 0, userMerit: 1 });
    setTriggerTurn(false);
    setStats({ total: 0, peers: 0, userLayer: 0 });
    
    setTimeout(() => {
        setSimRunning(true);
        setTurnCount(0);
        setIsGameOver(false);
        setPhaseMessage("Ready");
        setActiveStep(0);
        setActiveSection('hero');
    }, 100);
  };

  const handleManualTurn = () => {
      if (!isGameOver && !triggerTurn) {
          setTriggerTurn(true);
      } else if (isGameOver) {
          handleRestart();
      }
  };

  const getButtonLabel = () => {
      if (isGameOver) return 'Start New Career';
      if (turnCount === 0) return 'Start Career';
      if (turnCount === 4) return 'Retire';
      return 'Next Stage';
  };

  const isLocked = turnCount > 0 && !isGameOver;

  // Step Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepAttr = entry.target.getAttribute('data-step');
                if (stepAttr) {
                    const step = parseInt(stepAttr);
                    setActiveStep(step);
                    
                    // Trigger simulation turns based on scroll step
                    if (step === 3 && turnCount === 0 && !isGameOver) setTriggerTurn(true);
                    if (step === 4 && turnCount === 1 && !isGameOver) setTriggerTurn(true);
                    if (step === 5 && turnCount === 2 && !isGameOver) setTriggerTurn(true);
                    if (step === 6 && turnCount === 3 && !isGameOver) setTriggerTurn(true);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.scroll-step').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [turnCount, isGameOver]);

  // Section Observer
  useEffect(() => {
    const sections = ['hero', 'simulation-section', 'dataviz-section', 'conclusions-section'];
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveSection(entry.target.id);
            }
        });
    }, { 
      threshold: 0, 
      rootMargin: "-25% 0px -75% 0px" 
    });

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-blue-200">
      <Navbar onReset={handlePageReset} activeSection={activeSection} />

      {/* Hero */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center pt-20">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-4xl">
          <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase">
            A Visual Essay
          </div>
          <h1 className="text-4xl md:text-8xl font-medium tracking-tight mb-2 text-slate-900 leading-tight">
            This Modern Career
          </h1>
          <div className="text-xl md:text-3xl text-slate-500 font-light mb-8">
            A simulation of corporate hierarchy
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 mb-12 font-medium text-sm">
             <span className="text-blue-600">Aki Matsushima</span>
             <span>|</span>
             <span>December 1, 2025</span>
          </div>
          <p className="text-base md:text-2xl text-slate-600 mb-16 leading-relaxed max-w-2xl mx-auto font-light">
           What 250,000 careers taught me about merit, luck, and finding meaning beyond the ladder
          </p>
          <div 
            className="flex flex-col items-center gap-2 text-blue-600 text-xs font-bold tracking-widest uppercase cursor-pointer hover:opacity-75 transition-opacity" 
            onClick={() => document.getElementById('intro-text')?.scrollIntoView({behavior:'smooth'})}
          >
            <span>Scroll Down</span>
            <ChevronDown size={16} />
          </div>
        </motion.div>
      </section>

      {/* Intro Essay */}
      <PageSection id="intro-text" className="pt-24 pb-8">
        <div className="mb-0">
          <SectionHeading as="h2" className="text-2xl md:text-4xl mb-8">The geometry of ambition</SectionHeading>
          <BodyText>
            I built a simulation I wish I'd played before entering the corporate world.
          </BodyText>
          <BodyText>
               Over 80% of US workers are in companies with more than 20 people <a href="#citation-1" className="text-blue-600 hover:text-blue-500 hover:underline">[1]</a>, large enough to require hierarchy. These structures have persisted, helping coordinate complex work, from ancient armies to modern corporations.
          </BodyText>
          <BodyText>
               In this environment, we are raised on the metaphor of the "Career Ladder." Work hard, climb up, reach the top. It sounds simple. It sounds fair. It motivates us to put in extra effort.
          </BodyText>
          <BodyText>
               But after years of managing teams and studying the data, I discovered something that changed how I think about career progression entirely: advancement isn't just about merit or effort. It's about geometry and chance.
          </BodyText>
          <BodyText>
               The uncomfortable truth hiding in plain sight is that the career ladder is not really a ladder. It behaves more like a pyramid that narrows sharply as you go up, with many of the positions already taken.
          </BodyText>
            
            <HierarchyChart />
            
          <BodyText>
               Geometry isn't the only constraint. Unlike school grades, workplace "merit" is unstable. Is it hard work? Speed? Leadership? Different managers value different things. Some projects succeed because of timing. This is why luck is an essential consideration.
          </BodyText>
        </div>
      </PageSection>

      {/* Simulation */}
      <section id="simulation-section" ref={simSectionRef} className="relative z-10 max-w-[1600px] mx-auto simulation-section">
        <PageSection className="pt-12 pb-8">
            <SectionHeading as="h2" className="text-2xl md:text-4xl mb-8">The simulation</SectionHeading>
            <BodyText className="mb-2">
              This is a simple model of how a career unfolds. There are five career phases and if you are successfully promoted at each phase you reach the top.
            </BodyText>
        </PageSection>
        <div className="sticky top-12 md:top-20 h-auto md:h-[calc(100vh-6rem)] max-h-[900px] mx-0 md:mx-6 rounded-none md:rounded-2xl border-x-0 border-y md:border border-slate-800 bg-slate-900 overflow-hidden flex flex-col md:flex-row shadow-[0_30px_80px_rgba(15,23,42,0.9)] ring-1 ring-slate-900/40 z-20 md:z-10">
            {/* Controls */}
            <div className="controls-panel bg-slate-800 z-50 shadow-lg relative font-mono border-r border-slate-700/50">
              {/* Luck Factor (mobile left col item 1; desktop spacing) */}
              <div className="md:space-y-6 md:block w-full md:w-auto">
                <div className={`w-full transition-all duration-300 min-w-[100px]`}>
                        <div className="flex justify-between mb-1 md:mb-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                Luck Factor
                                {isLocked && <Lock size={12} className="text-orange-500" />}
                            </label>
                            <span className="text-xs md:text-sm text-orange-400">{Math.round(simConfig.luck * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="100" step="10" 
                            value={simConfig.luck * 100} 
                            onChange={(e) => setSimConfig({...simConfig, luck: parseInt(e.target.value)/100})}
                            disabled={isLocked}
                            className={`w-full h-2 md:h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                        <div className="hidden md:flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                            <span>Meritocracy</span>
                            <span>Random</span>
                        </div>
                    </div>
                </div>
                
              {/* Your Merit (mobile right col item 1) */}
              <div className="md:space-y-6 md:block w-full md:w-auto">
                <div className={`w-full transition-all duration-300 min-w-[120px]`}>
                  <div className="flex justify-between mb-1 md:mb-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      Your Merit
                      {isLocked && <Lock size={12} className="text-orange-500" />}
                    </label>
                  </div>
                  <select 
                    className={`w-full bg-slate-700 text-white text-[10px] md:text-xs rounded-lg p-2 md:p-2.5 border-none focus:ring-2 focus:ring-orange-500 ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
                    value={simConfig.userMerit}
                    onChange={(e) => setSimConfig({...simConfig, userMerit: parseFloat(e.target.value)})}
                    disabled={isLocked}
                  >
                    <option value="0.5">Median performer</option>
                    <option value="0.75">Top 25% (key player)</option>
                    <option value="0.9">Top 10% (star)</option>
                    <option value="1">Top 1 (genius)</option>
                  </select>
                </div>
              </div>

              {/* Next Stage (mobile left col item 2) */}
                <div className="w-full md:w-full text-center flex flex-col items-center justify-center gap-1 md:gap-2 md:mt-4 md:ml-0 h-full md:h-auto">
                  <PrimaryButton onClick={handleManualTurn} disabled={triggerTurn}>
                    {getButtonLabel()}
                  </PrimaryButton>
                </div>

              {/* Stage + Ready (mobile right col item 2) */}
              <div className="w-full md:w-full text-center flex flex-col items-center justify-center gap-1 md:gap-2 md:mt-4 md:ml-0 h-full md:h-auto">
                <div className="mt-1 md:mt-2 text-[10px] md:text-xs text-slate-500">
                  Stage: {Math.min(turnCount + 1, 5)} / 5
                </div>
                <div className={`text-[10px] md:text-xs transition-all duration-300 ${phaseMessage !== "Ready" ? "text-orange-500" : "text-slate-600"}`}>
                  {phaseMessage}
                </div>
              </div>

                <div className="hidden md:block w-full text-xs text-slate-400 space-y-2 border-t border-slate-700 pt-6 mt-auto">
                    <div className="font-bold text-slate-500 mb-2 uppercase tracking-wider text-[10px]">Legend</div>
                    <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2 shadow-sm shadow-orange-900"></span>You</div>
                    <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm shadow-blue-900"></span>Your peers</div>
                    <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-2 opacity-80"></span>Incumbent</div>
                    <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full border border-slate-500 mr-2 opacity-50"></span>Vacancy</div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-grow w-full relative overflow-hidden bg-slate-900">
                <SimulationCanvas 
                    isRunning={simRunning}
                    simConfig={simConfig}
                    triggerNextTurn={triggerTurn}
                    onTurnComplete={handleTurnComplete}
                    onStatsUpdate={setStats}
                    setPhaseMessage={setPhaseMessage}
                />
            </div>
        </div>

        {/* Scrolly Overlay */}
        <div className="relative z-10 md:z-30 pointer-events-none mt-0 md:-mt-[calc(100vh-6rem)]">
            <div data-step="0" className="scroll-step h-[10vh] md:h-[50vh] flex items-end justify-center pb-20"></div>

            <ScrollStepCard step={1}>
              <h2 className="inline text-base font-bold text-slate-900 md:block md:text-3xl md:font-medium md:mb-4 tracking-tight">The landscape<span className="md:hidden">: </span></h2>
              <p className="inline text-sm text-slate-600 md:block md:text-lg leading-relaxed">
                Think of this grid as the entire job market, not just one company. You are the orange dot. The blue dots are your peers in the same career stage as you. The grey dots are the incumbents blocking your path.
              </p>
            </ScrollStepCard>

            <ScrollStepCard step={2}>
              <h2 className="inline text-base font-bold text-slate-900 md:block md:text-3xl md:font-medium md:mb-4 tracking-tight">The setup<span className="md:hidden">: </span></h2>
              <p className="inline text-sm text-slate-600 md:block md:text-lg leading-relaxed">
                In this tutorial, we are going to rig the game in your favour. You are the #1 ranked employee by merit, and Luck is set to 0%. This is a perfect meritocracy. If a seat opens and you are the best, you get it.
              </p>
            </ScrollStepCard>

            <ScrollStepCard step={3}>
              <h2 className="inline text-base font-bold text-slate-900 md:block md:text-3xl md:font-medium md:mb-4 tracking-tight">Tutorial<span className="md:hidden">: </span></h2>
              <p className="inline text-sm text-slate-600 md:block md:text-lg leading-relaxed">
                As you scroll, the button is pressed automatically in this round. Watch the cycle: people retire (grey dots disappear and create vacancies), promotions happen (dots move up to fill the gaps), and new hires join at the bottom. 
                Promotion priority depends on merit and luck.
              </p>
            </ScrollStepCard>

            <ScrollStepCard step={4}>
              <h2 className="inline text-base font-bold text-slate-900 md:block md:text-3xl md:font-medium md:mb-4 tracking-tight">Stage 3<span className="md:hidden">: </span></h2>
              <p className="inline text-sm text-slate-600 md:block md:text-lg leading-relaxed">
                Halfway through your career. Most of your starting cohort is still at the bottom.
              </p>
            </ScrollStepCard>
            
            <ScrollStepCard step={5}>
              <h2 className="inline text-base font-bold text-slate-900 md:block md:text-3xl md:font-medium md:mb-4 tracking-tight">Stage 4<span className="md:hidden">: </span></h2>
              <p className="inline text-sm text-slate-600 md:block md:text-lg leading-relaxed">
                One more stage. Notice how few dots make it this far, even in a perfect meritocracy.
              </p>
            </ScrollStepCard>

             <ScrollStepCard step={6}>
              <h2 className="inline text-base font-bold text-slate-900 md:block md:text-3xl md:font-medium md:mb-4 tracking-tight">Final state<span className="md:hidden">: </span></h2>
              <p className="inline text-sm text-slate-600 md:block md:text-lg leading-relaxed">
                Five stages complete. As the top performer in a perfect meritocracy, you reached the top. But look at everyone else. This is the best-case scenario, and most dots barely moved.
              </p>
            </ScrollStepCard>

             <ScrollStepCard step={7}>
              <h2 className="inline text-base font-bold text-slate-900 md:block md:text-3xl md:font-medium md:mb-4 tracking-tight">Try another scenario<span className="md:hidden">: </span></h2>
              <p className="inline text-sm text-slate-600 md:block md:text-lg leading-relaxed">
                That was a perfect meritocracy with you as the single best performer. Now see what happens when you adjust the parameters. You can only live once but you can run many simulations.
              </p>
            </ScrollStepCard>
            
            <div className="scroll-step h-[0vh] md:h-[100vh] pointer-events-none"></div>
        </div>
      </section>

      {/* Data Visualization */}
      <section id="dataviz-section" className="relative z-10 flex flex-col md:flex-row">
        {/* Analysis Intro */}
        <div className="w-full pt-16 md:pt-64 pb-8 md:pb-16 px-6 md:px-20 max-w-4xl mx-auto text-left">
          <h2 className="text-3xl md:text-5xl font-medium mb-12 tracking-tight text-slate-900">Analysis</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-2 font-light">
            Playing the simulation once shows you what could happen. Running it thousands of times shows you what usually happens. Across 250,000 simulated careers, we start too see some patterns.
          </p>
        </div>
      </section>

      {/* Data Visualization */}
       <section className="relative z-10 flex flex-col md:flex-row max-w-[1600px] mx-auto">
         {/* Offset below fixed navbar (md:h-16 => 4rem). Use md:top-16 for clear separation. */}
         <div className="w-full md:w-7/12 h-[70vh] md:h-[80vh] max-h-[550px] md:max-h-[900px] sticky top-12 md:top-16 flex items-center justify-center p-4 md:p-8">
             <DataVizPanel stats={stats} activeScenario={activeStep < 10 ? 0 : activeStep - 9} />
           </div>

        <div className="w-full md:w-5/12">
             <div data-step="9" className="scroll-step min-h-screen flex flex-col justify-center px-8 py-20 md:px-12">
                 <h3 className="text-2xl md:text-3xl font-medium text-slate-900 mb-6 tracking-tight">The 90% rule</h3>
                 <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                    90% of employees never rise beyond the first layer of management, and more than half never manage anyone at all. Reaching the top is a statistical anomaly.
                 </p>
             </div>

              <div data-step="10" className="scroll-step min-h-screen flex flex-col justify-center px-8 py-20 md:px-12">
                 <h3 className="text-2xl md:text-3xl font-medium text-slate-900 mb-6 tracking-tight">The best get blocked by noise</h3>
                 <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                   In a pure meritocracy, the top-ranked employee reaches the CEO level every time. But as soon as we introduce a realistic amount of noise, that guarantee disappears. With luck set to 50%, the top performer’s odds of reaching the C-suite fall from 100% to around 6%. Small amounts of randomness create large differences in who actually rises.
                 </p>
             </div>

              <div data-step="11" className="scroll-step min-h-[80vh] flex flex-col justify-center px-8 py-20 md:px-12">
                 <h3 className="text-2xl md:text-3xl font-medium text-slate-900 mb-6 tracking-tight">Median performers need randomness to move</h3>
                 <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                    Here is the irony: in a perfectly fair system, the median performer almost never moves. There is always someone ranked above them, so they stay at the bottom. Randomness becomes their only path up. As promotions become a little less tidy, their odds of an occasional jump actually improve.                 </p>
             </div>

             <div data-step="12" className="scroll-step min-h-[80vh] flex flex-col justify-center px-8 py-20 md:px-12">
                <h3 className="text-2xl md:text-3xl font-medium text-slate-900 mb-6 tracking-tight">Advancement happens late</h3>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                    Most people who become managers don't get there until past the midpoint of their career. The structure doesn't just limit how many rise. It delays when they rise.
                    <br/><br/>
                    Waiting becomes the norm, even for eventual success.
                </p>
             </div>
             
             <div className="h-[20vh]"></div>
        </div>
      </section>

      {/* Conclusions */}
      <section id="conclusions-section" className="py-24 px-6 md:px-20 max-w-3xl mx-auto text-left relative z-20">
          <h2 className="text-3xl md:text-5xl font-medium mb-12 tracking-tight text-slate-900">The rational path</h2>
          
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Why the bosses may not see this</h3>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6 font-light">
            If the maths is this clear, why do companies keep promising “work hard and you will rise”? One simple reason is perspective. Directors and VPs are the small fraction of people who made it through the narrowing funnel. From where they sit, the system looks fair. Working hard did lead to promotion in their own careers, so it is natural to believe that pattern holds for everyone.
          </p>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-12 font-light">
            What they do not see as clearly are the many people who worked just as hard but stayed in place. That gap in visibility is a classic form of survivor bias.
          </p>

          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">The squeeze is getting tighter</h3>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6 font-light">
             For the rest of us, the geometry is shifting. AI is beginning to automate layers of the hierarchy, removing the very rungs we used to climb.
          </p>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-12 font-light">
             Some companies provide an alternative to managing people: specialist tracks that lead to "Principal" and "Distinguished" titles. But more often than not, the geometry barely changes since these roles are usually as rare as the executive ones.          </p>

          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">The maths of quiet quitting</h3>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6 font-light">
             Meanwhile, something else is shifting. Recent surveys show that 52% of Gen Z workers generally don't want to take on middle management roles <a href="#citation-3" className="text-blue-600 hover:text-blue-500 hover:underline">[3]</a>. This makes sense mathematically. If advancement is structurally constrained, optimising for promotion is a bad bet.
          </p>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-12 font-light">
            “Quiet quitting” also looks different through this lens. In a workplace where pay is tied to position in the hierarchy, pulling back can be seen less as disengagement and more as probability adjustment: matching effort to the real odds of return.
          </p>
          
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Seeing the ladder clearly</h3>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 font-light">
            Understanding this geometry is the most liberating thing I have learned about work. Once you see the career ladder for what it is, it becomes easier to separate your self-worth from the outcome of a structural gamble and to choose how you want to enjoy your career with clearer eyes.
          </p>
      </section>

      {/* Methodology */}
      <section className="py-16 px-6 md:px-20 max-w-3xl mx-auto text-left relative z-20">
            <h2 className="text-xl md:text-2xl font-medium mb-8 tracking-tight text-slate-900">Methodology</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The aggregate results come from a Monte Carlo simulation written in Python. 
              The model represents an organisation with five levels and a 1:5 span of control. 
              Each agent moves through five career stages, and promotion decisions are based on a score that combines a fixed merit value with a configurable amount of random noise.
            </p>

            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The simulation was repeated until each merit group had 10,000 completed careers. 
              The outputs include individual career paths and the distribution of final levels for each scenario, which were exported as CSV files for analysis and charting.
            </p>

            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The interactive version uses the same rules and is implemented in React and TypeScript. 
              The hierarchy is rendered with DOM positioning, and Framer Motion is used to animate state changes in the browser while keeping the core logic consistent with the Python model.
            </p>

            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              All charts in this essay are based on the Python outputs, and the interactive piece is a real time illustration of the same process. 
              Source code for both the simulation and the web page is available on GitHub.
            </p>
      </section>
      
      {/* References */}
      <section className="py-12 px-6 max-w-3xl mx-auto border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">References</h3>
        <ol className="text-sm text-slate-500 space-y-2">
            <li id="citation-1">
                [1] Bureau of Labor Statistics. (2024). Table F. Distribution of private sector employment by firm size class. <a href="https://www.bls.gov/web/cewbd/table_f.txt" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Link</a>
            </li>
            <li id="citation-2">
                [2] Lattice. (2023). 2023 State of People Strategy Report. <a href="https://lattice.com/articles/lattice-data-reveals-lower-engagement-stretched-managers-and-more" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Link</a>
            </li>
            <li id="citation-3">
                [3] Robert Walters. (2024). Conscious Unbossing. <a href="https://www.robertwalters.co.uk/insights/news/blog/conscious-unbossing.html" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Link</a>
            </li>
        </ol>
      </section>

      <footer className="bg-slate-50 py-12 text-center text-slate-400 text-sm border-t border-slate-100">
        <div className="flex justify-center gap-8 mb-8 font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Source Code</a>
            <span>|</span>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            <span>|</span>
            <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
        </div>
        <p>© 2025 Aki Matsushima</p>
      </footer>
    </div>
  );
}

export default App;