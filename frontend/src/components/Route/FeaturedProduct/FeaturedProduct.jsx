import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";
import Button from "../../common/Button";
import Card from "../../common/Card";
import Loading from "../../common/Loading";
import { AiOutlineArrowRight, AiOutlineStar, AiOutlineTrophy } from "react-icons/ai";

const FeaturedProduct = () => {
  const { allProducts, isLoading } = useSelector((state) => state.products);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Get featured products (you can modify this logic based on your criteria)
  const featuredProducts = allProducts ? allProducts.slice(0, 10) : [];

  if (isLoading) {
    return (
      <div className="py-16">
        <div className={`${styles.section}`}>
          <Loading.ProductGrid count={10} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-16 bg-white"
    >
      <div className={`${styles.section}`}>
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white mr-3 shadow-lg">
              <AiOutlineTrophy size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Products
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our handpicked selection of premium products that our customers love most
          </p>
          
          {/* Stats Section */}
          <div className="flex items-center justify-center mt-8 space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{allProducts?.length || 0}+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <AiOutlineStar className="text-yellow-500 mr-1" size={20} />
                <span className="text-2xl font-bold text-purple-600">4.8</span>
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">50K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"></div>
            <div className="h-1 w-4 bg-gray-300 rounded-full"></div>
            <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"></div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {allProducts && allProducts.length !== 0 ? (
          <motion.div 
            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-8 mb-12"
            variants={containerVariants}
          >
            {featuredProducts.map((product, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard data={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <Card className="max-w-md mx-auto p-8 bg-gradient-to-br from-gray-50 to-white">
              <Card.Body className="text-center">
                <div className="mb-4">
                  <AiOutlineTrophy size={48} className="text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Featured Products</h3>
                <p className="text-gray-600 mb-6">
                  We're curating amazing products for you. Check back soon!
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        )}

        {/* View All Button */}
        {allProducts && allProducts.length > 10 && (
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <Link to="/products">
              <Button
                variant="gradient"
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center">
                  Explore All Products
                  <AiOutlineArrowRight className="ml-2" size={20} />
                </span>
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Newsletter Signup Section */}
        <motion.div 
          className="mt-20 pt-16 border-t border-gray-200"
          variants={itemVariants}
        >
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <Card.Body className="text-center py-12 px-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Stay Updated with New Products
              </h3>
              <p className="text-purple-100 mb-8 max-w-md mx-auto">
                Be the first to know about our latest featured products and exclusive deals
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Button
                  variant="outline"
                  className="bg-white text-purple-600 hover:bg-gray-100 border-white px-6"
                >
                  Subscribe
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FeaturedProduct;
