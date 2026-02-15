const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  console.log("=== TOKEN GENERATION ===");
  console.log("User ID to encode:", id);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
  
  const token = jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: "30d" }
  );
  
  console.log("Generated token:", token);
  console.log("Token parts count:", token.split('.').length);
  console.log("Token length:", token.length);
  
  // Decode to check expiry
  const decoded = jwt.decode(token);
  console.log("Token payload:", decoded);
  console.log("Token expiry (exp):", decoded.exp);
  console.log("Token expiry date:", new Date(decoded.exp * 1000));
  console.log("Current date:", new Date());
  console.log("Is token expired?", decoded.exp < Date.now() / 1000);
  console.log("==================");
  
  return token;
};

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};