import { Navigate, Route, Routes } from 'react-router-dom';

import { MiniAppLayout } from '@/layouts/MiniAppLayout';
import { BagPage } from '@/pages/bag/BagPage';
import { GiftsPage } from '@/pages/gifts/GiftsPage';
import { GirlsPage } from '@/pages/girls/GirlsPage';
import { StorePage } from '@/pages/store/StorePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MiniAppLayout />}>
        <Route path="/" element={<Navigate to="/girls" replace />} />
        <Route path="/girls" element={<GirlsPage />} />
        <Route path="/gifts" element={<GiftsPage />} />
        <Route path="/bag" element={<BagPage />} />
        <Route path="/store" element={<StorePage />} />
      </Route>
    </Routes>
  );
}
