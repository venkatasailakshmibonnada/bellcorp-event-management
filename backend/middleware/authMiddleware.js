const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token = req.headers.authorization;
  
  console.log("=== AUTH DEBUG ===");
  console.log("Authorization header:", token);
  
  if (token && token.startsWith("Bearer ")) {
    try {
      token = token.split(" ")[1];
      console.log("Extracted token:", token);
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
      
      // Decode without verification to see what's inside
      const decoded_unverified = jwt.decode(token);
      console.log("Token payload (unverified):", decoded_unverified);
      
      // Now verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified successfully!");
      console.log("User ID:", decoded.id);
      console.log("==================");
      
      req.user = decoded.id;
      next();
    } catch (error) {
      console.log("❌ JWT Verify Error:", error.message);
      console.log("Error name:", error.name);
      console.log("==================");
      res.status(401).json({ message: "Not authorized", error: error.message });
    }
  } else {
    console.log("Token validation failed - No Bearer token");
    console.log("==================");
    res.status(401).json({ message: "No token" });
  }
};

module.exports = protect;