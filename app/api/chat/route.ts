import { streamText, convertToModelMessages } from 'ai';
import { ModelId, getModelInstance, models } from '@/lib/ai/providers';
import { autoSelectModel } from '@/lib/ai/auto-router';
import { buildBrandSystemPrompt, shouldIncludeFullDocs, BRAND_SOURCES } from '@/lib/brand-knowledge';

export const maxDuration = 60; // Allow streaming responses up to 60 seconds

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

    // Ensure messages alternate properly (filter out consecutive messages of same role)
    const validatedMessages = messages.reduce((acc: typeof messages, msg, idx) => {
      if (idx === 0) {
        acc.push(msg);
      } else {
        const prevRole = acc[acc.length - 1]?.role;
        // Only add if role alternates or it's a different type
        if (msg.role !== prevRole) {
          acc.push(msg);
        } else if (msg.role === 'user') {
          // Merge consecutive user messages into one
          const prev = acc[acc.length - 1];
          const prevContent = typeof prev.content === 'string' ? prev.content : '';
          const msgContent = typeof msg.content === 'string' ? msg.content : '';
          acc[acc.length - 1] = { ...prev, content: `${prevContent}\n\n${msgContent}` };
        }
        // Skip consecutive assistant messages
      }
      return acc;
    }, []);

    // Select model (auto-route if needed)
    const selectedModel: ModelId = model === 'auto' ? autoSelectModel(validatedMessages) : model;

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

    // Convert UI messages to model messages (AI SDK 5.x requirement)
    const modelMessages = convertToModelMessages(validatedMessages);

    // Build brand-aware system prompt
    const systemPrompt = buildBrandSystemPrompt({
      includeFullDocs: shouldIncludeFullDocs(messages),
    });

    // Stream the response with generous max tokens
    const result = streamText({
      model: modelInstance,
      messages: modelMessages,
      system: systemPrompt,
      maxTokens: 4096, // Allow longer responses
    });

    // Return streaming response in format useChat expects (AI SDK 5.x)
    // Must use toUIMessageStreamResponse() for useChat hook to parse correctly
    // Include brand sources in headers for client-side citation rendering
    return result.toUIMessageStreamResponse({
      headers: {
        'X-Model-Used': selectedModel,
        'X-Brand-Sources': JSON.stringify(BRAND_SOURCES),
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
