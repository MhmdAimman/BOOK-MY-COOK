import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserGroupIcon, CakeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import HomeNavbar from '../components/common/HomeNavbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const features = [
    {
      title: 'Professional Chefs',
      description: 'Hire experienced chefs specializing in Tamil cuisine, Chettinad, Kongu, and more.',
      icon: UserGroupIcon,
      link: '/chefs',
    },
    {
      title: 'Catering Services',
      description: 'Complete catering solutions for weddings, corporate events, and family functions.',
      icon: CakeIcon,
      link: '/caterers',
    },
    {
      title: 'Decoration Services',
      description: 'Transform your venue with stunning decorations for any occasion.',
      icon: SparklesIcon,
      link: '/decorators',
    },
  ];

  const whyChooseUs = [
    {
      title: 'Verified Providers',
      description: 'All chefs and caterers are verified with background checks and valid certifications across Tamil Nadu.',
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.488-8-3.864z" />
        </svg>
      ),
    },
    {
      title: 'Tamil Nadu Focus',
      description: 'Specialized in Chettinad, Kongu, and traditional Tamil cuisine with deep local expertise.',
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      title: 'Secure Payments',
      description: 'Safe online and cash payment options with transparent pricing and no hidden fees.',
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 14.5l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: '24/7 Support',
      description: 'Dedicated support team available round the clock for all your event planning needs.',
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.197.175-.394.254-.59A8.22 8.22 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
  ];

  const popularCities = [
    'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli'
  ];

  const stats = [
    { value: '500+', label: 'Service Providers' },
    { value: '1000+', label: 'Events Completed' },
    { value: '40+', label: 'Cities Covered' },
    { value: '4.8', label: 'Average Rating' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Home Navbar */}
      {!isAuthenticated && <HomeNavbar />}
      
      {/* Hero Section - Full Screen with Overlay */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Fallback Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B1538] via-[#A31B47] to-[#B91C1C]" />

        {/* Unsplash Background Image */}
        {!imageError && (
          <img
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&q=80"
            alt="South Indian cuisine background"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-6">
            <span className="text-4xl md:text-5xl font-bold text-[#F59E0B]">BOOK</span>
            <span className="text-4xl md:text-5xl font-bold text-white">MYCOOK</span>
          </div>

          {/* Tagline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Book the Best Services
            <br />
            <span className="text-[#F59E0B]">for Your Events</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Tamil Nadu's trusted platform for hiring professional chefs, catering services, and decoration management for all your events.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for chefs, caterers, decorators..."
                  className="w-full px-6 py-4 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-8 py-4 rounded-xl font-semibold"
              >
                Explore Services
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#8B1538] px-8 py-4 rounded-xl font-semibold"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-20 bg-[#FFFBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#451A03] mb-4">
              Our Services
            </h2>
            <p className="text-lg text-[#78350F] max-w-2xl mx-auto">
              Find the perfect service provider for your next event. From intimate gatherings to grand celebrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Link to={feature.link} key={index} className="group">
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border-2 border-transparent group-hover:border-[#F59E0B]">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#8B1538] to-[#B91C1C] rounded-2xl flex items-center justify-center shadow-lg">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#451A03] mb-3">{feature.title}</h3>
                    <p className="text-[#78350F]">{feature.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-[#8B1538] to-[#B91C1C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-[#F59E0B] mb-2">{stat.value}</p>
                <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#FFFBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#451A03] mb-4">
              Why Choose BOOKMYCOOK?
            </h2>
            <p className="text-lg text-[#78350F] max-w-2xl mx-auto">
              Tamil Nadu's most trusted platform for professional event services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-[#F59E0B]"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#8B1538] to-[#B91C1C] rounded-full flex items-center justify-center shadow-lg group-hover:animate-float transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#451A03] mb-3">{item.title}</h3>
                <p className="text-[#78350F] text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#451A03] mb-4">
              Popular Cities in Tamil Nadu
            </h2>
            <p className="text-lg text-[#78350F]">
              Find service providers in your city
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {popularCities.map((city, index) => (
              <Link
                key={index}
                to={`/services?city=${city.toLowerCase()}`}
                className="px-8 py-4 bg-[#FEF3C7] rounded-full shadow-md hover:shadow-lg transition-all text-[#451A03] font-semibold border-2 border-[#F59E0B]/30 hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA Section */}
      <section className="py-20 bg-[#451A03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Are You a Service Provider?
              </h2>
              <p className="text-xl text-[#F59E0B] max-w-lg">
                Join our platform and reach thousands of customers across Tamil Nadu.
              </p>
            </div>
            <Link to="/register?role=provider">
              <Button
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-10 py-5 rounded-xl font-bold text-lg whitespace-nowrap"
              >
                Register as Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
