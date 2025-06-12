import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Login from "./components/Login/index";
import SignUp from "./components/SignUp";
import HomePage from "./components/Home";
import NavBar from "./components/Global/Nav";
import Footer from "./components/Global/Fot";
import Club from "./components/Club/index";
import ServicePage from "./components/Services/ServicePage";
import ServiceDetail from "./components/Services/ServiceDetail";
import PaymentPage from "./components/Pay/index";
import BillPage from "./components/Pay/bill";
import AdminClubManager from "./components/Admin/qlclb";
import AdminServiceManager from "./components/Admin/qldv";
import UserProfile from "./components/Users";
import MembershipPage from "./components/Membership";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/Dashboard";
import ViewClasses from "./components/Classes/index";
import UserClasses from "./components/Classes/UserClasses";
import ClassDetails from "./components/Classes/ClassDetails";
import ScrollToTop from "./components/common/ScrollToTop";

import "./styles/vintage-global.css";

// Wrap toàn bộ app content
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safely access localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("App loaded with user:", parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vintage-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-vintage-primary border-t-transparent mx-auto mb-4"></div>
          <p className="vintage-body text-vintage-neutral">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-cream">
      <Router>
        <ScrollToTop />
        <div className="app-container">
          <NavBar user={user} setUser={setUser} />
          <main className="pt-16 main-content">
            {" "}
            {/* Add padding-top for fixed navbar */}
            <Routes>
              {/* Main routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/club" element={<Club />} />
              <Route path="/services" element={<ServicePage />} />
              {/* Fix: Thêm route detail trước route :id */}
              <Route path="/services/detail/:id" element={<ServiceDetail />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/bill" element={<BillPage />} />
              <Route path="/user" element={<UserProfile />} />
              <Route path="/classes" element={<ViewClasses />} />
              <Route path="/my-classes" element={<UserClasses />} />
              <Route path="/classes/:id/details" element={<ClassDetails />} />

              {/* Admin routes - tất cả qua dashboard */}
              <Route
                path="/admin/*"
                element={
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminDashboard />} />
                      <Route path="classes" element={<AdminDashboard />} />
                      <Route path="attendance" element={<AdminDashboard />} />
                      <Route path="payments" element={<AdminDashboard />} />
                      <Route path="memberships" element={<AdminDashboard />} />
                      <Route path="services" element={<AdminDashboard />} />
                      <Route path="clubs" element={<AdminDashboard />} />
                      <Route path="images" element={<AdminDashboard />} />
                      <Route path="stats" element={<AdminDashboard />} />
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </AdminLayout>
                }
              />

              {/* Standalone admin routes (legacy) */}
              <Route path="/qlclb" element={<AdminClubManager />} />
              <Route path="/qldv" element={<AdminServiceManager />} />

              {/* Default admin route */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </div>
  );
}

export default App;
