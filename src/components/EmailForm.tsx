import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Sparkles } from 'lucide-react';

interface EmailFormData {
  email: string;
  name: string;
}

interface EmailFormProps {
  onSubmit: (data: EmailFormData) => void;
  isLoading: boolean;
}

export const EmailForm: React.FC<EmailFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>();

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
        <div className="flex-1 w-full">
          <div className="relative flex flex-col sm:flex-row">
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              id="email"
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-300 rounded-lg sm:rounded-l-full sm:rounded-r-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 outline-none touch-target"
              placeholder="Enter your email"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-l-none sm:rounded-r-full transition-all duration-200 whitespace-nowrap mt-2 sm:mt-0 touch-target no-select"
            >
              {isLoading ? 'Processing...' : 'Spin to Win'}
            </button>
          </div>
          {errors.email && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 text-center">{errors.email.message}</p>
          )}
        </div>
        <input
          {...register('name')}
          type="hidden"
          value="Anonymous"
        />
      </form>
    </div>
  );
};