import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

// POST - Add a new resource
export async function POST(request: Request) {
  try {
    // Verify admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.Name || !body.URL) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('Inspiration Design Resources')
      .insert([
        {
          Name: body.Name,
          URL: body.URL,
          Description: body.Description || null,
          Category: body.Category || null,
          'Sub-category': body['Sub-category'] || null,
          Pricing: body.Pricing || null,
          Featured: body.Featured ?? false,
          OpenSource: body.OpenSource ?? false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[POST /api/inspo] Supabase error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/inspo] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch all resources
export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('Inspiration Design Resources')
      .select('*');

    if (error) {
      console.error('[GET /api/inspo] Supabase error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/inspo] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

