import { streamText, convertToModelMessages } from 'ai';
import { ModelId, getModelInstance, models } from '@/lib/ai/providers';
import { autoSelectModel } from '@/lib/ai/auto-router';
import { buildBrandSystemPrompt, shouldIncludeFullDocs, BRAND_SOURCES, type PageContext } from '@/lib/brand-knowledge';

export const maxDuration = 60; // Allow streaming responses up to 60 seconds

// Interface for file attachments from client
interface FileAttachment {
  type: 'image';
  data: string; // Base64 data URL
  mimeType: string;
}

// Message type from client (flexible to handle various formats)
interface ClientMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
  files?: FileAttachment[];
  experimental_attachments?: FileAttachment[];
}

// Process messages to handle image attachments
function processMessagesWithImages(messages: ClientMessage[]): ClientMessage[] {
  return messages.map(msg => {
    // Check if this message has file attachments
    const imageFiles = msg.experimental_attachments || msg.files;

    if (msg.role === 'user' && imageFiles && imageFiles.length > 0) {
      // Convert to multimodal message format with parts
      const parts: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }> = [];

      // Add text content if present
      const textContent = typeof msg.content === 'string'
        ? msg.content
        : msg.parts
          ? msg.parts.filter(p => p.type === 'text').map(p => p.text || '').join('\n')
          : '';

      if (textContent) {
        parts.push({ type: 'text', text: textContent });
      }

      // Add image parts
      for (const file of imageFiles) {
        if (file.type === 'image' && file.data) {
          parts.push({ type: 'image', image: file.data });
        }
      }

      // Return message with parts array as content for multimodal
      if (parts.length > 0) {
        return {
          ...msg,
          content: parts as unknown as string, // Type cast for compatibility
          files: undefined, // Remove processed files
          experimental_attachments: undefined,
        };
      }
    }

    return msg;
  });
}

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
    const { messages, model = 'auto', context } = body as {
      messages: ClientMessage[];
      model?: string;
      context?: PageContext;
    };
    
    // Log context for debugging
    if (context) {
      console.log('Page context received:', context.type, context);
    }

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process messages to handle image attachments
    const processedMessages = processMessagesWithImages(messages as ClientMessage[]);

    // Ensure messages alternate properly (filter out consecutive messages of same role)
    const validatedMessages = processedMessages.reduce((acc: ClientMessage[], msg, idx) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelMessages = convertToModelMessages(validatedMessages as any);

    // Build brand-aware system prompt with page context
    const systemPrompt = buildBrandSystemPrompt({
      includeFullDocs: shouldIncludeFullDocs(messages),
      context: context,
    });
    
    // Log system prompt length for debugging
    console.log('System prompt built with context:', context?.type || 'none', 'Length:', systemPrompt.length);

    // Stream the response
    const result = streamText({
      model: modelInstance,
      messages: modelMessages,
      system: systemPrompt,
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
