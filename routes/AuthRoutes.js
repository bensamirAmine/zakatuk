import express from "express";
import ForgetPasswordController from "../controllers/ForgetPasswordController.js";
import authController from "../controllers/AuthController.js";
import ZakatController from "../controllers/ZakatController.js";
import { verifyAndAuth } from "../middleware/verifyToken.js";
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         username:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/Admin/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/Admin/signup", authController.signup_Amdin);

/**
 * @swagger
 * /auth/User/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/User/signup", authController.signup_User);

/**
 * @swagger
 * /auth/livreur/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new delivery person
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Delivery person registered successfully
 */
router.post("/livreur/signup", authController.signup_Livreur);

/**
 * @swagger
 * /auth/setCurrentLocationforDelivery:
 *   put:
 *     tags: [Delivery]
 *     summary: Update delivery person's current location
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 */
router.put(
  "/setCurrentLocationforDelivery",
  authController.setCurrentLocationforDelivery
);

/**
 * @swagger
 * /auth/Check_Google_Login:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify Google login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 */
router.post("/Check_Google_Login", authController.Check_Google_Login);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Admin login
 */
router.post("/admin/login", authController.loginAdmin);

/**
 * @swagger
 * /auth/livreur/Login:
 *   post:
 *     tags: [Authentication]
 *     summary: Delivery person login
 */
router.post("/livreur/Login", authController.livreurLogin);

/**
 * @swagger
 * /auth/forgetPwd:
 *   post:
 *     tags: [Password Recovery]
 *     summary: Initiate password recovery
 */
router.post("/forgetPwd", ForgetPasswordController.forgetPwd);

/**
 * @swagger
 * /auth/forgetPwdSms:
 *   post:
 *     tags: [Password Recovery]
 *     summary: Send password recovery SMS
 */
router.post("/forgetPwdSms", ForgetPasswordController.forgot_password_sms);

/**
 * @swagger
 * /auth/otp:
 *   post:
 *     tags: [Password Recovery]
 *     summary: Verify OTP code
 *     security:
 *       - bearerAuth: []
 */
router.post("/otp", verifyAndAuth, ForgetPasswordController.otp);

/**
 * @swagger
 * /auth/newPwd:
 *   post:
 *     tags: [Password Recovery]
 *     summary: Set new password
 *     security:
 *       - bearerAuth: []
 */
router.post("/newPwd", verifyAndAuth, ForgetPasswordController.newPwd);

export default router;
