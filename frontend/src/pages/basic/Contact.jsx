import React, { useRef, useState } from 'react';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Contact = () => {
  const { theme, classes, isDark, getClass } = useThemeAwareStyle();
  const { user } = useAuth();
  const form = useRef();
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(form.current);
      const data = {
        name: formData.get('user_name'),
        email: formData.get('user_email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      const response = await api.post('/proxy/send-email', data);
      
      if (response.data.success) {
        setStatus('success');
        form.current.reset();
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
      // Clear status message after 5 seconds
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className={`min-h-screen ${getClass('bgPrimary')}`}>
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-20`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-8">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent ${isDark ? 'from-yellow-100 to-yellow-300' : ''}`}>
            Get In Touch
          </h1>
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95`}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className={`text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6`}>
                Let's Start a Conversation
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mb-8`}>
                Whether you're planning a special event, have questions about our services, or need assistance with booking, our team is here to help make your culinary dreams come true.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              {/* Updated Card 1 with theme support */}
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border`}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Email Us</h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>For general inquiries and support</p>
                    <a href="mailto:hello@cooks.com" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200">
                      hello@cooks.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Updated Card 2 with theme support */}
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border`}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Call Us</h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Available 24/7 for urgent inquiries</p>
                    <a href="tel:+1234567890" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
              </div>

              {/* Updated Card 3 with theme support */}
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border`}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Visit Us</h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Our main office location</p>
                    <p className="text-orange-600 font-semibold">
                      123 Culinary Street<br />
                      Food District, FD 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time - already has gradient bg so no change needed */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Quick Response Promise</h3>
              <p className="opacity-95">We typically respond to all inquiries within 2-4 hours during business hours, and within 24 hours on weekends.</p>
            </div>
          </div>

          {/* Contact Form - Updated with theme support */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-3xl p-8 shadow-lg border`}>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Send us a Message
              </h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Fill out the form below and we'll get back to you soon</p>
            </div>

            <form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label htmlFor="user_name" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    required
                    className={`w-full p-4 pl-12 border ${isDark ? 'border-gray-600 text-gray-100 bg-gray-700' : 'border-gray-300 text-gray-900 bg-gray-50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200`}
                    placeholder="Enter your full name"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>

              <div>
                <label htmlFor="user_email" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="user_email"
                    name="user_email"
                    required
                    defaultValue={user?.email || ''}
                    className={`w-full p-4 pl-12 border ${isDark ? 'border-gray-600 text-gray-100 bg-gray-700' : 'border-gray-300 text-gray-900 bg-gray-50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200`}
                    placeholder="you@example.com"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className={`w-full p-4 border ${isDark ? 'border-gray-600 text-gray-100 bg-gray-700' : 'border-gray-300 text-gray-900 bg-gray-50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200`}
                >
                  <option value="">Select a topic</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="chef">Become a Chef</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  className={`w-full p-4 border ${isDark ? 'border-gray-600 text-gray-100 bg-gray-700' : 'border-gray-300 text-gray-900 bg-gray-50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none`}
                  placeholder="Tell us how we can help you..."
                />
              </div>

              {/* Status Messages - no changes needed */}

              {/* Updated button with orange/amber theme */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
