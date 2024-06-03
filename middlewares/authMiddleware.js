const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

async function authenticate(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.userId = decoded.userId;

        next();

    } catch (err) {
        return res.redirect('/login');
    }
}

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

async function getHash(passwordString) {
    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS);
    const password_hash = await bcrypt.hash(passwordString, saltRounds);
    return password_hash;
}

async function comparePassword(passwordString, bdHash) {
    const compareHashes = await bcrypt.compare(passwordString, bdHash);
    return compareHashes;
}

module.exports = {
    authenticate,
    generateToken,
    getHash,
    comparePassword
};