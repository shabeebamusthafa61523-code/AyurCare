import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  Search, 
  PackageCheck, 
  Layers, 
  Calendar, 
  Truck, 
  X,
  Droplet,
  BookOpen,
  Building,
  Filter
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';

const CATEGORIES = [
  'All',
  'Kashayam',
  'Arishtam / Asavam',
  'Tailam / Thailam',
  'Ghritam',
  'Churnam',
  'Gulika / Vati',
  'Lehyam / Rasayanam',
  'Bhasmam / Pishti',
  'Panchakarma Supplies',
  'Consumables & Linen'
];

export default function PharmacyInventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Kashayam',
    classicalReference: 'Sahasrayogam',
    manufacturer: 'Kottakkal Arya Vaidya Sala',
    batchNumber: 'BATCH-2026',
    quantity: 50,
    unit: 'Bottles',
    minStockLevel: 10,
    purchasePrice: 160,
    sellingPrice: 220,
    supplier: 'AVS Kottakkal Depot',
    location: 'Rack A - Kashaya Shala',
    expiryDate: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getPharmacyItems();
      if (res.success) setItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const count = items.length;
      const prefix = newItem.category.substring(0, 3).toUpperCase();
      const itemCode = `${prefix}-${101 + count}`;
      const res = await polyclinicService.createPharmacyItem({
        ...newItem,
        itemCode,
        quantity: Number(newItem.quantity),
        purchasePrice: Number(newItem.purchasePrice),
        sellingPrice: Number(newItem.sellingPrice),
        minStockLevel: Number(newItem.minStockLevel)
      });
      if (res.success) {
        setShowModal(false);
        setNewItem({
          name: '',
          category: 'Kashayam',
          classicalReference: 'Sahasrayogam',
          manufacturer: 'Kottakkal Arya Vaidya Sala',
          batchNumber: 'BATCH-2026',
          quantity: 50,
          unit: 'Bottles',
          minStockLevel: 10,
          purchasePrice: 160,
          sellingPrice: 220,
          supplier: 'AVS Kottakkal Depot',
          location: 'Rack A - Kashaya Shala',
          expiryDate: ''
        });
        fetchItems();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (i.itemCode && i.itemCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (i.manufacturer && i.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockItems = items.filter(i => i.quantity <= i.minStockLevel);
  const totalStockValue = items.reduce((acc, i) => acc + (i.quantity * i.sellingPrice), 0);

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Classical Herbal Formulations
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-emerald-400" /> Aushadhi Shala (Herbal Dispensary & Inventory)
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            Track Kashayams, Arishtas, Thailams, Churnas, Ghrithams, Gulikas, manufacturer batches, classical text references, and low stock alerts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg transition text-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Aushadhi Item
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{items.length}</div>
            <div className="text-[11px] text-slate-500">Total Formulations</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{lowStockItems.length}</div>
            <div className="text-[11px] text-slate-500">Low Stock Warnings</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </div>
            <div className="text-[11px] text-slate-500">Units in Stock</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            ₹
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">₹{totalStockValue.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Retail Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex items-center gap-3 text-amber-900 dark:text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-xs">Low Aushadhi Stock Alert ({lowStockItems.length} items require re-ordering)</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lowStockItems.map(i => `${i.name} (${i.quantity} left)`).join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search herbal formulation, manufacturer (Kottakkal, Vaidyaratnam), or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">Aushadhi Name</th>
                <th className="py-3.5 px-3 font-bold">Category</th>
                <th className="py-3.5 px-3 font-bold">Manufacturer / Source</th>
                <th className="py-3.5 px-3 font-bold">Batch & Location</th>
                <th className="py-3.5 px-3 font-bold text-center">Stock</th>
                <th className="py-3.5 px-3 font-bold text-right">Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredItems.map(item => (
                <tr key={item._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">{item.itemCode}</span>
                      {item.classicalReference && <span>• Ref: {item.classicalReference}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300">
                    <div>{item.manufacturer || 'Ayurvedic Lab'}</div>
                    <div className="text-[10px] text-slate-400">{item.supplier}</div>
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <div className="font-mono text-[11px] text-slate-500">{item.batchNumber}</div>
                    <div className="text-[10px] text-slate-400">{item.location}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                      item.quantity <= item.minStockLevel
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {item.quantity} {item.unit || 'Units'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="font-bold text-slate-900 dark:text-white">₹{item.sellingPrice}</div>
                    <div className="text-[10px] text-slate-400">Cost: ₹{item.purchasePrice}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" /> Add New Aushadhi Formulation
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aushadhi Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharasnadi Kashayam, Dasamoolarishtam..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category (Kalpana) *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Classical Text Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Sahasrayogam, Ashtanga Hridaya"
                    value={newItem.classicalReference}
                    onChange={(e) => setNewItem({ ...newItem, classicalReference: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Kottakkal AVS, Vaidyaratnam, AVP"
                    value={newItem.manufacturer}
                    onChange={(e) => setNewItem({ ...newItem, manufacturer: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newItem.batchNumber}
                    onChange={(e) => setNewItem({ ...newItem, batchNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.purchasePrice}
                    onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellingPrice: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="Bottles, Jars, Strips, Cans"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Shelf</label>
                  <input
                    type="text"
                    placeholder="Rack A - Kashaya Shala"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Add to Dispensary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
