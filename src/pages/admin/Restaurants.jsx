import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiToggleLeft, FiToggleRight, FiMapPin, FiClock, FiStar, FiCoffee } from 'react-icons/fi';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cuisine: '',
    openingHours: '9:00 AM - 10:00 PM',
    image: '',
  });

  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm]);

  const fetchRestaurants = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/restaurants?${params.toString()}`);
      setRestaurants(response.data.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/restaurants', {
        ...formData,
        cuisine: formData.cuisine.split(',').map(c => c.trim()).filter(c => c),
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        cuisine: '',
        openingHours: '9:00 AM - 10:00 PM',
        image: '',
      });
      fetchRestaurants();
    } catch (error) {
      console.error('Error adding restaurant:', error);
      alert(error.response?.data?.message || 'Failed to add restaurant');
    }
  };

  const handleEditRestaurant = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/restaurants/${selectedRestaurant._id}`, {
        ...formData,
        cuisine: formData.cuisine.split(',').map(c => c.trim()).filter(c => c),
      });
      setShowEditModal(false);
      setSelectedRestaurant(null);
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        cuisine: '',
        openingHours: '9:00 AM - 10:00 PM',
        image: '',
      });
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert(error.response?.data?.message || 'Failed to update restaurant');
    }
  };

  const handleToggleStatus = async (restaurantId) => {
    try {
      await api.patch(`/restaurants/${restaurantId}/status`);
      fetchRestaurants();
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      alert(error.response?.data?.message || 'Failed to update restaurant status');
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      await api.delete(`/restaurants/${restaurantId}`);
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert(error.response?.data?.message || 'Failed to delete restaurant');
    }
  };

  const openEditModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      cuisine: restaurant.cuisine.join(', '),
      openingHours: restaurant.openingHours,
      image: restaurant.image || '',
    });
    setShowEditModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
          <p className="text-gray-600 mt-1">Manage restaurants in the system</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <FiPlus className="mr-2" />
          Add Restaurant
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100 group">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{restaurant.name || 'N/A'}</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-yellow-500">
                    <FiStar className="h-4 w-4" />
                    <span className="ml-1 text-sm font-medium">{restaurant.rating || 0}</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      restaurant.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
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
                    <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
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

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleStatus(restaurant._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      restaurant.isActive 
                        ? 'text-yellow-600 hover:bg-yellow-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={restaurant.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {restaurant.isActive ? <FiToggleRight className="h-5 w-5" /> : <FiToggleLeft className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(restaurant)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
          <FiCoffee className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first restaurant</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Restaurant
          </button>
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <ModalWrapper onClose={() => setShowAddModal(false)} title="Add Restaurant">
          <RestaurantForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleAddRestaurant} 
            onCancel={() => setShowAddModal(false)}
            isEdit={false}
          />
        </ModalWrapper>
      )}

      {/* Edit Restaurant Modal */}
      {showEditModal && selectedRestaurant && (
        <ModalWrapper onClose={() => { setShowEditModal(false); setSelectedRestaurant(null); }} title="Edit Restaurant">
          <RestaurantForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleEditRestaurant} 
            onCancel={() => { setShowEditModal(false); setSelectedRestaurant(null); }}
            isEdit={true}
          />
        </ModalWrapper>
      )}
    </div>
  );
};

const ModalWrapper = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

const RestaurantForm = ({ formData, setFormData, onSubmit, onCancel, isEdit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Name
      </label>
      <input
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>
      <textarea
        required
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Address
      </label>
      <input
        type="text"
        required
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Phone
      </label>
      <input
        type="tel"
        required
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email
      </label>
      <input
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Cuisine (comma-separated)
      </label>
      <input
        type="text"
        value={formData.cuisine}
        onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
        placeholder="Italian, Chinese, Indian"
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Opening Hours
      </label>
      <input
        type="text"
        value={formData.openingHours}
        onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Image URL (optional)
      </label>
      <input
        type="url"
        value={formData.image}
        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
      >
        {isEdit ? 'Update Restaurant' : 'Add Restaurant'}
      </button>
    </div>
  </form>
);

export default AdminRestaurants;