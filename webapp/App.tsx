import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';

import Navbar from './components/Navbar';
import BackgroundParticles from './components/BackgroundParticles';
import HierarchyChart from './components/HierarchyChart';
import SimulationCanvas from './components/SimulationCanvas';
import DataVizPanel from './components/DataVizPanel';
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
  const [autoTutorialEnabled, setAutoTutorialEnabled] = useState(true);
  
  // Hooks
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

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
        setAutoTutorialEnabled(true);
    }, 100);
  };

  const handleManualTurn = () => {
      if (!isGameOver && !triggerTurn) {
        // If user manually presses when the button shows "Retire",
        // disable further auto tutorial triggering for the rest of this run.
        if (turnCount === 4 && autoTutorialEnabled) {
          setAutoTutorialEnabled(false);
        }
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

  // Step Observer (match original working behavior)
  useEffect(() => {
    if (!autoTutorialEnabled) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const stepAttr = entry.target.getAttribute('data-step');
        if (!stepAttr) return;

        const step = parseInt(stepAttr);
        setActiveStep(step);

        // Trigger simulation turns based on scroll step (only when auto tutorial is enabled)
        if (step === 3 && turnCount === 0 && !isGameOver) setTriggerTurn(true);
        if (step === 4 && turnCount === 1 && !isGameOver) setTriggerTurn(true);
        if (step === 5 && turnCount === 2 && !isGameOver) setTriggerTurn(true);
        if (step === 6 && turnCount === 3 && !isGameOver) setTriggerTurn(true);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.scroll-step').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [turnCount, isGameOver, autoTutorialEnabled]);

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
    <div className="app-shell relative bg-slate-50 min-h-screen">
      <motion.div 
        style={{ opacity: bgOpacity }} 
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <BackgroundParticles 
          className="absolute inset-0" 
        />
      </motion.div>
      <Navbar onReset={handlePageReset} activeSection={activeSection} />

      {/* Hero */}
      <section
  id="hero"
  className="hero-section relative z-10"
>
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-4xl">
          {/* <div className="hero-pill">
            A Visual Essay
          </div> */}
          <h1 className="hero-title">
            This Modern Career
          </h1>
          <div className="hero-subtitle">
            A simulation of corporate hierarchy
          </div>
          <div className="hero-meta">
             <span className="hero-meta-highlight">Aki Matsushima</span>
             <span>|</span>
             <span>December 1, 2025</span>
             <span className="hidden md:inline">|</span>
             <span className="hidden md:inline">10 min read</span>
          </div>
          <p className="hero-lede">
           What 250,000 careers taught me about merit, luck, and finding meaning beyond the ladder
          </p>
          <div 
            className="hero-scroll-cta" 
            onClick={() => document.getElementById('intro-text')?.scrollIntoView({behavior:'smooth'})}
          >
            <span>Scroll Down</span>
            <ChevronDown size={16} />
          </div>
        </motion.div>
      </section>

      {/* Intro Essay */}
      <section id="intro-text" className="page-section section-padding-hero-offset relative z-10">
        <div className="mb-0 bg-slate-50/80 backdrop-blur-sm">
        <h2 className="section-heading">The geometry of ambition</h2>
        <p className="body-text">
            I built a simulation I wish I'd played before entering the corporate world.
        </p>
         <p className="body-text">
           Over 80% of US workers are in companies with more than 20 people <a href="#citation-1" className="body-link">[1]</a>, large enough to require hierarchy. These structures have persisted, helping coordinate complex work, from ancient armies to modern corporations.
         </p>
        <p className="body-text">
               In this environment, we are raised on the metaphor of the "career ladder". Work hard, climb up, reach the top. It sounds simple. It sounds fair. It motivates us to put in extra effort.
        </p>
        <p className="body-text">
               But after years of managing teams and studying the data, I discovered something that changed how I think about career progression entirely: advancement isn't just about merit or effort. It's about geometry and chance.
        </p>
        <p className="body-text">
               The uncomfortable truth, hiding in plain sight, is that the career ladder is not really a ladder. It behaves more like a pyramid that narrows sharply as you go up, with many of the positions already taken.
        </p>
            
            <HierarchyChart />
            
          <p className="body-text">
               Geometry isn't the only constraint. Unlike school grades, workplace "merit" is unstable. Is it hard work? Speed? Leadership? Different managers value different things. Some projects succeed because of timing. This is why luck is an essential consideration.
          </p>
        </div>
      </section>

      {/* Simulation */}
      <section id="simulation-section" className="simulation-shell simulation-section relative z-10">
        <section className="page-section section-padding-normal">
          <div className="mb-0 bg-slate-50/80 backdrop-blur-sm">
            <h2 className="section-heading">The simulation</h2>
            <p className="body-text">
              This is a simple model of how a career unfolds. There are five career phases and if you are successfully promoted at each phase you reach the top.  
            </p>
          </div>
        </section>
        <div className="simulation-frame">
            {/* Controls */}
            <div className="controls-panel bg-slate-800 z-50 shadow-lg relative mono-text border-r border-slate-700/50">
              {/* Luck Factor (mobile left col item 1; desktop spacing) */}
              <div className="md:space-y-6 md:block w-full md:w-auto">
                <div className={`w-full transition-all duration-300 min-w-[100px]`}>
                    <div className="control-row">
                          <label className="ui-label">
                                Luck Factor
                                {isLocked && <Lock size={12} className="text-orange-500" />}
                            </label>
                      <span className="control-value">{Math.round(simConfig.luck * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="100" step="10" 
                            value={simConfig.luck * 100} 
                            onChange={(e) => setSimConfig({...simConfig, luck: parseInt(e.target.value)/100})}
                            disabled={isLocked}
                      className={`control-slider ${isLocked ? 'control-slider--locked' : ''}`}
                        />
                    <div className="control-scale-labels">
                            <span>Meritocracy</span>
                            <span>Random</span>
                        </div>
                    </div>
                </div>
                
              {/* Your Merit (mobile right col item 1) */}
              <div className="md:space-y-6 md:block w-full md:w-auto">
                <div className={`w-full transition-all duration-300 min-w-[120px]`}>
                  <div className="control-row">
                    <label className="ui-label">
                      Your Merit
                      {isLocked && <Lock size={12} className="text-orange-500" />}
                    </label>
                  </div>
                  <select 
                    className={`control-select ${isLocked ? 'control-select--locked' : ''}`}
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
                <div className="ui-inline-stack">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleManualTurn}
                    disabled={triggerTurn}
                  >
                    {getButtonLabel()}
                  </button>
                </div>

              {/* Stage + Ready (mobile right col item 2) */}
              <div className="ui-inline-stack">
                <div className="ui-status-text">
                  Stage: {Math.min(turnCount + 1, 5)} / 5
                </div>
                <div className={`ui-status-text transition-all duration-300 ${phaseMessage !== "Ready" ? "text-orange-500" : "text-slate-600"}`}>
                  {phaseMessage}
                </div>
              </div>

                <div className="sim-legend">
                  <div className="sim-legend-list">
                    <div className="sim-legend-heading">Legend</div>
                    <div className="sim-legend-item">
                      <span className="sim-legend-dot sim-legend-dot--you" />
                      You
                    </div>
                    <div className="sim-legend-item">
                      <span className="sim-legend-dot sim-legend-dot--peers" />
                      Your peers
                    </div>
                    <div className="sim-legend-item">
                      <span className="sim-legend-dot sim-legend-dot--incumbent" />
                      Incumbent
                    </div>
                    <div className="sim-legend-item">
                      <span className="sim-legend-dot sim-legend-dot--vacancy" />
                      Vacancy
                    </div>
                  </div>
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
        <div className="scroll-overlay-shell">
          <div data-step="0" className="scroll-step scroll-step-spacer-top"></div>

            <div data-step={1} className="scroll-step scroll-step-shell">
              <div className="scroll-step-card">
                <h2 className="scroll-step-heading">
                  The landscape<span className="md:hidden">: </span>
                </h2>
                <p className="scroll-step-body">
                  Think of this grid as the entire job market, not just one company. You are the orange dot. The blue dots are your peers in the same career stage as you. The grey dots are the incumbents blocking your path.
                </p>
              </div>
            </div>

            <div data-step={2} className="scroll-step scroll-step-shell">
              <div className="scroll-step-card">
                <h2 className="scroll-step-heading">
                  The setup<span className="md:hidden">: </span>
                </h2>
                <p className="scroll-step-body">
                  In this tutorial, we are going to rig the game in your favour. You are the #1 ranked employee by merit, and Luck is set to 0%.
                </p>
                <p className="scroll-step-body">
                  At 0% luck, promotions are purely merit-based (the best person wins). At 100% luck, they're completely random. At 50%, merit matters but randomness plays a role.
                </p>
              </div>
            </div>

            <div data-step={3} className="scroll-step scroll-step-shell">
              <div className="scroll-step-card">
                <h2 className="scroll-step-heading">
                  Tutorial<span className="md:hidden">: </span>
                </h2>
                <p className="scroll-step-body">
                  As you scroll, the button is pressed automatically in this round. Watch the cycle: people retire (grey dots disappear and create vacancies), promotions happen (dots move up to fill the gaps), and new hires join at the bottom. 
                </p>
              </div>
            </div>

            <div data-step={4} className="scroll-step scroll-step-shell">
              <div className="scroll-step-card">
                <h2 className="scroll-step-heading">
                  Stage 3<span className="md:hidden">: </span>
                </h2>
                <p className="scroll-step-body">
                  Halfway through your career. Most of your starting cohort is still at the bottom.
                </p>
              </div>
            </div>

            <div data-step={5} className="scroll-step scroll-step-shell">
              <div className="scroll-step-card">
                <h2 className="scroll-step-heading">
                  Stage 4<span className="md:hidden">: </span>
                </h2>
                <p className="scroll-step-body">
                  One more stage. Notice how few peers have risen, even in a perfect meritocracy.
                </p>
              </div>
            </div>

            <div data-step={6} className="scroll-step scroll-step-shell">
              <div className="scroll-step-card">
                <h2 className="scroll-step-heading">
                  Final state<span className="md:hidden">: </span>
                </h2>
                <p className="scroll-step-body">
                  Five stages complete. As the top performer in a perfect meritocracy, you reached the top but most peers barely moved. Now hit 'Retire' to try another scenario yourself.
                </p>
              </div>
            </div>
            
            <div className="scroll-step scroll-step-spacer-bottom"></div>
        </div>
      </section>

      {/* Data Visualization */}
      <section id="dataviz-section" className="relative z-10 flex flex-col md:flex-row">
        {/* Analysis Intro */}
        <div className="w-full page-section section-padding-roomy md:pt-64 md:pb-16 max-w-4xl">
          <h2 className="section-heading section-heading--analysis">Analysis</h2>
          <p className="body-text">
            Playing the simulation once shows you what could happen. Running it thousands of times shows you what usually happens. Across 250,000 simulated careers, we start to see some patterns.
          </p>
        </div>
      </section>

      {/* Data Visualization */}
       <section className="relative z-10 flex flex-col md:flex-row max-w-[1600px] mx-auto">
         {/* Offset below fixed navbar (md:h-16 => 4rem). Use md:top-16 for clear separation. */}
         <div className="dataviz-panel-shell">
             <DataVizPanel stats={stats} activeScenario={activeStep < 10 ? 0 : activeStep - 9} />
           </div>

          <div className="w-full md:w-5/12">
             <div data-step="9" className="scroll-step analysis-step">
                <h3 className="analysis-heading">The 90% rule</h3>
                <p className="analysis-body">
                    90% of employees never rise beyond the first layer of management, and more than half never manage anyone at all. Reaching the top is a statistical anomaly.
                 </p>
             </div>

              <div data-step="10" className="scroll-step analysis-step">
                <h3 className="analysis-heading">The best get blocked by noise</h3>
                <p className="analysis-body">
                   In a pure meritocracy, the top-ranked employee reaches the CEO level every time. But as soon as we introduce a realistic amount of noise, that guarantee disappears. With luck set to 50%, the top performer’s odds of reaching the C-suite fall from 100% to around 6%. Small amounts of randomness create large differences in who actually rises.
                 </p>
             </div>

              <div data-step="11" className="scroll-step analysis-step">
                <h3 className="analysis-heading">Median performers need randomness to move</h3>
                <p className="analysis-body">
                    Here is the irony: in a perfectly fair system, the median performer almost never moves. There is always someone ranked above them, so they stay at the bottom. Randomness becomes their only path up. As promotions become a little less tidy, their odds of an occasional jump actually improve.                 </p>
             </div>

             <div data-step="12" className="scroll-step analysis-step">
               <h3 className="analysis-heading">Advancement happens late</h3>
               <p className="analysis-body">
                    Most people who become managers don't get there until past the midpoint of their career. The structure doesn't just limit how many rise. It delays when they rise.
                    <br/><br/>
                    Waiting becomes the norm, even for eventual success.
                </p>
             </div>
             
             <div className="h-[20vh]"></div>
        </div>
      </section>

      {/* Conclusions */}
        <section id="conclusions-section" className="page-section section-padding-roomy relative z-10">
          <h2 className="section-heading">The rational path</h2>
          
          <h3 className="subheading">Why the bosses may not see this</h3>
          <p className="body-text">
            If the maths is this clear, why do companies keep promising “work hard and you will rise”? One simple reason is perspective. Directors and VPs are the small fraction of people who made it through the narrowing funnel. From where they sit, the system looks fair. Working hard did lead to promotion in their own careers, so it is natural to believe that pattern holds for everyone.
          </p>
          <p className="body-text">
            What they do not see as clearly are the many people who worked just as hard but stayed in place. That gap in visibility is a classic form of survivor bias.
          </p>

           <h3 className="subheading">The squeeze is getting tighter</h3>
           <p className="body-text">
             For the rest of us, the geometry is shifting. AI is beginning to automate layers of the hierarchy, removing the very rungs we used to climb.
          </p>
           <p className="body-text">
             Some companies provide an alternative to managing people: specialist tracks that lead to "Principal" and "Distinguished" titles. But more often than not, the geometry barely changes since these roles are as rare as the executive ones.          </p>

          <h3 className="subheading">The maths of quiet quitting</h3>
           <p className="body-text">
             Meanwhile, something else is shifting. Recent surveys show that 52% of Gen Z workers generally don't want to take on middle management roles <a href="#citation-3" className="body-link">[3]</a>. This makes sense mathematically. If advancement is structurally constrained, optimising for promotion is a bad bet.
          </p>
          <p className="body-text">
            “Quiet quitting” also looks different through this lens. In a workplace where pay is tied to position in the hierarchy, pulling back can be seen less as disengagement and more as probability adjustment: matching effort to the real odds of return.
          </p>
          
          <h3 className="subheading">Seeing the ladder clearly</h3>
          <p className="body-text">
            Understanding this geometry is the most liberating thing I have learned about work. Once you see the career ladder for what it is, it becomes easier to separate your self-worth from the outcome of a structural gamble and to choose how you want to enjoy your career with clearer eyes.
          </p>
      </section>

      {/* References */}
      <section className="page-section section-padding-tight border-t border-slate-200 relative z-10">
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

      {/* Methodology */}
      <section className="page-section section-padding-normal relative z-20">
        <h2 className="section-heading">Methodology</h2>
        <p className="body-text-small">
              The aggregate results come from a Monte Carlo simulation written in Python. 
              The model represents an organisation with five levels and a 1:5 span of control. 
              Each agent moves through five career stages, and promotion decisions are based on a score that combines a fixed merit value with a configurable amount of random noise.
            </p>

            <p className="body-text-small">
              The simulation was repeated until each merit group had 10,000 completed careers. 
              The outputs include individual career paths and the distribution of final levels for each scenario, which were exported as CSV files for analysis and charting.
            </p>

            <p className="body-text-small">
              The interactive version uses the same rules and is implemented in React and TypeScript. 
              The hierarchy is rendered with DOM positioning, and Framer Motion is used to animate state changes in the browser while keeping the core logic consistent with the Python model.
            </p>

            <p className="body-text-small mb-8">
              All charts in this essay are based on the Python outputs, and the interactive piece is a real time illustration of the same process. 
              Source code for both the simulation and the web page is available on GitHub.
            </p>
      </section>

      <footer className="bg-slate-50 py-12 text-center text-slate-400 text-sm border-t border-slate-100 relative z-10">
        <div className="flex justify-center gap-8 mb-8 font-medium text-slate-500">
            <a
              href="https://github.com/akimatsushima/this-modern-career"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Source Code
            </a>
            <span>|</span>
            <a
              href="mailto:akidataviz+careersessay@gmail.com"
              className="hover:text-slate-900 transition-colors"
            >
              Contact
            </a>
            <span>|</span>
            <a
              href="https://www.linkedin.com/in/akimatsushima/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              LinkedIn
            </a>
        </div>
        <p>© 2025 Aki Matsushima</p>
      </footer>
    </div>
  );
}

export default App;