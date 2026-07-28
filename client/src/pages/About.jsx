import { Link } from 'react-router-dom';
import { UserGroupIcon, GlobeAltIcon, HeartIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import BackButton from '../components/common/BackButton';

const About = () => {
  const values = [
    {
      icon: HeartIcon,
      title: 'Trust',
      description: 'We verify all service providers to ensure quality and reliability for every event.',
    },
    {
      icon: LightBulbIcon,
      title: 'Quality',
      description: 'We partner with experienced professionals who deliver exceptional service.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Local Expertise',
      description: 'Deep understanding of Tamil culture, traditions, and regional cuisines.',
    },
    {
      icon: UserGroupIcon,
      title: 'Community',
      description: 'Building connections between skilled providers and families across Tamil Nadu.',
    },
  ];

  const milestones = [
    { year: 'Jan 2026', event: 'BOOKMYCOOK founded in Chennai with a vision to digitize event services' },
    { year: 'Feb 2026', event: 'Onboarded first 50 verified service providers across Chennai' },
    { year: 'Mar 2026', event: 'Expanded to 10+ cities across Tamil Nadu' },
    { year: 'Apr 2026', event: 'Launched mobile-friendly platform with real-time booking' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BackButton className="mb-6" />

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#451A03] mb-4">
            About <span className="text-[#8B1538]">BOOKMYCOOK</span>
          </h1>
          <p className="text-lg text-[#78350F] max-w-3xl mx-auto">
            Tamil Nadu's trusted platform connecting families with professional chefs, caterers, and decorators for memorable events.
          </p>
        </div>

        {/* Our Story */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#451A03] mb-6">Our Story</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              BOOKMYCOOK was born from a simple observation: planning events in Tamil Nadu often meant relying on word-of-mouth recommendations, with no easy way to find, compare, and book quality service providers.
            </p>
            <p className="mb-4">
              Founded in January 2026 in Chennai, we set out to create a platform that would transform how Tamil families plan their most important occasions - from weddings and engagements to housewarmings and temple festivals.
            </p>
            <p>
              In just 3 months, we have grown to serve 10+ cities across Tamil Nadu, connecting hundreds of families with verified chefs, caterers, and decorators who bring expertise in traditional Tamil cuisine including Chettinad, Kongu, and Brahmin specialties.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-[#8B1538] to-[#B91C1C] rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-white/90">
              To make event planning effortless for Tamil families by providing a trusted platform where they can discover, compare, and book verified service providers with confidence.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Our Vision</h3>
            <p className="text-white/90">
              To become South India's most trusted event services platform, empowering local professionals while preserving and celebrating Tamil culinary traditions.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#451A03] mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#FEF3C7] rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-[#8B1538]" />
                  </div>
                  <h3 className="font-bold text-[#451A03] mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Our Journey */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#451A03] mb-8 text-center">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#F59E0B]"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-[#FEF3C7] rounded-lg p-4">
                      <span className="font-bold text-[#8B1538]">{milestone.year}</span>
                      <p className="text-gray-600 text-sm mt-1">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-[#8B1538] rounded-full z-10"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-[#8B1538] to-[#B91C1C] rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Join Our Platform</h3>
          <p className="mb-6 text-white/90">
            Whether you're looking for services or offering them, BOOKMYCOOK is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="px-6 py-3 bg-white text-[#8B1538] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Find Services
            </Link>
            <Link to="/register?role=provider" className="px-6 py-3 bg-[#F59E0B] text-white font-semibold rounded-lg hover:bg-[#D97706] transition-colors">
              Become a Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
