import { Shield, Zap, Target, Users } from 'lucide-react';
const AboutSection = () => {
 const features = [
  {
    icon: Shield,
    title: 'AI-Based Strategy Generator',
    description:
      'No coding Required. Describe your trading logic in natural language, and our AI will automatically generate optimized Python strategies for you.'
  },
  {
    icon: Zap,
    title: 'Indian Market Data Integration',
    description:
      'Access extensive, real-time and historical datasets from the Indian financial markets, enabling informed strategy development tailored to your local trading environment.'
  },
  {
    icon: Target,
    title: 'Multi-Asset Backtesting',
    description:
      'Backtest and deploy strategies across a wide range of asset classes, including equities, F&O, currencies, commodities, gold, and cryptocurrencies — all in one unified platform.'
  },
  {
    icon: Users,

    title: 'No Programming Required',
    description:
      'Simply describe your strategy in natural language — our AI automatically writes the code for you. Advanced users can customize and run it with full Python support.'
  }
];

  return <section id="about" className="relative py-24 bg-gradient-to-br from-emerald-900/10 via-emerald-800/10 to-green">

      {/* Top curve */}
      <div className="absolute top-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-24 transform rotate-180">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-black"></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">About </span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">QuantEdge</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">We're transforming the way traders develop and refine their strategies-delivering unmatched data driven power through our seamless blend of Backtester and AI</p>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"> 
        

          {features.map((feature, index) => <div key={index} className="group glass-effect rounded-2xl p-8 text-center hover:bg-emerald-900/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>)}
        </div>

   
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-24">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-black"></path>
        </svg>
      </div>
    </section>;
};
export default AboutSection;