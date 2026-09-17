import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { useCart } from '../../context/CartContext';
import { FiSearch, FiFilter, FiShoppingCart, FiPlus, FiMinus, FiStar, FiClock } from 'react-icons/fi';

const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchParams] = useSearchParams();

  const { addToCart } = useCart();

  const categories = ['Starters', 'Main Course', 'Pizza', 'Burger', 'Pasta', 'Drinks', 'Desserts', 'Other'];

  useEffect(() => {
    const restaurantId = searchParams.get('restaurant');
    if (restaurantId) {
      setRestaurantFilter(restaurantId);
    }
    fetchMenuItems();
    fetchRestaurants();
  }, [searchTerm, categoryFilter, restaurantFilter, searchParams]);

  const fetchMenuItems = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (restaurantFilter) params.append('restaurant', restaurantFilter);
      params.append('isAvailable', 'true');

      const response = await api.get(`/menu?${params.toString()}`);
      setMenuItems(response.data.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data.data);
      
      if (restaurantFilter) {
        const restaurant = response.data.data.find(r => r._id === restaurantFilter);
        setSelectedRestaurant(restaurant);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleAddToCart = (item) => {
    if (!restaurantFilter) {
      alert('Please select a restaurant first');
      return;
    }
    addToCart({ ...item, restaurant: restaurantFilter, restaurantName: selectedRestaurant?.name });
    alert(`${item.name} added to cart!`);
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
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedRestaurant ? selectedRestaurant.name : 'Menu'}
          </h1>
          <p className="text-gray-600 mt-1">
            {selectedRestaurant ? `Browse delicious items from ${selectedRestaurant.name}` : 'Browse our delicious items'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">All Restaurants</option>
            {restaurants.map((rest) => (
              <option key={rest._id} value={rest._id}>
                {rest.name}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100 group">
            {item.image ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <span className="text-orange-300 text-4xl">🍕</span>
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name || 'N/A'}</h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <FiClock className="h-4 w-4 mr-1" />
                  <span>{item.preparationTime || 0} min</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-600">{formatCurrency(item.price || 0)}</span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <FiShoppingCart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or select a different restaurant</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setRestaurantFilter('');
            }}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
