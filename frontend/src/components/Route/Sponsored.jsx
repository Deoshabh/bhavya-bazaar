import React from "react";
import styles from "../../styles/styles";

const Sponsored = () => {
    return (
        <div
            className={`${styles.section} hidden sm:block bg-white py-10 px-5 mb-12 cursor-pointer rounded-xl`}
        >
            <div className="flex justify-between w-full">
                <div className="flex items-start">
                    <img
                        src="/brand-logos/sony-logo.png"
                        alt="Sony"
                        style={{ width: "150px", objectFit: "contain" }}
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/dell-logo.png"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Dell"
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/lg-logo.png"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="LG"
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/apple-logo.png"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Apple"
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/microsoft-logo.png"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Microsoft"
                    />
                </div>
            </div>
        </div>
    );
};

export default Sponsored;