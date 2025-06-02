import React from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Lottie from "lottie-react";
import animationData from "../Assests/animations/107043-success.json";

const OrderSuccessPage = () => {
    return (
        <div>
            <Header />
            <Success />
            <Footer />
        </div>
    );
};

const Success = () => {
    return (
        <div>
            <Lottie 
                animationData={animationData} 
                loop={false}
                autoplay={true}
                style={{ width: 300, height: 300 }}
            />
            <h5 className="text-center mb-14 text-[25px] text-[#000000a1]">
                Your order is successful 😍
            </h5>
            <br />
            <br />
        </div>
    );
};

export default OrderSuccessPage;