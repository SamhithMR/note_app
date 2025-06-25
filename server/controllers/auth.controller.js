const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your access token';
const SALT_ROUNDS = 10;

exports.registerUser = async (req, res) => {
    const {
        fullName,
        email,
        password
    } = req.body;

    if (!fullName) {
        return res.status(400).json({
            error: true,
            message: "Full Name is Required"
        });
    }

    if (!email) {
        return res.status(400).json({
            error: true,
            message: "Email is Required"
        });
    }

    if (!password) {
        return res.status(400).json({
            error: true,
            message: "Password is Required"
        });
    }

    const isUser = await User.findOne({
        email: email
    });
    if (isUser) {
        return res.json({
            error: true,
            message: "Email already exists"
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await user.save();

        const accessToken = jwt.sign({
            user: {
                _id: user._id,
                email: user.email
            }
        }, JWT_SECRET, {
            expiresIn: "36000m",
        });

        return res.json({
            error: false,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email
            },
            accessToken,
            message: "User Created Successfully",
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error"
        });
    }
};

exports.loginUser = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    if (!password) {
        return res.status(400).json({
            message: "Password is required"
        });
    }

    try {
        const user = await User.findOne({
            email: email
        });

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            const accessToken = jwt.sign({
                user: {
                    _id: user._id,
                    email: user.email
                }
            }, JWT_SECRET, {
                expiresIn: "36000m",
            });

            return res.json({
                error: false,
                message: "Login Successful",
                email: user.email,
                accessToken,
            });
        } else {
            return res.status(400).json({
                error: true,
                message: "Invalid Credentials"
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error"
        });
    }
};

exports.getUserProfile = async (req, res) => {
    const {
        user
    } = req.user;
    const isUser = await User.findOne({
        _id: user._id
    });

    if (!isUser) {
        return res.status(401);
    }
    return res.json({
        user: {
            fullName: isUser.fullName,
            email: isUser.email,
            _id: isUser._id,
            createdOn: isUser.createdOn,
        },
        message: "User found",
    });
};