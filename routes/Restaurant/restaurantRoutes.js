import express from "express";
import RestaurantController from "../../controllers/Restaurant/RestaurantController.js"
import PanierController from "../../controllers/OrderController/PanierController.js"

import customMulter from '../../middleware/multer.js';
import {verifyAdmin,verifyAndAuth,verifyUser} from "../../middleware/verifyToken.js"; 
 
const router = express.Router();
router.post ("/admin/addRestaurant", verifyAdmin,customMulter("restaurants"), RestaurantController.createRestaurant);
router.get("/FetchRestaurant",verifyUser, RestaurantController.getAllRestaurants);
router.post ("/restaurantDetails",verifyUser, RestaurantController.getRestaurantById);
router.post ("/likeRestaurant" ,verifyUser,RestaurantController.LikeRestaurant);
router.post ("/DislikeRestaurant",verifyUser ,RestaurantController.DislikeRestaurant);
router.post("/getRestaurantRate", RestaurantController.calculateLikePercentage);
router.post("/checkUserLike", verifyUser,RestaurantController.checkUserLike);

//_________________________Panier Routes_______________________
router.post("/panier/addItemToPanier", verifyUser,PanierController.addItemToPanier);
router.get("/panier/getUserOrders", verifyUser,PanierController.getUserOrders);

router.post("/panier/getUserOrdersByRestaurant", verifyUser,PanierController.getUserOrdersByRestaurant);
router.post("/panier/TotalUserOrdersByRestaurant", verifyUser,PanierController.TotalUserOrdersByRestaurant);

router.delete("/panier/deleteItem", verifyUser,PanierController.deleteItem);

router.post("/panier/get_restID_by_panier_item", verifyUser,PanierController.getRestaurantIdbypanierItem);

router.put("/panier/updateItem", verifyUser,PanierController.updateItem);



//_______________________ Boisson Routes _______________________

router.post("/boisson/createSupplement",verifyUser, customMulter("supplements"),PanierController.createSupplement);
router.get("/boisson/getAllSupplement", verifyUser,PanierController.getAllSupplement);


export default router;



