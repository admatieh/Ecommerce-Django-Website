import { useState, useMemo } from 'react';
import { Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import { submitContactMessage } from '../services/authService';

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    const { name, email, subject, message } = form;
    if (!name || !email || !subject || !message) return false;
    return /^\S+@\S+\.\S+$/.test(email);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      await submitContactMessage(form);
      setIsSubmitting(false);
      setIsSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch {
      setIsSubmitting(false);
      // Could add error state here; for now just stop loading
    }
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-6 animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-16 lg:mb-24 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-serif text-textMain mb-6">Contact Us</h1>
          <p className="text-lg text-textLight leading-relaxed font-light">
            Have a question about our collections or need assistance with an order? 
            Our team is here to help you with anything you need.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center text-center animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-serif text-textMain mb-4">Message Sent Successfully</h2>
                  <p className="text-textLight max-w-sm mb-8">
                    Thank you for reaching out. We have received your message and will get back to you within 24 hours.
                  </p>
                  <Button 
                    onClick={() => setIsSuccess(false)}
                    className="bg-transparent border border-black/10 text-textMain hover:bg-black/5 px-8 py-3"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                      placeholder="What is this regarding?"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all resize-none"
                      placeholder="How can we help you today?"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!isFormValid}
                    className="w-full py-4 text-sm tracking-widest uppercase font-semibold bg-textMain text-white hover:bg-black/80 transition-all duration-300 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Send Message
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Info Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-12">
              <section className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center text-brand shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMain mb-3">Phone</h2>
                    <a 
                      href="tel:+96176716868" 
                      className="text-lg font-medium text-textMain hover:text-brand transition-colors inline-block"
                    >
                      +961 76 716 868
                    </a>
                    <p className="text-sm text-textLight mt-1">Mon - Sun, 07:00 - 01:30</p>
                  </div>
                </div>
              </section>

              <section className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center text-brand shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMain mb-3">Location</h2>
                    <p className="text-lg font-medium text-textMain">Velora Store</p>
                    <p className="text-textLight leading-relaxed">
                      Main Street, Hlelieh<br />
                      Lebanon, Floor 1
                    </p>
                  </div>
                </div>
              </section>

              <section className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center text-brand shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMain mb-3">Opening Hours</h2>
                    <div className="space-y-1 text-textMain">
                      <p className="flex justify-between w-48 text-sm">
                        <span className="text-textLight">Mon - Sun</span>
                        <span className="font-medium">07:00 - 01:30</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Map Placeholder/Iframe */}
            <div className="rounded-3xl overflow-hidden h-64 bg-gray-100 border border-black/5 relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.2858546144884!2d35.3789!3d33.5631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDMzJzQ3LjIiTiAzNcKwMjInNDQuMCJF!5e0!3m2!1sen!2slb!4v1620000000000!5m2!1sen!2slb" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Velora Location Map"
                className="transition-all duration-700 group-hover:filter-none group-hover:opacity-100"
              ></iframe>
            </div>

            {/* Help Section */}
            <div className="p-8 rounded-3xl bg-brand/5 border border-brand/10">
              <h3 className="font-serif text-lg text-textMain mb-3">Need instant help?</h3>
              <p className="text-sm text-textLight leading-relaxed mb-6">
                Our support team is available via WhatsApp for immediate inquiries regarding your orders.
              </p>
              <a 
                href="https://wa.me/96176716868" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand hover:gap-3 transition-all duration-300"
              >
                Chat on WhatsApp <span className="ml-2">→</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
