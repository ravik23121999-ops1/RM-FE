import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiSearch, FiEye } from 'react-icons/fi';

const ReceptionistCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      // Fetch orders from the receptionist's restaurant
      const response = await api.get('/orders');
      const orders = response.data.data;
      
      // Filter orders by the receptionist's restaurant
      const restaurantOrders = orders.filter(order => 
        order.restaurant === user.restaurant
      );
      
      // Extract unique customers from these orders
      const uniqueCustomers = new Map();
      restaurantOrders.forEach(order => {
        if (order.customer && !uniqueCustomers.has(order.customer._id)) {
          uniqueCustomers.set(order.customer._id, {
            ...order.customer,
            orderCount: 1,
            totalSpent: order.totalAmount,
            lastOrderDate: order.createdAt
          });
        } else if (order.customer) {
          const existing = uniqueCustomers.get(order.customer._id);
          existing.orderCount += 1;
          existing.totalSpent += order.totalAmount;
          if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = order.createdAt;
          }
        }
      });
      
      let customersList = Array.from(uniqueCustomers.values());
      
      // Apply search filter
      if (searchTerm) {
        customersList = customersList.filter(customer =>
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)
        );
      }
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    try {
      const response = await api.get(`/orders?search=${customerId}`);
      const allOrders = response.data.data;
      
      // Filter orders by restaurant
      const restaurantOrders = allOrders.filter(order => 
        order.restaurant === user.restaurant && order.customer._id === customerId
      );
      
      setCustomerOrders(restaurantOrders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    }
  };

  const openDetailModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    fetchCustomerOrders(customer._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user.restaurant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">View customer information and order history</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEye className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurant Assigned</h2>
          <p className="text-gray-600">You are not assigned to any restaurant. Please contact the admin to get assigned to a restaurant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">View customer information and order history</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{customer.name || 'N/A'}</h3>
                <p className="text-sm text-gray-500">{customer.email || 'N/A'}</p>
                <p className="text-sm text-gray-500">{customer.phone || 'N/A'}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  customer.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-lg font-bold text-gray-900">{customer.orderCount || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-lg font-bold text-indigo-600">₹{Math.round(customer.totalSpent || 0)}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Last order: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
            </div>

            <button
              onClick={() => openDetailModal(customer)}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <FiEye className="mr-2" />
              View Details
            </button>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="h-8 w-8 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600">No customers have placed orders at your restaurant yet</p>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedCustomer.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-semibold text-gray-900">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order History</h3>
                {(!customerOrders || customerOrders.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">No orders found</div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-900">{order.orderNumber || 'N/A'}</span>
                          <span className="text-sm text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{order.items?.length || 0} items</span>
                          <span className="font-bold text-indigo-600">₹{Math.round(order.totalAmount || 0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistCustomers;
