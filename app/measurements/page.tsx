'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Ruler } from 'lucide-react';
import { addBodyMeasurement, getBodyMeasurements, deleteBodyMeasurement } from '@/lib/db';
import { BodyMeasurement } from '@/lib/types';

export default function MeasurementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    waist: '',
    chest: '',
    arms: '',
    thighs: '',
    hips: '',
    neck: '',
    notes: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);

  const loadMeasurements = async () => {
    if (!user) return;
    setLoadingMeasurements(true);
    try {
      const entries = await getBodyMeasurements(user.id);
      setMeasurements(entries);
    } catch (error) {
      console.error('Error loading measurements:', error);
    } finally {
      setLoadingMeasurements(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // At least one measurement must be provided
    const hasMeasurement = formData.waist || formData.chest || formData.arms || 
                          formData.thighs || formData.hips || formData.neck;
    
    if (!hasMeasurement) {
      alert('Please enter at least one measurement');
      return;
    }

    try {
      await addBodyMeasurement({
        userId: user.id,
        date: formData.date,
        waist: formData.waist ? parseFloat(formData.waist) : undefined,
        chest: formData.chest ? parseFloat(formData.chest) : undefined,
        arms: formData.arms ? parseFloat(formData.arms) : undefined,
        thighs: formData.thighs ? parseFloat(formData.thighs) : undefined,
        hips: formData.hips ? parseFloat(formData.hips) : undefined,
        neck: formData.neck ? parseFloat(formData.neck) : undefined,
        notes: formData.notes || undefined,
      });
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        waist: '',
        chest: '',
        arms: '',
        thighs: '',
        hips: '',
        neck: '',
        notes: '',
      });
      setShowAddForm(false);
      loadMeasurements();
    } catch (error) {
      console.error('Error adding measurement:', error);
      alert('Failed to add measurement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return;
    try {
      await deleteBodyMeasurement(id);
      loadMeasurements();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Failed to delete measurement');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Body Measurements</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Measurement
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Body Measurement</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arms (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.arms}
                    onChange={(e) => setFormData({ ...formData, arms: e.target.value })}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thighs (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.thighs}
                    onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hips (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.hips}
                    onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 95"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Neck (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.neck}
                    onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 38"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Measurement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      date: format(new Date(), 'yyyy-MM-dd'),
                      waist: '',
                      chest: '',
                      arms: '',
                      thighs: '',
                      hips: '',
                      neck: '',
                      notes: '',
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Measurement History</h2>
          {loadingMeasurements ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Ruler size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-2">No measurements recorded yet.</p>
              <p className="text-sm">Click "Add Measurement" to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        {format(new Date(measurement.date), 'MMMM d, yyyy')}
                      </p>
                      {measurement.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{measurement.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(measurement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {measurement.waist && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Waist</p>
                        <p className="font-semibold">{measurement.waist} cm</p>
                      </div>
                    )}
                    {measurement.chest && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Chest</p>
                        <p className="font-semibold">{measurement.chest} cm</p>
                      </div>
                    )}
                    {measurement.arms && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Arms</p>
                        <p className="font-semibold">{measurement.arms} cm</p>
                      </div>
                    )}
                    {measurement.thighs && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Thighs</p>
                        <p className="font-semibold">{measurement.thighs} cm</p>
                      </div>
                    )}
                    {measurement.hips && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Hips</p>
                        <p className="font-semibold">{measurement.hips} cm</p>
                      </div>
                    )}
                    {measurement.neck && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Neck</p>
                        <p className="font-semibold">{measurement.neck} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

