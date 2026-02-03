import { Navigate, Route, Routes } from 'react-router-dom';

import { MiniAppLayout } from '@/layouts/MiniAppLayout';
import { BagPage } from '@/pages/bag/BagPage';
import { CharactersPage } from '@/pages/characters/CharactersPage';
import { GiftsPage } from '@/pages/gifts/GiftsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MiniAppLayout />}>
        <Route path="/" element={<Navigate to="/characters" replace />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/gifts" element={<GiftsPage />} />
        <Route path="/bag" element={<BagPage />} />
      </Route>
    </Routes>
  );
}
