// import express from "express";
// import UserController from "../controllers/UserController.js"; 
// import {verifyAdmin,verifyAndAuth,} from "../middleware/verifyToken.js"; 
// import customMulter from '../middleware/multer.js';
// const router = express.Router();

// router.put("/", verifyAndAuth, customMulter("users"), UserController.updateAccount);
// router.delete("/", verifyAndAuth, UserController.deleteAccount);
// router.get("/profile", verifyAndAuth, UserController.getUser);
// router.get("/", UserController.getAllUsers);
// router.get("/admins", UserController.getAllAdmins);
// router.put("/ban", UserController.banUser);
// router.put("/unBan", UserController.unBanUser);

// export default router;

import express from "express";
import UserController from "../controllers/UserController.js";
import { verifyAdmin, verifyAndAuth } from "../middleware/verifyToken.js";
import customMulter from '../middleware/multer.js';
const router = express.Router();

/**
 * @swagger
 * /user:
 *   put:
 *     tags: [Users]
 *     summary: Update user account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully
 */
router.put("/", verifyAndAuth, customMulter("users"), UserController.updateAccount);

/**
 * @swagger
 * /user:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete("/", verifyAndAuth, UserController.deleteAccount);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
router.get("/profile", verifyAndAuth, UserController.getUser);

/**
 * @swagger
 * /user:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/", UserController.getAllUsers);

/**
 * @swagger
 * /user/admins:
 *   get:
 *     tags: [Users]
 *     summary: Get all admin users
 *     responses:
 *       200:
 *         description: List of all admins
 */
router.get("/admins", UserController.getAllAdmins);

/**
 * @swagger
 * /user/ban:
 *   put:
 *     tags: [Users]
 *     summary: Ban a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 */
router.put("/ban", UserController.banUser);

/**
 * @swagger
 * /user/unBan:
 *   put:
 *     tags: [Users]
 *     summary: Unban a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 */
router.put("/unBan", UserController.unBanUser);

export default router;