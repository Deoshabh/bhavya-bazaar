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
    
    // Options for cookie
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "lax",
    };

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
