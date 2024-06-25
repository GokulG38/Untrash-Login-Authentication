
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Resource = require("../models/resource")
const validator = require("validator");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user, expiresIn = '1h') => {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn, algorithm: 'HS256' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
};

const authenticateToken = async(req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    const decoded = verifyToken(token);
    if (!decoded) return res.sendStatus(403);

    req.user = decoded;
    const userDecoded = await User.findById(req.user.id);
    const newToken = generateToken(userDecoded);
    res.cookie("token", newToken, { httpOnly: true, secure: true });

    next();
};

const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};


router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
  
    if (!name || !email || !password || name.trim() === "" || email.trim() === "" || password.trim() === "") {
        return res.status(400).json({ message: "Invalid inputs" });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "User added" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
  });
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password || email.trim() === "" || password.trim() === "") {
        return res.status(400).json({ message: "Invalid inputs" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = generateToken(user);
        res.cookie("token", token, { httpOnly: true, secure: true });
        res.status(200).json({ message: "Login successful" });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.json({ message: "You have access to profile details", user });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/verify-token", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Token is valid", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
});


router.get("/dashboard", authenticateToken, async (req, res) => {
    try {
        let resources;
        if (req.user.role === 'admin') {
            resources = await Resource.find({});
        } else {
            resources = await Resource.find({ visibility: 'public' });
        }
        res.json({ message: "This is your dashboard", resources });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/resource", authenticateToken, checkAdmin, async (req, res) => {
    const { name, description, visibility } = req.body;

    if (!name || !description || name.trim() === "" || description.trim() === "") {
        return res.status(400).json({ message: "Invalid inputs" });
    }

    try {
        const newResource = new Resource({ name, description, visibility });
        await newResource.save();
        res.status(201).json({ message: "Resource added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
});
module.exports = router;
