import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BiggestMovers } from './BiggestMovers';

// Mock data for testing
const mockMovers = [
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', change_24h: 25.5, price: 0.0000012 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', change_24h: 15.2, price: 0.000025 },
  { id: 'virtual', name: 'Virtual Protocol', symbol: 'VIRTUAL', change_24h: 12.8, price: 1.45 },
  { id: 'ai16z', name: 'ai16z', symbol: 'AI16Z', change_24h: -8.5, price: 0.15 },
  { id: 'pump', name: 'Pump', symbol: 'PUMP', change_24h: -12.3, price: 0.08 },
  { id: 'war', name: 'WAR', symbol: 'WAR', change_24h: -18.7, price: 0.01 },
];

describe('BiggestMovers', () => {
  it('renders the header with title', async () => {
    render(<BiggestMovers />);
    
    await waitFor(() => {
      expect(screen.getByText('Biggest Movers 📈')).toBeInTheDocument();
    });
  });

  it('renders 6 coins by default', async () => {
    render(<BiggestMovers />);
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('mover-card');
      expect(cards).toHaveLength(6);
    });
  });

  it('respects the limit prop', async () => {
    render(<BiggestMovers limit={3} />);
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('mover-card');
      expect(cards).toHaveLength(3);
    });
  });

  it('displays positive changes in green', async () => {
    render(<BiggestMovers />);
    
    await waitFor(() => {
      const positiveChange = screen.getByText(/\+25\.50%/);
      expect(positiveChange).toHaveClass('text-green-500');
    });
  });

  it('displays negative changes in red', async () => {
    render(<BiggestMovers />);
    
    await waitFor(() => {
      const negativeChange = screen.getByText(/-18\.70%/);
      expect(negativeChange).toHaveClass('text-red-500');
    });
  });

  it('shows the View All link when showViewAll is true', async () => {
    render(<BiggestMovers showViewAll={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('View All')).toBeInTheDocument();
    });
  });

  it('hides the View All link when showViewAll is false', async () => {
    render(<BiggestMovers showViewAll={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText('View All')).not.toBeInTheDocument();
    });
  });

  it('sorts by absolute change percentage descending', async () => {
    render(<BiggestMovers />);
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('mover-card');
      // First should be highest positive change (25.5%)
      expect(cards[0]).toHaveTextContent('PEPE');
    });
  });
});