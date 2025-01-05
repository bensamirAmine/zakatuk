import PanierItem from '../../models/panier.js';
import MenuItem from '../../models/menuItem.js';
import {verifyAdmin,verifyAndAuth} from "../../middleware/verifyToken.js"; 
import Restaurant from '../../models/restaurant.js';
import Supplement from '../../models/Boisson.js';
export const addItemToPanier = async (req, res) => {
  await verifyAndAuth(req, res, async () => {
    try {
      const userID = req.payload._id;
      const { menuItemID, restaurantId, quantity, supplements } = req.body;

      // Validate request body
      if (!menuItemID || !quantity || !restaurantId) {
        return res.status(400).json({ message: 'Menu item, restaurant, and quantity are required' });
      }

      // Fetch restaurant and menuItem in parallel to save time
      const [menuItem, restaurant] = await Promise.all([
        MenuItem.findById(menuItemID).select('price'), // Only select price field
        Restaurant.findById(restaurantId).select('_id') // Only select _id
      ]);

      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      const calculatedQuantity = quantity || 1;
      let subtotal = menuItem.price * calculatedQuantity;

      // Validate supplements in one query
      let validBoissons = [];
      if (supplements && supplements.length > 0) {
        const boissons = await Supplement.find({ _id: { $in: supplements } }).select('price');

        if (boissons.length !== supplements.length) {
          return res.status(404).json({ message: 'One or more supplements not found' });
        }

         validBoissons = boissons.map(boisson => {
          subtotal += boisson.price;
          return boisson._id;
        });
      }

      // Create the PanierItem
      const panierItem = new PanierItem({
        user: userID,
        restaurant: restaurantId,
        menuItem: menuItemID,
        quantity: calculatedQuantity,
        subtotal: subtotal,
        supplement: validBoissons
      });

       await panierItem.save();

       return res.status(201).json({
        message: 'Item added to panier successfully'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

export const getUserOrdersByRestaurant = async (req, res) => {
  await verifyAndAuth(req, res, async () => {
    try {
      const userID = req.payload._id;  
      const restaurantID = req.body.restaurantID;  

      const limit = parseInt(req.query.limit) || 10;  
      const page = parseInt(req.query.page) || 1;      
      const skip = (page - 1) * limit;
      const [restaurantExists, orders] = await Promise.all([
        Restaurant.findById(restaurantID).select('_id'),  
        PanierItem.find({ 
          user: userID, 
          restaurant: restaurantID 
        })  
        .populate('menuItem') 
      ])
      if (!restaurantExists) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      if(!orders){
        return res.status(404).json({ orders:[] });
      }
       
       res.status(200).json({ orders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

 
export const TotalUserOrdersByRestaurant = async (req, res) => {
  await verifyAndAuth(req, res, async () => {
    try {
      const userID = req.payload._id;  
      const restaurantID = req.body.restaurantID;  

      const limit = parseInt(req.query.limit) || 10;  
      const page = parseInt(req.query.page) || 1;      
      const skip = (page - 1) * limit;
       const orders = await PanierItem.find({ 
        user: userID, 
        restaurant: restaurantID  
      }).skip(skip).limit(limit);

      if (!orders || orders.length === 0) {
        return res.status(200).json({ number:0 });
      }
      let number = orders.length;
      res.status(200).json({ number });

      console.log("orders are ready ");
      console.log(number);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};
export const getUserOrders = async (req, res) => {
  await verifyAndAuth(req, res, async () => {
    try {
      const userID = req.payload._id;   

      const limit = parseInt(req.query.limit) || 10;  // Nombre d'éléments par page, par défaut 10
      const page = parseInt(req.query.page) || 1;     // Numéro de page
      const skip = (page - 1) * limit; 
       const orders = await PanierItem.find({ user: userID }).populate('menuItem','restaurant name typeMenu specialty price')
       .skip(skip)
       .limit(limit);

      if (!orders ) {
        return res.status(404).json({message:"Not Found" });
      }
      else if ( orders.length === 0)
      {
        return res.status(200).json({orders});
      }
      return  res.status(200).json({orders});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};
const deleteItem = async (req, res) => {
  try {
     const paniteItem = await PanierItem.findByIdAndDelete(req.body.panierItemID);
     if (!paniteItem) {
      return res.status(404).json({ message: 'Restaurant not found!' });
    }
    console.log('deleted');
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getRestaurantIdbypanierItem = async (req, res) => {
  try {
    const {panierId}=req.body;
    const panierItem = await PanierItem.findById(panierId).populate('restaurant');
     if (!panierItem) {
      return res.status(404).json( " item not found");
    }

    return res.status(200).json({ restaurantId:panierItem.restaurant._id});
 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    // Vérification si itemId et quantity sont fournis
    if (!itemId || !quantity) {
      return res.status(400).json({ message: 'itemId and quantity are required' });
    }

    console.log('Updating item with ID:', itemId); 
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }
    const oldItem = await PanierItem.findById(itemId);

    if (!oldItem) {
      console.log('Item not found with ID:', itemId);
      return res.status(404).json({ message: 'Item not found' });
    }     const prixunitaire = oldItem.subtotal / oldItem.quantity
     const updatedItem = await PanierItem.findByIdAndUpdate(
      itemId,
      { quantity,subtotal :prixunitaire*quantity},
      { new: true, runValidators: true }  
    );

     if (!updatedItem) {
      console.log('Item not found with ID:', itemId);
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log('Item successfully updated:', updatedItem);  
    res.status(200).json({ message: 'Quantity of this item has been updated successfully'});

  } catch (error) {
    console.error('Error updating item:', error.message);  
    res.status(500).json({ message: error.message });
  }
};
const createSupplement = async (req, res) => {
  try {
    const { name, price,type} = req.body;
    var image =req.file?.filename
  
    const supplement = new Supplement({
       name,
       price,
       type,
       image
    });

    await supplement.save();
    res.status(201).json({ message: 'Supplement added successfully', supplement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSupplement = async (req, res) => {
  try {
    const supplements = await Supplement.find();
    res.status(200).json(supplements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export default {addItemToPanier,getUserOrders,createSupplement
,deleteItem,updateItem ,getAllSupplement,getUserOrdersByRestaurant,TotalUserOrdersByRestaurant,getRestaurantIdbypanierItem};
  