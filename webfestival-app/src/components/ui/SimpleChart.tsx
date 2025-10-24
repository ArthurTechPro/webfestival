import React from 'react';
import './SimpleChart.scss';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'donut' | 'line';
  height?: number;
  className?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  title,
  data,
  type = 'bar',
  height = 200,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['#346CB0', '#2ed573', '#ffa502', '#3742fa', '#ff4757', '#5f27cd'];

  const renderBarChart = () => (
    <div className="chart-container" style={{ height }}>
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="bar-container">
            <div 
              className="bar"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || colors[index % colors.length]
              }}
            >
              <div className="bar-value">{item.value}</div>
            </div>
            <div className="bar-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDonutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="chart-container donut-container" style={{ height }}>
        <svg width={height} height={height} viewBox={`0 0 ${height} ${height}`}>
          <g transform={`translate(${height/2}, ${height/2})`}>
            {data.map((item, index) => {
              // const percentage = (item.value / total) * 100;
              const angle = (item.value / total) * 360;
              const radius = height * 0.35;
              const innerRadius = height * 0.2;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * radius;
              const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * radius;
              const x2 = Math.cos((endAngle - 90) * Math.PI / 180) * radius;
              const y2 = Math.sin((endAngle - 90) * Math.PI / 180) * radius;

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${Math.cos((endAngle - 90) * Math.PI / 180) * innerRadius} ${Math.sin((endAngle - 90) * Math.PI / 180) * innerRadius}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${Math.cos((startAngle - 90) * Math.PI / 180) * innerRadius} ${Math.sin((startAngle - 90) * Math.PI / 180) * innerRadius}`,
                'Z'
              ].join(' ');

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || colors[index % colors.length]}
                  className="donut-segment"
                />
              );
            })}
          </g>
        </svg>
        <div className="donut-center">
          <div className="donut-total">{total}</div>
          <div className="donut-label">Total</div>
        </div>
        <div className="donut-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const width = 300;
    const chartHeight = height - 40;
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * width,
      y: chartHeight - (item.value / maxValue) * chartHeight
    }));

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="chart-container line-container" style={{ height }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#346CB0" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#346CB0" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Área bajo la línea */}
          <path
            d={`${pathData} L ${width} ${chartHeight} L 0 ${chartHeight} Z`}
            fill="url(#lineGradient)"
          />
          
          {/* Línea principal */}
          <path
            d={pathData}
            stroke="#346CB0"
            strokeWidth="3"
            fill="none"
            className="line-path"
          />
          
          {/* Puntos */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#346CB0"
              className="line-point"
            />
          ))}
        </svg>
        
        <div className="line-labels">
          {data.map((item, index) => (
            <div key={index} className="line-label">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`simple-chart ${className}`}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
      </div>
      
      <div className="chart-body">
        {type === 'bar' && renderBarChart()}
        {type === 'donut' && renderDonutChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  );
};

export { SimpleChart };
export default SimpleChart;