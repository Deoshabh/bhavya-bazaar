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
                        src="/brand-logos/sony_  logo.svg"
                        alt="Sony"
                        style={{ width: "150px", objectFit: "contain" }}
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/dell_logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Dell"
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/lg-logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="LG"
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/apple-logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Apple"
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="/brand-logos/microsoft-logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Microsoft"
                    />
                </div>
            </div>
        </div>
    );
};

export default Sponsored;