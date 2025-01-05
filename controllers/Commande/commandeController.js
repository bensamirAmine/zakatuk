import { verifyAndAuth,verifyAndAuthLivreur } from "../../middleware/verifyToken.js";
 import Commande from '../../models/commande.js';  
import LivreurM from "../../models/livreur.js";
import geolib from 'geolib';
import UserModel from "../../models/UserModel.js";



export const SetCommande = async (req, res) => {
  await verifyAndAuth(req, res, async () => {
    try {

      const userID = req.payload._id;
      const { 
        
        restaurantID, 
        panierItems, 
        latitude,  
        longitude,  
        deliveryAddress, 
        paymentMethod, 
        totalProductAmount,
        totalAmount, 
      } = req.body;
     
      console.log(req.body);
       if (!restaurantID || !panierItems || !deliveryAddress || !paymentMethod || !latitude || !longitude) {
        return res.status(400).json({ message: 'Tous les champs requis doivent être renseignés.' });
      }
       const newCommande = new Commande({
        user: userID,
        restaurant: restaurantID,
        panierItems: panierItems,
        deliveryLocation: {
          latitude: latitude,  
          longitude: longitude 
        },
        deliveryAddress: deliveryAddress,
        paymentMethod: paymentMethod,
        totalProductAmount:totalProductAmount,  
        
        totalAmount: totalAmount,  
        status: 'En attente' 
      });

     await newCommande.save();

       res.status(201).json({ 
        message: 'Commande créée avec succès', 
       });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur du serveur lors de la création de la commande.' });
    }
  });
};
const getnearbyOrders = async (req, res) => {
  await verifyAndAuthLivreur(req, res, async () => {
    try {
      const { radius } = req.body;
      const userID = req.payload._id;  
      const livreur = await LivreurM.findById(userID).select('deliveryLocation'); // Récupérer uniquement la localisation de livraison

      if (!livreur) {
        return res.status(404).json({ message: 'Livreur non trouvé' });
      }

      // Trouver toutes les commandes avec les restaurants et les éléments du panier.
      const orders = await Commande.find()
        .populate('restaurant', 'name')
        .populate({
          path: 'panierItems',
          populate: {
            path: 'menuItem',
            select: 'name'
          }
        });

       const nearbyOrders = await Promise.all(orders.map(async order => {
        const distance = geolib.getDistance(
          { latitude: livreur.deliveryLocation.latitude, longitude: livreur.deliveryLocation.longitude },
          { latitude: order.deliveryLocation.latitude, longitude: order.deliveryLocation.longitude }
        );

         const user = await UserModel.findById(order.user).select('name phoneNumber'); 
         return {
          ...order.toObject(), 
          distance,
  
           userPhone: user ? user.phoneNumber : 'N/A'  
        };
      }));

       const filteredOrders = nearbyOrders.filter(order => order.distance <= radius);

      res.status(200).json({ nearbyOrders: filteredOrders });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });
};

const OderDetails = async (req, res) => {
  try {
    const { orderID } = req.body;
    const order = await Commande.findById(orderID).populate('restaurant', 'name')
    .populate({
      path: 'panierItems',
      populate: {
        path: 'menuItem',
        select: 'name',
         
      }
    });
     
    if (!order) {
      return res.status(404).json({ message: 'Menu not found!' });
    }
   return res.status(200).json({order});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export default { SetCommande,getnearbyOrders ,OderDetails};
