import React from "react";
import styles from "../../../styles/styles";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div
      className={`relative min-h-[70vh] 800px:min-h-[80vh] w-full bg-no-repeat ${styles.normalFlex}`}
      style={{
        backgroundImage:
          "url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className={`${styles.section} w-full 800px:w-[60%]`}>
        <h1
          className={`text-[35px] leading-[1.2] 800px:text-[60px] text-[#3d3a3a] font-[600] capitalize`}
        >
          Best Collection for <br /> home Decoration
        </h1>
        <p className="pt-5 text-[16px] font-[Poppins] font-[400] text-[#000000ba]">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae,
          assumenda? Quisquam itaque <br /> exercitationem labore vel, dolore
          quidem asperiores, laudantium temporibus soluta optio consequatur{" "}
          <br /> aliquam deserunt officia. Dolorum saepe nulla provident.
        </p>
        <Link to="/products" className="inline-block">
            <div className={`${styles.button} mt-5`}>
                 <span className="text-[#fff] font-[Poppins] text-[18px]">
                    Shop Now
                 </span>
            </div>
        </Link>
      </div>
      <div className="categories-container p-5 bg-white rounded-lg absolute right-12 top-12 hidden 800px:block">
        <h2 className="font-semibold text-lg mb-4">Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="category-item">
            <Link to="/products?category=Computers">
              <img 
                src="/laptop-placeholder.svg" 
                alt="Computers and Laptops" 
                className="w-36 h-24 object-cover rounded"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18px' fill='%23333333'%3EComputers%3C/text%3E%3C/svg%3E";
                }}
              />
              <h3 className="text-sm mt-2">Computers & Laptops</h3>
            </Link>
          </div>
          <div className="category-item">
            <Link to="/products?category=Cosmetics">
              <img 
                src="/cosmetics-placeholder.svg"
                alt="Cosmetics" 
                className="w-36 h-24 object-cover rounded"
                onError={(e) => { 
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18px' fill='%23333333'%3ECosmetics%3C/text%3E%3C/svg%3E";
                }}
              />
              <h3 className="text-sm mt-2">Cosmetics</h3>
            </Link>
          </div>
          <div className="category-item">
            <Link to="/products?category=Shoes">
              <img 
                src="/shoes-placeholder.svg"
                alt="Shoes" 
                className="w-36 h-24 object-cover rounded"
                onError={(e) => { 
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18px' fill='%23333333'%3EShoes%3C/text%3E%3C/svg%3E";
                }}
              />
              <h3 className="text-sm mt-2">Shoes</h3>
            </Link>
          </div>
          <div className="category-item">
            <Link to="/products?category=Gifts">
              <img 
                src="/gifts-placeholder.svg"
                alt="Gifts" 
                className="w-36 h-24 object-cover rounded"
                onError={(e) => { 
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18px' fill='%23333333'%3EGifts%3C/text%3E%3C/svg%3E";
                }}
              />
              <h3 className="text-sm mt-2">Gifts</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;