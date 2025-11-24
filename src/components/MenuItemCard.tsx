import { Plus, Minus } from 'lucide-react';
import type { MenuItem } from '../lib/database.types';
import { useCart } from '../contexts/CartContext';

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find((ci) => ci.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
      <div className="aspect-square bg-[#252525] flex items-center justify-center text-4xl">
        {item.category === 'Biryani' && '🍛'}
        {item.category === 'Chinese' && '🥡'}
        {item.category === 'Snacks' && '🍟'}
        {item.category === 'Drinks' && '🥤'}
      </div>

      <div className="p-4">
        <h3 className="font-semibold mb-1 text-sm">{item.name}</h3>
        <p className="text-[#c4ff00] font-bold text-lg mb-3">₹{item.price}</p>

        {quantity === 0 ? (
          <button
            onClick={() => addToCart(item)}
            className="w-full bg-[#c4ff00] text-black font-semibold py-2.5 rounded-xl hover:bg-[#b3e600] transition-colors"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#c4ff00] text-black rounded-xl px-3 py-2.5">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold">{quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
