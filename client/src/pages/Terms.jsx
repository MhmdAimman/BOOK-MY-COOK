import { DocumentCheckIcon, UserIcon, CreditCardIcon, CalendarIcon, ExclamationTriangleIcon, ScaleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import BackButton from '../components/common/BackButton';

const Terms = () => {
  const sections = [
    {
      icon: DocumentCheckIcon,
      title: 'Acceptance of Terms',
      content: `By accessing and using BOOKMYCOOK, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. These terms apply to all visitors, users, and service providers.

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the platform. Your continued use of BOOKMYCOOK after any changes indicates your acceptance of the new terms.`,
    },
    {
      icon: UserIcon,
      title: 'User Accounts',
      content: `To use certain features of the platform, you must register and create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain and update your information to keep it accurate
• Keep your password confidential and secure
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use of your account

You may register as a Customer, Chef, Caterer, or Decorator based on your role. Service providers must provide valid identification and certifications as required by law.`,
    },
    {
      icon: UserIcon,
      title: 'Service Provider Terms',
      content: `Service providers (chefs, caterers, decorators) agree to:

• Provide accurate information about services, pricing, and availability
• Maintain valid licenses and certifications as required by Tamil Nadu regulations
• Deliver services as described and at the quality promised
• Respond to booking requests within 24 hours
• Honor confirmed bookings and not cancel without valid reason
• Maintain hygiene and safety standards as per FSSAI guidelines
• Not engage in any fraudulent or misleading practices

BOOKMYCOOK reserves the right to suspend or terminate provider accounts that violate these terms.`,
    },
    {
      icon: CreditCardIcon,
      title: 'Booking & Payment Terms',
      content: `When you make a booking through BOOKMYCOOK:

• You agree to pay the total amount shown, including any applicable taxes
• Payment can be made online through our secure payment gateway or in cash to the provider
• Online payments are processed through Razorpay and subject to their terms
• A booking is confirmed only after the provider accepts your request
• Prices displayed are in Indian Rupees (INR) and inclusive of GST where applicable

Service providers set their own prices. BOOKMYCOOK charges a platform fee from providers for each completed booking.`,
    },
    {
      icon: CalendarIcon,
      title: 'Cancellation Policy',
      content: `Cancellation by Customer:
• More than 7 days before event: Full refund minus processing fees
• 3-7 days before event: 50% refund
• Less than 3 days before event: No refund

Cancellation by Provider:
• Providers must inform customers at least 48 hours in advance
• In case of provider cancellation, full refund will be issued
• Repeated cancellations by providers may result in account suspension

Force Majeure: In case of natural disasters, government restrictions, or other unforeseen circumstances, both parties will work together to reschedule or process refunds.`,
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'Limitation of Liability',
      content: `BOOKMYCOOK acts as a platform connecting customers with service providers. We are not responsible for:

• The quality of services provided by third-party providers
• Any injury, loss, or damage occurring during service delivery
• Delays or failures due to provider negligence
• Any disputes between customers and providers

Our liability is limited to the platform fee collected for the booking. For any claims, the maximum liability shall not exceed the total amount paid through the platform.

We recommend customers verify provider credentials and discuss all requirements before booking.`,
    },
    {
      icon: ScaleIcon,
      title: 'Governing Law & Dispute Resolution',
      content: `These Terms of Service are governed by the laws of India. Any disputes arising from these terms or the use of BOOKMYCOOK shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.

Before initiating legal proceedings, we encourage parties to:

1. Contact our support team to attempt resolution
2. Engage in good-faith negotiation
3. Consider mediation through a neutral third party

For consumer complaints, you may also approach the Consumer Disputes Redressal Commission as per the Consumer Protection Act, 2019.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BackButton className="mb-6" />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#451A03] mb-4">
            Terms of <span className="text-[#8B1538]">Service</span>
          </h1>
          <p className="text-lg text-[#78350F]">
            Last updated: January 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-gray-600 leading-relaxed">
            Welcome to BOOKMYCOOK! These Terms of Service govern your use of our platform for booking chefs, caterers, and decoration services in Tamil Nadu. Please read these terms carefully before using our services.
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
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-[#8B1538] to-[#B91C1C] rounded-2xl p-8 mt-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <EnvelopeIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">Questions About Terms?</h2>
          </div>
          <p className="text-white/90 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-white/90">
            <p>Email: legal@bookmycook.in</p>
            <p>Phone: +91 98765 43210</p>
            <p>Address: 123 Anna Salai, Chennai, Tamil Nadu 600002</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            By using BOOKMYCOOK, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
