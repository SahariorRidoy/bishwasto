'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AlertCircle } from 'lucide-react';

export default function ShopUpdateForm({ shop, shopId, onCancel }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    category: shop?.category || '',
    location: shop?.location || ''
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}shop/categories/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data && response.data.results) {
          setCategories(response.data.results);
        } else {
          const categoriesData = Array.isArray(response.data) ? response.data : response.data.categories || [];
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch shop categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const accessToken = Cookies.get('accessToken');
      const payload = {
        name: formData.name,
        category: formData.category !== '' ? parseInt(formData.category) : null,
        location: formData.location
      };

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}shop/${shopId}/`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        // Refresh the page to show updated shop info
        router.refresh();
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating shop:', err);
      setError(err.response?.data?.message || 'Failed to update shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm dark:bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Update Shop Information</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
            Shop updated successfully! Refreshing page...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-[#00ADB5] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-[#00ADB5] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a category</option>
                {loadingCategories ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-[#00ADB5] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter shop location"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#00ADB5] hover:bg-[#00989f] text-white font-medium py-2 px-4 rounded-md dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update Shop'}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}