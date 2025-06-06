// creating token and saving in cookies
const sendToken = (user, statusCode, res) => {
  if (!process.env.JWT_SECRET_KEY) {
    console.error("JWT_SECRET_KEY is not defined in environment variables");
    return res.status(500).json({
      success: false,
      message: "Server configuration error"
    });
  }

  try {
    const token = user.getJwtToken();
    
    // Options for cookie with cross-domain support
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Only secure in production
      domain: process.env.COOKIE_DOMAIN || undefined // Cross-domain cookie support
    };

    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Error in token generation:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating authentication token"
    });
  }
};

module.exports = sendToken;
