"use client";
import { authService } from '@/api/services/authService';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const Otp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') ?? "";
  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [message, setMessage] = useState("");

  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const isOtpComplete = otp.every((digit) => digit !== "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    const sanitizedValue = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = sanitizedValue;
    setOtp(nextOtp);

    if (sanitizedValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    if (isActionDisabled || !isOtpComplete) return;
    if (!email) return;

    const enteredOtp = otp.join('');
    setIsActionDisabled(true);
    try {
      await authService.verifyEmail({
        email,
        otp: enteredOtp
      });
      toast.success("OTP verified successfully! You can now log in.");
      router.push("/login");

    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.response?.data?.error?.message || "OTP verification failed. Please try again.");
    } finally {
      setIsActionDisabled(false);
    }
  };

   const resendOtp = async () => {
    if (isActionDisabled || resendCooldown > 0) return;
    if (!email) return;

    try {
      setResendCooldown(20);
      await authService.resendOtp({email});
      setMessage("A new OTP has been sent to your email.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.response?.data?.error?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsActionDisabled(false);
    }
  };

  const [resendCooldown, setResendCooldown] = useState(0);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <div className='flex items-center justify-center min-h-screen w-screen bg-gray-100 overflow-hidden'>
      <div className='flex items-center justify-center flex-col w-80 h-80 bg-white border border-gray-300 rounded-2xl shadow-[4px_4px_10px_rgba(0,0,0,0.25)]'>
        <h2 className='text-2xl  font-sans my-5 mt-0'>Enter OTP Code</h2>
        <p className={message?`text-red-600 text-xs`:`text-xs text-green-600`}>{message || "A 6-digit code has been sent to your email."}</p>
        <div className='flex items-center gap-1 my-5 mx-5'>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className='h-10 w-10 border-2 border-gray-400 rounded-sm text-center text-lg font-semibold outline-none focus:border-blue-500'
            />
          ))}
        </div>
       <button disabled={isActionDisabled || !isOtpComplete}className={(!isActionDisabled && isOtpComplete)?`bg-green-500 border-2 rounded-xl p-1.5 my-3 w-70 text-white hover:bg-green-400 transition-all cursor-pointer`:`bg-green-200 border-2 rounded-xl p-1.5 my-3 w-70 text-white transition-all cursor-pointer`} onClick={verifyOtp}>
          Verify
        </button>
        <button disabled={isActionDisabled ||resendCooldown > 0} className="bg-blue-500 border-2 rounded-xl p-1.5 w-70 text-white hover:bg-blue-400 transition-all cursor-pointer" onClick={resendOtp}>{resendCooldown > 0 ? `Resend (${resendCooldown})` : "Resend"}</button>
      </div>
    </div>
  );
};

export default Otp;
