import React from "react";
import { Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, productName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-sm mb-4">
            <Trash2 size={22} />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-800">Delete Product</h3>
          <p className="mt-2 text-sm text-slate-500 px-2">
            Are you sure you want to delete <span className="font-medium text-slate-700">"{productName}"</span>? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 transition-colors"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}