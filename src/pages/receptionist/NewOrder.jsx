import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiMinus, FiTrash2, FiSearch } from 'react-icons/fi';

const ReceptionistNewOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInCustomer, setWalkInCustomer] = useState({ name: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [orderDetails, setOrderDetails] = useState({
    tableNumber: '',
    notes: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    fetchMenuItems();
    fetchCustomers();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu?isAvailable=true');
      setMenuItems(response.data.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/users?role=customer');
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const addToOrder = (menuItem) => {
    const existingItem = orderItems.find((item) => item.menuItem === menuItem._id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItem === menuItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromOrder(index);
      return;
    }
    setOrderItems(
      orderItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromOrder = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getOrderTotal = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    if (!isWalkIn && !selectedCustomer) {
      alert('Please select a customer or choose walk-in');
      return;
    }

    if (isWalkIn && (!walkInCustomer.name || !walkInCustomer.phone)) {
      alert('Please provide walk-in customer details');
      return;
    }

    try {
      const orderData = {
        items: orderItems.map((item) => ({
          menuItem: item.menuItem,
          name: item.name,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        orderType: 'reception',
        customerDetails: isWalkIn
          ? walkInCustomer
          : {
              name: selectedCustomer.name,
              phone: selectedCustomer.phone,
            },
        customer: isWalkIn ? null : selectedCustomer._id,
        createdBy: user._id,
        tableNumber: orderDetails.tableNumber,
        notes: orderDetails.notes,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: getOrderTotal(),
      };

      await api.post('/orders', orderData);
      alert('Order created successfully');
      navigate('/receptionist/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to create order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
        <p className="text-gray-600">Create a new order for customer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Menu and Customer Selection */}
        <div className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isWalkIn}
                    onChange={() => setIsWalkIn(false)}
                    className="mr-2"
                  />
                  <span>Existing Customer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isWalkIn}
                    onChange={() => setIsWalkIn(true)}
                    className="mr-2"
                  />
                  <span>Walk-in Customer</span>
                </label>
              </div>

              {!isWalkIn ? (
                <div>
                  <select
                    value={selectedCustomer?._id || ''}
                    onChange={(e) => {
                      const customer = customers.find((c) => c._id === e.target.value);
                      setSelectedCustomer(customer);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name || 'N/A'} - {customer.phone || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={walkInCustomer.name}
                    onChange={(e) =>
                      setWalkInCustomer({ ...walkInCustomer, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="tel"
                    placeholder="Customer Phone"
                    value={walkInCustomer.phone}
                    onChange={(e) =>
                      setWalkInCustomer({ ...walkInCustomer, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Menu Search */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-lg shadow p-6 max-h-96 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Menu Items</h2>
            <div className="space-y-3">
              {filteredMenuItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{item.category || 'N/A'}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-indigo-600">
                      {formatCurrency(item.price || 0)}
                    </span>
                    <button
                      onClick={() => addToOrder(item)}
                      className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Order Details */}
        <div className="space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price || 0)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromOrder(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency((item.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Details Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="text"
                  value={orderDetails.tableNumber}
                  onChange={(e) =>
                    setOrderDetails({ ...orderDetails, tableNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={orderDetails.paymentMethod}
                  onChange={(e) =>
                    setOrderDetails({ ...orderDetails, paymentMethod: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={orderDetails.notes}
                  onChange={(e) =>
                    setOrderDetails({ ...orderDetails, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(getOrderTotal())}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={orderItems.length === 0}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistNewOrder;
