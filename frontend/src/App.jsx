import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import OfflineBanner from "./components/OfflineBanner";

const RoleSelect = lazy(() => import("./pages/RoleSelect"));
const FarmerAdd = lazy(() => import("./pages/FarmerAdd"));
const FarmerLots = lazy(() => import("./pages/FarmerLots"));
const BuyerLots = lazy(() => import("./pages/BuyerLots"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const AgentDelivery = lazy(() => import("./pages/AgentDelivery"));
const ExploreMap = lazy(() => import("./pages/ExploreMap"));
const MarketPrices = lazy(() => import("./pages/MarketPrices"));
const QualityGrading = lazy(() => import("./pages/QualityGrading"));
const PoolingDetails = lazy(() => import("./pages/PoolingDetails"));
const NotificationsPage = lazy(() => import("./pages/AccountPages").then((pages) => ({ default: pages.NotificationsPage })));
const ProfilePage = lazy(() => import("./pages/AccountPages").then((pages) => ({ default: pages.ProfilePage })));
const SettingsPage = lazy(() => import("./pages/AccountPages").then((pages) => ({ default: pages.SettingsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Suspense fallback={<div className="loading-state"><span className="spinner" />Loading KisanPool…</div>}>
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route element={<AppShell role="farmer" />}>
            <Route path="/farmer/add" element={<FarmerAdd />} />
            <Route path="/farmer/lots" element={<FarmerLots />} />
            <Route path="/quality" element={<QualityGrading />} />
          </Route>
          <Route element={<AppShell />}>
            <Route path="/map" element={<ExploreMap />} />
            <Route path="/prices" element={<MarketPrices />} />
            <Route path="/lot/:lotId" element={<PoolingDetails />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route element={<AppShell role="buyer" />}>
            <Route path="/buyer" element={<BuyerLots />} />
            <Route path="/order/:orderId" element={<OrderStatus />} />
          </Route>
          <Route element={<AppShell role="agent" />}>
            <Route path="/agent" element={<AgentDelivery />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
