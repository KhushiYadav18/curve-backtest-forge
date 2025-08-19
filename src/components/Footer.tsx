import { ArrowUp } from 'lucide-react';
import logo from '../QElogo.png';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Top Button */}
        <div className="text-center mb-8">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full hover:from-emerald-700 hover:to-green-700 transition-all duration-300 hover:scale-110"
          >
            <ArrowUp size={20} />
          </button>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-start">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="QuantEdge Logo"
                className="h-20 w-20 object-contain mt-4"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
                QuantEdge
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md mt-4">
              Unlock the power of data-driven trading using our Advanced AI Driven Trading platform which lets you test, optimise and refine your trading strategies using Indian market datasets.
            </p>
            <div className="text-sm text-gray-400">
              © 2025 QuantEdge. All rights reserved.
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block h-full border-l border-gray-700 mx-auto" />

          {/* Team Section */}
          <div className="md:col-span-1">
            <h1 className="text-lg font-bold mb-4">Our Team</h1>
            <div className="space-y-4 text-gray-300">
              <div>
                <p className="font-semibold text-white">Anuj Yadav</p>
                <p className="text-sm">BTech Environmental Engineering, IIT Bombay'27</p>
              
               <p className="text-sm">8770678570</p>
               
               <p className="text-sm">anujyadav@iitb.ac.in</p>
              </div>
              <div>
                <p className="font-semibold text-white">Aryan Tewari</p>
                <p className="text-sm">BTech Engineering Physics, IIT Bombay'26</p>
              
               <p className="text-sm">9875408858</p>
               
               <p className="text-sm">aryantiwari4975@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Text */}
        <div className="border-t border-gray-800 pt-8">
          <div className="text-center text-gray-400 text-sm">
            Built with ❤️ for the trading community
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
