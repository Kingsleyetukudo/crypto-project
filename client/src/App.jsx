import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import Invest from "./pages/user/Invest.jsx";
import Deposits from "./pages/admin/Deposits.jsx";
import Withdrawals from "./pages/admin/Withdrawals.jsx";
import Investments from "./pages/admin/Investments.jsx";
import KycApproval from "./pages/admin/KycApproval.jsx";
import Wallets from "./pages/admin/Wallets.jsx";
import AdminHistory from "./pages/admin/History.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";
import Deposit from "./pages/user/Deposit.jsx";
import Withdraw from "./pages/user/Withdraw.jsx";
import MyInvestments from "./pages/user/MyInvestments.jsx";
import Profits from "./pages/user/Profits.jsx";
import LiveTrades from "./pages/user/LiveTrades.jsx";
import CryptoNews from "./pages/user/CryptoNews.jsx";
import History from "./pages/user/History.jsx";
import Referrals from "./pages/user/Referrals.jsx";
import Kyc from "./pages/user/Kyc.jsx";
import Help from "./pages/user/Help.jsx";
import Settings from "./pages/user/Settings.jsx";
import ContactPage from "./pages/ContactPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Deposit />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invest"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Invest />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-investments"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <MyInvestments />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Withdraw />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profits"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Profits />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trades"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <LiveTrades />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <CryptoNews />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <History />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Referrals />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Kyc />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Help />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute role="user">
              <UserLayout>
                <Settings />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deposits"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Deposits />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Withdrawals />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/investments"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Investments />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <KycApproval />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/wallets"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Wallets />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/history"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminHistory />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
