// creating token and saving in cookies
const sendShopToken = (seller, statusCode, res) => {
  if (!process.env.JWT_SECRET_KEY) {
    console.error("JWT_SECRET_KEY is not defined in environment variables");
    return res.status(500).json({
      success: false,
      message: "Server configuration error"
    });
  }

  try {
    const token = seller.getJwtToken();
    
    // Enhanced cookie options for production cross-domain setup
    const isProduction = process.env.NODE_ENV === "production";
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      // Set domain correctly for bhavyabazaar.com
      domain: isProduction ? ".bhavyabazaar.com" : undefined
    };

    // Debug cookie settings
    console.log('🍪 Setting seller token cookie with options:', {
      secure: options.secure,
      sameSite: options.sameSite,
      domain: options.domain,
      httpOnly: options.httpOnly,
      env: process.env.NODE_ENV,
      isProduction: isProduction
    });

    // Also log the request origin for debugging
    console.log('📍 Request origin:', res.req?.headers?.origin);
    console.log('🌐 Request host:', res.req?.headers?.host);

    res.status(statusCode).cookie("seller_token", token, options).json({
      success: true,
      seller,
      token,
    });
  } catch (error) {
    console.error("Error in seller token generation:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating seller authentication token"
    });
  }
};

module.exports = sendShopToken;
