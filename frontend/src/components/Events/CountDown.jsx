import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { server } from "../../server";
import Card from "../common/Card";
import { AiOutlineClockCircle } from "react-icons/ai";

const CountDown = ({ data }) => {
  const calculateTimeLeft = React.useCallback(() => {
    const difference = +new Date(data.Finish_Date) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [data.Finish_Date]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    if (
      typeof timeLeft.days === "undefined" &&
      typeof timeLeft.hours === "undefined" &&
      typeof timeLeft.minutes === "undefined" &&
      typeof timeLeft.seconds === "undefined"
    ) {
      axios.delete(`${server}/event/delete-shop-event/${data._id}`);
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, data._id, calculateTimeLeft]);

  const timeUnits = [
    { key: 'days', label: 'Days', value: timeLeft.days },
    { key: 'hours', label: 'Hours', value: timeLeft.hours },
    { key: 'minutes', label: 'Minutes', value: timeLeft.minutes },
    { key: 'seconds', label: 'Seconds', value: timeLeft.seconds }
  ];

  const hasTimeLeft = Object.keys(timeLeft).length > 0;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {hasTimeLeft ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {timeUnits.map(({ key, label, value }) => {
              if (value === undefined || value === null) return null;
              
              return (
                <motion.div
                  key={key}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white border-0 shadow-lg">
                    <Card.Body className="text-center py-3 px-2">
                      <motion.div
                        key={value}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl lg:text-3xl font-bold mb-1"
                      >
                        {String(value).padStart(2, '0')}
                      </motion.div>
                      <div className="text-xs lg:text-sm font-medium uppercase tracking-wide opacity-90">
                        {label}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-lg">
              <Card.Body className="py-6 px-4">
                <div className="flex items-center justify-center mb-3">
                  <AiOutlineClockCircle size={32} className="text-white/80" />
                </div>
                <div className="text-xl lg:text-2xl font-bold mb-2">
                  Event Ended
                </div>
                <div className="text-sm text-white/80">
                  This special offer has expired
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountDown;
