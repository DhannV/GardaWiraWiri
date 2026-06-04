import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import OrderPaymentPage from "./pages/order/OrderPaymentPage";
import ServicesPage from "./pages/landing/ServicesPage";
import TermsAndFaqPage from "./pages/landing/TermsAndFaqPage";
import LoginPage from "./pages/landing/LoginPage";
import RegisterPage from "./pages/landing/RegisterPage";
import PelajariLayananPage from "./pages/landing/PelajariLayananPage";
import KebijakanPrivasiPage from "./pages/landing/KebijakanPrivasiPage";
// 🛠️ PERBAIKAN IMPORT: Pastikan folder aslinya sudah benar.
// Jika Dashboard berada di folder 'src/pages/client/' atau 'src/pages/freelancer/', silakan ubah di sini.
import DashboardClientPage from "./pages/landing/DashboardClientPage";
import DashboardFreelancerPage from "./pages/landing/DashboardFreelancerPage";

import FreelancerBidPage from "./components/bids/FreelancerBidPage";
import ClientBidsViewPage from "./components/bids/ClientBidsViewPage";
import CreateProject from "./components/project/CreateProject";

// 💡 IMPORT KOMPONEN KONTRAK BARU KAMU UNTUK ROUTING (Jika diperlukan halaman terpisah)
import ClientContract from "./components/contract/ClientContracts";
import FreelancerContract from "./components/contract/FreelancerContracts";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* RUTE UMUM / LANDING */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/order-payment" element={<OrderPaymentPage />} />
        <Route path="/terms-faq" element={<TermsAndFaqPage />} />
        <Route path="/pelajari-layanan" element={<PelajariLayananPage />} />
        <Route path="/kebijakan-privasi" element={<KebijakanPrivasiPage />} />
        {/* AUTHENTIKASI */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* DASHBOARD CLIENT */}
        <Route path="/dashboard-client" element={<DashboardClientPage />} />
        <Route path="/create-project" element={<CreateProject />} />
        {/* Rute Opsional jika Kontrak Client ingin diakses via URL langsung */}
        <Route
          path="/dashboard-client/contracts"
          element={<ClientContract />}
        />

        {/* DASHBOARD FREELANCER */}
        <Route
          path="/dashboard-freelancer"
          element={<DashboardFreelancerPage />}
        />
        <Route
          path="/dashboard-freelancer/bid/:projectId"
          element={<DashboardFreelancerPage />}
        />
        {/* Rute Opsional jika Kontrak Freelancer ingin diakses via URL langsung */}
        <Route
          path="/dashboard-freelancer/contracts"
          element={<FreelancerContract />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
