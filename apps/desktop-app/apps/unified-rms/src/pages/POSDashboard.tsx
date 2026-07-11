import React from 'react';
import AppShell from '../layouts/AppShell';
import PosPage from '../modules/hq/views/PosPage';

export default function POSDashboard() {
  return (
    <AppShell pageTitle="نقطة بيع (POS)">
      <PosPage />
    </AppShell>
  );
}
