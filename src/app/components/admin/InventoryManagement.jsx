'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiPackage, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/admin/inventory');
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await axios.delete(`/api/admin/inventory/${itemId}`);
        if (response.status === 200) {
          toast.success('Item deleted successfully');
          fetchInventory(); // Refresh the list
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.error || 'Failed to delete item');
      }
    }
  };

  const InventoryModal = ({ item, onClose }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      category: item?.category || '',
      quantity: item?.quantity || 0,
      unit: item?.unit || '',
      minQuantity: item?.minQuantity || 0,
      location: item?.location || '',
      description: item?.description || '',
      price: item?.price?.toFixed(2) || '0.00',  // Format price with 2 decimal places
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Format price properly before sending
      const submitData = {
        ...formData,
        price: parseFloat(parseFloat(formData.price).toFixed(2))  // Ensure proper price format
      };

      try {
        if (item?._id) {
          const response = await axios.put(`/api/admin/inventory/${item._id}`, submitData);
          if (response.status === 200) {
            toast.success('Item updated successfully');
          }
        } else {
          const response = await axios.post('/api/admin/inventory', submitData);
          if (response.status === 201) {
            toast.success('Item added successfully');
          }
        }
        fetchInventory(); // Refresh the list
        onClose();
      } catch (error) {
        console.error('Save error:', error);
        toast.error(error.response?.data?.error || 'Failed to save item');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 w-full max-w-md max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-gray-100">
              {item ? 'Edit Item' : 'Add New Item'}
            </h3>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <form id="inventoryForm" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Laboratory">Laboratory</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                    placeholder="e.g., pcs, boxes"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Minimum Quantity</label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value)})}
                  className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Storage Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({
                    ...formData, 
                    price: e.target.value
                  })}
                  className="w-full rounded-lg border-gray-700 bg-gray-900 text-gray-100 p-3"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                />
              </div>
            </form>
          </div>

          <div className="flex justify-end space-x-3 mt-6 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="inventoryForm"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10"
            >
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Inventory Management
        </h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl hover:shadow-lg shadow-violet-500/20 transition-all border border-white/10"
        >
          <FiPlus className="mr-2" />
          Add New Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-700/50 text-gray-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FiPackage className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-100">{item.name}</div>
                          <div className="text-sm text-gray-400">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-xs text-gray-400">
                        Min: {item.minQuantity} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100">
                      ₹{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100">{item.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.quantity <= item.minQuantity ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FiAlertCircle className="mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <InventoryModal
          item={selectedItem}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
