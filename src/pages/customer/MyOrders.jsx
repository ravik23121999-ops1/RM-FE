import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getOrderStatusSteps } from '../../utils/helpers';
import { FiEye, FiSearch, FiFilter } from 'react-icons/fi';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/orders/my-orders?${params.toString()}`);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.patch(`/orders/${orderId}/cancel`);
      fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.message || 'Failed to cancel order');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No orders found</p>
            <button
              onClick={() => navigate('/customer/menu')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Order Status Steps */}
              {order.status !== 'cancelled' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    {getOrderStatusSteps(order.status).map((step, index) => (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step.completed
                                ? 'bg-green-500 text-white'
                                : step.current
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {step.completed ? '✓' : index + 1}
                          </div>
                          <span className="text-xs mt-1 text-center">{step.label}</span>
                        </div>
                        {index < getOrderStatusSteps(order.status).length - 1 && (
                          <div
                            className={`flex-1 h-1 mx-2 ${
                              step.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          ></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount || 0)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openDetailModal(order)}
                    className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <FiEye className="inline mr-1" />
                    Details
                  </button>
                  {(order.status === 'pending' || order.status === 'in-preparation') && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Items</p>
                <div className="bg-gray-50 rounded p-3 space-y-2">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <p className="text-lg font-medium">Total</p>
                <p className="text-xl font-bold">{formatCurrency(selectedOrder.totalAmount || 0)}</p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">{selectedOrder.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
