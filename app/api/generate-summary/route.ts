import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// DEMO BUILD — the real route calls the Anthropic API server-side with
// ANTHROPIC_API_KEY. To keep this demo runnable without a real key (and
// without making live, billed API calls on a reviewer's behalf), this
// version builds the same prompt the real route builds, then derives a
// summary extractively from the atom content instead of calling a model.
// The request/response contract is unchanged, so StoryEditor.tsx's
// handleGenerateSummary() needs no modification.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { title, atoms } = await request.json();

    if (!title || !atoms || atoms.length === 0) {
      return NextResponse.json(
        { error: 'Title and atoms are required' },
        { status: 400 }
      );
    }

    // Build content from atoms — identical to the real route.
    const atomContent = atoms
      .map((atom: { type: string; content: string; rich_content?: { text?: string } }) => {
        if (atom.type === 'quote' && atom.rich_content?.text) {
          return `Quote: "${atom.rich_content.text}"`;
        }
        return atom.content;
      })
      .filter(Boolean)
      .join('\n\n');

    if (!atomContent) {
      return NextResponse.json(
        { error: 'No atom content to summarize yet' },
        { status: 400 }
      );
    }

    // Simulate generation latency so the loading state in the UI is visible.
    await new Promise((resolve) => setTimeout(resolve, 600));

    const firstLine = atomContent.split('\n\n')[0].replace(/^Quote: "|"$/g, '').trim();
    const summary = `${title}: ${firstLine}`.slice(0, 220);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
