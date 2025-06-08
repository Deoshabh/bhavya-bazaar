import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import EventCard from "./EventCard";
import Button from "../common/Button";
import Card from "../common/Card";
import Loading from "../common/Loading";
import { AiOutlineCalendar, AiOutlineArrowRight, AiOutlineTags } from "react-icons/ai";

const Events = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events || {});
  
  // Error fallback for missing data
  if (!allEvents && !isLoading) {
    return (
      <div className="bg-gradient-to-r from-orange-400 to-red-500 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Events</h2>
          <p>No events available at the moment. Check back soon!</p>
        </div>
      </div>
    );
  }

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
          <Loading.Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Loading.Skeleton className="h-64 w-full rounded-xl" />
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
      className="py-16 bg-gradient-to-br from-orange-50 to-red-50"
    >
      <div className={`${styles.section}`}>
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white mr-3 shadow-lg">
              <AiOutlineCalendar size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Popular Events
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Don't miss out on our limited-time events with exclusive offers and amazing discounts
          </p>
          
          {/* Event Stats */}
          <div className="flex items-center justify-center mt-8 space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{allEvents?.length || 0}</div>
              <div className="text-sm text-gray-600">Active Events</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <AiOutlineTags className="text-red-500 mr-1" size={20} />
                <span className="text-2xl font-bold text-orange-600">70%</span>
              </div>
              <div className="text-sm text-gray-600">Max Discount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">24H</div>
              <div className="text-sm text-gray-600">Limited Time</div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <div className="h-1 w-4 bg-gray-300 rounded-full"></div>
            <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Events Content */}
        {allEvents && allEvents.length !== 0 ? (
          <motion.div variants={itemVariants}>
            {/* Featured Event */}
            <div className="mb-8">
              <EventCard data={allEvents[0]} />
            </div>
            
            {/* Additional Events Grid */}
            {allEvents.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {allEvents.slice(1, 4).map((event, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EventCard data={event} active={true} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <Card className="max-w-md mx-auto p-8 bg-white shadow-lg">
              <Card.Body className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AiOutlineCalendar size={32} className="text-orange-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Available</h3>
                <p className="text-gray-600 mb-6">
                  We're planning exciting events for you. Stay tuned for amazing deals and offers!
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Refresh
                  </Button>
                  <Link to="/products">
                    <Button
                      variant="primary"
                      className="w-full"
                    >
                      Browse Products Instead
                    </Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        )}

        {/* View All Events Button */}
        {allEvents && allEvents.length > 1 && (
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <Link to="/events">
              <Button
                variant="gradient"
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center">
                  View All Events
                  <AiOutlineArrowRight className="ml-2" size={20} />
                </span>
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Newsletter for Events */}
        <motion.div 
          className="mt-20 pt-16 border-t border-gray-200"
          variants={itemVariants}
        >
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Card.Body className="text-center py-12 px-8">
              <AiOutlineCalendar size={48} className="mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Never Miss an Event
              </h3>
              <p className="text-orange-100 mb-8 max-w-md mx-auto">
                Get notified about upcoming events, flash sales, and exclusive limited-time offers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Button
                  variant="outline"
                  className="bg-white text-orange-600 hover:bg-gray-100 border-white px-6"
                >
                  Notify Me
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Events;
