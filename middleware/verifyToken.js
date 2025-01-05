import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';
const secretKey = process.env.SECRET_KEY;
import LivreurM from "../models/livreur.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, async (err, payload) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Token" });
      }
      req.payload = payload;
      next();
    });
  } else {
    return res.status(401).json({ message: "You are not authenticated"});
  }
};

export const verifyAndAuth = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      const user = await UserModel.findById(req.payload._id);
      if (user) {
        
        next();
      } else {
        res.status(403).json({ message: "You can't access this" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const verifyAndAuthLivreur = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
       const user = await LivreurM.findById(req.payload._id);
      if (user) {
         next();
      } else {
        res.status(403).json({ message: "You can't access this" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyAdmin = async (req, res, next) => {

  try {
    await verifyAndAuth(req, res, () => {
      const userRole = req.payload.role; 

      if (userRole === 'ADMIN') {
          next();
      } else {
          res.status(403).json({ message: "You are not authorized to perform this action" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }


};
 
export const verifyUser = async (req, res, next) => {

  try {
    await verifyAndAuth(req, res, () => {
      const userRole = req.payload.role; 

      if (userRole === 'USER' || userRole === 'ADMIN') {
          next();
      } else {
          res.status(403).json({ message: "You are not authorized to perform this action" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }


};
 