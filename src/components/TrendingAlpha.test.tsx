import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TrendingAlpha } from './TrendingAlpha';

describe('TrendingAlpha', () => {
  it('renders the header with title and subtitle', async () => {
    render(<TrendingAlpha />);
    
    await waitFor(() => {
      expect(screen.getByText('Trending Alpha 🔥')).toBeInTheDocument();
    });
    expect(screen.getByText('Top opportunities from the community')).toBeInTheDocument();
  });

  it('renders project cards with correct data', async () => {
    render(<TrendingAlpha />);
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Solana')).toBeInTheDocument();
  });

  it('displays positive change in green', async () => {
    render(<TrendingAlpha />);
    
    await waitFor(() => {
      expect(screen.getByText(/\+2\.50%/)).toBeInTheDocument();
    });
    const positiveChange = screen.getByText(/\+2\.50%/);
    expect(positiveChange).toHaveClass('text-green-500');
  });

  it('displays negative change in red', async () => {
    render(<TrendingAlpha />);
    
    await waitFor(() => {
      expect(screen.getByText(/-1\.20%/)).toBeInTheDocument();
    });
    const negativeChange = screen.getByText(/-1\.20%/);
    expect(negativeChange).toHaveClass('text-red-500');
  });

  it('renders correct number of cards based on limit prop', async () => {
    render(<TrendingAlpha limit={3} />);
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('alpha-card');
      expect(cards).toHaveLength(3);
    });
  });

  it('shows view all link when showViewAll is true', async () => {
    render(<TrendingAlpha showViewAll={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('View All')).toBeInTheDocument();
    });
  });

  it('hides view all link when showViewAll is false', async () => {
    render(<TrendingAlpha showViewAll={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText('View All')).not.toBeInTheDocument();
    });
  });
});