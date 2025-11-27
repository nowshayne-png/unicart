import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { HeroBanner } from '../lib/database.types';

export function HeroBannerCarousel() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error loading hero banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <div className="px-5 py-4">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex-shrink-0 w-80 rounded-2xl p-6 snap-start transition-all"
            style={{
              backgroundColor: banner.bg_color,
              color: banner.text_color,
            }}
          >
            <div className="h-32 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm opacity-90 line-clamp-2">
                    {banner.description}
                  </p>
                )}
              </div>

              {banner.action_text && (
                <button
                  className="self-start px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: banner.text_color,
                    color: banner.bg_color,
                  }}
                >
                  {banner.action_text}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
