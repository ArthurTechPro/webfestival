import React from 'react';
import './StatsCard.scss';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  className = ''
}) => {
  return (
    <div className={`stats-card stats-card--${color} ${className}`}>
      <div className="stats-card__content">
        <div className="stats-card__header">
          <div className="stats-card__icon">
            <span>{icon}</span>
          </div>
          {trend && (
            <div className={`stats-card__trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              <span className="trend-icon">
                {trend.isPositive ? '↗️' : '↘️'}
              </span>
              <span className="trend-value">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div className="stats-card__body">
          <div className="stats-card__value">{value}</div>
          <div className="stats-card__title">{title}</div>
        </div>
      </div>
      
      <div className="stats-card__background">
        <div className="stats-card__glow"></div>
      </div>
    </div>
  );
};

export default StatsCard;