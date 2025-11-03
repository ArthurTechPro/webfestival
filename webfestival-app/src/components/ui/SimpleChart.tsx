import React from 'react';
import { Card } from 'react-bootstrap';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  title: string;
  type: 'bar' | 'donut' | 'line';
  height: number;
  data: ChartDataPoint[];
}

/**
 * Componente simple para mostrar gráficos básicos sin dependencias externas
 */
const SimpleChart: React.FC<SimpleChartProps> = ({
  title,
  type,
  height,
  data
}) => {
  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="d-flex align-items-end justify-content-around" style={{ height: height - 60 }}>
        {data.map((item, index) => (
          <div key={index} className="d-flex flex-column align-items-center">
            <div
              className="bg-primary rounded-top"
              style={{
                width: '40px',
                height: `${(item.value / maxValue) * (height - 100)}px`,
                minHeight: '5px'
              }}
              title={`${item.label}: ${item.value}`}
            />
            <small className="text-muted mt-2">{item.label}</small>
            <small className="text-white">{item.value}</small>
          </div>
        ))}
      </div>
    );
  };

  const renderDonutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    const radius = Math.min(height, 300) / 2 - 20;
    const centerX = radius + 20;
    const centerY = radius + 20;
    
    return (
      <div className="d-flex align-items-center justify-content-center">
        <div className="me-4">
          <svg width={radius * 2 + 40} height={radius * 2 + 40}>
            {data.map((item, index) => {
              // const percentage = (item.value / total) * 100;
              const angle = (item.value / total) * 360;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
              const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
              const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
              const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}
            {/* Círculo interior para efecto donut */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.6}
              fill="#212529"
            />
          </svg>
        </div>
        <div>
          {data.map((item, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <div
                className="rounded me-2"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)`
                }}
              />
              <small className="text-white me-2">{item.label}:</small>
              <small className="text-muted">{item.value}</small>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const chartHeight = height - 80;
    const chartWidth = 400;
    const stepX = chartWidth / (data.length - 1);
    
    let pathData = '';
    
    data.forEach((item, index) => {
      const x = index * stepX;
      const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });
    
    return (
      <div className="d-flex justify-content-center">
        <svg width={chartWidth + 40} height={height}>
          <path
            d={pathData}
            fill="none"
            stroke="#0d6efd"
            strokeWidth="3"
            transform="translate(20, 20)"
          />
          {data.map((item, index) => {
            const x = index * stepX + 20;
            const y = chartHeight - ((item.value - minValue) / range) * chartHeight + 20;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#0d6efd"
                />
                <text
                  x={x}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6c757d"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'donut':
        return renderDonutChart();
      case 'line':
        return renderLineChart();
      default:
        return <div className="text-center text-muted">Tipo de gráfico no soportado</div>;
    }
  };

  return (
    <Card className="bg-dark text-white border-0 h-100">
      <Card.Header>
        <h6 className="mb-0">{title}</h6>
      </Card.Header>
      <Card.Body>
        {data.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center" style={{ height }}>
            <p className="text-muted">No hay datos disponibles</p>
          </div>
        ) : (
          renderChart()
        )}
      </Card.Body>
    </Card>
  );
};

export default SimpleChart;