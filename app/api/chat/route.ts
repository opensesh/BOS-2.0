import { streamText } from 'ai';
import { ModelId, getModelInstance, models } from '@/lib/ai/providers';
import { autoSelectModel } from '@/lib/ai/auto-router';

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

// Check if required API key is available for a model
function hasRequiredApiKey(modelId: ModelId): { valid: boolean; error?: string } {
  const model = models[modelId];
  if (!model) {
    return { valid: false, error: `Unknown model: ${modelId}` };
  }

  const provider = model.provider;
  
  if (provider === 'anthropic' || provider === 'auto') {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return { valid: false, error: 'ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.' };
    }
  }
  
  if (provider === 'perplexity') {
    const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
    if (!apiKey) {
      return { valid: false, error: 'PERPLEXITY_API_KEY is not configured. Please add it to your .env.local file.' };
    }
  }

  return { valid: true };
}

export async function POST(req: Request) {
  console.log('=== Chat API called ===');
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { messages, model = 'auto' } = body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Select model (auto-route if needed)
    const selectedModel: ModelId = model === 'auto' ? autoSelectModel(messages) : model;

    // Validate API key is available for selected model
    const keyCheck = hasRequiredApiKey(selectedModel);
    if (!keyCheck.valid) {
      console.error('API key missing:', keyCheck.error);
      return new Response(
        JSON.stringify({ error: keyCheck.error }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Return streaming response in format useChat expects (AI SDK 5.x)
    // Must use toDataStreamResponse() for useChat hook to parse correctly
    return result.toDataStreamResponse({
      headers: {
        'X-Model-Used': selectedModel,
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    const isAuthError = errorMessage.includes('api-key') || errorMessage.includes('authentication') || errorMessage.includes('401');
    
    return new Response(
      JSON.stringify({ 
        error: isAuthError 
          ? 'API authentication failed. Please check your API keys.' 
          : errorMessage 
      }),
      { status: isAuthError ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
