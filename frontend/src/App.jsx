import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import RoleSelect from "./pages/RoleSelect";
import FarmerAdd from "./pages/FarmerAdd";
import FarmerLots from "./pages/FarmerLots";
import BuyerLots from "./pages/BuyerLots";
import OrderStatus from "./pages/OrderStatus";
import AgentDelivery from "./pages/AgentDelivery";
import OfflineBanner from "./components/OfflineBanner";

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <TopBar />
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/farmer/add" element={<FarmerAdd />} />
        <Route path="/farmer/lots" element={<FarmerLots />} />
        <Route path="/buyer" element={<BuyerLots />} />
        <Route path="/order/:orderId" element={<OrderStatus />} />
        <Route path="/agent" element={<AgentDelivery />} />
        {/* more routes get added here as you build screens */}
      </Routes>
    </BrowserRouter>
  );
}