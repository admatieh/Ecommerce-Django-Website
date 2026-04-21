import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { HeroSection } from '../../types/landing';
import { Product } from '../../types/product';

type HeroProps = {
  data: HeroSection;
  products: Product[];
};

export default function Hero({ data, products }: HeroProps) {
  return (
    <section className="relative min-h-screen pt-24 pb-12 lg:pt-32 px-6 overflow-hidden flex flex-col justify-center">
      {/* Background large text */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-0 overflow-hidden">
        <h1 className="text-[10rem] md:text-[18rem] lg:text-[26rem] font-bold text-white/60 tracking-tighter mix-blend-overlay select-none whitespace-nowrap">
          FASHION
        </h1>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left / Center Image Area */}
        <div className="relative order-2 lg:order-1 flex justify-center mt-12 lg:mt-0">
          <div className="relative w-full max-w-md opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <img
              src={data.backgroundImage}
              alt="Fashion model wearing a beige ensemble"
              className="w-full h-auto object-cover rounded-3xl z-10 relative shadow-xl"
            />

            {/* Floating tags */}
            {data.tags.map((tag, index) => {
              const product = products.find((item) => item.id === tag.productId);
              const tagPrice = product ? product.discountPrice ?? product.price : undefined;

              return (
                <div
                  key={tag.id}
                  className="absolute bg-white/40 backdrop-blur-md border border-white/50 p-3 pr-4 rounded-xl flex items-center justify-between gap-4 shadow-lg z-20 opacity-0 animate-fade-in-up max-w-[180px]"
                  style={{
                    ...tag.position,
                    animationDelay: `${600 + index * 200}ms`,
                    right: tag.position.right ? `clamp(0%, ${tag.position.right}, ${tag.position.right})` : undefined,
                    left: tag.position.left ? `clamp(0%, ${tag.position.left}, ${tag.position.left})` : undefined,
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold text-textMain">{product?.name ?? 'Featured Product'}</p>
                    <p className="text-xs text-textMain/70">
                      {typeof tagPrice === 'number' ? `$${tagPrice.toFixed(2)}` : 'View details'}
                    </p>
                  </div>
                  <Link
                    to={product ? `/product/${product.id}` : data.ctaLink}
                    className="bg-brand text-white p-2 rounded-lg cursor-pointer hover:bg-brand/80 transition-all duration-200 active:scale-90 shrink-0"
                    aria-label={product ? `View ${product.name}` : 'View featured product'}
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Text Content */}
        <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left pt-12 lg:pt-0">
          <h2
            className="text-4xl sm:text-5xl lg:text-7xl font-serif text-textMain mb-6 leading-[1.1] opacity-0 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {data.title}
          </h2>
          <p
            className="text-base sm:text-lg text-textLight mb-8 max-w-md opacity-0 animate-fade-in-up"
            style={{ animationDelay: '250ms' }}
          >
            {data.subtitle}
          </p>

          <Link to={data.ctaLink} className="opacity-0 animate-fade-in-up w-full sm:w-auto" style={{ animationDelay: '400ms' }}>
            <Button className="w-full sm:w-auto px-8 py-4 text-base group">
              {data.ctaText}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
