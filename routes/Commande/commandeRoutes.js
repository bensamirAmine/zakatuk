import express from "express";
 import CommandeController from "../../controllers/Commande/commandeController.js"

  import { verifyAndAuthLivreur,verifyUser} from "../../middleware/verifyToken.js"; 

const router = express.Router();

   
router.post("/SetCommande", verifyUser,CommandeController.SetCommande);
router.post("/getnearbyOrders",CommandeController.getnearbyOrders);
router.post("/OderDetails",verifyAndAuthLivreur,CommandeController.OderDetails);

export default router;
