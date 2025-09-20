import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimateOnScroll from './AnimateOnScroll';

describe('AnimateOnScroll', () => {
  it('renders children correctly', () => {
    render(
      <AnimateOnScroll>
        <div>Test Content</div>
      </AnimateOnScroll>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimateOnScroll className="custom-class">
        <div>Test Content</div>
      </AnimateOnScroll>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('renders with default props', () => {
    const { container } = render(
      <AnimateOnScroll>
        <span>Default Test</span>
      </AnimateOnScroll>
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Default Test')).toBeInTheDocument();
  });
});