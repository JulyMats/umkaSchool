import React from 'react';
import { X, Target } from 'lucide-react';
import { Modal } from '../../ui';
import { formatNumberWithSign } from '../../../utils/exercise.utils';

interface NumbersOverlayProps {
  isOpen: boolean;
  numbers: number[];
  expectedAnswer: number | null;
  isSubtraction: boolean;
  onClose: () => void;
}

const NumbersOverlay: React.FC<NumbersOverlayProps> = ({
  isOpen,
  numbers,
  expectedAnswer,
  isSubtraction,
  onClose
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" /> Numbers Shown 🔢
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      <div className="text-center space-y-4">
        {numbers.map((number, index) => (
          <div key={`${number}-${index}`} className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatNumberWithSign(number, index, isSubtraction)}
          </div>
        ))}
        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <p className="text-3xl font-bold text-gray-800">= {expectedAnswer ?? 'N/A'}</p>
        </div>
      </div>
    </Modal>
  );
};

export default NumbersOverlay;

