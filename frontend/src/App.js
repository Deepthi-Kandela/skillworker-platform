import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import Home from './pages/Home';
import Search from './pages/Search';
import Categories from './pages/Categories';
import WorkerProfile from './pages/WorkerProfile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NearbyWorkers from './pages/Worker/NearbyWorkers/NearbyWorkers';
import MyBookings from './pages/Customer/MyBookings';
import CustomerDashboard from './pages/Customer/CustomerDashboard/CustomerDashboard';
import WorkerDashboard from './pages/Worker/WorkerDashboard';
import WorkerSetup from './pages/Worker/WorkerSetup';
import AdminDashboard from './pages/Admin/AdminDashboard';
import BookingPage from './pages/Booking/BookingPage';
import NotFound from './pages/NotFound';
import ChatPage from './pages/Chat/ChatPage';
import WalletPage from './pages/Wallet/WalletPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import ComplaintsPage from './pages/Complaints/ComplaintsPage';
import SubscriptionsPage from './pages/Subscriptions/SubscriptionsPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/worker/:id" element={<WorkerProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/nearby" element={<NearbyWorkers />} />
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['customer']}>
            <MyBookings />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/book/:workerId" element={
          <ProtectedRoute roles={['customer']}>
            <BookingPage />
          </ProtectedRoute>
        } />

        <Route path="/worker/setup" element={
          <ProtectedRoute roles={['worker']}>
            <WorkerSetup />
          </ProtectedRoute>
        } />

        <Route path="/worker/dashboard" element={
          <ProtectedRoute roles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute roles={['customer', 'worker']}>
            <ChatPage />
          </ProtectedRoute>
        } />

        <Route path="/wallet" element={
          <ProtectedRoute roles={['customer', 'worker']}>
            <WalletPage />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute roles={['customer', 'worker', 'admin']}>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        <Route path="/complaints" element={
          <ProtectedRoute roles={['customer', 'worker']}>
            <ComplaintsPage />
          </ProtectedRoute>
        } />

        <Route path="/subscriptions" element={
          <ProtectedRoute roles={['worker']}>
            <SubscriptionsPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
