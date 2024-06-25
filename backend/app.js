
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("./models/user");
const Resource = require("./models/resource")
const api = require("./routes/api");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const app = express();  

mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, 
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api", api);

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling:true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    maxAge: 1000 * 60 * 60, 
    secure: false,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));



app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
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
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User added" });
} catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
}
});


app.post("/login", async (req, res) => {
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
    req.session.user = { id: user._id, role: user.role };
    res.status(200).json({ message: "Login successful", user: req.session.user, id: req.session.id });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/profile", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const sessionExpiry = req.session.cookie._expires;

    res.json({ message: "You have access to this profile", user, sessionExpiry });
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

app.get("/auth-check", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json({ message: "Authenticated" });
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.session.user.role === 'admin') {
      Resource.find({})
          .then(resources => {
              res.json({ message: "This is your dashboard", resources });
          })
          .catch(err => {
              console.error(err);
              res.status(500).json({ message: "Internal Server Error" });
          });
  } else {
      Resource.find({ visibility: 'public' })
          .then(resources => {
              res.json({ message: "This is your dashboard", resources });
          })
          .catch(err => {
              console.error(err);
              res.status(500).json({ message: "Internal Server Error" });
          });
  }
});


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
