import React, { useState } from "react";
import {
    AiFillFacebook,
    AiFillInstagram,
    AiFillYoutube,
    AiOutlineTwitter,
    AiOutlineMail,
    AiOutlinePhone,
    AiOutlineEnvironment,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import SafeImage from "../common/SafeImage";
import { motion } from "framer-motion";
import Button from "../common/Button";
import Input from "../common/Input";
import {
    footercompanyLinks,
    footerProductLinks,
    footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { icon: AiFillFacebook, href: "#", color: "hover:text-blue-500" },
    { icon: AiOutlineTwitter, href: "#", color: "hover:text-blue-400" },
    { icon: AiFillInstagram, href: "#", color: "hover:text-pink-500" },
    { icon: AiFillYoutube, href: "#", color: "hover:text-red-500" },
  ];

  return (
    <footer className="bg-gray-900 text-white md:pb-0 pb-16">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-3/5">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl lg:text-4xl font-bold leading-tight mb-4 md:mb-0"
              >
                <span className="text-green-400">Subscribe</span> to get the latest{" "}
                <br className="hidden md:block" />
                news, events and offers
              </motion.h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:w-2/5"
            >
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/70 focus:border-white/40"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="bg-green-500 hover:bg-green-600 text-white border-0 px-8 whitespace-nowrap"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? "✓ Subscribed!" : "Subscribe"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="mb-6">
              <Link to="/" className="flex items-center mb-4">
                <SafeImage
                  src="/main.png"
                  alt="Bhavya Vyapar"
                  className="h-12 w-auto"
                  fallbackType="general"
                />
                <span className="ml-2 text-xl font-bold">Bhavya Vyapar</span>
              </Link>
              <p className="text-gray-400 leading-relaxed mb-6">
                Your trusted marketplace for quality products. We bring you the best deals and authentic products from verified sellers.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-400">
                <AiOutlineEnvironment className="mr-3 text-blue-400" size={18} />
                <span className="text-sm">New Delhi, India</span>
              </div>
              <div className="flex items-center text-gray-400">
                <AiOutlinePhone className="mr-3 text-green-400" size={18} />
                <span className="text-sm">+91 9999-XXX-XXX</span>
              </div>
              <div className="flex items-center text-gray-400">
                <AiOutlineMail className="mr-3 text-purple-400" size={18} />
                <span className="text-sm">hello@bhavyavyapar.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 bg-gray-800 rounded-full transition-colors duration-300 ${social.color}`}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {footerProductLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.link}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-white">Shop</h3>
            <ul className="space-y-3">
              {footercompanyLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.link}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              {footerSupportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.link}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2025 DevSum IT Solutions. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex space-x-6">
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </div>
              
              <div className="flex items-center">
                <SafeImage
                  src="/payment-methods.png"
                  alt="Payment methods"
                  className="h-6 opacity-70"
                  fallbackType="general"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;