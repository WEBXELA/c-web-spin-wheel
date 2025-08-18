import React, { useState } from 'react';
import { SpinWheel } from './components/SpinWheel';
import { EmailForm } from './components/EmailForm';
import { PrizeModal } from './components/PrizeModal';
import { saveEmailSubmission } from './lib/supabase';
import { Sparkles, Star, Gift } from 'lucide-react';

interface EmailFormData {
  email: string;
  name: string;
}

function App() {
  const [hasSubmittedEmail, setHasSubmittedEmail] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<string>('');
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      await saveEmailSubmission({
        email: data.email,
        name: data.name,
        prize_won: 'pending'
      });
      
      setUserEmail(data.email);
      setHasSubmittedEmail(true);
    } catch (error) {
      console.error('Error saving email:', error);
      // Still allow them to proceed even if there's an error
      setUserEmail(data.email);
      setHasSubmittedEmail(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpin = async (prize: string) => {
    setIsSpinning(true);
    setCurrentPrize(prize);
    
    try {
      // Update the prize in Supabase
      await saveEmailSubmission({
        email: userEmail,
        name: '',
        prize_won: prize
      });
    } catch (error) {
      console.error('Error updating prize:', error);
    }
    
    setTimeout(() => {
      setIsSpinning(false);
      setShowPrizeModal(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20">
          <div className="w-4 h-4 bg-yellow-400 transform rotate-45"></div>
        </div>
        <div className="absolute top-40 right-32">
          <div className="w-3 h-8 bg-red-400 transform rotate-12"></div>
        </div>
        <div className="absolute bottom-32 left-16">
          <div className="w-6 h-2 bg-teal-500 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 right-24">
          <div className="w-2 h-6 bg-yellow-500"></div>
        </div>
        <div className="absolute top-1/2 left-10">
          <div className="w-8 h-1 bg-teal-600 rounded-full transform -rotate-45"></div>
        </div>
        <div className="absolute top-1/3 right-16">
          <div className="w-1 h-8 bg-red-500 rounded-full transform rotate-12"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">
              Let's Create
            </h2>
            <p className="text-lg text-gray-600">
              Co-Working Offices - Fitness & Wellness
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-500 mb-6">
            Win 1 Year Free Rent!
          </h1>
          <p className="text-xl md:text-2xl text-teal-700 mb-2">
            Enter your email below for your
          </p>
          <p className="text-xl md:text-2xl text-teal-700">
            chance to spin the wheel and win.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-12 max-w-4xl mx-auto">
          {/* Email Form or Spin Wheel */}
          {!hasSubmittedEmail ? (
            <div className="w-full max-w-lg">
              <EmailForm onSubmit={handleEmailSubmit} isLoading={isSubmitting} />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <SpinWheel onSpin={handleSpin} isSpinning={isSpinning} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600">
          <p className="text-sm">
            Terms & conditions apply. One entry per person.
          </p>
          <p className="text-sm mt-2 font-semibold">
            www.letscreate.club
          </p>
        </div>
      </div>

      {/* Prize Modal */}
      <PrizeModal
        isOpen={showPrizeModal}
        onClose={() => setShowPrizeModal(false)}
        prize={currentPrize}
      />
    </div>
  );
}

export default App;