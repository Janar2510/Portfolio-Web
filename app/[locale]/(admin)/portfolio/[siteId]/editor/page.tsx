import { redirect } from 'next/navigation';

export default async function PortfolioEditorPage({ params }: { params: Promise<{ locale: string, siteId: string }> }) {
  const { locale, siteId } = await params;
  redirect(`/${locale}/sites/${siteId}/edit`);
}
