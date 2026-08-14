'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ThaiRiskForm from '@/components/ThaiRiskForm';

export default function ThaiRiskPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <ThaiRiskForm />
      </div>
    </AppLayout>
  );
}
