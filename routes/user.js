import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import user from "../models/user.js";
import User from "../models/user.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // check if confirm password is same as password
  if (confirmPassword !== password)
    res.status(400).json({
      status: false,
      data: { message: "Password doesn't match. Please try again." },
    });

  try {
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // store to mongodb
    const newUser = new user({
      name,
      email,
      password: hashedPassword,
      salt,
    });
    let createdUser = await newUser.save();

    // generate jwt
    const token = jwt.sign(
      {
        _id: createdUser._id.toString(),
        email: createdUser.email,
        name: createdUser.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1hr",
      }
    );

    // send response with token
    res.status(201).json({ data: { token }, status: true });
  } catch (error) {
    console.log("error in signup", error);
    res.status(400).json({ data: { message: error.message }, status: false });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // fetch user from mongodb using email
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: false,
        data: { message: "User Not Found. Please Signup First." },
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (matchPassword) {
      const token = jwt.sign(
        { _id: user._id.toString(), email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "1hr" }
      );
      res.status(200).json({ status: true, data: { token } });
    } else {
      res.status(400).json({
        status: false,
        data: { message: "Invalid Password. Please try again." },
      });
    }
  } catch (error) {
    console.log("error in signup", error);
    res.status(400).json({ status: false, data: { message: error.message } });
  }
});

router.get("/notes", auth, async (req, res) => {
  if (req.userDetails) {
    res
      .status(200)
      .json({ status: true, data: { userDetails: req.userDetails } });
  }
});

export default router;
