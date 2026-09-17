import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiHome } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome className="h-4 w-4" /> },
          { path: '/admin/users', label: 'Users', icon: <FiUser className="h-4 w-4" /> },
          { path: '/admin/restaurants', label: 'Restaurants', icon: <FiHome className="h-4 w-4" /> },
          { path: '/admin/menu', label: 'Menu', icon: <FiHome className="h-4 w-4" /> },
          { path: '/admin/orders', label: 'Orders', icon: <FiHome className="h-4 w-4" /> },
        ];
      case 'receptionist':
        return [
          { path: '/receptionist/dashboard', label: 'Dashboard', icon: <FiHome className="h-4 w-4" /> },
          { path: '/receptionist/orders', label: 'Orders', icon: <FiHome className="h-4 w-4" /> },
          { path: '/receptionist/new-order', label: 'New Order', icon: <FiHome className="h-4 w-4" /> },
          { path: '/receptionist/customers', label: 'Customers', icon: <FiUser className="h-4 w-4" /> },
        ];
      case 'customer':
        return [
          { path: '/customer/dashboard', label: 'Dashboard', icon: <FiHome className="h-4 w-4" /> },
          { path: '/customer/restaurants', label: 'Restaurants', icon: <FiHome className="h-4 w-4" /> },
          { path: '/customer/menu', label: 'Menu', icon: <FiHome className="h-4 w-4" /> },
          { path: '/customer/cart', label: 'Cart', icon: <FiShoppingCart className="h-4 w-4" /> },
          { path: '/customer/my-orders', label: 'My Orders', icon: <FiHome className="h-4 w-4" /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'receptionist': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={`/${user.role}/dashboard`} className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <span className="text-2xl">🍽️</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  RMS
                </span>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleBadgeColor()}`}>
                  {user.role}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user.role === 'customer' && (
              <Link
                to="/customer/cart"
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <FiShoppingCart className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px]">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            )}

            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-4 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                <span className="ml-3">{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {user.role === 'customer' && (
                <Link
                  to="/customer/cart"
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiShoppingCart className="h-5 w-5" />
                  <span>Cart ({getCartItemCount()})</span>
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <FiLogOut className="h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
