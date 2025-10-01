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
import AdminScheduleRequests from "./components/Admin/AdminScheduleRequests";
import ViewClasses from "./components/Classes/index";
import UserClasses from "./components/Classes/UserClasses";
import ClassDetails from "./components/Classes/ClassDetails";
import ScrollToTop from "./components/common/ScrollToTop";
import { GoogleOAuthProvider } from "@react-oauth/google";
import FeedbackPage from "./components/Feedback/FeedbackPage";
import TrainerManagement from "./components/Admin/qlhlv";
import TrainerDashboard from "./components/Trainer/Dashboard";
import TrainerClasses from "./components/Trainer/Classes";
import TrainerSchedule from "./components/Trainer/TrainerSchedule";
import ScheduleChangeRequests from "./components/Trainer/ScheduleChangeRequests";
import TrainerClassDetail from "./components/Trainer/ClassDetail";
import AttendanceFlow from "./components/Trainer/AttendanceFlow";
import NotificationToast from "./components/Common/NotificationToast";

import "./styles/vintage-global.css";
import axios from "axios";
import { setupAxiosInterceptors } from "./utils/authUtils";
import { useAccountStatusCheck } from "./hooks/useAccountStatusCheck";
import useNotifications from "./hooks/useNotifications";

// Setup axios interceptors
setupAxiosInterceptors(axios);

// Wrap toàn bộ app content
function App({ appName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Hook quản lý notifications
  const { newNotifications, markAsRead, removeNewNotification } = useNotifications();

  // Hook để kiểm tra trạng thái tài khoản định kỳ
  useAccountStatusCheck(user);

  useEffect(() => {
    // Safely access localStorage
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      console.log("App init - checking auth state:", { 
        hasUser: !!storedUser, 
        hasToken: !!storedToken 
      });
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        console.log("App loaded with user:", parsedUser);
        setUser(parsedUser);
      } else if (storedUser && !storedToken) {
        // User exists but no token, clear user data
        console.log("User found but no token, clearing user data");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
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
            <Routes>
              {/* Main routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/club" element={<Club />} />
              <Route path="/services" element={<ServicePage />} />
              <Route path="/services/detail/:id" element={<ServiceDetail />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/bill" element={<BillPage />} />
              <Route path="/user" element={<UserProfile />} />
              <Route path="/classes" element={<ViewClasses />} />
              <Route path="/my-classes" element={<UserClasses />} />
              <Route path="/classes/:id/details" element={<ClassDetails />} />
              
              {/* Feedback routes */}
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/feedback/club/:clubId" element={<FeedbackPage />} />

              {/* Trainer routes */}
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
              <Route path="/trainer/classes" element={<TrainerClasses />} />
              <Route path="/trainer/schedule" element={<TrainerSchedule />} />
              <Route path="/trainer/schedule-requests" element={<ScheduleChangeRequests />} />
              <Route path="/trainer/class/:classId" element={<TrainerClassDetail />} />
              <Route path="/trainer/attendance/:classId" element={<AttendanceFlow />} />

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
                      <Route path="trainers" element={<TrainerManagement />} />
                      <Route path="schedule-requests" element={<AdminScheduleRequests />} />
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
          
          {/* Global Notification Toast */}
          {user && (
            <NotificationToast
              notifications={newNotifications}
              onMarkAsRead={markAsRead}
              onRemove={removeNewNotification}
            />
          )}
        </div>
      </Router>
    </div>
  );
}

const GOOGLE_CLIENT_ID =
  "95171768612-385ic851574oc5145p5pkn7319ok3vfr.apps.googleusercontent.com";
const APP_NAME = "DACN-web";

export default function RootApp() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App appName={APP_NAME} />
    </GoogleOAuthProvider>
  );
}