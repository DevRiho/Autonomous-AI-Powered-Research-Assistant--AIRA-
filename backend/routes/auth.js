const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../services/database');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'aira_super_secret_key_123', {
        expiresIn: '36500d', // 100 years approx
    });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ error: 'Please add all fields' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            email,
            password: hashedPassword,
            verificationCode,
            isVerified: false
        });

        if (user) {
            console.log(`\n\n=========================================`);
            console.log(`📧 MOCK EMAIL SENT TO: ${user.email}`);
            console.log(`🔐 VERIFICATION CODE: ${verificationCode}`);
            console.log(`=========================================\n\n`);

            res.status(201).json({
                message: 'Registration successful. Please verify your email.',
                requiresVerification: true,
                email: user.email
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(403).json({ 
                    error: 'Please verify your email first.',
                    requiresVerification: true,
                    email: user.email
                });
            }

            res.json({
                _id: user.id,
                email: user.email,
                fullName: user.fullName,
                interests: user.interests,
                onboarded: user.onboarded,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route POST /api/auth/verify
router.post('/verify', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

        if (user.verificationCode === code) {
            user.isVerified = true;
            user.verificationCode = undefined;
            await user.save();

            res.json({
                _id: user.id,
                email: user.email,
                fullName: user.fullName,
                interests: user.interests,
                onboarded: user.onboarded,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ error: 'Invalid verification code' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.interests = req.body.interests || user.interests;
            user.onboarded = true;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser.id,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                interests: updatedUser.interests,
                onboarded: updatedUser.onboarded,
                token: generateToken(updatedUser._id) // keep rolling tokens if desired
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
