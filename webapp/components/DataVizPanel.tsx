import React, { useRef, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  LabelList
} from 'recharts';

interface DataVizPanelProps {
  stats: { total: number; peers: number; userLayer: number };
  activeScenario: number;
}

const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const value: string = payload.value;

    let lines: string[];

    // Special-case the longest label so it always breaks nicely on mobile
    if (value.startsWith('Chief Exec Level')) {
        lines = ['Chief Exec Level', '(c. 750 reports)'];
    } else {
        const words = value.split(' ');
        const maxChars = 24;
        const wrappedLines: string[] = [];
        let currentLine = '';

        words.forEach((word: string) => {
            if ((currentLine + word).length <= maxChars) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) wrappedLines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) wrappedLines.push(currentLine);
        lines = wrappedLines;
    }

    return (
        <g transform={`translate(${x},${y})`}>
            {lines.map((line, i) => (
                <text
                    key={i}
                    x={-10}
                    y={0}
                    dy={i * 14 - ((lines.length - 1) * 7)}
                    textAnchor="end"
                    fill="#f1f5f9"
                    fontSize={12}
                    fontWeight={500}
                >
                    {line}
                </text>
            ))}
        </g>
    );
};

const OUTCOME_DATA = [
        { name: 'Chief Exec Level (c. 750 reports)', value: 0.45 },
        { name: 'Executive Level (150)', value: 2.14 },
        { name: 'Senior Manager (30)', value: 7.82 },
        { name: 'Manager (5)', value: 25.04 },
        { name: 'Individual Contributor', value: 64.56 },
]; 

type LevelDist = { level: number; pct: number };

interface FacetCell {
    scenario: string;
    dist: LevelDist[];
}

interface FacetRow {
    label: string;
    cells: FacetCell[];
}

const LEVEL_ABBREVS: Record<number, string> = {
    5: 'CE',
    4: 'Ex',
    3: 'SM',
    2: 'Mn',
    1: 'IC'
};

const FACET_DATA: FacetRow[] = [
    {
        label: "Top 1",
        cells: [
            { 
                scenario: "100% Meritocracy", 
                dist: [{ level: 5, pct: 100 }, { level: 4, pct: 0 }, { level: 3, pct: 0 }, { level: 2, pct: 0 }, { level: 1, pct: 0 }] 
            },
            { 
                scenario: "50% Luck", 
                dist: [{ level: 5, pct: 6 }, { level: 4, pct: 17 }, { level: 3, pct: 36 }, { level: 2, pct: 36 }, { level: 1, pct: 5 }] 
            },
            { 
                scenario: "100% Luck", 
                dist: [{ level: 5, pct: 0.5 }, { level: 4, pct: 2.5 }, { level: 3, pct: 8 }, { level: 2, pct: 26 }, { level: 1, pct: 63 }] 
            }
        ]
    },
    {
        label: "Top 10th percentile",
        cells: [
            { 
                scenario: "100% Meritocracy", 
                dist: [{ level: 5, pct: 0 }, { level: 4, pct: 0 }, { level: 3, pct: 0 }, { level: 2, pct: 100 }, { level: 1, pct: 0 }] 
            },
            { 
                scenario: "50% Luck", 
                dist: [{ level: 5, pct: 2.5 }, { level: 4, pct: 9.3 }, { level: 3, pct: 29.7 }, { level: 2, pct: 47.3 }, { level: 1, pct: 11.1 }] 
            },
            { 
                scenario: "100% Luck", 
                dist: [{ level: 5, pct: 0.6 }, { level: 4, pct: 2.3 }, { level: 3, pct: 8.6 }, { level: 2, pct: 26 }, { level: 1, pct: 62.5 }] 
            }
        ]
    },
    {
        label: "Top 25th percentile",
        cells: [
            { 
                scenario: "100% Meritocracy", 
                dist: [{ level: 5, pct: 0 }, { level: 4, pct: 0 }, { level: 3, pct: 0 }, { level: 2, pct: 67 }, { level: 1, pct: 33 }] 
            },
            { 
                scenario: "50% Luck", 
                dist: [{ level: 5, pct: 0.3 }, { level: 4, pct: 1.8 }, { level: 3, pct: 13.3 }, { level: 2, pct: 56.9 }, { level: 1, pct: 27.8 }] 
            },
            { 
                scenario: "100% Luck", 
                dist: [{ level: 5, pct: 0.6 }, { level: 4, pct: 2.6 }, { level: 3, pct: 8.8 }, { level: 2, pct: 25.5 }, { level: 1, pct: 62.4 }] 
            }
        ]
    },
    {
        label: "Median Performer",
        cells: [
            { 
                scenario: "100% Meritocracy", 
                dist: [{ level: 5, pct: 0 }, { level: 4, pct: 0 }, { level: 3, pct: 0 }, { level: 2, pct: 0 }, { level: 1, pct: 100 }] 
            },
            { 
                scenario: "50% Luck", 
                dist: [{ level: 5, pct: 0 }, { level: 4, pct: 0 }, { level: 3, pct: 0 }, { level: 2, pct: 11 }, { level: 1, pct: 89 }] 
            },
            { 
                scenario: "100% Luck", 
                dist: [{ level: 5, pct: 0.5 }, { level: 4, pct: 2.3 }, { level: 3, pct: 9 }, { level: 2, pct: 26.4 }, { level: 1, pct: 61.7 }] 
            }
        ]
    }
];

