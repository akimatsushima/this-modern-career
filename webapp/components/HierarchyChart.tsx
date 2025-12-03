import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
  Customized
} from 'recharts';

const data = [
  { name: 'Chief Exec Level (c.750 reports)', value: 1, label: 'Chief Executive', yIndex: 4 },
  { name: 'Exec Level (c.150 reports)', value: 5, label: 'Executive', yIndex: 3 },
  { name: 'Senior Manager (c.30 reports)', value: 25, label: 'Senior Manager', yIndex: 2 },
  { name: 'Manager (c.5 reports)', value: 125, label: 'Manager', yIndex: 1 },
  { name: 'Individual Contributor (0 reports)', value: 625, label: 'Individual Contributor', yIndex: 0 },
];

const generateCurvePoints = () => {
  const points = [];
  const numPoints = 50;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // 0 to 1
    const yIndex = t * 4; // 0 to 4
    // Exponential function: value = 5^(4-yIndex) to go from 625 to 1
    const value = Math.pow(5, 4 - yIndex);
    points.push({ yIndex, value });
  }
  
  return points;
};

const curveData = generateCurvePoints();

const DotShape = (props: any) => {
  const { cx, cy, fill } = props;
  return (
    <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#0f172a" strokeWidth={2} />
  );
};

const HierarchyChart: React.FC = () => {
  return (
    <div className="w-full max-w mx-auto my-16 px-0 md:px-0">
      <div className="chart-card">
        {/* Desktop header above chart */}
        <h3 className="chart-heading">
          The shape of the hierarchy
        </h3>
        <p className="chart-caption">
          Number of positions available at each level in a typical organisation with five layers and a 1:5 management ratio
        </p>
        {/* Mobile header and caption */}
        <div className="md:hidden mb-3 text-left px-2">
          <h3 className="chart-heading-mobile">The shape of the hierarchy</h3>
          <p className="chart-caption-mobile">
            Positions available at each level in a typical organisation with a 1:5 management ratio.
          </p>
        </div>
        <div className="flex-grow w-full min-h-0 aspect-square md:aspect-auto">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 40, bottom: 20, left: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis
                type="number"
                dataKey="value"
                hide
                domain={[0, 650]}
              />
              <YAxis
                type="number"
                dataKey="yIndex"
                axisLine={false}
                tickLine={false}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const item = data.find(d => d.yIndex === payload.value);
                  if (!item) return null;
                  
                  // Split on opening bracket to wrap text
                  const parts = item.name.split(' (');
                  const mainText = parts[0];
                  const subText = parts[1] ? `(${parts[1]}` : '';
                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                  const mainSize = isMobile ? 11 : 14;
                  const subSize = isMobile ? 9 : 11;
                  
                  return (
                    <g>
                      <text x={x - 10} y={y - 2} textAnchor="end" fill="#f1f5f9" fontSize={mainSize} fontWeight={500}>
                        {mainText}
                      </text>
                      {subText && (
                        <text x={x - 10} y={y + 14} textAnchor="end" fill="#94a3b8" fontSize={subSize} fontWeight={400}>
                          {subText}
                        </text>
                      )}
                    </g>
                  );
                }}
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                width={typeof window !== 'undefined' && window.innerWidth < 768 ? 125 : 155}
              />
              {/* Solid white guide lines from each point to the Y-axis (render first to sit behind) */}
              {data.map((d, i) => (
                <Scatter
                  key={`guide-${i}`}
                  data={[{ value: 0, yIndex: d.yIndex }, { value: d.value, yIndex: d.yIndex }]}
                  fill="none"
                  line={{ stroke: '#ffffff', strokeWidth: 0.5}}
                  shape={() => null}
                  z={0}
                />
              ))}
              {/* Smooth exponential curve overlay */}
              <Scatter data={curveData} fill="none" line={{ stroke: '#60a5fa', strokeWidth: 3 }} shape={() => null} z={1} />
              {/* Blue points with value labels (render last to be on top) */}
              <Scatter data={data} fill="#3b82f6" z={2} shape={<DotShape />}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  offset={12} 
                  fill="#94a3b8" 
                  fontSize={13} 
                  fontWeight={600} 
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        {/* Desktop captions below chart */}
        <div className="hidden md:block mt-6 text-left px-4">
          <p className="chart-caption-secondary">
            In a typical contemporary organisation, there's roughly 1 manager for every 5 reports <a href="https://lattice.com/articles/lattice-data-reveals-lower-engagement-stretched-managers-and-more" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">[2]</a>. This ratio compounds at every level.
          </p>
        </div>
        {/* Mobile secondary caption placed below chart */}
        <div className="md:hidden mt-3 text-left px-2">
          <p className="chart-caption-secondary-mobile">
            In a typical contemporary organisation, there's roughly 1 manager for every 5 reports <a href="https://lattice.com/articles/lattice-data-reveals-lower-engagement-stretched-managers-and-more" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">[2]</a>. This ratio compounds at every level.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HierarchyChart;