import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { HeroSection } from '../../types/landing';
import { Product } from '../../types/product';
import { formatPrice } from '../../utils/format';

type HeroProps = {
  data: HeroSection;
  products: Product[];
};

export default function Hero({ data, products }: HeroProps) {
  const imageWrapRef = useRef<HTMLDivElement | null>(null);

  const handleImageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = imageWrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 3;
    const rotateX = (0.5 - y / rect.height) * 2;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  };

  const handleImageLeave = () => {
    if (!imageWrapRef.current) return;
    imageWrapRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <section className="relative min-h-screen pt-24 pb-12 lg:pt-32 px-6 overflow-hidden flex flex-col justify-center">
      {/* Background large text */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-0 overflow-hidden">
        <h1 className="text-[10rem] md:text-[18rem] lg:text-[26rem] font-bold text-white/60 tracking-tighter mix-blend-overlay select-none whitespace-nowrap">
          {data.backgroundWord}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left / Center Image Area */}
        <div className="relative order-2 lg:order-1 flex justify-center mt-12 lg:mt-0">
          <div
            ref={imageWrapRef}
            className="relative w-full max-w-md opacity-0 animate-fade-in-up transition-transform duration-300"
            style={{ animationDelay: '200ms', transformStyle: 'preserve-3d', willChange: 'transform' }}
            onMouseMove={handleImageMove}
            onMouseLeave={handleImageLeave}
          >
            <img
              src={data.backgroundImage}
              alt="Fashion model wearing a beige ensemble"
              className="w-full h-auto object-cover rounded-3xl z-10 relative shadow-xl"
            />

            {/* Floating tags */}
            {data.tags.map((tag, index) => {
              const product = products.find((item) => item.id === tag.productId);
              if (!product) return null;

              const tagPrice = product.discountPrice ?? product.price;

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
                    <p className="text-sm font-semibold text-textMain">{product.name}</p>
                    <p className="text-xs text-textMain/70">
                      {formatPrice(tagPrice)}
                    </p>
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="bg-brand text-white p-2 rounded-lg cursor-pointer hover:bg-brand/80 transition-all duration-200 active:scale-90 shrink-0"
                    aria-label={`View ${product.name}`}
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
