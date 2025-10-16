import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User exists", status: false });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
      message: "User registered successfully",
      status: true,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
        message: "Login successful",
        status: true,
      });
    } else {
      res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};
