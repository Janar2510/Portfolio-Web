'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CreateSiteDialog } from './CreateSiteDialog';

export function NoSiteView() {
  const t = useTranslations('portfolio');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <h1 className="heading-page mb-4">{t('title')}</h1>
          <p className="body-default text-muted-foreground mb-6">
            {t('noSite')}
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="btn-primary">
            {t('createSite')}
          </Button>
        </div>
      </div>
      <CreateSiteDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
