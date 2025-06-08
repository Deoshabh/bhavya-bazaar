import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { server } from "../server";
import axios from 'axios';


const SellerActivationPage = () => {
    const { activation_token } = useParams();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (activation_token) {
            const activationEmail = async () => {
                try {
                    await axios
                        .post(`${server}/shop/activation`, {
                            activation_token
                        })
                    setSuccess(true);
                } catch (err) {
                    console.log(err.response.data.message);
                    setError(true);
                }
            }
            activationEmail();
        }
    }, [activation_token]);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
            {
                error ? (
                    <p className='text-red-800'>Your token has expired</p>
                ) : success ? (
                    <p className='text-green-800'>Your Account has been created successfully!</p>
                ) : (
                    <p className='text-blue-800'>Activating your account...</p>
                )
            }

        </div>
    )
}

export default SellerActivationPage




