import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, Linkedin } from 'lucide-react';
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const res = await fetch('http://localhost:5001/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const data = await res.json();

  if (data.success) {
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  } else {
    alert('Failed to send message.');
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return <section id="contact" className="relative py-24 bg-black">
      {/* Top curve */}
      <div className="absolute top-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-24 transform rotate-180">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-900"></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Get In </span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ready to revolutionize your trading? Contact our team to learn more about our 
            advanced backtesting platform and how it can enhance your trading performance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-6 bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-700/30 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Email Us</h3>
                  <p className="text-emerald-400">anujyadav@iitb.ac.in</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-700/30 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Phone className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Call Us</h3>
                  <p className="text-emerald-400">+918770678570</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-700/30 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Visit Us</h3>
                  <p className="text-emerald-400">FLAT.NO.204, KUBER HILL,B-WING, NR.JANAI SCHOOL,M TAL-KALYAN 421301</p>
                </div>
              </div>
            </Card>

            {/* Social Links - Only LinkedIn */}
           <div className="flex space-x-4">
  <a
    href="https://www.linkedin.com/company/quantedge2024/posts/?feedView=all"
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
  >
    <Linkedin className="text-white" size={20} />
  </a>
</div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" placeholder="Your full name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" placeholder="your.email@example.com" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <Input id="subject" name="subject" type="text" required value={formData.subject} onChange={handleChange} className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" placeholder="What's this about?" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <Textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleChange} className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" placeholder="Tell us more about your needs..." />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3">
                  Send Message
                  <Send className="ml-2" size={16} />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>;
};
export default ContactSection;