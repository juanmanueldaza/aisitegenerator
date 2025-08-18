import { describe, it, expect } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { InlineDiffView } from './InlineDiffView';
import { computeHunks } from '@/utils/diff';

describe('InlineDiffView', () => {
  it('renders side-by-side blocks with add/remove/context highlighting', async () => {
    const original = 'a\nb\nc';
    const target = 'a\nB\nc\nD';
    const hunks = computeHunks(original, target);
    const { container } = render(<InlineDiffView original={original} hunks={hunks} />);

    const block = await within(container).findByTestId('diff-block-0');
    expect(block).toBeInTheDocument();

    // Expect a removed line "- b" on left and added lines "+ B" and "+ D" on right
    // We search by text content with prefixes added by the component
    expect(within(container).getByText(/^-\sb$/m)).toBeInTheDocument();
    expect(within(container).getByText(/^\+\sB$/m)).toBeInTheDocument();
    expect(within(container).getByText(/^\+\sD$/m)).toBeInTheDocument();
  });

  it('supports j/k keyboard navigation between multiple change blocks', () => {
    // Create two separated changes to yield two hunks/blocks
    const original = ['one', 'two', 'three', 'four', 'five'].join('\n');
    const target = ['one', 'TWO', 'three', 'four', 'FIVE'].join('\n');
    const hunks = computeHunks(original, target);

    const { container } = render(<InlineDiffView original={original} hunks={hunks} />);

    const root = within(container).getByRole('list');
    (root as HTMLElement).focus();

    // Initially first block is active
    const first = within(container).getByTestId('diff-block-0');
    expect(first.getAttribute('data-active')).toBe('true');

    // Press 'j' to go to next
    fireEvent.keyDown(root, { key: 'j' });
    const second = within(container).getByTestId('diff-block-1');
    expect(second.getAttribute('data-active')).toBe('true');

    // Press 'k' to go back
    fireEvent.keyDown(root, { key: 'k' });
    expect(first.getAttribute('data-active')).toBe('true');
  });
});
