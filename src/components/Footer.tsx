import { Link } from 'react-router-dom';
import { getFooterLinks } from '../services/uiService';

export default function Footer() {
  const footerLinks = getFooterLinks();

  return (
    <footer className="bg-textMain text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-16 border-b border-white/10 pb-16">

        {/* Brand Area */}
        <div className="sm:col-span-2 md:col-span-1">
          <h2 className="text-2xl font-serif tracking-widest mb-6">VELORA</h2>
          <p className="text-sm text-white/50 leading-relaxed pr-8 max-w-xs">
            Defining modern elegance with timeless, conscious fashion. Crafted for the life you live.
          </p>
        </div>

        {/* Links: Brand */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-white/80">Our Brand</h3>
          {footerLinks.brand.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm text-white/50 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Links: Support */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-white/80">Support</h3>
          {footerLinks.customerService.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm text-white/50 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Links: Socials */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-white/80">Connect</h3>
          {footerLinks.socials.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm text-white/50 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
        <p>&copy; {new Date().getFullYear()} Velora. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white/60 transition-colors duration-300">Privacy Policy</a>
          <a href="#" className="hover:text-white/60 transition-colors duration-300">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}