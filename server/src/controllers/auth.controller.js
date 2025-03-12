import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
//import cloudinary from "../lib/cloudinary";

//export แบบนี้ต้องไปเรียกใช้เป็น { signup }
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body; // fullName, email, password รับค่าจาก body
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  } // ถ้าไม่มีข้อมูลให้ return 400 และข้อความว่า All fields are required

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    } // ถ้ามี user อยู่แล้วให้ return 400 และข้อความว่า User already exists
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // เข้ารหัสทางเดียว hash password ด้วย bcrypt

    // สร้าง user ใหม่
    const newUser = await User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const token = await generateToken(newUser._id, res);
      console.log("TOKEN", token);

      await newUser.save(); // บันทึก user ใหม่
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      }); // ถ้าบันทึกสำเร็จให้ return 201(create สำเร็จ)
    } else {
      res.status(400).json({ message: "Invalid user data" });
    } // ถ้าไม่สามารถสร้าง user ใหม่ได้ให้ return 400 และข้อความว่า Invalid user data
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while registering a new user" });
  } // ถ้ามี error ให้ return 500 และข้อความว่า Internal server error
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email or Password is missing" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      res.status(401).send({
        message: "Invalid credentials!",
      });
      return;
    }

    //login success
    jwt.sign({ email: user.email, id: user._id }, secret, {}, (err, token) => {
      if (err)
        return res.status(500).send({
          message: "Internal server error: Authentication Failed!",
        });
      //token generated
      res.send({
        message: "User logged in successfully",
        id: user._id,
        email: user.email,
        accessToken: token,
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while logging in a user" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while logging out" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    // const userId = req.user._id;
    const { id: userId } = req.params;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    if (!uploadResponse) {
      res.status(500).json({ message: "Error while updating profile picture" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json({ updatedUser });
    } else {
      res.status(500).json({ message: "Error while updating profile picture" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error while updating" });
  }
};
