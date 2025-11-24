import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { OrderBatch } from '../lib/database.types';

const statusOptions = [
  { step: 1, label: 'Collecting Orders' },
  { step: 2, label: 'Order Placed at Restaurant' },
  { step: 3, label: 'Preparing Food' },
  { step: 4, label: 'Out for Delivery' },
  { step: 5, label: 'Delivered' },
];

export function AdminTracking() {
  const [batch, setBatch] = useState<OrderBatch | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [slotLabel, setSlotLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBatch();
  }, []);

  const loadBatch = async () => {
    try {
      const { data } = await supabase
        .from('order_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setBatch(data);
        setCurrentStep(data.current_step);
        setStatusMessage(data.status_message);
        setSlotLabel(data.slot_label);
      }
    } catch (error) {
      console.error('Error loading batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!batch) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('order_batches')
        .update({
          current_step: currentStep,
          status_message: statusMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', batch.id);

      if (error) throw error;

      alert('Tracking status updated successfully!');
      loadBatch();
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Failed to update tracking status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateNewBatch = async () => {
    if (!slotLabel) {
      alert('Please enter a slot label');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.from('order_batches').insert({
        slot_label: slotLabel,
        current_step: 1,
        status_message: 'Accepting orders for this slot',
      });

      if (error) throw error;

      alert('New batch created successfully!');
      loadBatch();
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create new batch');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a] rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Current Batch</h2>
        <p className="text-gray-400 text-sm mb-2">Slot Label</p>
        <p className="font-semibold mb-4">{batch?.slot_label || 'No active batch'}</p>

        <button
          onClick={() => setSlotLabel('')}
          className="text-sm text-[#c4ff00] hover:underline"
        >
          Create New Batch →
        </button>
      </div>

      {slotLabel === '' && (
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Create New Batch</h2>
          <input
            type="text"
            placeholder="e.g., Dinner 8:00-8:30 PM"
            value={slotLabel}
            onChange={(e) => setSlotLabel(e.target.value)}
            className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20"
          />
          <button
            onClick={handleCreateNewBatch}
            disabled={updating}
            className="w-full bg-[#c4ff00] text-black font-semibold py-3 rounded-xl hover:bg-[#b3e600] transition-colors disabled:opacity-50"
          >
            {updating ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      )}

      {batch && slotLabel !== '' && (
        <>
          <div className="bg-[#1a1a1a] rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Update Tracking Status</h2>

            <div className="space-y-3 mb-5">
              {statusOptions.map((option) => (
                <label
                  key={option.step}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
                    currentStep === option.step
                      ? 'bg-[#c4ff00] text-black'
                      : 'bg-[#252525] text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  <input
                    type="radio"
                    name="step"
                    value={option.step}
                    checked={currentStep === option.step}
                    onChange={(e) => setCurrentStep(Number(e.target.value))}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">
                    Step {option.step}: {option.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">
                Custom Message (shown to all users)
              </label>
              <textarea
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="E.g., Orders for 8-8:30 slot are being prepared..."
                rows={3}
                className="w-full bg-[#252525] text-white rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4ff00]/20 resize-none"
              />
            </div>

            <button
              onClick={handleUpdateTracking}
              disabled={updating}
              className="w-full bg-[#c4ff00] text-black font-semibold py-3 rounded-xl hover:bg-[#b3e600] transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Tracking Status'}
            </button>
          </div>

          <div className="bg-[#252525] rounded-2xl p-5">
            <p className="text-sm text-gray-400 text-center">
              💡 All users in this batch will see the updated status immediately
            </p>
          </div>
        </>
      )}
    </div>
  );
}
