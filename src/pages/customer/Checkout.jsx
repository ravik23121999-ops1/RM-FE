import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    paymentMethod: 'cash',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if all items are from the same restaurant
    const restaurants = [...new Set(cart.map(item => item.restaurant))];
    if (restaurants.length > 1) {
      alert('You can only order from one restaurant at a time');
      setLoading(false);
      return;
    }

    if (restaurants.length === 0 || !restaurants[0]) {
      alert('Please select a restaurant first');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          subtotal: (item.price || 0) * item.quantity,
        })),
        restaurant: restaurants[0],
        orderType: 'online',
        customerDetails: {
          name: user?.name || 'Guest',
          phone: user?.phone || 'N/A',
        },
        customer: user._id,
        createdBy: user._id,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        totalAmount: getCartTotal(),
      };

      const response = await api.post('/orders', orderData);
      clearCart();
      navigate('/customer/my-orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to create order');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <button
          onClick={() => navigate('/customer/menu')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{user?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">{user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user?.email || 'N/A'}</span>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Items</h3>
          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>{item.name || 'N/A'} x {item.quantity}</span>
                <span>{formatCurrency((item.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatCurrency(getCartTotal())}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="card">Card</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special requests or instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : `Place Order - ${formatCurrency(getCartTotal())}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
