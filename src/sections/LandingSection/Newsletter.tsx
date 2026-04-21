import { useState, FormEvent } from 'react';
import { Mail, Check } from 'lucide-react';
import { NewsletterSection } from '../../types/landing';

type NewsletterProps = {
  data: NewsletterSection;
};

export default function Newsletter({ data }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');

      // Reset after a few seconds
      setTimeout(() => setIsSubmitted(false), 4000);
    }, 800);
  };

  return (
    <section className="bg-brand py-24 sm:py-32 px-6 text-center text-white">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-6">{data.title}</h2>
        <p className="text-base sm:text-lg text-white/70 mb-10 sm:mb-12 max-w-md mx-auto leading-relaxed">
          {data.subtitle}
        </p>

        {isSubmitted ? (
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Check size={16} strokeWidth={3} />
            </div>
            <p className="text-lg font-medium">Thank you for subscribing!</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch gap-4 max-w-lg mx-auto"
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
                aria-label="Email address"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`sm:w-auto px-8 py-3 bg-white text-brand rounded-full uppercase tracking-widest text-xs sm:text-sm font-semibold transition-all duration-300 font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand active:scale-[0.97] ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white/90 cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}