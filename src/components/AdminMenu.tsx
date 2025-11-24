import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MenuItem } from '../lib/database.types';

export function AdminMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Biryani',
    description: '',
    is_recommended: false,
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: formData.name,
            price: Number(formData.price),
            category: formData.category,
            description: formData.description,
            is_recommended: formData.is_recommended,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        alert('Item updated successfully!');
      } else {
        const { error } = await supabase.from('menu_items').insert({
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
          description: formData.description,
          is_recommended: formData.is_recommended,
          is_available: true,
          image_url: '',
        });

        if (error) throw error;
        alert('Item added successfully!');
      }

      resetForm();
      loadMenuItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (error) throw error;
      loadMenuItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);

      if (error) throw error;
      alert('Item deleted successfully!');
      loadMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description,
      is_recommended: item.is_recommended,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'Biryani',
      description: '',
      is_recommended: false,
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading menu...</div>;
  }

  return (
    <div className="space-y-6">
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-[#c4ff00] text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#b3e600] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Item
        </button>
      )}

      {showAddForm && (
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <h2 className="font-semibold mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Item Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
              required
            />

            <input
              type="number"
              placeholder="Price (₹) *"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
              required
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
            >
              <option value="Biryani">Biryani</option>
              <option value="Chinese">Chinese</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
            </select>

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20 resize-none"
            />

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={formData.is_recommended}
                onChange={(e) =>
                  setFormData({ ...formData, is_recommended: e.target.checked })
                }
                className="w-5 h-5"
              />
              <span>Mark as Recommended</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-[#c4ff00] text-black font-semibold py-3 rounded-xl hover:bg-[#b3e600] transition-colors"
              >
                {editingItem ? 'Update' : 'Add'} Item
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-[#252525] text-white font-semibold py-3 rounded-xl hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-[#c4ff00] font-bold mb-1">₹{item.price}</p>
                <p className="text-sm text-gray-400">{item.category}</p>
                {item.is_recommended && (
                  <span className="inline-block mt-2 text-xs bg-[#c4ff00] text-black px-2 py-1 rounded">
                    Recommended
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 hover:bg-[#252525] rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => handleToggleAvailability(item)}
              className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                item.is_available
                  ? 'bg-[#252525] text-white hover:bg-[#2a2a2a]'
                  : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              }`}
            >
              {item.is_available ? 'Available' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
