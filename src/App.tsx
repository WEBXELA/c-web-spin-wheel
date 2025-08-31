import React, { useRef, useState, useEffect } from 'react';
import { SpinWheel } from './components/SpinWheel';
import { EmailForm } from './components/EmailForm';
import { PrizeModal } from './components/PrizeModal';
import { saveEmailSubmission, isEmailAllowed, insertAllowedEmail, allowAutoApprove, getEmailSubmission } from './lib/supabase';
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
  const [triggerSpin, setTriggerSpin] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      // Gate: check if email is allowed to spin
      // Prevent second try: if already has a claimed prize (not pending), block
      const existing = await getEmailSubmission(data.email);
      if (existing && existing.prize_won && existing.prize_won !== 'pending') {
        throw new Error('You have already claimed a prize.');
      }

      let allowed = await isEmailAllowed(data.email);
      if (!allowed && allowAutoApprove) {
        await insertAllowedEmail(data.email);
        allowed = true;
      }
      if (!allowed) throw new Error('Email is not authorized to spin.');

      // Record submission
      await saveEmailSubmission({
        email: data.email,
        name: data.name,
        prize_won: 'pending'
      });

      setUserEmail(data.email);
      setHasSubmittedEmail(true);
      // Scroll to wheel section after a short delay
      setTimeout(() => {
        wheelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Automatically trigger spin after scrolling
        setTimeout(() => {
          setTriggerSpin(true);
        }, 500);
      }, 150);
    } catch (error) {
      console.error('Error saving email or not allowed:', error);
      alert((error as Error)?.message || 'This email is not authorized to spin. Please contact admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpin = async (prize: string) => {
    setIsSpinning(true);
    setCurrentPrize(prize);
    setTriggerSpin(false); // Reset trigger
    // Do not update Supabase yet; wait for user to claim
    setTimeout(() => {
      setIsSpinning(false);
      setShowPrizeModal(true);
    }, 3000);
  };

  const handleClaimPrize = async () => {
    try {
      await saveEmailSubmission({
        email: userEmail,
        name: '',
        prize_won: currentPrize,
      });
    } catch (error) {
      console.error('Error saving claimed prize:', error);
    } finally {
      setShowPrizeModal(false);
      // Reset UI to initial and redirect to home
      setHasSubmittedEmail(false);
      setUserEmail('');
      setCurrentPrize('');
    }
  };

  const handleWebsiteClick = () => {
    window.open('https://www.letscreate.club', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Background Elements - Responsive positioning */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 sm:top-20 sm:left-20">
          <div className="w-2 h-2 sm:w-4 sm:h-4 bg-yellow-400 transform rotate-45"></div>
        </div>
        <div className="absolute top-8 right-8 sm:top-40 sm:right-32">
          <div className="w-2 h-4 sm:w-3 sm:h-8 bg-red-400 transform rotate-12"></div>
        </div>
        <div className="absolute bottom-8 left-4 sm:bottom-32 sm:left-16">
          <div className="w-3 h-1 sm:w-6 sm:h-2 bg-teal-500 rounded-full"></div>
        </div>
        <div className="absolute bottom-4 right-6 sm:bottom-20 sm:right-24">
          <div className="w-1 h-3 sm:w-2 sm:h-6 bg-yellow-500"></div>
        </div>
        <div className="absolute top-1/2 left-2 sm:left-10">
          <div className="w-4 h-1 sm:w-8 sm:h-1 bg-teal-600 rounded-full transform -rotate-45"></div>
        </div>
        <div className="absolute top-1/3 right-4 sm:right-16">
          <div className="w-1 h-4 sm:w-1 sm:h-8 bg-red-500 rounded-full transform rotate-12"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header - Logo */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="mb-4 sm:mb-6">
            <img 
              src="/plain logo.png" 
              alt="Let's Create Logo" 
              className="mx-auto w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-48 lg:h-48 xl:w-52 xl:h-52 2xl:w-56 2xl:h-56 object-contain"
            />
          </div>
          <h1 className="text-responsive-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-yellow-500 mb-4 sm:mb-6">
            Win 1 Year Free Rent!
          </h1>
          <p className="text-responsive-lg sm:text-xl md:text-2xl text-teal-700 mb-1 sm:mb-2">
            Enter your email below for your
          </p>
          <p className="text-responsive-lg sm:text-xl md:text-2xl text-teal-700">
            chance to spin the wheel and win.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* Email Form */}
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
            <EmailForm onSubmit={handleEmailSubmit} isLoading={isSubmitting} />
          </div>

          {/* Spin Wheel (always visible, disabled until email submitted) */}
          <div className="flex flex-col items-center w-full" ref={wheelRef}>
            <SpinWheel onSpin={handleSpin} isSpinning={isSpinning} canSpin={hasSubmittedEmail} triggerSpin={triggerSpin} />
          </div>
        </div>

        {/* Footer - Responsive text */}
        <div className="text-center mt-8 sm:mt-12 md:mt-16 text-gray-600">
          <p className="text-xs sm:text-sm">
            Terms & conditions apply. One entry per person.
          </p>
          <button
            onClick={handleWebsiteClick}
            className="text-xs sm:text-sm mt-1 sm:mt-2 font-semibold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer underline"
          >
            www.letscreate.club
          </button>
        </div>
      </div>

      {/* Prize Modal */}
      <PrizeModal
        isOpen={showPrizeModal}
        onClose={() => setShowPrizeModal(false)}
        prize={currentPrize}
        onClaim={handleClaimPrize}
      />
    </div>
  );
}

export default App;