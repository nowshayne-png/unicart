import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { HeroBanner } from '../lib/database.types';

export function AdminHeroBanners() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    bg_color: '#1a1a1a',
    text_color: '#ffffff',
    action_text: '',
    action_link: '',
    order: 0,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      alert('Please enter a banner title');
      return;
    }

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('hero_banners')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            bg_color: formData.bg_color,
            text_color: formData.text_color,
            action_text: formData.action_text,
            action_link: formData.action_link,
            order: Number(formData.order),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
        alert('Banner updated successfully!');
      } else {
        const { error } = await supabase.from('hero_banners').insert({
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url,
          bg_color: formData.bg_color,
          text_color: formData.text_color,
          action_text: formData.action_text,
          action_link: formData.action_link,
          order: Number(formData.order),
          is_active: true,
        });

        if (error) throw error;
        alert('Banner added successfully!');
      }

      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({
          is_active: !banner.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', banner.id);

      if (error) throw error;
      loadBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase.from('hero_banners').delete().eq('id', id);

      if (error) throw error;
      alert('Banner deleted successfully!');
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image_url: banner.image_url,
      bg_color: banner.bg_color,
      text_color: banner.text_color,
      action_text: banner.action_text,
      action_link: banner.action_link,
      order: banner.order,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      bg_color: '#1a1a1a',
      text_color: '#ffffff',
      action_text: '',
      action_link: '',
      order: 0,
    });
    setEditingBanner(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading banners...</div>;
  }

  return (
    <div className="space-y-6">
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-[#c4ff00] text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#b3e600] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Banner
        </button>
      )}

      {showAddForm && (
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <h2 className="font-semibold mb-4">
            {editingBanner ? 'Edit Banner' : 'Add New Banner'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Banner Title (e.g., 🎉 New Menu Items!) *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20 resize-none"
            />

            <input
              type="text"
              placeholder="Image URL (optional)"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Background Color</label>
                <input
                  type="color"
                  value={formData.bg_color}
                  onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Text Color</label>
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
            </div>

            <input
              type="text"
              placeholder="CTA Button Text (e.g., Shop Now)"
              value={formData.action_text}
              onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
            />

            <input
              type="text"
              placeholder="CTA Link or Action"
              value={formData.action_link}
              onChange={(e) => setFormData({ ...formData, action_link: e.target.value })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
            />

            <input
              type="number"
              placeholder="Display Order (0, 1, 2...)"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-[#c4ff00] text-black font-semibold py-3 rounded-xl hover:bg-[#b3e600] transition-colors"
              >
                {editingBanner ? 'Update' : 'Add'} Banner
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
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="rounded-2xl p-5"
            style={{
              backgroundColor: banner.bg_color,
              color: banner.text_color,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-lg">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm opacity-90 mb-2">{banner.description}</p>
                )}
                {banner.action_text && (
                  <p className="text-xs opacity-75">CTA: {banner.action_text}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  {banner.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs opacity-75 pt-2 border-t" style={{ borderColor: banner.text_color + '40' }}>
              Order: {banner.order} | {banner.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
