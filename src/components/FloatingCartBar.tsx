import { useCart } from '../contexts/CartContext';

export function FloatingCartBar({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { totalItems, totalAmount } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-5 z-50">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => onNavigate('cart')}
          className="w-full bg-[#c4ff00] text-black font-semibold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between hover:bg-[#b3e600] transition-all transform hover:scale-[1.02]"
        >
          <span>View Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
          <span>₹{totalAmount}</span>
        </button>
      </div>
    </div>
  );
}
