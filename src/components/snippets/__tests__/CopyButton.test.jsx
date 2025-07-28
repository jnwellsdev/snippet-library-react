import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CopyButton from '../CopyButton';

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
};

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });
    
    // Mock secure context
    Object.defineProperty(window, 'isSecureContext', {
      writable: true,
      value: true,
    });
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<CopyButton text="test content" />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<CopyButton text="test" className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders different sizes correctly', () => {
      const { rerender } = render(<CopyButton text="test" size="small" />);
      expect(screen.getByRole('button')).toHaveClass('copy-button--small');
      
      rerender(<CopyButton text="test" size="medium" />);
      expect(screen.getByRole('button')).toHaveClass('copy-button--medium');
      
      rerender(<CopyButton text="test" size="large" />);
      expect(screen.getByRole('button')).toHaveClass('copy-button--large');
    });

    it('shows disabled state when disabled prop is true', () => {
      render(<CopyButton text="test" disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('copy-button--disabled');
    });

    it('shows disabled state when no text is provided', () => {
      render(<CopyButton text="" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Clipboard API Integration', () => {
    it('copies text using clipboard API when available', async () => {
      mockClipboard.writeText.mockResolvedValue();
      const onCopySuccess = vi.fn();
      
      render(
        <CopyButton 
          text="test content" 
          onCopySuccess={onCopySuccess}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('test content');
      
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
        expect(onCopySuccess).toHaveBeenCalledWith('test content');
      });
    });

    it('shows copying state during async operation', async () => {
      let resolvePromise;
      mockClipboard.writeText.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );
      
      render(<CopyButton text="test content" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Copying...')).toBeInTheDocument();
      expect(button).toHaveClass('copy-button--copying');
      expect(button).toBeDisabled();
      
      resolvePromise();
      
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('handles clipboard API errors gracefully', async () => {
      const error = new Error('Clipboard access denied');
      mockClipboard.writeText.mockRejectedValue(error);
      const onCopyError = vi.fn();
      
      render(
        <CopyButton 
          text="test content" 
          onCopyError={onCopyError}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(button).toHaveClass('copy-button--error');
        expect(onCopyError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('User Interactions', () => {
    it('prevents multiple clicks during copying', async () => {
      let resolvePromise;
      mockClipboard.writeText.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );
      
      render(<CopyButton text="test content" />);
      
      const button = screen.getByRole('button');
      
      // First click
      fireEvent.click(button);
      expect(screen.getByText('Copying...')).toBeInTheDocument();
      
      // Second click should be ignored
      fireEvent.click(button);
      expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
      
      resolvePromise();
    });

    it('does not copy when disabled', () => {
      render(<CopyButton text="test content" disabled={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockClipboard.writeText).not.toHaveBeenCalled();
    });

    it('does not copy when no text is provided', () => {
      render(<CopyButton text="" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockClipboard.writeText).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<CopyButton text="test content" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('title');
    });

    it('has proper icon with aria-hidden', () => {
      render(<CopyButton text="test content" />);
      
      const icon = screen.getByText('📋');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});