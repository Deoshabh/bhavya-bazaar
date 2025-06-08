import React from 'react'
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { brandingData, categoriesData } from "../../../static/data";
import styles from '../../../styles/styles'
import { CategoryImage } from "../../common/EnhancedImage";
import Card from "../../common/Card";
import Button from "../../common/Button";
import { AiOutlineArrowRight } from "react-icons/ai";

const Categories = () => {
    const navigate = useNavigate();
    
    const brandingVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const brandingItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const categoryVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.05
            }
        }
    };

    const categoryItemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.3 }
        }
    };

    return (
        <>
            {/* Branding Section */}
            <motion.div 
                className={`${styles.section} hidden sm:block`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={brandingVariants}
            >
                <Card className="my-12 p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {brandingData &&
                            brandingData.map((item, index) => (
                                <motion.div 
                                    className='flex items-center space-x-4 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105' 
                                    key={index}
                                    variants={brandingItemVariants}
                                    whileHover={{ y: -2 }}
                                >
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white shadow-lg">
                                        {item.icon}
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='font-bold text-gray-900 text-sm md:text-base mb-1'>{item.title}</h3>
                                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{item.Description}</p>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </Card>
            </motion.div>

            {/* Categories Section */}
            <motion.div
                className={`${styles.section} mb-16`}
                id="categories"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={categoryVariants}
            >
                <div className="text-center mb-12">
                    <motion.h2 
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Shop by Category
                    </motion.h2>
                    <motion.p 
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Discover our wide range of products across different categories
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {categoriesData &&
                        categoriesData.map((category, index) => {
                            const handleSubmit = (category) => {
                                navigate(`/products?category=${category.title}`);
                            }
                            return (
                                <motion.div
                                    key={category.id}
                                    variants={categoryItemVariants}
                                    whileHover={{ 
                                        y: -8, 
                                        transition: { duration: 0.2 } 
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group cursor-pointer"
                                    onClick={() => handleSubmit(category)}
                                >
                                    <Card className="h-full bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-xl overflow-hidden">
                                        <Card.Body className="p-0">
                                            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-32 flex items-center justify-center">
                                                <CategoryImage
                                                    category={category}
                                                    className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110"
                                                    alt={`${category.title} category`}
                                                />
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            <div className="p-4 text-center">
                                                <h5 className="font-semibold text-gray-900 text-sm md:text-base mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                                    {category.title}
                                                </h5>
                                                <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700 p-0"
                                                    >
                                                        <span className="flex items-center text-xs">
                                                            Browse
                                                            <AiOutlineArrowRight className="ml-1" size={12} />
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            )
                        })
                    }
                </div>

                {/* View All Categories Button */}
                <motion.div 
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/products')}
                        className="px-8 py-3 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    >
                        <span className="flex items-center">
                            View All Products
                            <AiOutlineArrowRight className="ml-2" size={18} />
                        </span>
                    </Button>
                </motion.div>
            </motion.div>
        </>
    )
}

export default Categories