/**
 * Customer Management API
 * Handles customer registration and profile management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Lazy initialization
let supabase: any = null;

function getSupabase() {
  if (!supabase && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// Validation schemas
const createCustomerSchema = z.object({
  email: z.string().email(),
  companyName: z.string().min(1),
});

const updateCustomerSchema = z.object({
  email: z.string().email().optional(),
  companyName: z.string().min(1).optional(),
  status: z.enum(['trial', 'active', 'paused', 'churned']).optional(),
});

/**
 * POST /api/customers - Create new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName } = createCustomerSchema.parse(body);

    // Check if customer already exists
    const { data: existing } = await getSupabase()
      .from('customers')
      .select('id, email, company_name, status')
      .eq('email', email)
      .single();

    if (existing) {
      // Return existing customer instead of error
      return NextResponse.json(
        { 
          message: 'Welcome back! Continuing with your existing account.',
          existingCustomer: {
            id: existing.id,
            email: existing.email,
            companyName: existing.company_name,
            status: existing.status
          }
        },
        { status: 409 }
      );
    }

    // Create new customer
    const { data: customer, error } = await getSupabase()
      .from('customers')
      .insert({
        email,
        company_name: companyName,
        status: 'trial'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Log the action
    await getSupabase().from('audit_logs').insert({
      customer_id: customer.id,
      action: 'customer_created',
      entity_type: 'customer',
      entity_id: customer.id,
      metadata: { email, companyName }
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        companyName: customer.company_name,
        status: customer.status,
        createdAt: customer.created_at
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customers - List customers (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    let query = supabase
      .from('customers')
      .select('id, email, company_name, status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customers: customers?.map(customer => ({
        id: customer.id,
        email: customer.email,
        companyName: customer.company_name,
        status: customer.status,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      })) || []
    });
  } catch (error) {
    console.error('Error in GET /api/customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}