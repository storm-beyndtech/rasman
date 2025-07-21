'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ISong, IAlbum } from '@/lib/models';

// Paystack types
declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PurchaseButtonProps {
  item: ISong | IAlbum;
  itemType: 'song' | 'album';
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  item,
  itemType,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { isSignedIn, user } = useUser();

  // Button styling variants
  const variants = {
    primary: 'bg-reggae-green text-white hover:bg-green-600 focus:ring-reggae-green',
    secondary: 'bg-reggae-yellow text-black hover:bg-yellow-500 focus:ring-reggae-yellow',
    outline: 'border-2 border-reggae-green text-reggae-green hover:bg-reggae-green hover:text-white focus:ring-reggae-green'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    inline-flex items-center gap-2 font-semibold rounded-full
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]} ${sizes[size]} ${className}
  `;

  // Format price
  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString()}`;
  };

  // Handle purchase initiation
  const handlePurchase = async () => {
    if (!isSignedIn) {
      // Redirect to sign in
      window.location.href = '/sign-in';
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Initialize purchase on backend
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item._id,
          itemType,
          amount: item.price,
          currency: 'NGN'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to initialize purchase');
      }

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        await loadPaystackScript();
      }

      // Initialize Paystack popup
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user?.emailAddresses[0]?.emailAddress,
        amount: item.price * 100, // Convert to kobo
        currency: 'NGN',
        ref: result.data.reference,
        metadata: {
          userId: user?.id,
          itemId: item._id,
          itemType,
          purchaseId: result.data.purchaseId,
          itemTitle: item.title,
          customerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        },
        callback: (response: any) => {
          handlePaymentSuccess(response.reference);
        },
        onClose: () => {
          setLoading(false);
          console.log('Payment popup closed');
        }
      });

      handler.openIframe();

    } catch (error) {
      console.error('Purchase error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Purchase failed');
      setLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Verify payment on backend
      const response = await fetch('/api/purchase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setLoading(false);
        
        // Redirect to success page or user dashboard after a delay
        setTimeout(() => {
          window.location.href = '/dashboard?purchase=success';
        }, 2000);
      } else {
        throw new Error(result.error || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setErrorMessage('Payment verification failed. Please contact support.');
      setLoading(false);
    }
  };

  // Load Paystack script dynamically
  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  };

  // Render different states
  if (status === 'success') {
    return (
      <motion.button
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`${baseClasses} bg-green-500 text-white cursor-default`}
        disabled
      >
        <CheckCircle size={20} />
        Purchased!
      </motion.button>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`${baseClasses} bg-red-500 text-white mb-2`}
          onClick={handlePurchase}
          disabled={loading}
        >
          <AlertCircle size={20} />
          Try Again
        </motion.button>
        {errorMessage && (
          <p className="text-red-500 text-xs">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={baseClasses}
      onClick={handlePurchase}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          Buy {formatPrice(item.price)}
        </>
      )}
    </motion.button>
  );
};

export default PurchaseButton;