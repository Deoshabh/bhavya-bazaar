import React from "react";
import ShopLogin from "../components/Shop/ShopLogin.jsx";
import styles from "../styles/styles";

const ShopLoginPage = () => {
  return (
    <div className={`${styles.section}`}>
      <ShopLogin />
    </div>
  );
};

export default ShopLoginPage;