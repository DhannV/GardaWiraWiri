import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import LandingPage from "./pages/landing/LandingPage";
import OrderPaymentPage from "./pages/order/OrderPaymentPage";
import ServicesPage from "./pages/landing/ServicesPage";
import TermsAndFaqPage from "./pages/landing/TermsAndFaqPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/order-payment" element={<OrderPaymentPage />} />
        <Route path="/terms-faq" element={<TermsAndFaqPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
