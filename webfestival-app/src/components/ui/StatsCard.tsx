import React from 'react';
import { Card } from 'react-bootstrap';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Componente para mostrar estadísticas con diseño atractivo
 */
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'border-primary';
      case 'success': return 'border-success';
      case 'info': return 'border-info';
      case 'warning': return 'border-warning';
      case 'danger': return 'border-danger';
      default: return 'border-secondary';
    }
  };

  const getIconBgClass = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary';
      case 'success': return 'bg-success';
      case 'info': return 'bg-info';
      case 'warning': return 'bg-warning';
      case 'danger': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <Card className={`bg-dark text-white border-0 border-start border-4 ${getColorClass(color)} h-100`}>
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className={`rounded-circle p-3 me-3 ${getIconBgClass(color)}`}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          </div>
          <div className="flex-grow-1">
            <h6 className="text-muted mb-1">{title}</h6>
            <h3 className="mb-0 text-white">{value}</h3>
            {trend && (
              <small className={`text-${trend.isPositive ? 'success' : 'danger'}`}>
                {trend.isPositive ? '↗️' : '↘️'} {Math.abs(trend.value)}%
              </small>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;