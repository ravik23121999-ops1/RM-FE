import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';
import { FiSearch, FiFilter, FiEye, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';

const ReceptionistOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">View and manage orders</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="h-8 w-8 text-red-400" />
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">View and manage orders for your restaurant</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
        <p className="text-sm text-indigo-800">
          <strong>Managing:</strong> {user.restaurant?.name || 'Unknown Restaurant'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-preparation">In Preparation</option>
            <option value="prepared">Prepared</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-gray-900">{order.orderNumber}</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                    {order.orderType}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-medium text-gray-900">{order.customerDetails?.name || 'Guest'}</p>
                    <p className="text-gray-500">{order.customerDetails?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Items</p>
                    <p className="font-medium text-gray-900">{order.items?.length || 0} items</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-bold text-lg text-indigo-600">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                <button
                  onClick={() => openDetailModal(order)}
                  className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiEye className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="h-8 w-8 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.orderNumber}</h2>
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
                  <p className="text-sm text-gray-600 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customerDetails?.name || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerDetails?.phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Order Type</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.orderType}</p>
                  {selectedOrder.tableNumber && (
                    <p className="text-sm text-gray-500">Table: {selectedOrder.tableNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">Items</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-lg font-medium text-gray-900">Total</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Notes</p>
                  <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'in-preparation', 'prepared', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedOrder.status === status
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistOrders;