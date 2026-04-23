import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { getRelatedProducts } from '../services/productService';
import { Product } from '../types/product';

export default function WishlistPage() {
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch recommendations based on wishlist items
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (wishlist.length === 0) {
        setRecommendations([]);
        return;
      }

      setIsRecLoading(true);
      try {
        // Fetch related products for the first 3 items in wishlist to avoid too many requests
        // and get a diverse set of recommendations
        const wishlistIds = new Set(wishlist.map(p => p.id));
        const categories = Array.from(new Set(wishlist.map(p => p.categoryId)));

        // Strategy: Get 4 related products for up to 3 items
        const relatedPromises = wishlist.slice(0, 3).map(p => getRelatedProducts(p.id, 4));
        const relatedResults = await Promise.all(relatedPromises);

        // Flatten, deduplicate by ID, and filter out items already in wishlist
        const allRelated = relatedResults.flat();
        const uniqueRecs = allRelated.reduce((acc: Product[], current) => {
          const isDuplicate = acc.find(p => p.id === current.id);
          const isInWishlist = wishlistIds.has(current.id);
          if (!isDuplicate && !isInWishlist) {
            acc.push(current);
          }
          return acc;
        }, []);

        setRecommendations(uniqueRecs.slice(0, 8)); // Show up to 8 recommendations
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setIsRecLoading(false);
      }
    };

    fetchRecommendations();
  }, [wishlist]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
        <p className="text-textLight font-medium">Curating your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 lg:px-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif text-textMain mb-4">Your Wishlist</h1>
          <p className="text-textLight max-w-2xl">
            A curated collection of pieces you love. Ready to make them yours?
          </p>
        </header>

        {wishlist.length === 0 ? (
          <div className="bg-black/[0.02] rounded-3xl p-12 sm:p-20 text-center mb-20 border border-black/[0.03]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Heart className="text-black/20" size={32} />
            </div>
            <h2 className="text-2xl font-serif text-textMain mb-4">Your wishlist is empty</h2>
            <p className="text-textLight mb-10 max-w-md mx-auto leading-relaxed">
              Start adding your favorite pieces to your wishlist and they will appear here.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-textMain text-white text-xs font-semibold uppercase tracking-widest hover:bg-black/80 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/10 group"
            >
              Explore Collections
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-24">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Recommendations Section */}
        {(recommendations.length > 0 || isRecLoading) && (
          <section className="border-t border-black/5 pt-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-textMain mb-2">Recommended for You</h2>
                <p className="text-sm text-textLight">Based on your wishlist</p>
              </div>
              <Link to="/collections" className="text-sm text-brand font-medium hover:opacity-70 transition-opacity flex items-center gap-2 group">
                See everything
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {isRecLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-4">
                    <div className="bg-black/[0.03] rounded-2xl aspect-[3/4]" />
                    <div className="h-4 bg-black/[0.03] rounded-full w-3/4" />
                    <div className="h-4 bg-black/[0.03] rounded-full w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {recommendations.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
