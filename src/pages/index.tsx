import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Briefcase,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  Play,
  MessageCircle,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("customer");

  const features = {
    customer: [
      {
        icon: <Search className="h-6 w-6" />,
        title: "Find Skilled Fundis",
        description:
          "Connect with verified professionals in plumbing, electrical, carpentry, and more.",
      },
      {
        icon: <Shield className="h-6 w-6" />,
        title: "Verified & Trusted",
        description:
          "All fundis are thoroughly vetted and reviewed by other customers.",
      },
      {
        icon: <Clock className="h-6 w-6" />,
        title: "Quick Response",
        description:
          "Get multiple quotes and responses within minutes, not days.",
      },
    ],
    fundi: [
      {
        icon: <Briefcase className="h-6 w-6" />,
        title: "More Job Opportunities",
        description:
          "Access hundreds of customers looking for your skills every day.",
      },
      {
        icon: <Star className="h-6 w-6" />,
        title: "Build Your Reputation",
        description:
          "Grow your business with reviews and ratings from satisfied customers.",
      },
      {
        icon: <Users className="h-6 w-6" />,
        title: "Grow Your Business",
        description:
          "Expand your client base and increase your earnings potential.",
      },
    ],
  };

  const steps = [
    {
      number: "01",
      title: "Post Your Need",
      description: "Describe the job you need done and your location",
      icon: <MessageCircle className="h-8 w-8" />,
    },
    {
      number: "02",
      title: "Get Multiple Quotes",
      description:
        "Receive competitive quotes from qualified fundis in your area",
      icon: <Briefcase className="h-8 w-8" />,
    },
    {
      number: "03",
      title: "Choose & Connect",
      description: "Select the best fundi for your job and get it done",
      icon: <Users className="h-8 w-8" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A2647] to-[#003366] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-semibold mb-6">
              Connecting Skilled <span className="text-orange-500">Fundis</span>{" "}
              with People Who Need Them
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Kenya's trusted platform for home services and skilled
              professionals. Get your jobs done right, right when you need them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/register"
                className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors duration-200   text-lg flex items-center justify-center space-x-2"
              >
                <span>Find a Fundi</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/auth/register"
                className="bg-white text-[#0A2647] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200   text-lg"
              >
                Become a Fundi
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-semibold text-orange-500">
                  500+
                </div>
                <div className="text-gray-300">Skilled Fundis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-orange-500">
                  2,000+
                </div>
                <div className="text-gray-300">Jobs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-orange-500">
                  98%
                </div>
                <div className="text-gray-300">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-orange-500">
                  15+
                </div>
                <div className="text-gray-300">Service Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0A2647] mb-4">
              How FundiConnect Helps You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're looking for skilled help or growing your business,
              we've got you covered.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setActiveTab("customer")}
                className={`px-6 py-3 rounded-md   transition-colors duration-200 ${
                  activeTab === "customer"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:text-[#0A2647]"
                }`}
              >
                For Customers
              </button>
              <button
                onClick={() => setActiveTab("fundi")}
                className={`px-6 py-3 rounded-md   transition-colors duration-200 ${
                  activeTab === "fundi"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:text-[#0A2647]"
                }`}
              >
                For Fundis
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features[activeTab as keyof typeof features].map(
              (feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="text-orange-500 mb-4">{feature.icon}</div>
                  <h3 className="text-xl   text-[#0A2647] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0A2647] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your jobs done has never been easier. Three simple steps
              to connect with the right professional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl   text-[#0A2647] mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] to-[#003366] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of Kenyans who trust FundiConnect for their home
            service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors duration-200   text-lg"
            >
              Find a Fundi Today
            </Link>
            <Link
              href="/auth/register"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-[#0A2647] transition-colors duration-200   text-lg"
            >
              Become a Fundi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
