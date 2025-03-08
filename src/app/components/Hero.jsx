'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FiClock, 
  FiCalendar, 
  FiClipboard, 
  FiShield, 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiUsers,
  FiAward,
  FiHeart,
  FiActivity,
  FiMonitor
} from 'react-icons/fi';

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus({ loading: false, error: null, success: true });
      setFormData({ name: '', email: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative pt-10">
      {/* Main Hero Section */}
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-blue-800">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-6 pt-20 pb-24 relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <div className="lg:w-1/2 text-white z-10">
                <div className="inline-block px-4 py-2 bg-blue-400 rounded-full text-sm font-semibold mb-6">
                  Leading Healthcare Provider
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Your Health Is Our
                  <span className="block text-blue-100">Top Priority</span>
                </h1>

                <p className="text-xl text-blue-50 mb-8 leading-relaxed">
                  Experience world-class healthcare with our team of expert doctors and state-of-the-art facilities. We're here to provide you with the best medical care 24/7.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/signin">
                    <button className="px-8 py-4 bg-white text-blue-500 rounded-lg font-semibold text-lg 
                                   hover:bg-blue-50 transition-colors duration-300 shadow-lg">
                      Book Appointment
                    </button>
                  </Link>
                  <button className="px-8 py-4 bg-blue-400 text-white rounded-lg font-semibold text-lg 
                                 hover:bg-blue-300 transition-colors duration-300 border border-blue-300">
                    Emergency Care
                  </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center gap-3">
                    <FiUsers className="w-8 h-8 text-blue-100" />
                    <div>
                      <div className="text-2xl font-bold">50,000+</div>
                      <div className="text-blue-200">Patients Served</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiAward className="w-8 h-8 text-blue-100" />
                    <div>
                      <div className="text-2xl font-bold">15+</div>
                      <div className="text-blue-200">Years Experience</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="lg:w-1/2 relative">
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800"
                    alt="Medical Professional"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>

                {/* Floating Cards */}
                <div className="absolute top-4 -left-4 bg-white p-4 rounded-lg shadow-xl">
                  <FiHeart className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800">24/7 Emergency</div>
                </div>

                <div className="absolute bottom-4 -right-4 bg-white p-4 rounded-lg shadow-xl">
                  <FiActivity className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-800">Expert Doctors</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: FiClock,
                  title: "24/7 Service",
                  description: "Round-the-clock medical care for all emergencies"
                },
                {
                  icon: FiCalendar,
                  title: "Easy Scheduling",
                  description: "Book appointments online with your preferred doctor"
                },
                {
                  icon: FiPhone,
                  title: "Telemedicine",
                  description: "Virtual consultations from the comfort of your home"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced sections with modern glassmorphism */}
      <section id="about" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-blue-600 mb-4"
            >
              About Us
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              We are committed to providing the best healthcare management solution for patients and healthcare providers.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section - Fixed */}
      <section className="py-16 relative bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '24/7', label: 'Support Available' },
              { number: '100+', label: 'Expert Doctors' },
              { number: '50k+', label: 'Registered Patients' },
              { number: '99%', label: 'Patient Satisfaction' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 
                          backdrop-blur-xl border border-gray-100 hover:border-blue-200/50 
                          shadow-lg shadow-gray-200/50 hover:shadow-blue-200/10 transition-all"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 
                              bg-clip-text text-transparent mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare services designed to meet all your medical needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Online Consultations',
                description: 'Connect with healthcare providers from the comfort of your home',
                icon: FiPhone,
              },
              {
                title: 'Electronic Health Records',
                description: 'Secure access to your complete medical history',
                icon: FiClipboard,
              },
              {
                title: 'Appointment Scheduling',
                description: 'Easy and quick appointment booking with preferred doctors',
                icon: FiCalendar,
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 backdrop-blur-xl border border-gray-100 p-8 rounded-2xl
                          hover:bg-gray-50/50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-600 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Fixed */}
      <section id="testimonials" className="py-20 relative bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">What Our Patients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from people who have used our healthcare platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                content: "The online consultation feature saved me so much time. Excellent service!",
                image: "/testimonial1.jpg"
              },
              {
                name: "Michael Chen",
                role: "Patient",
                content: "Very user-friendly platform. Booking appointments has never been easier.",
                image: "/testimonial2.jpg"
              },
              {
                name: "Emma Williams",
                role: "Patient",
                content: "I love having all my medical records in one secure place. Highly recommended!",
                image: "/testimonial3.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-xl 
                          border border-gray-100 p-8 rounded-2xl hover:border-blue-200/50
                          shadow-lg shadow-gray-200/50 hover:shadow-blue-200/10 transition-all"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-800" />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">&quot;{testimonial.content}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Fixed */}
      <section id="contact" className="py-20 relative bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">Get in Touch</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions? Our team is here to help you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 bg-gradient-to-br from-white/80 to-gray-50/80 
                          backdrop-blur-xl border border-gray-100 p-4 rounded-xl
                          hover:border-blue-200/50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiPhone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-600">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 bg-gradient-to-br from-white/80 to-gray-50/80 
                          backdrop-blur-xl border border-gray-100 p-4 rounded-xl
                          hover:border-blue-200/50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-600">Email</h3>
                  <p className="text-gray-600">support@hms.com</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 bg-gradient-to-br from-white/80 to-gray-50/80 
                          backdrop-blur-xl border border-gray-100 p-4 rounded-xl
                          hover:border-blue-200/50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-600">Address</h3>
                  <p className="text-gray-600">123 Healthcare Street, Medical City, MC 12345</p>
                </div>
              </motion.div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-white/80 to-gray-50/80 
                           backdrop-blur-xl border border-gray-100 p-8 rounded-2xl">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900
                          placeholder:text-gray-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900
                          placeholder:text-gray-400"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Your Message"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900
                          placeholder:text-gray-400"
              ></textarea>
              
              {status.error && (
                <div className="text-red-500 text-sm">{status.error}</div>
              )}
              
              {status.success && (
                <div className="text-green-500 text-sm">Message sent successfully!</div>
              )}

              <button 
                type="submit"
                disabled={status.loading}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white 
                         px-8 py-4 rounded-xl font-medium text-lg shadow-lg 
                         hover:shadow-blue-500/50 transition-all disabled:opacity-50"
              >
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;