import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { FiShoppingBag, FiClock, FiCheckCircle, FiDollarSign, FiArrowRight, FiStar } from 'react-icons/fi';

const CustomerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/customer');
      setStats(response?.data?.data?.stats);
      setRecentOrders(response?.data?.data?.recentOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your orders</p>
        </div>
        <button
          onClick={() => navigate('/customer/restaurants')}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
        >
          Order Now
          <FiArrowRight className="ml-2" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FiShoppingBag className="h-6 w-6" />}
          color="from-blue-500 to-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Pending"
          value={stats.pendingOrders}
          icon={<FiClock className="h-6 w-6" />}
          color="from-yellow-500 to-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="In Preparation"
          value={stats.inPreparationOrders}
          icon={<FiClock className="h-6 w-6" />}
          color="from-purple-500 to-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Delivered"
          value={stats.deliveredOrders}
          icon={<FiCheckCircle className="h-6 w-6" />}
          color="from-green-500 to-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Total Spent */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Spent</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(stats.totalSpent)}</p>
            <p className="text-green-100 text-sm mt-2">All time purchases</p>
          </div>
          <div className="p-4 bg-white/20 rounded-full">
            <FiDollarSign className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="h-8 w-8 text-indigo-300" />
              </div>
              <p className="text-gray-500 mb-4">No orders yet. Start ordering from the menu!</p>
              <button
                onClick={() => navigate('/customer/restaurants')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders?.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer" onClick={() => navigate('/customer/my-orders')}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-xl text-indigo-600">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'in-preparation' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'prepared' ? 'bg-green-100 text-green-800' :
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FiStar className="h-4 w-4 mr-1 text-yellow-500" />
                      {order.items?.length || 0} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 bg-gradient-to-r ${color} rounded-xl shadow-md`}>
        <div className="text-white">{icon}</div>
      </div>
    </div>
  </div>
);

export default CustomerDashboard;