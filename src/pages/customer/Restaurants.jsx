import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiSearch, FiClock, FiMapPin, FiStar, FiCoffee, FiArrowRight } from 'react-icons/fi';

const CustomerRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm]);

  const fetchRestaurants = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('isActive', 'true');

      const response = await api.get(`/restaurants?${params.toString()}`);
      setRestaurants(response.data.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRestaurant = (restaurantId) => {
    navigate(`/customer/menu?restaurant=${restaurantId}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Choose a Restaurant</h1>
          <p className="text-gray-600 mt-1">Browse our partner restaurants and order delicious food</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants by name or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100 group">
            {restaurant.image ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                  <FiStar className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">{restaurant.rating || 0}</span>
                </div>
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <FiCoffee className="h-16 w-16 text-indigo-300" />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name || 'N/A'}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description || 'No description'}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FiMapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{restaurant.address || 'No address'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiClock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{restaurant.openingHours || 'No hours'}</span>
                </div>
              </div>

              {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs rounded-full font-medium">
                      {cuisine}
                    </span>
                  ))}
                  {restaurant.cuisine.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{restaurant.cuisine.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => handleSelectRestaurant(restaurant._id)}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center font-medium"
              >
                View Menu
                <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <FiCoffee className="mx-auto h-20 w-20 text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants found</h3>
          <p className="text-gray-600 mb-6">We couldn't find any restaurants matching your search</p>
          <button
            onClick={() => setSearchTerm('')}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerRestaurants;