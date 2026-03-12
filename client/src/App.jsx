import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout/Layout";
import PrivateRoute from "./components/PrivateRoute";


/* =====================
   LAZY LOADED PAGES
===================== */
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));

const Home = lazy(() => import("./pages/Home/Home"));
const Users = lazy(() => import("./pages/Home/Users"));
const Providers = lazy(() => import("./pages/Home/Providers"));
const Games = lazy(() => import("./pages/Home/Games"));
const AllPages = lazy(() => import("./pages/AllPages"));
const Recharge = lazy(() => import("./pages/Home/Recharge"));
const RechargeHistory = lazy(() => import("./pages/Home/RechargeHistory"));
const BetHistory = lazy(() => import("./pages/Home/BetHistory"));
const Notifications = lazy(() => import("./pages/Home/Notifications"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const AccessProviders = lazy(() => import("./pages/AccessProviders"));
const Docs = lazy(() => import("./pages/Doc"));
const Cricket = lazy(() => import("./pages/Cricket"));



const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ================= PUBLIC ROUTES ================= */}
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ================= PRIVATE ROUTES ================= */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/providers" element={<Providers />} />
                <Route path="/profile" element={<Users />} />
                <Route path="/provider/:provider" element={<Games />} />
                <Route path="/games" element={<AllPages />} />
                <Route path="/deposit" element={<Recharge />} />
                <Route path="/deposit-history" element={<RechargeHistory />} />
                <Route path="/bet-history" element={<BetHistory />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                
                <Route path="/cricket" element={<Cricket/>} />
                <Route path="/accessproviders" element={<AccessProviders />} />
              </Route>
              <Route path="/docs" element={<Docs/>} />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/home" replace />} />

          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;