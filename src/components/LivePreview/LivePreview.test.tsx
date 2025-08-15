import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import LivePreview from './LivePreview';

const md = `# Title\n\n<script>window.X=1</script>\n\n**bold** [link](https://example.com)`;

describe('LivePreview', () => {
  beforeEach(() => {
    // jsdom no implementa createObjectURL; lo simulamos de forma tipada
    const g = globalThis as unknown as {
      URL: URL & {
        createObjectURL?: (obj: unknown) => string;
        revokeObjectURL?: (url: string) => void;
      };
    };
    g.URL = {
      ...g.URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    } as URL & {
      createObjectURL: (obj: unknown) => string;
      revokeObjectURL: (url: string) => void;
    };
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  it('renders header and controls', () => {
    render(<LivePreview content={md} />);
    expect(screen.getByText(/Live Preview/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Device:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Zoom:/i)).toBeInTheDocument();
  });

  it('loads iframe content url', async () => {
    render(<LivePreview content={md} />);
    const iframes = await screen.findAllByTitle('Live Preview');
    const iframe = iframes[0];
    await waitFor(() => expect(iframe.getAttribute('src')).toContain('blob:'));
  });
});
