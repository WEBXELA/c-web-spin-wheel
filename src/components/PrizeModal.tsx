import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Check } from 'lucide-react';

interface PrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: string;
  onClaim?: () => void;
}

export const PrizeModal: React.FC<PrizeModalProps> = ({ isOpen, onClose, prize, onClaim }) => {
  const [copied, setCopied] = React.useState(false);

  const generatePromoCode = (prize: string) => {
    // Optional: generate different codes for different prizes
    if (!prize.toUpperCase().includes('FREE RENT')) return null;
    const months = prize.includes('1 YEAR') ? '12' : (prize.match(/\d+/)?.[0] || '1');
    return `FREERENT${months}`;
  };

  const promoCode = generatePromoCode(prize);

  const copyToClipboard = async () => {
    if (promoCode) {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWin = true; // both options are wins now
  const displayPrize = prize;

  // Debug logging
  console.log('Prize:', prize, 'isWin:', isWin);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 modal-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full mx-auto relative max-h-[90vh] overflow-y-auto"
          >
            {!isWin && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors touch-target"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            <div className="text-center">
              {isWin ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full mb-4 sm:mb-6">
                    <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-3 sm:mb-4">
                    Congratulations! 🎉
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 mb-4 sm:mb-6">
                    You've won {displayPrize}!
                  </p>
                  
                  {promoCode && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Your promo code:</p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:space-x-2">
                        <code className="bg-white px-3 sm:px-4 py-2 rounded border text-sm sm:text-lg font-mono font-bold break-all">
                          {promoCode}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="p-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors mt-2 sm:mt-0 touch-target"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {copied && (
                        <p className="text-xs sm:text-sm text-green-600 mt-2">Copied to clipboard!</p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                    Use this code at checkout to claim your discount. Valid for 30 days.
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full mb-4 sm:mb-6">
                    <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Better Luck Next Time!
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6">
                    You didn't win this time, but don't worry!
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                    Stay subscribed to our newsletter for exclusive offers and future spin opportunities.
                  </p>
                </>
              )}

              <button
                onClick={() => {
                  if (isWin && onClaim) {
                    onClaim();
                  } else {
                    onClose();
                  }
                }}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base touch-target no-select"
              >
                {isWin ? 'Claim Your Prize!' : 'Continue Exploring'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};