const MEDIAN_PROGRESSION_DATA = [
    { phase: '1', ic: 100, manager: 0 },
    { phase: '2', ic: 97.24, manager: 2.76 },
    { phase: '3', ic: 94.50, manager: 5.50 },
    { phase: '4', ic: 91.68, manager: 8.32 },
    { phase: '5', ic: 88.97, manager: 11.03 },
];

const DataVizPanel: React.FC<DataVizPanelProps> = ({ activeScenario }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);

  const formatPercent = (val: number) => {
    return `${parseFloat(val.toPrecision(2))}%`;
  };

  const handleBarLeave = () => {
    setHoveredBarId(null);
  };

  // Renderers

  const renderScenario0 = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    return (
                <div className="h-full flex flex-col text-white">
          <div className="mb-6">
                         <h3 className="dataviz-heading">Highest level reached in career</h3>
          </div>
          <div className="flex-grow min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={OUTCOME_DATA} 
                                layout="vertical" 
                                margin={{ top: 10, right: 60, left: isMobile ? -20 : 0, bottom: 32 }}
                                barCategoryGap="25%"
                            >
                <CartesianGrid horizontal={false} stroke="#334155" strokeDasharray="3 3" />
                                <XAxis 
                                        type="number" 
                                        domain={[0, 80]} 
                                        tick={{fill: '#94a3b8', fontSize: isMobile ? 13 : 15, fontWeight: 500}} 
                                        stroke="#475569" 
                                        tickFormatter={(val) => `${val}%`}
                                        label={{ 
                                            value: '% careers ended in level', 
                                            position: 'insideBottom', 
                                            offset: -18, 
                                            fill: '#94a3b8', 
                                            fontSize: isMobile ? 13 : 15, 
                                            fontWeight: 500
                                        }}
                                />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={isMobile ? <CustomYAxisTick /> : {fill: '#f1f5f9', fontSize: 16, fontWeight: 500}}
                    width={isMobile ? 180 : 280}
                    axisLine={false}
                    tickLine={false} 
                />
                <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderColor: '#e2e8f0', 
                      color: '#0f172a', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backdropFilter: 'blur(12px)'
                    }}
                    itemStyle={{color: '#0f172a'}}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    formatter={(value: number) => [formatPercent(value), 'Percent of Employees']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    <LabelList 
                        dataKey="value" 
                        position="right" 
                        fill="#94a3b8" 
                        fontSize={isMobile ? 13 : 15} 
                        fontWeight={600}
                        formatter={formatPercent}
                    />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
    );
  };

    const renderFacetChart = () => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const colTemplate = isMobile ? '65px 1fr 1fr 1fr' : '100px 1fr 1fr 1fr';

    return (
        <div className="h-full flex flex-col text-slate-200 overflow-hidden relative">
             <div className="mb-4">
                 <h3 className="dataviz-heading">Merit vs luck: career outcomes</h3>
             </div>

                 <div className="grid gap-4 mb-4 border-b border-slate-700 pb-2" style={{ gridTemplateColumns: colTemplate }}>
                <div className="font-bold text-[10px] md:text-xs text-slate-500 uppercase tracking-wider self-end">Merit Level</div>
                     <div className="text-center font-bold text-[10px] md:text-sm text-slate-300">100% Meritocracy</div>
                     <div className="text-center font-bold text-[10px] md:text-sm text-slate-300">50% Luck</div>
                     <div className="text-center font-bold text-[10px] md:text-sm text-slate-300">100% Luck</div>
                 </div>

                         <div className="flex-grow flex flex-col justify-between">
                             {(() => {
                                    let rows = FACET_DATA;
                                    if (isMobile) {
                                        const panelHeight = panelRef.current?.clientHeight || window.innerHeight;
                                        const fullSet = ['Top 1','Top 25th percentile','Median Performer'];
                                        const twoSet = ['Top 1','Median Performer'];
                                        const requiredForThree = 420; // px; below this, show only two merit levels
                                        const useTwo = panelHeight < requiredForThree;
                                        rows = FACET_DATA.filter(r => (useTwo ? twoSet : fullSet).includes(r.label));
                                    }
                                    return rows.map((row, idx) => {
                                        const isRowHighlighted = (activeScenario === 1 && row.label === 'Top 1') || (activeScenario !== 1 && row.label === 'Median Performer');
                                        return (
                                            <div
                                                key={row.label}
                                                className="grid gap-1 items-center transition-opacity duration-500"
                                                style={{ gridTemplateColumns: colTemplate }}
                                            >
                                                <div className={`text-[11px] md:text-sm font-semibold leading-tight pr-2 transition-colors duration-500 ${isRowHighlighted ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>{row.label}</div>
                                                                                                {row.cells.map((cell, cIdx) => (
                                                                                                        <div
                                                                                                            key={cIdx}
                                                                                                            className={`${isMobile ? 'h-[90px]' : 'h-[120px]'} border-l border-slate-700 pl-3 relative flex flex-col justify-center gap-1`}
                                                                                                        >
                                                        {cell.dist.map(d => {
                                                            const barId = `${idx}-${cIdx}-${d.level}`;
                                                            const isBarHovered = hoveredBarId === barId;
                                                            const barColor = isBarHovered ? 'bg-blue-300' : isRowHighlighted ? 'bg-blue-500' : 'bg-slate-500 opacity-40';
                                                            const textColor = isBarHovered ? 'text-white font-bold scale-110' : isRowHighlighted ? 'text-slate-200' : 'text-slate-400';
                                                            return (
                                                                <div
                                                                    key={d.level}
                                                                    className="flex items-center gap-1 h-[16px] text-[11px] group cursor-pointer transition-transform duration-200"
                                                                    onMouseEnter={() => setHoveredBarId(barId)}
                                                                    onMouseLeave={handleBarLeave}
                                                                >
                                                                    {!(isMobile && cIdx > 0) && (
                                                                        <div className="w-6 text-right text-slate-500 mono-text text-[10px]">{LEVEL_ABBREVS[d.level]}</div>
                                                                    )}
                                                                    <div className="flex-grow h-full bg-slate-800/70 relative rounded-sm overflow-hidden">
                                                                        <div
                                                                            className={`h-full absolute left-0 top-0 rounded-sm transition-all duration-300 ${barColor}`}
                                                                            style={{ width: `${d.pct}%`, opacity: d.pct > 0 ? undefined : 0 }}
                                                                        />
                                                                    </div>
                                                                    <div className={`w-10 font-medium transition-all duration-300 origin-left ${textColor}`}>
                                                                        {d.pct >= 1 ? `${Math.round(d.pct)}%` : d.pct > 0 ? '<1%' : ''}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    });
                             })()}
                         </div>
             
        </div>
    );
  };

  const renderMedianProgression = () => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            return (
        <div className="h-full flex flex-col text-white">
            <div className="mb-2">
                <h3 className="dataviz-heading">Median performer, 50% luck</h3>
                
                <div className={`flex items-center gap-6 my-4 ${isMobile ? 'text-xs' : 'text-sm md:text-base'} text-slate-300`}>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-slate-500 rounded-sm opacity-80"></span>
                        <span>Individual Contributor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>
                        <span>Manager</span>
                    </div>
                </div>

                <p className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>% employees at level</p>
            </div>
            <div className="flex-grow min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={MEDIAN_PROGRESSION_DATA}
                        margin={{ top: 20, right: 30, left: 20, bottom: 48 }}
                        barSize={60}
                    >
                        <CartesianGrid vertical={false} stroke="#334155" strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="phase" 
                            tick={{fill: '#94a3b8', fontSize: isMobile ? 13 : 15}} 
                            tickLine={false}
                            axisLine={{stroke: '#475569'}}
                            label={{ value: 'Career phase out of 5', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: isMobile ? 13 : 15 }}
                        />
                        <YAxis 
                            tick={isMobile ? undefined : {fill: '#94a3b8', fontSize: 15}} 
                            hide={isMobile}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                borderColor: '#e2e8f0', 
                                borderRadius: '8px', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                backdropFilter: 'blur(12px)'
                            }}
                            itemStyle={{color: '#0f172a'}}
                            labelStyle={{color: '#64748b', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px'}}
                            formatter={(val: number, name: string) => {
                                const formattedVal = formatPercent(val);
                                const shortName = name.includes('Individual') ? 'Individual Contributor' : 'Manager';
                                return [formattedVal, shortName];
                            }}
                            labelFormatter={(label) => `Career phase ${label} of 5`}
                        />
                        
                        <Bar 
                            dataKey="manager" 
                            stackId="a" 
                            fill="#f97316" 
                            name="Manager (c.5 reports)" 
                        >
                            <LabelList 
                                dataKey="manager" 
                                content={(props: any) => {
                                    const { x, y, width, height, value } = props;
                                    if (typeof value !== 'number' || value <= 0.5) return null;
                                    
                                    const isTight = height < 18; 
                                    
                                    return (
                                        <text 
                                            x={x + width / 2} 
                                            y={isTight ? y - 3 : y + height / 2 + 3} 
                                            fill="#fff" 
                                            textAnchor="middle" 
                                            fontSize={isMobile ? 13 : 15} 
                                            fontWeight={600}
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {formatPercent(value)}
                                        </text>
                                    );
                                }}
                            />
                        </Bar>

                        <Bar 
                            dataKey="ic" 
                            stackId="a" 
                            fill="#64748b" 
                            name="Individual Contributor (0 reports)"
                        >
                             <LabelList 
                                dataKey="ic" 
                                position="center" 
                                fill="#f8fafc" 
                                fontSize={isMobile ? 13 : 15} 
                                formatter={(val: number) => val > 5 ? formatPercent(val) : ''}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      );
  };

  return (
    <div 
        ref={panelRef}
		        className="w-full h-full p-6 md:p-8 flex flex-col bg-slate-900 rounded-3xl border border-slate-800/80 transition-colors duration-500 relative dataviz-panel-shell-inner"
    >
      {activeScenario === 0 ? renderScenario0() : 
       activeScenario === 3 ? renderMedianProgression() :
       renderFacetChart()}
    </div>
  );
};

export default DataVizPanel;