import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { EvaluationDashboard } from '../components/evaluation';

/**
 * Dashboard específico para jurados especializados
 */
const JuradoDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <EvaluationDashboard />
    </DashboardLayout>
  );
};

export default JuradoDashboard;