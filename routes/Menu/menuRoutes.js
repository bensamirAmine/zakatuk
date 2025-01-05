import express from "express";
import RestaurantController from "../../controllers/Restaurant/RestaurantController.js"
import MenuController from "../../controllers/Menu/MenuContoller.js"

 import customMulter from '../../middleware/multer.js';
 import {verifyAdmin,verifyAndAuth,verifyUser} from "../../middleware/verifyToken.js"; 

const router = express.Router();

// ___________ Admin Space______________
router.post("/admin/addMenuToRestaurant", verifyAdmin,customMulter("menu"), MenuController.createMenuItemAndAssign);
router.put ("/admin/UpdateMenu",verifyAdmin,customMulter("menu"),MenuController.updateMenuItem);
router.put ("/admin/ChangeMenuItemStatus",verifyAdmin, MenuController.ChangeMenuItemStatus);

// ___________ User Space______________
router.post("/FetchMenuDetails", verifyUser,MenuController.MenuDetails);
router.post("/LikeMenu", verifyUser,MenuController.LikeMenu);
router.post("/DislikeMenu", verifyUser,MenuController.DislikeMenu);

router.post("/checkUserLike", verifyUser,MenuController.checkUserLike);

export default router;
