// Simple test to verify test setup
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Basic Test Suite', () => {
  test('should render a simple component', () => {
    const TestComponent = () => <div>Hello World</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('should pass basic functionality test', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBeTruthy();
  });
});
