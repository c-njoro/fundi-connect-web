import {
  Target,
  Eye,
  Users,
  Award,
  Heart,
  MapPin,
  Clock,
  Star,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function AboutUs() {
  const values = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Trust & Safety",
      description:
        "We prioritize the safety and security of both our customers and fundis through rigorous verification processes.",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Quality Excellence",
      description:
        "We're committed to connecting you with skilled professionals who deliver exceptional workmanship.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Community First",
      description:
        "We believe in building strong communities by supporting local talent and creating economic opportunities.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Collaboration",
      description:
        "We foster collaboration between customers and fundis to ensure successful outcomes for everyone.",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Founded",
      description:
        "FundiConnect was born to solve the challenge of finding reliable skilled workers in Kenya",
    },
    {
      year: "2024",
      title: "First 100 Jobs",
      description:
        "Completed our first 100 successful job matches within the first three months",
    },
    {
      year: "2025",
      title: "Platform Growth",
      description:
        "Expanded to serve all major counties with 500+ registered fundis",
    },
    {
      year: "Future",
      title: "National Expansion",
      description:
        "Working towards becoming Kenya's leading platform for skilled services",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0A2647] to-[#003366] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">
              About FundiConnect
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              We're on a mission to transform how Kenyans find skilled
              professionals and how talented fundis grow their businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-[#0A2647] mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg">
                  FundiConnect was founded in 2024 with a simple but powerful
                  vision: to create a trusted platform that connects skilled
                  Kenyan professionals with people who need their services.
                </p>
                <p>
                  We recognized the challenge many face in finding reliable,
                  qualified fundis for home repairs, construction, and various
                  skilled services. At the same time, we saw talented fundis
                  struggling to find consistent work and grow their businesses.
                </p>
                <p>
                  Today, we're proud to be building a community where trust,
                  quality, and mutual success are at the heart of everything we
                  do.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-semibold text-orange-500 mb-2">
                    500+
                  </div>
                  <div className="text-gray-600">Skilled Fundis</div>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-semibold text-orange-500 mb-2">
                    2,000+
                  </div>
                  <div className="text-gray-600">Jobs Completed</div>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-semibold text-orange-500 mb-2">
                    15+
                  </div>
                  <div className="text-gray-600">Service Categories</div>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-semibold text-orange-500 mb-2">
                    98%
                  </div>
                  <div className="text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white mb-6">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-[#0A2647] mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 text-lg">
                To empower skilled Kenyan professionals and make quality
                services accessible to everyone by creating trusted connections
                that drive economic growth and community development.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-[#0A2647] rounded-full flex items-center justify-center text-white mb-6">
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-[#0A2647] mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 text-lg">
                To become Kenya's most trusted platform for skilled services,
                where every talented fundi can thrive and every customer can
                find reliable help with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#0A2647] mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do at FundiConnect
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-orange-500 mb-4">{value.icon}</div>
                <h3 className="text-xl   text-[#0A2647] mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] to-[#003366] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Our Journey</h2>
            <p className="text-xl text-gray-200">
              From startup to Kenya's growing platform for skilled services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-semibold text-orange-500 mb-2">
                  {milestone.year}
                </div>
                <h3 className="text-xl   mb-3">{milestone.title}</h3>
                <p className="text-gray-200">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#0A2647] mb-4">
              The Team Behind FundiConnect
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're a passionate team of Kenyans dedicated to solving real
              problems in our community through technology and innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Our Fundis",
                role: "Skilled Professionals",
                description:
                  "The heart of our platform - talented Kenyan fundis who deliver exceptional work every day.",
              },
              {
                name: "Technology Team",
                role: "Innovation Drivers",
                description:
                  "Building and maintaining the platform that makes these connections possible.",
              },
              {
                name: "Support Team",
                role: "Community Builders",
                description:
                  "Ensuring every user has a great experience and every connection leads to success.",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#0A2647] to-[#003366] rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-xl   text-[#0A2647] mb-2">{member.name}</h3>
                <div className="text-orange-500 font-medium mb-4">
                  {member.role}
                </div>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-[#0A2647] mb-6">
            Join the FundiConnect Community
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you're looking for skilled help or ready to grow your
            business, we're here to support your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors duration-200   text-lg"
            >
              Find a Fundi
            </Link>
            <Link
              href="/auth/register"
              className="bg-[#0A2647] text-white px-8 py-4 rounded-lg hover:bg-[#003366] transition-colors duration-200   text-lg"
            >
              Become a Fundi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
