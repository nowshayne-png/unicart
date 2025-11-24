import { useEffect, useState } from 'react';
import { Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/database.types';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-gray-400">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today's Orders</h2>
        <span className="text-sm text-gray-400">{orders.length} total</span>
      </div>

      {orders.map((order) => (
        <div key={order.id} className="bg-[#1a1a1a] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1">{order.user_name}</h3>
              <p className="text-sm text-gray-400">
                {new Date(order.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className="text-[#c4ff00] font-bold text-lg">₹{order.total_amount}</span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>
                {order.hostel} - Room {order.room}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Phone className="w-4 h-4" />
              <a href={`tel:${order.phone}`} className="hover:text-[#c4ff00]">
                {order.phone}
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-sm text-gray-400 mb-2">Items:</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm mb-1">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="text-gray-400">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-400">{order.payment_mode}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
