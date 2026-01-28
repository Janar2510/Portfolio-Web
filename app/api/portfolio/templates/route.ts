import { NextResponse } from 'next/server';
import { listTemplates } from '@/domain/templates/registry';
import { convertTemplateDefToPortfolioTemplate } from '@/domain/builder/templates/converter';

export async function GET() {
  try {
    const staticTemplates = listTemplates().map(def =>
      convertTemplateDefToPortfolioTemplate(def)
    );
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
