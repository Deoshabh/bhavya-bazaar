import React from 'react'
import Header from "../components/Layout/Header";
import Hero from '../components/Route/Hero/Hero';
import Categories from "../components/Route/Categories/Categories";
import BestDeals from "../components/Route/BestDeals/BestDeals";
import Events from "../components/Events/Events";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Sponsored from "../components/Route/Sponsored";
import Footer from "../components/Layout/Footer";

// Safe component wrapper
const SafeComponent = ({ children, fallback = null }) => {
  try {
    return children;
  } catch (error) {
    console.error('Component render error:', error);
    return fallback;
  }
};

const HomePage = () => {
    return (
        <div>
            <Header activeHeading={1} />
            <Hero />
            <Categories />
            <SafeComponent fallback={<div className="py-8 text-center">Best Deals temporarily unavailable</div>}>
                <BestDeals />
            </SafeComponent>
            <SafeComponent fallback={<div className="py-8 text-center">Events temporarily unavailable</div>}>
                <Events />
            </SafeComponent>
            <SafeComponent fallback={<div className="py-8 text-center">Featured Products temporarily unavailable</div>}>
                <FeaturedProduct />
            </SafeComponent>
            <Sponsored />
            <Footer />
        </div>
    )
}

export default HomePage