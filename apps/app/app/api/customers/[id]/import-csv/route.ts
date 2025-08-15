/**
 * CSV Import API
 * Handles importing usage data from OpenAI/Anthropic CSV exports
 */

import { type NextRequest, NextResponse } from 'next/server';
import { CSVImporter } from '@/lib/services/csv-importer';

// Lazy initialization
let csvImporter: CSVImporter | null = null;

function getCSVImporter() {
  if (!csvImporter) {
    csvImporter = new CSVImporter(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return csvImporter;
}

/**
 * POST /api/customers/[id]/import-csv - Import CSV usage data
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const provider = (formData.get('provider') as string) || 'openai';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const csvContent = await file.text();

    // Import and analyze
    const result = await getCSVImporter().importOpenAICSV(customerId, csvContent);

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${result.rowsImported} usage records`,
      insights: result.insights,
      totalSavingsPotential: result.insights.reduce((sum, i) => sum + i.savings_potential, 0),
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json({ error: 'Failed to process CSV file' }, { status: 500 });
  }
}
