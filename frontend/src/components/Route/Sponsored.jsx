import React from "react";
import styles from "../../styles/styles";
import SafeImage from "../common/SafeImage";

const Sponsored = () => {
    return (
        <div
            className={`${styles.section} hidden sm:block bg-white py-10 px-5 mb-12 cursor-pointer rounded-xl`}
        >
            <div className="flex justify-between w-full">
                <div className="flex items-start">
                    <SafeImage
                        src="/brand-logos/sony_  logo.svg"
                        alt="Sony"
                        style={{ width: "150px", objectFit: "contain" }}
                        fallbackType="brand"
                    />
                </div>
                <div className="flex items-start">
                    <SafeImage
                        src="/brand-logos/dell_logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Dell"
                        fallbackType="brand"
                    />
                </div>
                <div className="flex items-start">
                    <SafeImage
                        src="/brand-logos/lg-logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="LG"
                        fallbackType="brand"
                    />
                </div>
                <div className="flex items-start">
                    <SafeImage
                        src="/brand-logos/apple-logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Apple"
                        fallbackType="brand"
                    />
                </div>
                <div className="flex items-start">
                    <SafeImage
                        src="/brand-logos/microsoft-logo.svg"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt="Microsoft"
                        fallbackType="brand"
                    />
                </div>
            </div>
        </div>
    );
};

export default Sponsored;