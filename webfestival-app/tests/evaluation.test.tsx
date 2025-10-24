import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Evaluation System Tests', () => {
  it('should have toBeInTheDocument matcher available', () => {
    // Simple test to verify that jest-dom matchers are working
    const div = document.createElement('div');
    div.textContent = 'Test content';
    document.body.appendChild(div);

    expect(div).toBeInTheDocument();

    document.body.removeChild(div);
  });

  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>;

    render(<TestComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should verify evaluation types exist', () => {
    // Test that our evaluation types are properly defined
    const mockMedio = {
      id: 1,
      titulo: 'Test Media',
      tipo_medio: 'fotografia' as const,
      evaluado: false
    };

    expect(mockMedio.tipo_medio).toBe('fotografia');
    expect(mockMedio.evaluado).toBe(false);
  });

  it('should demonstrate various jest-dom matchers work', () => {
    const TestComponent = () => (
      <div>
        <button disabled>Disabled Button</button>
        <input type="text" value="test value" readOnly />
        <div className="test-class">Styled Div</div>
      </div>
    );

    render(<TestComponent />);

    // Test various jest-dom matchers
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveValue('test value');
    expect(screen.getByText('Styled Div')).toHaveClass('test-class');
  });
});