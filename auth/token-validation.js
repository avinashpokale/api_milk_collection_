import jwt from 'jsonwebtoken';

export function checkToken(req,res,next){
    let token = req.get("authorization");
    if (token) {
        // Remove bearer from string;
        token = token.slice(7);
        try {
            const decoded = jwt.verify(token,process.env.JWT_KEY)
            req.decoded = decoded;
        next();
        } catch (error) {
            return res.status(400).json({
                success: 3,
                message:"Invalid Token......"
            })
        }
    } else {
        return res.status(400).json({
            success: 0,
            message:"Access Denied; Unauthorized User"
        })
    }
}

export function checkAdmin(req,res,next) {
  // req.user was set by your checkToken middleware
  if (req.decoded && req.decoded.role === 'Admin') {
    next(); // Access granted
  } else {
    res.status(403).json({ 
      success: 0, 
      message: "Forbidden: You do not have permission to access this resource." 
    });
  }
}

export function checkUser(req,res,next) {
  // req.user was set by your checkToken middleware
  if (req.decoded && req.decoded.role === 'User') {
    next(); // Access granted
  } else {
    res.status(403).json({ 
      success: 0, 
      message: "Forbidden: You do not have permission to access this resource." 
    });
  }
};