import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const HomeNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className={`text-2xl font-bold transition-colors ${
                scrolled ? 'text-[#8B1538]' : 'text-white'
              }`}>
                BOOK
              </span>
              <span className={`text-2xl font-bold transition-colors ${
                scrolled ? 'text-[#F59E0B]' : 'text-[#F59E0B]'
              }`}>
                MYCOOK
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/services"
              className={`font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
              }`}
            >
              Services
            </Link>
            <Link
              to="/chefs"
              className={`font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
              }`}
            >
              Chefs
            </Link>
            <Link
              to="/caterers"
              className={`font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
              }`}
            >
              Caterers
            </Link>
            <Link
              to="/decorators"
              className={`font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
              }`}
            >
              Decorators
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button
                variant="outline"
                className={`${
                  scrolled 
                    ? 'border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white' 
                    : 'border-white text-white hover:bg-white hover:text-[#8B1538]'
                }`}
              >
                Login
              </Button>
            </Link>
            <Link to="/register" className="hidden sm:block">
              <Button
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
              >
                Sign Up
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            scrolled ? 'bg-white border-gray-200' : 'bg-[#8B1538]/95 border-white/20'
          }`}>
            <div className="flex flex-col space-y-3">
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 font-medium ${
                  scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
                }`}
              >
                Services
              </Link>
              <Link
                to="/chefs"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 font-medium ${
                  scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
                }`}
              >
                Chefs
              </Link>
              <Link
                to="/caterers"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 font-medium ${
                  scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
                }`}
              >
                Caterers
              </Link>
              <Link
                to="/decorators"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 font-medium ${
                  scrolled ? 'text-gray-600 hover:text-[#8B1538]' : 'text-white/90 hover:text-white'
                }`}
              >
                Decorators
              </Link>
              <div className="pt-3 border-t border-gray-200/20 px-4">
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNavbar;
