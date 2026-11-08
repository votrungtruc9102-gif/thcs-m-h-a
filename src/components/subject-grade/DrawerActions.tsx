import React from 'react';
import { ArrowRight, X } from 'lucide-react';

interface DrawerActionsProps {
  onCancel: () => void;
  onApply: () => void;
  isValid: boolean;
}

export const DrawerActions: React.FC<DrawerActionsProps> = ({ onCancel, onApply, isValid }) => {
  return (
    <div className="flex items-center gap-3 pt-3 border-t border-[#E2EAF5] mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-3 px-4 rounded-xl border border-[#CBD5E1] text-[#475569] font-semibold text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <X className="w-4 h-4" />
        Hủy
      </button>

      <button
        type="button"
        disabled={!isValid}
        onClick={onApply}
        className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
          isValid
            ? 'bg-[#2684FF] hover:bg-[#1B6EE0] active:scale-[0.98] cursor-pointer shadow-[#2684FF]/25'
            : 'bg-[#94A3B8] cursor-not-allowed opacity-60'
        }`}
      >
        <span>Áp dụng lựa chọn</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
