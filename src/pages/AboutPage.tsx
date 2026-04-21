import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, Truck, MapPin, Phone, Globe, CreditCard, Info, ShieldCheck, ChevronDown } from 'lucide-react';

export default function AboutPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#faq') {
      const element = document.getElementById('faq');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const sections = [
    {
      title: "Store Notice",
      icon: <Info size={20} className="text-brand" />,
      content: "For reliable on-screen review of your order status, your data may be stored using cookies. Please review our Cookie Policy.",
      fullWidth: true
    },
    {
      title: "Opening Hours",
      icon: <Clock size={20} className="text-brand" />,
      content: "Monday – Sunday: 07:00 – 01:30"
    },
    {
      title: "Delivery Fees",
      icon: <Truck size={20} className="text-brand" />,
      content: (
        <ul className="space-y-1">
          <li>$1.12</li>
          <li>$1.35</li>
          <li>$1.67</li>
        </ul>
      )
    },
    {
      title: "Services Availability",
      icon: <ShieldCheck size={20} className="text-brand" />,
      content: (
        <ul className="space-y-2">
          <li className="flex justify-between">
            <span className="text-textLight">Delivery</span>
            <span className="font-medium text-textMain">07:00 – 01:30</span>
          </li>
          <li className="flex justify-between">
            <span className="text-textLight">Pickup</span>
            <span className="font-medium text-textMain">07:00 – 01:30</span>
          </li>
          <li className="flex justify-between">
            <span className="text-textLight">On-premise</span>
            <span className="font-medium text-textMain">07:00 – 01:30</span>
          </li>
        </ul>
      )
    },
    {
      title: "Payment Methods",
      icon: <CreditCard size={20} className="text-brand" />,
      content: "Cash (Pickup, Delivery)"
    },
    {
      title: "Languages",
      icon: <Globe size={20} className="text-brand" />,
      content: "English"
    },
    {
      title: "Location",
      icon: <MapPin size={20} className="text-brand" />,
      content: (
        <div>
          <p className="font-medium text-textMain">Velora, Hlelieh</p>
          <p className="text-xs text-textLight mt-1 uppercase tracking-widest">Main Street, Floor 1</p>
        </div>
      )
    },
    {
      title: "Contact",
      icon: <Phone size={20} className="text-brand" />,
      content: (
        <a
          href="tel:+96176716868"
          className="text-lg font-medium text-textMain hover:text-brand transition-colors"
        >
          +961 76 716 868
        </a>
      ),
      fullWidth: true
    }
  ];

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-6 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif text-textMain mb-6">About Velora</h1>
          <p className="text-lg text-textLight max-w-2xl mx-auto leading-relaxed font-light">
            An editorial approach to fashion, curated for the modern individual.
            Committed to quality, aesthetics, and seamless service.
          </p>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {sections.map((section, index) => (
            <section
              key={index}
              className={`p-8 rounded-3xl bg-white border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 group ${section.fullWidth ? 'md:col-span-2' : ''
                }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {section.icon}
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMain">
                  {section.title}
                </h2>
              </div>
              <div className="text-textLight leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ Section */}
        <section id="faq" className="mt-32 scroll-mt-24">
          <header className="text-center mb-16">
            <h2 className="text-3xl font-serif text-textMain mb-4">Frequently Asked Questions</h2>
            <p className="text-textLight font-light">Everything you need to know about shopping with Velora.</p>
          </header>

          <div className="space-y-12">
            {[
              {
                category: "Orders",
                items: [
                  { q: "How do I place an order?", a: "Browse our collections, select your items, and proceed to checkout. You can also order directly via WhatsApp for a personalized experience." },
                  { q: "Can I modify my order after placing it?", a: "Please contact us via WhatsApp immediately if you need to make changes to your order. We can modify details as long as the order hasn't been dispatched." }
                ]
              },
              {
                category: "Shipping",
                items: [
                  { q: "What are delivery times?", a: "Delivery times vary depending on your location, typically within 2-5 business days within Lebanon." },
                  { q: "What are the delivery fees?", a: "Delivery fees range from $1.12 to $1.67 depending on the specific area and distance." }
                ]
              },
              {
                category: "Payment",
                items: [
                  { q: "Do you accept cash on delivery?", a: "Yes, we primarily accept cash on delivery for all orders to ensure a secure transaction for our customers." },
                  { q: "What payment methods are available?", a: "Currently, we accept Cash on Delivery and Cash on Pickup at our physical location." }
                ]
              },
              {
                category: "Returns",
                items: [
                  { q: "Can I return items?", a: "Yes, we accept returns within 7 days of delivery if the items are in their original condition." },
                  { q: "What is the return policy?", a: "Items must be unworn, with all original tags attached. Please contact our support team via WhatsApp to initiate a return process." }
                ]
              },
              {
                category: "Account",
                items: [
                  { q: "Do I need an account to place an order?", a: "No, you can easily place an order as a guest. Creating an account is optional but helps you track orders faster." }
                ]
              }
            ].map((group, groupIdx) => (
              <div key={groupIdx} className="animate-fade-in-up" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 pl-4 border-l-2 border-brand/20">
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item, itemIdx) => {
                    const id = `${groupIdx}-${itemIdx}`;
                    const isOpen = openId === id;
                    return (
                      <div
                        key={itemIdx}
                        className={`border border-black/[0.03] rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02]' : 'bg-transparent'
                          }`}
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : id)}
                          className="w-full flex items-center justify-between p-5 md:p-6 text-left group transition-all"
                        >
                          <span className={`text-sm md:text-base font-medium transition-colors ${isOpen ? 'text-brand' : 'text-textMain group-hover:text-brand'}`}>
                            {item.q}
                          </span>
                          <div className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand' : 'text-textLight'}`}>
                            <ChevronDown size={18} strokeWidth={1.5} />
                          </div>
                        </button>
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                          <div className="px-6 pb-6 text-sm md:text-base text-textLight leading-relaxed font-light">
                            {item.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-24 pt-12 border-t border-black/5 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-textLight">
            Velora &copy; {new Date().getFullYear()} &bull; Established in Lebanon
          </p>
        </footer>
      </div>
    </main>
  );
}
