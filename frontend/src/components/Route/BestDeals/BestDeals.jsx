import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";
import Button from "../../common/Button";
import Card from "../../common/Card";
import Loading from "../../common/Loading";
import { AiOutlineArrowRight, AiOutlineFire } from "react-icons/ai";

const BestDeals = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { allProducts } = useSelector((state) => state.products);

  useEffect(() => {
    setIsLoading(true);
    const allProductsData = allProducts ? [...allProducts] : [];
    const sortedData = allProductsData?.sort((a, b) => b.sold_out - a.sold_out);
    const firstFive = sortedData && sortedData.slice(0, 5);
    setData(firstFive);
    setIsLoading(false);
  }, [allProducts]);

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

  if (isLoading) {
    return (
      <div className="py-16">
        <div className={`${styles.section}`}>
          <Loading.ProductGrid count={5} />
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
      className="py-16 bg-gradient-to-br from-gray-50 to-white"
    >
      <div className={`${styles.section}`}>
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white mr-3 shadow-lg">
              <AiOutlineFire size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Best Deals
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Don't miss out on our most popular products with the best sales records
          </p>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
            <div className="h-1 w-4 bg-gray-300 rounded-full"></div>
            <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {data && data.length !== 0 ? (
          <motion.div 
            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-8 mb-12"
            variants={containerVariants}
          >
            {data.map((product, index) => (
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
                  <AiOutlineFire size={48} className="text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deals Available</h3>
                <p className="text-gray-600 mb-6">
                  We're working on bringing you the best deals. Check back soon!
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
        {data && data.length > 0 && (
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <Link to="/best-selling">
              <Button
                variant="gradient"
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center">
                  View All Best Deals
                  <AiOutlineArrowRight className="ml-2" size={20} />
                </span>
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BestDeals;
