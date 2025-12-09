import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

/**
 * MealSelector Component
 * 
 * Allows clients to:
 * 1. Select predefined meal packages (bed & breakfast, half board, full board, etc.)
 * 2. Choose à la carte items (breakfast, lunch, dinner, soft drinks, etc.)
 * 3. Create custom meal bundles (e.g., "Dinner R300 + 2 soft drinks + lunch voucher")
 * 4. View per-head/per-night pricing with total calculations
 */
export default function MealSelector({ 
  onMealsSelected, 
  headCount = 1, 
  nights = 1,
  bookingType = 'FIT' 
}) {
  const [mealItems, setMealItems] = useState({});
  const [packages, setPackages] = useState({});
  const [selectedMode, setSelectedMode] = useState('none'); // none, package, alacarte, custom
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [pricing, setPricing] = useState(null);

  // Load available meal items and packages on mount
  useEffect(() => {
    async function loadMealOptions() {
      try {
        const [itemsRes, packagesRes] = await Promise.all([
          fetch('/api/meals/items'),
          fetch('/api/meals/packages'),
        ]);

        if (itemsRes.ok && packagesRes.ok) {
          const itemsData = await itemsRes.json();
          const packagesData = await packagesRes.json();
          setMealItems(itemsData);
          setPackages(packagesData);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load meal options:', err);
        setError('Failed to load meal options');
        setLoading(false);
      }
    }

    loadMealOptions();
  }, []);

  // Calculate pricing when selections change
  useEffect(() => {
    calculatePricing();
  }, [selectedMode, selectedPackage, selectedItems, customItems, headCount, nights]);

  async function calculatePricing() {
    if (selectedMode === 'none') {
      setPricing(null);
      onMealsSelected([]);
      return;
    }

    try {
      let response;

      if (selectedMode === 'package' && selectedPackage) {
        response = await fetch('/api/meals/calculate-package', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: selectedPackage,
            headCount: bookingType === 'Groups' ? headCount : 1,
            nights,
          }),
        });
      } else if (selectedMode === 'alacarte' && selectedItems.length > 0) {
        response = await fetch('/api/meals/calculate-alacarte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemIds: selectedItems,
            headCount,
          }),
        });
      } else if (selectedMode === 'custom' && customItems.length > 0) {
        response = await fetch('/api/meals/calculate-custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealRequirements: customItems,
            headCount,
          }),
        });
      }

      if (response?.ok) {
        const data = await response.json();
        setPricing(data);
        onMealsSelected(data);
      }
    } catch (err) {
      console.error('Failed to calculate pricing:', err);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading meal options...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-brand-brown mb-3">Meal Plan</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="mealMode"
              value="none"
              checked={selectedMode === 'none'}
              onChange={e => {
                setSelectedMode(e.target.value);
                setSelectedPackage(null);
                setSelectedItems([]);
                setCustomItems([]);
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">No meals (room only)</span>
          </label>

          {packages.accommodation && packages.accommodation.length > 0 && (
            <>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="mealMode"
                  value="package"
                  checked={selectedMode === 'package'}
                  onChange={e => setSelectedMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Meal packages</span>
              </label>

              {selectedMode === 'package' && (
                <div className="ml-7 space-y-2 mt-2">
                  {packages.accommodation.map(pkg => (
                    <label key={pkg.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="package"
                        value={pkg.id}
                        checked={selectedPackage === pkg.id}
                        onChange={e => setSelectedPackage(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-brown">{pkg.name}</p>
                        <p className="text-xs text-gray-600">{pkg.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="mealMode"
              value="alacarte"
              checked={selectedMode === 'alacarte'}
              onChange={e => setSelectedMode(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">À la carte items</span>
          </label>

          {selectedMode === 'alacarte' && (
            <div className="ml-7 space-y-3 mt-2">
              {Object.entries(mealItems).map(([category, items]) => (
                <div key={category}>
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="flex items-center gap-2 text-sm font-semibold text-brand-brown hover:text-orange-600"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedCategory === category ? 'rotate-180' : ''
                      }`}
                    />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>

                  {expandedCategory === category && (
                    <div className="ml-6 space-y-2 mt-2">
                      {items.map(item => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, item.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== item.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                          <span className="text-xs font-semibold text-brand-orange whitespace-nowrap">
                            ZAR {item.pricePerHead || 0}/head
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="mealMode"
              value="custom"
              checked={selectedMode === 'custom'}
              onChange={e => setSelectedMode(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Custom meal bundle</span>
          </label>

          {selectedMode === 'custom' && (
            <div className="ml-7 space-y-3 mt-2">
              {customItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <input
                    type="text"
                    placeholder="Description (e.g., Dinner)"
                    value={item.description || ''}
                    onChange={e => {
                      const updated = [...customItems];
                      updated[index].description = e.target.value;
                      setCustomItems(updated);
                    }}
                    className="flex-1 text-sm border border-cream-border rounded px-2 py-1"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity || 1}
                    onChange={e => {
                      const updated = [...customItems];
                      updated[index].quantity = Number(e.target.value);
                      setCustomItems(updated);
                    }}
                    className="w-12 text-sm border border-cream-border rounded px-2 py-1"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price (ZAR)"
                    value={item.pricePerUnit || ''}
                    onChange={e => {
                      const updated = [...customItems];
                      updated[index].pricePerUnit = Number(e.target.value);
                      setCustomItems(updated);
                    }}
                    className="w-24 text-sm border border-cream-border rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomItems(customItems.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setCustomItems([...customItems, { description: '', quantity: 1, pricePerUnit: 0 }])}
                className="flex items-center gap-1 text-xs text-brand-orange hover:text-orange-600 font-medium"
              >
                <Plus className="h-3 w-3" />
                Add item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      {pricing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-brand-brown mb-3">Meal Cost Summary</h4>
          <div className="space-y-2 text-sm">
            {pricing.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-gray-700">
                <span>{item.name || item.description}</span>
                <span className="font-medium">ZAR {item.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold text-brand-orange">
                <span>Total:</span>
                <span>ZAR {pricing.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {pricing.headCount && pricing.headCount > 1 && (
              <p className="text-xs text-gray-600 mt-2">
                {pricing.headCount} {pricing.type === 'a_la_carte' ? 'guests' : 'people'} × meal selections
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
