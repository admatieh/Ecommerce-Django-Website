import { useState, FormEvent, useEffect } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { NewsletterSection } from '../../types/landing';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

type NewsletterProps = {
  data: NewsletterSection;
};

export default function Newsletter({ data }: NewsletterProps) {
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
      
      // Check subscription status
      const checkStatus = async () => {
        try {
          const res = await apiFetch<{ isSubscribed: boolean }>('/subscribe/status/');
          if (res.isSubscribed) {
            setIsSubscribed(true);
          }
        } catch {
          // Ignore error on status check
        }
      };
      
      checkStatus();
    } else {
      setEmail('');
      setIsSubscribed(false);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setErrorMsg('Please log in to subscribe');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    if (!email.trim() || isSubmitting || isSubscribed) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await apiFetch('/subscribe/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      setIsSubscribed(true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to subscribe.';
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-brand py-24 sm:py-32 px-6 text-center text-white">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-6">{data.title}</h2>
        <p className="text-base sm:text-lg text-white/70 mb-10 sm:mb-12 max-w-md mx-auto leading-relaxed">
          {data.subtitle}
        </p>

        <div className="w-full max-w-lg mx-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch gap-4"
          >
            <div className="relative flex-1">
              <Mail
                size={16}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 hidden sm:block"
              />
              <input
                type="email"
                placeholder={data.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-white/30 pb-3 pt-1 text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors duration-300 text-base sm:text-lg sm:pl-7"
                required
                readOnly={isAuthenticated || isSubscribed}
                aria-label="Email address"
                disabled={!isAuthenticated && false} // Let them focus to see error, or disable it. We leave it editable for guests but error on submit.
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || isSubscribed}
              className={`sm:w-auto px-8 py-3 bg-white text-brand rounded-full uppercase tracking-widest text-xs sm:text-sm font-semibold transition-all duration-300 font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand active:scale-[0.97] ${
                (isSubmitting || isSubscribed) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white/90 cursor-pointer'
              }`}
            >
              {isSubscribed ? 'Already Subscribed' : isSubmitting ? data.submittingText : data.submitText}
            </button>
          </form>
          
          {errorMsg && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-200 text-sm animate-fade-in-up">
              <AlertCircle size={14} />
              <p>{errorMsg}</p>
            </div>
          )}
          
          {isSubscribed && !errorMsg && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-200 text-sm animate-fade-in-up">
              <Check size={14} strokeWidth={3} />
              <p>You are subscribed 🎉</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}