import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Check, Save } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminConfigModal: React.FC = () => {
  const { adminConfig, updateAdminConfig, isAdminModalOpen, setIsAdminModalOpen } = useShop();

  const [codFee, setCodFee] = useState(adminConfig.codFee);
  const [codAdvance, setCodAdvance] = useState(adminConfig.codAdvance);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(adminConfig.freeShippingThreshold);
  const [shippingFee, setShippingFee] = useState(adminConfig.shippingFee);
  const [announcement, setAnnouncement] = useState(adminConfig.announcement);
  const [isSaving, setIsSaving] = useState(false);

  if (!isAdminModalOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateAdminConfig({
      codFee: Number(codFee),
      codAdvance: Number(codAdvance),
      freeShippingThreshold: Number(freeShippingThreshold),
      shippingFee: Number(shippingFee),
      announcement,
    });
    setIsSaving(false);
    setIsAdminModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-heading font-extrabold text-sm text-white">
                Store Admin & COD Engine
              </h3>
              <span className="text-[10px] text-zinc-400">
                Backend-synchronized payment logic
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto flex flex-col gap-4 text-xs">
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 flex flex-col gap-2.5">
            <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>COD & Partial Payment Rules</span>
            </span>

            <div>
              <label className="text-zinc-600 font-medium block mb-1">
                COD Advance Amount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={codAdvance}
                onChange={(e) => setCodAdvance(Number(e.target.value))}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Amount customer pays online to confirm COD order (e.g. ₹99)
              </span>
            </div>

            <div>
              <label className="text-zinc-600 font-medium block mb-1">
                Full COD Handling Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={codFee}
                onChange={(e) => setCodFee(Number(e.target.value))}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Additional courier convenience charge for full COD (e.g. ₹49)
              </span>
            </div>
          </div>

          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 flex flex-col gap-2.5">
            <span className="font-bold text-zinc-900 text-xs">Shipping Rules</span>

            <div>
              <label className="text-zinc-600 font-medium block mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900"
              />
            </div>

            <div>
              <label className="text-zinc-600 font-medium block mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-700 font-bold block mb-1">
              Top Announcement Ticker
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-2 w-full py-3 rounded-2xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating Store...' : 'Save & Synchronize'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
