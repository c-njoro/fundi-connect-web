import { 
  Search, 
  MessageSquare, 
  CheckCircle, 
  Star, 
  Shield,
  Clock,
  DollarSign,
  Users,
  FileText,
  MapPin,
  Phone
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const customerSteps = [
    {
      icon: <Search className="h-8 w-8" />,
      step: "1",
      title: "Find & Post",
      description: "Search for fundis by service or post your job requirement",
      details: [
        "Browse skilled fundis in your area",
        "Post detailed job descriptions",
        "Specify your budget and timeline"
      ]
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      step: "2",
      title: "Compare & Choose",
      description: "Receive quotes and compare fundis based on ratings and reviews",
      details: [
        "Get multiple competitive quotes",
        "View fundi profiles and ratings",
        "Check completed portfolios"
      ]
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      step: "3",
      title: "Hire & Pay Securely",
      description: "Hire your chosen fundi and pay securely upon job completion",
      details: [
        "Secure messaging with fundi",
        "Track job progress in real-time",
        "Pay only when satisfied"
      ]
    }
  ];

  const fundiSteps = [
    {
      icon: <FileText className="h-8 w-8" />,
      step: "1",
      title: "Create Your Profile",
      description: "Set up your professional profile with skills, experience, and portfolio",
      details: [
        "Showcase your expertise",
        "Upload certifications and portfolio",
        "Set your service areas"
      ]
    },
    {
      icon: <Phone className="h-8 w-8" />,
      step: "2",
      title: "Receive Job Requests",
      description: "Get notified of relevant jobs in your area and specialty",
      details: [
        "Real-time job notifications",
        "View job details and budgets",
        "Submit competitive quotes"
      ]
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      step: "3",
      title: "Grow Your Business",
      description: "Complete jobs, earn great reviews, and build your reputation",
      details: [
        "Secure payment processing",
        "Build your rating and reviews",
        "Get more job recommendations"
      ]
    }
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Professionals",
      description: "All fundis undergo thorough verification and background checks"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Quality Guaranteed",
      description: "We ensure quality work with our rating and review system"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Quick Response",
      description: "Get responses and quotes within minutes, not days"
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Fair Pricing",
      description: "Competitive and transparent pricing with no hidden costs"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Wide Network",
      description: "Access to hundreds of skilled professionals across Kenya"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location Based",
      description: "Find fundis near you for faster service and better rates"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A2647] to-[#003366] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How FundiConnect Works
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Simple, transparent, and efficient - discover how FundiConnect makes finding 
              skilled professionals or growing your business easier than ever.
            </p>
          </div>
        </div>
      </div>

      {/* For Customers Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A2647] mb-4">
              For Customers
            </h2>
            <p className="text-xl text-gray-600">
              Get your jobs done quickly and reliably in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {customerSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <div className="text-4xl font-bold text-gray-200">{step.step}</div>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#0A2647] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center space-x-3 text-gray-600">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/auth/register"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold text-lg inline-flex items-center space-x-2"
            >
              <span>Start Finding Fundis</span>
            </Link>
          </div>
        </div>
      </section>

      {/* For Fundis Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A2647] mb-4">
              For Fundis
            </h2>
            <p className="text-xl text-gray-600">
              Grow your business and reach more customers with FundiConnect
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fundiSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-[#0A2647] rounded-full flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <div className="text-4xl font-bold text-gray-200">{step.step}</div>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#0A2647] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center space-x-3 text-gray-600">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/auth/register"
              className="bg-[#0A2647] text-white px-8 py-4 rounded-lg hover:bg-[#003366] transition-colors duration-200 font-semibold text-lg inline-flex items-center space-x-2"
            >
              <span>Join as a Fundi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A2647] mb-4">
              Why Choose FundiConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to making your experience seamless and trustworthy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-orange-500 mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-[#0A2647] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A2647] mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How do I know if a fundi is qualified?",
                answer: "All fundis on our platform undergo verification, and you can check their ratings, reviews, and certifications before hiring."
              },
              {
                question: "What if I'm not satisfied with the work?",
                answer: "We have a dispute resolution process and work to ensure customer satisfaction. Your payment is protected until you approve the work."
              },
              {
                question: "How much does it cost to use FundiConnect?",
                answer: "For customers, it's free to post jobs and receive quotes. Fundis pay a small commission on completed jobs through the platform."
              },
              {
                question: "What areas do you serve?",
                answer: "We currently serve all major counties in Kenya and are expanding to more areas regularly."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#0A2647] mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}