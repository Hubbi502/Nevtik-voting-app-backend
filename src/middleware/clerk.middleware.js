import { clerk } from '../config/clerk.config.js';

export const requireClerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.split(' ')[1];
    const clientToken = await clerk.verifyToken(token);

    if (!clientToken) {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }

    req.auth = clientToken;
    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    res.status(401).json({
      message: "Authentication failed",
      error: error.message
    });
  }
};