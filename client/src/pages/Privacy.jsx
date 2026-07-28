import { ShieldCheckIcon, LockClosedIcon, EyeIcon, ServerIcon, UserGroupIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import BackButton from '../components/common/BackButton';

const Privacy = () => {
  const sections = [
    {
      icon: EyeIcon,
      title: 'Information We Collect',
      content: [
        'Personal Information: Name, email address, phone number, and address when you register on our platform.',
        'Payment Information: Credit card details and bank account information for processing payments securely through our payment gateway.',
        'Service Data: Booking details, event preferences, and communication history with service providers.',
        'Device Information: IP address, browser type, and device identifiers for security and analytics purposes.',
        'Location Data: City and area preferences to show relevant service providers in your region.',
      ],
    },
    {
      icon: ServerIcon,
      title: 'How We Use Your Information',
      content: [
        'To connect you with verified service providers based on your requirements and location.',
        'To process bookings, payments, and facilitate communication between customers and providers.',
        'To send important updates about your bookings, payments, and platform announcements.',
        'To improve our services through analytics and user feedback.',
        'To prevent fraud and ensure the security of all transactions on our platform.',
      ],
    },
    {
      icon: LockClosedIcon,
      title: 'Data Security',
      content: [
        'We use industry-standard SSL encryption to protect all data transmitted between your browser and our servers.',
        'Payment information is processed through PCI-DSS compliant payment gateways.',
        'Access to personal data is restricted to authorized personnel only.',
        'We regularly update our security measures to protect against unauthorized access.',
        'User passwords are hashed using bcrypt and never stored in plain text.',
      ],
    },
    {
      icon: ShieldCheckIcon,
      title: 'Cookies Policy',
      content: [
        'We use essential cookies to maintain your login session and remember your preferences.',
        'Analytics cookies help us understand how users interact with our platform.',
        'You can disable cookies in your browser settings, but some features may not work properly.',
        'We do not sell or share cookie data with third-party advertisers.',
        'Third-party cookies from payment gateways may be used during transactions.',
      ],
    },
    {
      icon: UserGroupIcon,
      title: 'Third-Party Services',
      content: [
        'Payment Processing: We use Razorpay for secure payment processing. They handle your payment data according to their privacy policy.',
        'Communication: We use email services to send booking confirmations and updates.',
        'Analytics: We use analytics tools to improve user experience and platform performance.',
        'Maps: Location services help show service providers near you.',
        'All third-party services are vetted for data security and privacy compliance.',
      ],
    },
    {
      icon: UserGroupIcon,
      title: 'Your Rights',
      content: [
        'Access: You can request a copy of all personal data we hold about you.',
        'Correction: You can update your personal information through your profile settings.',
        'Deletion: You can request deletion of your account and associated data.',
        'Portability: You can request your data in a portable format.',
        'Opt-out: You can opt out of marketing communications at any time.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BackButton className="mb-6" />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#451A03] mb-4">
            Privacy <span className="text-[#8B1538]">Policy</span>
          </h1>
          <p className="text-lg text-[#78350F]">
            Last updated: January 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-gray-600 leading-relaxed">
            At BOOKMYCOOK, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform to book chefs, caterers, and decoration services in Tamil Nadu.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#8B1538]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#451A03]">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600">
                      <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full mt-2 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-[#8B1538] to-[#B91C1C] rounded-2xl p-8 mt-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <EnvelopeIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">Questions About Privacy?</h2>
          </div>
          <p className="text-white/90 mb-4">
            If you have any questions or concerns about our privacy practices, please contact us:
          </p>
          <div className="space-y-2 text-white/90">
            <p>Email: privacy@bookmycook.in</p>
            <p>Phone: +91 98765 43210</p>
            <p>Address: 123 Anna Salai, Chennai, Tamil Nadu 600002</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            By using BOOKMYCOOK, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
