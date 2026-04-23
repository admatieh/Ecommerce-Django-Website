import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, Menu, X, UserCircle, Heart } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getNavigationLinks } from '../services/uiService';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const navigationLinks = getNavigationLinks();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { cartCount, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.04)] py-4'
          : 'bg-transparent py-6'
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 text-textMain transition-all duration-200 active:scale-95 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-full"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="font-serif text-2xl tracking-widest text-textMain transition-all duration-200 hover:opacity-70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-sm"
        >
          VELORA
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-all duration-300 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-sm relative ${isActive ? 'text-brand' : 'text-textMain hover:opacity-80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-brand transition-all duration-300 ${isActive ? 'w-full' : 'w-0'
                      }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            to="/search"
            className="flex items-center gap-2 text-sm hover:text-brand transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-full p-1"
            aria-label="Search products"
          >
            <Search size={18} strokeWidth={1.5} />
            <span className="hidden lg:inline">Search</span>
          </Link>
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="flex items-center gap-2 text-sm hover:text-brand transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-full p-1"
            aria-label={isAuthenticated ? 'My account' : 'Sign in'}
          >
            <UserCircle size={18} strokeWidth={1.5} />
            <span className="hidden lg:inline">{isAuthenticated ? 'Account' : 'Sign In'}</span>
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center gap-2 text-sm hover:text-brand transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-full p-1 relative"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart size={18} strokeWidth={1.5} />
            <span className="hidden lg:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 lg:-right-2 w-4 h-4 bg-textMain text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[16px] min-h-[16px]">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            className="flex items-center gap-2 text-sm hover:text-brand transition-all duration-200 hover:opacity-80 active:scale-90 active:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-full p-1 relative"
            onClick={openCart}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <ShoppingBag size={18} strokeWidth={1.5} className="transition-transform duration-200 group-active:-translate-y-1" />
            <span className="hidden lg:inline">Cart ({cartCount})</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 lg:hidden w-4.5 h-4.5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed top-0 left-0 right-0 h-[100vh] z-[40] transition-opacity duration-300 ease-out ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-[100vh] w-[85%] max-w-sm bg-background z-[50] transition-transform duration-300 ease-out will-change-transform flex flex-col ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="p-6 flex justify-between items-center shrink-0">
            <span className="font-serif text-2xl tracking-widest">VELORA</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 transition-all duration-200 active:scale-95 hover:opacity-70 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              aria-label="Close menu"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex flex-col gap-1 px-6 pt-4 overflow-y-auto flex-1">
          {navigationLinks.map((link, index) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `text-2xl py-3 transition-all duration-300 hover:text-brand hover:translate-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-sm opacity-0 animate-fade-in-up ${isActive
                  ? 'text-brand font-medium pl-4 border-l-2 border-brand'
                  : 'text-textMain'
                }`
              }
              style={{ animationDelay: `${(index + 1) * 80}ms` }}
              onClick={closeMobileMenu}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

          {/* Mobile menu footer actions */}
          <div className="mt-auto p-6 border-t border-black/5 space-y-1 shrink-0 bg-background">
            <Link
              to="/search"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-textLight hover:text-textMain transition-colors w-full py-3"
            >
              <Search size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">Search</span>
            </Link>
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-textLight hover:text-textMain transition-colors w-full py-3"
            >
              <UserCircle size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">{isAuthenticated ? 'My Account' : 'Sign In'}</span>
            </Link>
            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-textLight hover:text-textMain transition-colors w-full py-3"
            >
              <Heart size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">Wishlist ({wishlistCount})</span>
            </Link>
          </div>
        </div>
      </>
    </nav>
  );
}
