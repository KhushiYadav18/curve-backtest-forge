
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const images = [
  { src: "public/charts/im1.png", alt: "Code Editor" },
  { src: "public/charts/im2.png", alt: "Settings" },
  { src: "public/charts/im3.png", alt: "Code" },
  { src: "public/charts/im4.png", alt: "Advanced Results" },
   { src: "public/charts/im5.png", alt: "Advanced Results" },
    { src: "public/charts/im6.png", alt: "Advanced Results" },
     { src: "public/charts/im7.png", alt: "Generate Prompt" },
      { src: "public/charts/im8.png", alt: "submissions" },

];

const ChartCarousel = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((current + 1) % images.length);
  const prevSlide = () => setCurrent((current - 1 + images.length) % images.length);

  return (
    <section className="bg-gradient-to-b from-black via-emerald-10 to-emerald-900 py-20">
      <h2 className="text-center text-4xl font-bold text-white mb-8">Analytics Snapshots</h2>
      <div className="relative max-w-4xl mx-auto">
        <div className="overflow-hidden rounded-xl shadow-lg">
          <img
            src={images[current].src}
            alt={images[current].alt}
            className="w-full h-auto object-contain rounded-xl"
          />
        </div>

        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
        >
          <ChevronLeft className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default ChartCarousel;
