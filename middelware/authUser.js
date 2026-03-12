import JWT from 'jsonwebtoken';


const userAuth = (req, res, next) => {
    // Get token from cookies first, then from Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    console.log("Token:", token);

    if (!token) {
        return res.status(401).json({ error: 'Login First' });
    }

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);

        // console.log("Decoded Token:", decoded);
        
        if (decoded.role !== 'user') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.user = decoded;
        req.id = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export default userAuth;