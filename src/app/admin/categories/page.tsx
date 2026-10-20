'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) {
      setError('Please enter a category name');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCatName('');
        setSuccess(`Category "${name}" created successfully!`);
        await loadCategories();
      } else {
        setError(data.error || 'Failed to add category');
      }
    } catch {
      setError('Network error while adding category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c._id !== id));
      } else {
        alert('Failed to delete category');
      }
    } catch {
      alert('Network error while deleting category');
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="pb-12"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">System Management</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            Platform <span className="text-[#0012FF] font-black">Categories</span>
          </h1>
        </div>
      </div>

      {/* Add New Category Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm mb-8">
        <h2 className="text-xl font-black text-black mb-1">Add New Category</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Categories appear dynamically across Homepage, Explore Creators, and Creator Onboarding.
        </p>

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => {
              setNewCatName(e.target.value);
              setError('');
              setSuccess('');
            }}
            placeholder="Category name (e.g. Gaming, Real Estate, Crypto)"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
          />
          <button
            type="submit"
            disabled={!newCatName.trim() || isSubmitting}
            className="px-6 py-3 bg-[#0012FF] disabled:bg-blue-300 text-white rounded-xl text-sm font-bold shadow-md shadow-[#0012FF]/20 hover:bg-[#0010d0] transition-all cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? 'Adding...' : '+ Add Category'}
          </button>
        </form>

        {error && <p className="text-xs text-red-500 font-semibold mt-3">{error}</p>}
        {success && <p className="text-xs text-emerald-600 font-semibold mt-3">{success}</p>}
      </div>

      {/* Category List */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-black">Active Categories ({categories.length})</h2>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 font-semibold py-8 text-center">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-400 font-semibold py-8 text-center">No categories found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0012FF]/10 text-[#0012FF] flex items-center justify-center font-bold text-xs">
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">{cat.name}</p>
                    <p className="text-xs text-gray-400 font-medium">/{cat.slug}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCategory(cat._id, cat.name)}
                  className="px-3 py-1 bg-red-50 border border-red-200 rounded-full text-[11px] font-bold text-red-600 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
