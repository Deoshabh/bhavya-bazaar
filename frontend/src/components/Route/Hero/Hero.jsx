import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../common/Button";
import Card from "../../common/Card";
import Badge from "../../common/Badge";
import { AiOutlineArrowRight, AiOutlineStar } from "react-icons/ai";

const Hero = () => {
  const categories = [
    {
      name: "Computers & Laptops",
      image: "/laptop-placeholder.svg",
      link: "/products?category=Computers",
      count: "150+ items",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Cosmetics",
      image: "/cosmetics-placeholder.svg", 
      link: "/products?category=Cosmetics",
      count: "200+ items",
      color: "from-pink-500 to-pink-600"
    },
    {
      name: "Shoes",
      image: "/shoes-placeholder.svg",
      link: "/products?category=Shoes", 
      count: "120+ items",
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Gifts",
      image: "/gifts-placeholder.svg",
      link: "/products?category=Gifts",
      count: "80+ items", 
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-pink-500 rounded-full"></div>
        <div className="absolute bottom-40 right-40 w-8 h-8 bg-green-500 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="primary" className="inline-flex items-center space-x-2 px-4 py-2">
                <AiOutlineStar className="text-yellow-400" />
                <span>Trusted by 10,000+ customers</span>
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                Best Collection for{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Home Decoration
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 leading-relaxed max-w-2xl"
              >
                Discover premium quality products with unbeatable prices. Transform your space with our curated collection of home essentials and lifestyle products.
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/products">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center">
                    Shop Now
                    <AiOutlineArrowRight className="ml-2" size={20} />
                  </span>
                </Button>
              </Link>
              
              <Link to="/categories">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  Browse Categories
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Featured Categories */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-2xl">
              <Card.Header>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Popular Categories
                </h2>
                <p className="text-gray-600">
                  Explore our most loved product categories
                </p>
              </Card.Header>
              
              <Card.Body className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Link to={category.link}>
                        <div className={`relative p-4 rounded-xl bg-gradient-to-r ${category.color} hover:shadow-lg transition-all duration-300`}>
                          <div className="absolute inset-0 bg-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-16 object-cover rounded-lg mb-3 bg-white/20"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='80' viewBox='0 0 100 80'%3E%3Crect width='100' height='80' fill='%23ffffff20'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12px' fill='%23ffffff'%3E${category.name.split(' ')[0]}%3C/text%3E%3C/svg%3E`;
                              }}
                            />
                            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                              {category.name}
                            </h3>
                            <p className="text-white/80 text-xs">
                              {category.count}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </Card.Body>
              
              <Card.Footer className="mt-6 pt-6 border-t border-gray-200">
                <Link to="/categories">
                  <Button
                    variant="ghost"
                    className="w-full justify-center hover:bg-gray-100"
                  >
                    <span className="flex items-center">
                      View All Categories
                      <AiOutlineArrowRight className="ml-2" size={16} />
                    </span>
                  </Button>
                </Link>
              </Card.Footer>
            </Card>
          </motion.div>
        </div>

        {/* Mobile Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:hidden mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link to={category.link}>
                  <Card className="p-4 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-20 object-cover rounded-lg mb-3 bg-gray-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='80' viewBox='0 0 100 80'%3E%3Crect width='100' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12px' fill='%23374151'%3E${category.name.split(' ')[0]}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-xs">
                        {category.count}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;