import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';
import { FiShoppingBag, FiClock, FiCheckCircle, FiUsers, FiPlus, FiList, FiArrowRight } from 'react-icons/fi';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/receptionist');
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Unable to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage restaurant operations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders}
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
          title="Prepared"
          value={stats.preparedOrders}
          icon={<FiCheckCircle className="h-6 w-6" />}
          color="from-green-500 to-green-600"
          bgColor="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Customers */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Customers</p>
              <p className="text-4xl font-bold mt-1">{stats.totalCustomers}</p>
              <p className="text-indigo-100 text-sm mt-2">Served today</p>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <FiUsers className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/receptionist/new-order')}
              className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all border border-indigo-100 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <FiPlus className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-indigo-900">New Order</p>
                  <p className="text-sm text-indigo-600">Create order</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate('/receptionist/orders')}
              className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all border border-green-100 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FiList className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-900">View Orders</p>
                  <p className="text-sm text-green-600">Manage orders</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate('/receptionist/orders')}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
          >
            View All
            <FiArrowRight className="ml-1" />
          </button>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="h-8 w-8 text-indigo-300" />
              </div>
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders?.slice(0, 5).map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer" onClick={() => navigate('/receptionist/orders')}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{order.customerDetails?.name || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                    </div>
                    <p className="font-bold text-xl text-indigo-600">{formatCurrency(order.totalAmount)}</p>
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

export default ReceptionistDashboard;