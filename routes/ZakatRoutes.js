// import express from "express";


// import ZakatController from "../controllers/ZakatController.js"; // Assuming .mjs extension for ESM

//   const router = express.Router();



// //------------------------------
// router.put('/individual/setTransaction', ZakatController.addTransaction);
// router.get('/individual/getHistorique', ZakatController.recalculateTotals);
// router.post('/delete_transaction', ZakatController.deleteTransaction);
// router.post('/updateTransaction', ZakatController.updateTransaction);

// export default router;


import express from "express";
import ZakatController from "../controllers/ZakatController.js";
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /zakat/individual/setTransaction:
 *   put:
 *     tags: [Zakat]
 *     summary: Add or update a zakat transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 */
router.put('/individual/setTransaction', ZakatController.addTransaction);

/**
 * @swagger
 * /zakat/individual/getHistorique:
 *   get:
 *     tags: [Zakat]
 *     summary: Get transaction history and recalculate totals
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 */
router.get('/individual/getHistorique', ZakatController.recalculateTotals);

/**
 * @swagger
 * /zakat/delete_transaction:
 *   post:
 *     tags: [Zakat]
 *     summary: Delete a transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 */
router.post('/delete_transaction', ZakatController.deleteTransaction);

/**
 * @swagger
 * /zakat/updateTransaction:
 *   post:
 *     tags: [Zakat]
 *     summary: Update an existing transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 */
router.post('/updateTransaction', ZakatController.updateTransaction);

export default router;