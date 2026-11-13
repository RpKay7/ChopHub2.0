
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import OrderReview from "./pages/OrderReview";
import OrderConfirmation from "./pages/OrderConfirmation";
import CustomerDashboard from "./pages/CustomerDashboard";
import OrderTracking from "./pages/OrderTracking";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Intro from "./components/Intro";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 3800);

    return () => clearTimeout(introTimer);
  }, []);

  return (
    <>
      {showIntro && <Intro />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} /}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<CustomerDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-review" element={<OrderReview />} />
          <Route path="/track-order" element={<OrderTracking />} />
        </Route>

        <Route
          path="/order-confirmation"
          element={<OrderConfirmation />}
        />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
