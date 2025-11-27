import { streamText } from 'ai';
import { ModelId, getModelInstance } from '@/lib/ai/providers';
import { autoSelectModel } from '@/lib/ai/auto-router';

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  try {
    const { messages, model = 'auto' } = await req.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Select model (auto-route if needed)
    const selectedModel: ModelId = model === 'auto' ? autoSelectModel(messages) : model;

    // Get the model instance
    const modelInstance = getModelInstance(selectedModel);

    // Stream the response
    const result = streamText({
      model: modelInstance,
      messages,
      // System prompt for brand context
      system: `You are the Brand Operating System (BOS), an AI assistant designed to help with brand strategy, creative direction, and business operations.

Personality:
- Friendly: Warm, approachable, never condescending
- Creative: Experimental, curious, innovative  
- Visionary: Forward-thinking but realistic

Guidelines:
- Use first person plural (we, us, our)
- Active voice, present tense
- Balance expertise with accessibility
- Never gatekeep knowledge
- Be concise but thorough`,
    });

    // Return streaming response in format useChat expects
    return result.toDataStreamResponse({
      headers: {
        'X-Model-Used': selectedModel,
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
