import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import {
  FiUsers,
  FiShoppingBag,
  FiTrendingUp,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiHome,
  FiCoffee,
  FiStar,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setStats(response.data.data.stats);
      setCharts(response.data.data.charts);
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

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of restaurant operations</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
            <FiTrendingUp className="mr-2" />
            View Reports
          </button>
        </div>
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
          title="Today's Orders"
          value={stats.todayOrders}
          icon={<FiClock className="h-6 w-6" />}
          color="from-green-500 to-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<FiAlertCircle className="h-6 w-6" />}
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
          title="Delivered Orders"
          value={stats.deliveredOrders}
          icon={<FiCheckCircle className="h-6 w-6" />}
          color="from-emerald-500 to-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<FiUsers className="h-6 w-6" />}
          color="from-indigo-500 to-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          title="Total Receptionists"
          value={stats.totalReceptionists}
          icon={<FiUsers className="h-6 w-6" />}
          color="from-pink-500 to-pink-600"
          bgColor="bg-pink-50"
        />
        <StatCard
          title="Total Menu Items"
          value={stats.totalMenuItems}
          icon={<FiCoffee className="h-6 w-6" />}
          color="from-cyan-500 to-cyan-600"
          bgColor="bg-cyan-50"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Today's Revenue</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(stats.todayRevenue)}
              </p>
              <p className="text-green-100 text-sm mt-2">+12.5% from yesterday</p>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <FiDollarSign className="h-8 w-8" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-blue-100 text-sm mt-2">All time earnings</p>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <FiTrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Day */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiShoppingBag className="mr-2 text-indigo-600" />
            Orders by Day (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Day */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-green-600" />
            Revenue by Day (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-600" />
            Order Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(charts.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-600" />
            Popular Menu Items
          </h3>
          <div className="space-y-3">
            {(charts.popularItems || []).slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.totalQuantity} sold</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(item.totalRevenue)}</p>
              </div>
            ))}
          </div>
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

export default AdminDashboard;
