import React, { useEffect, useState } from 'react';
import ShopCreate from "../components/Shop/ShopCreate";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ShopCreatePage = () => {
    const navigate = useNavigate();
    const { isSeller, seller, isLoading } = useSelector((state) => state.seller);
    const [redirectAttempted, setRedirectAttempted] = useState(false);
    
    // if seller is already logged in, redirect to shop dashboard
    useEffect(() => {
        if (isSeller === true && seller?._id && !redirectAttempted) {
            console.log('🔄 Seller already exists, redirecting to dashboard...');
            setRedirectAttempted(true);
            navigate("/dashboard");
        }
    }, [isSeller, seller, navigate, redirectAttempted]);
    
    // Add debug logging
    useEffect(() => {
        console.log('🏪 ShopCreatePage - isSeller:', isSeller, 'seller:', seller?.name, 'isLoading:', isLoading);
    }, [isSeller, seller, isLoading]);
    return (
        <div>
            <ShopCreate />
        </div>
    )
}

export default ShopCreatePage