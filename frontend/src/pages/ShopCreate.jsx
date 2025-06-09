import React, { useEffect } from 'react';
import ShopCreate from "../components/Shop/ShopCreate";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ShopCreatePage = () => {
    const navigate = useNavigate();
    const { isSeller, seller } = useSelector((state) => state.seller);
    
    // if seller is already logged in, redirect to shop dashboard
    useEffect(() => {
        if (isSeller === true && seller?._id) {
            navigate("/dashboard");
        }
    }, [isSeller, seller, navigate]);
    return (
        <div>
            <ShopCreate />
        </div>
    )
}

export default ShopCreatePage