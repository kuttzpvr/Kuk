import React, { useState } from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';
import { Product } from '../../types';

export const SizeChartModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}> = ({ product, isOpen, onClose }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  const isTee = product.category === 't-shirts';
  const isBottom = product.category === 'bottoms';

  // Standard measurements
  const chartDataInches = isTee
    ? [
        { size: 'S', chest: '40', length: '28', shoulder: '20' },
        { size: 'M', chest: '42', length: '29', shoulder: '21' },
        { size: 'L', chest: '44', length: '30', shoulder: '22' },
        { size: 'XL', chest: '46', length: '31', shoulder: '23' },
        { size: 'XXL', chest: '48', length: '32', shoulder: '24' },
      ]
    : isBottom
    ? [
        { size: '30', chest: 'Waist: 30', length: '40', shoulder: 'Thigh: 24' },
        { size: '32', chest: 'Waist: 32', length: '41', shoulder: 'Thigh: 25' },
        { size: '34', chest: 'Waist: 34', length: '42', shoulder: 'Thigh: 26' },
      ]
    : [
        { size: 'S', chest: 'Bust: 36', length: '46', shoulder: 'Waist: 32' },
        { size: 'M', chest: 'Bust: 38', length: '46', shoulder: 'Waist: 34' },
        { size: 'L', chest: 'Bust: 40', length: '47', shoulder: 'Waist: 36' },
        { size: 'XL', chest: 'Bust: 42', length: '47', shoulder: 'Waist: 38' },
      ];

  const factor = unit === 'cm' ? 2.54 : 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-zinc-900" />
            <h3 className="font-heading font-extrabold text-base text-zinc-950">
              Official Size Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Unit Toggle */}
          <div className="flex items-center justify-between bg-zinc-100 p-1 rounded-xl">
            <span className="text-[11px] font-semibold text-zinc-600 px-2">Unit of Measure</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  unit === 'in' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  unit === 'cm' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500'
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="rounded-2xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                  <th className="py-2.5 px-2">Size</th>
                  <th className="py-2.5 px-2">{isBottom ? 'Waist' : isTee ? 'Chest' : 'Bust'}</th>
                  <th className="py-2.5 px-2">Length</th>
                  <th className="py-2.5 px-2">{isBottom ? 'Thigh' : isTee ? 'Shoulder' : 'Waist'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {chartDataInches.map((row, i) => {
                  const toVal = (valStr: string) => {
                    const num = parseFloat(valStr.replace(/[^0-9.]/g, ''));
                    if (isNaN(num)) return valStr;
                    return (num * factor).toFixed(unit === 'cm' ? 1 : 0);
                  };
                  return (
                    <tr key={i} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-2 font-black text-zinc-950">{row.size}</td>
                      <td className="py-2.5 px-2">{toVal(row.chest)}</td>
                      <td className="py-2.5 px-2">{toVal(row.length)}</td>
                      <td className="py-2.5 px-2">{toVal(row.shoulder)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fit Tip */}
          <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl flex items-start gap-2 text-zinc-800">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[11px] block text-amber-900">
                {product.fit}
              </span>
              <span className="text-[11px] text-amber-800">
                If you prefer a true-to-size standard look, choose one size smaller than your usual regular fit. For the intended relaxed street drape, pick your regular size.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
