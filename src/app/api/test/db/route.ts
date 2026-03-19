import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = createAdminClient();
    
    // Test 1: Check connection to events table
    const { data: testData, error: testError } = await admin.from('events').select('id').limit(1);
    if (testError) {
      return NextResponse.json({ error: 'DB connection failed', details: testError.message }, { status: 500 });
    }
    
    // Test 2: Try to read from event_registrations
    const { data: regData, error: regError } = await admin.from('event_registrations').select('id').limit(1);
    
    // Test 3: Try a dummy insert (will fail but shows if columns exist)
    const { error: insertError } = await admin.from('event_registrations').insert({
      event_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      status: 'test',
      payment_method: 'test'
    }).select();
    
    return NextResponse.json({
      connection: 'OK',
      eventsAccessible: !!testData,
      registrationsAccessible: !!regData,
      registrationsReadError: regError?.message || null,
      insertError: insertError?.message || null,
      insertErrorCode: insertError?.code || null,
      env: {
        hasServiceKey: !!(process.env.NEXT_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      }
    });
  } catch (err) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
