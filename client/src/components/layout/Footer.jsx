import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#8B1538] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <span className="text-xl font-bold text-[#F59E0B]">BOOK</span>
              <span className="text-xl font-bold text-white">MYCOOK</span>
            </div>
            <p className="text-white/70 text-sm">
              Tamil Nadu's premier platform for booking chefs, catering services, and decoration management for your events.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/chefs" className="text-white/70 hover:text-white transition-colors text-sm">Chef Services</Link></li>
              <li><Link to="/caterers" className="text-white/70 hover:text-white transition-colors text-sm">Catering Services</Link></li>
              <li><Link to="/decorators" className="text-white/70 hover:text-white transition-colors text-sm">Decoration Services</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-white/70 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><Link to="/privacy" className="text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white/70 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>Chennai, Tamil Nadu</li>
              <li>+91 98765 43210</li>
              <li>support@bookmycook.in</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} BOOKMYCOOK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
