import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiHeart } from 'react-icons/fi';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/customer/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">Review your items before checkout</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingCart className="h-12 w-12 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
          <button
            onClick={() => navigate('/customer/restaurants')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
          >
            Browse Restaurants
            <FiArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">Review your items before checkout</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{cart.length} items</span>
          <span className="text-gray-300">•</span>
          <span className="text-lg font-bold text-indigo-600">{formatCurrency(getCartTotal())}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍕</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name || 'N/A'}</h3>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price || 0)}</p>
                  {item.restaurantName && (
                    <p className="text-xs text-indigo-600 mt-1">{item.restaurantName}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">{formatCurrency((item.price || 0) * item.quantity)}</p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-1 transition-colors"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <FiHeart className="mr-2 text-red-500" />
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-2xl text-indigo-600">{formatCurrency(getCartTotal())}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full mt-6 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Proceed to Checkout
              <FiArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;