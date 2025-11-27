import { NextRequest } from 'next/server';

interface EnvCheckResult {
  secretKeys: {
    ANTHROPIC_API_KEY: boolean;
    PERPLEXITY_API_KEY: boolean;
  };
  publicKeys: {
    NEXT_PUBLIC_SUPABASE_URL: string | null;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check secret keys (only return boolean)
    const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
    const hasPerplexityKey = Boolean(process.env.PERPLEXITY_API_KEY);

    // Check public keys (safe to show first 20 characters)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const result: EnvCheckResult = {
      secretKeys: {
        ANTHROPIC_API_KEY: hasAnthropicKey,
        PERPLEXITY_API_KEY: hasPerplexityKey,
      },
      publicKeys: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl 
          ? supabaseUrl.substring(0, 20) + '...' 
          : null,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey 
          ? supabaseAnonKey.substring(0, 20) + '...' 
          : null,
      },
    };

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return Response.json(
      { 
        error: 'Failed to check environment variables',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

