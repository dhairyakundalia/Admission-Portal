import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const useOTPInputs = (length = 6) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value) && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text/plain').trim();
    if (pasteData.length === length && /^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[length - 1]?.focus();
    }
    e.preventDefault();
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return { 
    otp, 
    setOtp, 
    inputRefs, 
    handleChange, 
    handleKeyDown, 
    handlePaste, 
    fullOtp: otp.join('') 
  };
};

function OTPVerification({userId}) {
  const { otp, inputRefs, handleChange, handleKeyDown, handlePaste, fullOtp } = useOTPInputs(6);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, axios: authAxios } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (fullOtp.length !== 6) {
      setError('Please enter a complete 6-digit OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await authAxios.post('/authentication/verify-otp', {  
        otp: fullOtp 
      });

      if (response.data.statusCode === 200) {
        console.log('OTP verified successfully');
        await login();
      } else {
        setError(response.data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Verify Your Account</h2>
        <p className="text-gray-600 mt-2">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              disabled={loading}
              className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || fullOtp.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Didn't receive the code? Check your spam folder or try again later.
        </p>
      </div>
    </div>
  );
}

export default OTPVerification;