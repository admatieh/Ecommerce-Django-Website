import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage'
import CollectionsPage from './pages/CollectionsPage'
import CheckoutPage from './pages/CheckoutPage'
import ProductPage from './pages/ProductPage'
import SearchPage from './pages/SearchPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import CartDrawer from './components/CartDrawer'
import PageTransition from './components/PageTransition'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AccountPage from './pages/AccountPage'
import WishlistPage from './pages/WishlistPage'

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return;

    setIsTransitioning(true);
    const exitTimer = window.setTimeout(() => {
      setDisplayLocation(location);
      setIsLoading(true);

      const loadTimer = window.setTimeout(() => {
        setIsLoading(false);
        requestAnimationFrame(() => setIsTransitioning(false));
      }, 350);

      return () => window.clearTimeout(loadTimer);
    }, 220);

    return () => window.clearTimeout(exitTimer);
  }, [location, displayLocation.pathname]);

  return (
    <Layout>
      <PageTransition isTransitioning={isTransitioning} isLoading={isLoading}>
        <Routes location={displayLocation}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout/success" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </PageTransition>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background text-textMain overflow-x-hidden flex flex-col">
              <AnimatedRoutes />
              <CartDrawer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}

export default App
