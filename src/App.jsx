import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRestaurants from './pages/admin/Restaurants';
import AdminMenu from './pages/admin/Menu';
import AdminOrders from './pages/admin/Orders';
import AdminProfile from './pages/admin/Profile';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistNewOrder from './pages/receptionist/NewOrder';
import ReceptionistOrders from './pages/receptionist/Orders';
import ReceptionistCustomers from './pages/receptionist/Customers';
import ReceptionistProfile from './pages/receptionist/Profile';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerRestaurants from './pages/customer/Restaurants';
import CustomerMenu from './pages/customer/Menu';
import CustomerCart from './pages/customer/Cart';
import CustomerCheckout from './pages/customer/Checkout';
import CustomerMyOrders from './pages/customer/MyOrders';
import CustomerProfile from './pages/customer/Profile';

// Layout Component
const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main className={user ? 'container mx-auto px-4 py-8' : ''}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/signup" element={<Layout><Signup /></Layout>} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="restaurants" element={<AdminRestaurants />} />
                      <Route path="menu" element={<AdminMenu />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="profile" element={<AdminProfile />} />
                      <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Receptionist Routes */}
            <Route
              path="/receptionist/*"
              element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<ReceptionistDashboard />} />
                      <Route path="new-order" element={<ReceptionistNewOrder />} />
                      <Route path="orders" element={<ReceptionistOrders />} />
                      <Route path="customers" element={<ReceptionistCustomers />} />
                      <Route path="profile" element={<ReceptionistProfile />} />
                      <Route path="" element={<Navigate to="/receptionist/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<CustomerDashboard />} />
                      <Route path="restaurants" element={<CustomerRestaurants />} />
                      <Route path="menu" element={<CustomerMenu />} />
                      <Route path="cart" element={<CustomerCart />} />
                      <Route path="checkout" element={<CustomerCheckout />} />
                      <Route path="my-orders" element={<CustomerMyOrders />} />
                      <Route path="profile" element={<CustomerProfile />} />
                      <Route path="" element={<Navigate to="/customer/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
