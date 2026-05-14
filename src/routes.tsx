import { Navigate, Route, Routes } from 'react-router-dom';

import { MiniAppLayout } from '@/layouts/MiniAppLayout';
import { AffiliatePage } from '@/pages/affiliate/AffiliatePage';
import { BagPage } from '@/pages/bag/BagPage';
import { GiftsPage } from '@/pages/gifts/GiftsPage';
import { GirlPage } from '@/pages/girls/GirlPage';
import { GirlsPage } from '@/pages/girls/GirlsPage';
import { CreateCharacterPage } from '@/pages/my-girls/CreateCharacterPage';
import { CreateScenarioPage } from '@/pages/my-girls/CreateScenarioPage';
import { MyGirlPage } from '@/pages/my-girls/MyGirlPage';
import { MyGirlsPage } from '@/pages/my-girls/MyGirlsPage';
import { StorePage } from '@/pages/store/StorePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MiniAppLayout />}>
        <Route path="/" element={<Navigate to="/girls" replace />} />
        <Route path="/girls" element={<GirlsPage />} />
        <Route path="/girls/:id" element={<GirlPage />} />
        <Route path="/my-girls" element={<MyGirlsPage />} />
        <Route path="/my-girls/create" element={<CreateCharacterPage />} />
        <Route
          path="/my-girls/:id/scenarios/create"
          element={<CreateScenarioPage />}
        />
        <Route path="/my-girls/:id" element={<MyGirlPage />} />
        <Route path="/gifts" element={<GiftsPage />} />
        <Route path="/bag" element={<BagPage />} />
        <Route path="/affiliate" element={<AffiliatePage />} />
        <Route path="/store" element={<StorePage />} />
      </Route>
    </Routes>
  );
}
