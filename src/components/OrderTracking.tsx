import { useEffect, useState } from 'react';
import { ArrowLeft, Package, ChefHat, Bike, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { OrderBatch } from '../lib/database.types';

interface OrderTrackingProps {
  onNavigate: (screen: string) => void;
}

const steps = [
  { id: 1, label: 'Collecting Orders', icon: Clock },
  { id: 2, label: 'Order Placed', icon: Package },
  { id: 3, label: 'Preparing Food', icon: ChefHat },
  { id: 4, label: 'Out for Delivery', icon: Bike },
  { id: 5, label: 'Delivered', icon: CheckCircle },
];

export function OrderTracking({ onNavigate }: OrderTrackingProps) {
  const [batch, setBatch] = useState<OrderBatch | null>(null);

  useEffect(() => {
    loadBatchStatus();

    const interval = setInterval(loadBatchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBatchStatus = async () => {
    try {
      const { data } = await supabase
        .from('order_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setBatch(data);
    } catch (error) {
      console.error('Error loading batch status:', error);
    }
  };

  const currentStep = batch?.current_step || 1;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800 px-5 py-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="px-5 py-8">
          <h1 className="text-2xl font-bold mb-2">Order Tracking</h1>
          <p className="text-gray-400 mb-8">{batch?.slot_label || 'Loading...'}</p>

          <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-8">
            <div className="relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isUpcoming = step.id > currentStep;

                return (
                  <div key={step.id} className="relative">
                    <div className="flex items-start gap-4 pb-8 last:pb-0">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[#c4ff00] text-black'
                              : isCurrent
                              ? 'bg-[#c4ff00] text-black ring-4 ring-[#c4ff00]/20'
                              : 'bg-[#252525] text-gray-400'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>

                        {index < steps.length - 1 && (
                          <div
                            className={`absolute top-12 left-6 w-0.5 h-8 transition-colors ${
                              isCompleted ? 'bg-[#c4ff00]' : 'bg-[#252525]'
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 pt-2">
                        <h3
                          className={`font-semibold mb-1 ${
                            isCompleted || isCurrent ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </h3>
                        {isCurrent && (
                          <p className="text-sm text-gray-400">In progress...</p>
                        )}
                        {isCompleted && (
                          <p className="text-sm text-[#c4ff00]">Completed</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#c4ff00] mt-2" />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">
                  Last update: {new Date(batch?.updated_at || '').toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-white">{batch?.status_message || 'No updates yet'}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#252525] rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-400">
              💡 All orders in this slot share the same delivery status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
