import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/authService';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  let token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    // FIX: decode URL + quoted-printable corruption
    token = decodeURIComponent(token);
    token = token.replace(/=3D/g, '=');

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err?.response?.data?.detail ||
          err?.message ||
          'Verification failed. The link may have expired.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex items-center justify-center animate-fade-in-up">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-black/5 text-center">
        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-serif text-textMain mb-2">Verifying Email</h1>
            <p className="text-sm text-textLight">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">✓</div>
            <h1 className="text-2xl font-serif text-textMain mb-2">Email Verified</h1>
            <p className="text-sm text-textLight mb-8">Your email has been verified successfully. You can now access all features of your account.</p>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-brand text-white text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-all duration-200">
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">!</div>
            <h1 className="text-2xl font-serif text-textMain mb-2">Verification Failed</h1>
            <p className="text-sm text-textLight mb-8">{message}</p>
            <Link to="/register" className="text-brand font-semibold hover:underline">
              Register again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
