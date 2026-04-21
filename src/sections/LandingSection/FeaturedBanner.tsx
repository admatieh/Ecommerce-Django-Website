import { ArrowRight } from 'lucide-react';
import Button from '../../components/Button';

export default function FeaturedBanner() {
  return (
    <section className="bg-background py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center bg-white rounded-3xl lg:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">

        {/* Left Image */}
        <div className="w-full lg:w-1/2 h-[400px] sm:h-[500px] lg:h-[700px] overflow-hidden relative group">
          <img
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop"
            alt="Editorial campaign - woman in summer dress"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 xl:p-24 text-center lg:text-left flex flex-col items-center lg:items-start">
          <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase mb-4">Summer Collection</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight text-textMain mb-6">
            Effortless Elegance<br />for the Modern Woman
          </h2>
          <p className="text-base sm:text-lg text-textLight mb-8 leading-relaxed max-w-md">
            Discover pieces crafted from premium sustainable fabrics. Our latest collection brings you versatile silhouettes that transition flawlessly from day to evening.
          </p>

          <Button className="py-4 px-8 text-base group">
            Discover the Campaign
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
}
