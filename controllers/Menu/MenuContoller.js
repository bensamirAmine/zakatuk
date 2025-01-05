import MenuItem from '../../models/menuItem.js';
import Restaurant from '../../models/restaurant.js';
import {verifyAdmin,verifyAndAuth} from "../../middleware/verifyToken.js"; 

import UserModel from '../../models/UserModel.js';

 const createMenuItemAndAssign = async (req, res) => {
  try {
    const { restaurantId, name, typeMenu,specialty, price, description } = req.body;
    var image =req.file?.filename

    // Validate required fields
    if (!restaurantId || !name || !typeMenu || !price) {
      return res.status(400).json({ 
        message: 'Restaurant ID, name, type, and price are required fields.' 
      });
    }

    // Check if the restaurant exists before proceeding
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create the new MenuItem
    const newMenuItem = new MenuItem({
      restaurant: restaurantId,
      name,
      typeMenu,
      specialty,
      price,
      description,
      image,
    });

     await newMenuItem.save()
      .catch((saveError) => {
        return res.status(500).json({ 
          message: 'Error saving the new MenuItem',
          error: saveError.message
        });
      });

     restaurant.menu.push(newMenuItem._id);

     await restaurant.save()
      .catch((saveError) => {
        return res.status(500).json({ 
          message: 'Error updating the restaurant with the new menu item',
          error: saveError.message
        });
      });

    res.status(201).json({ 
      message: 'Menu item created and added to restaurant successfully', 
      newMenuItem 
    });
  } catch (error) {
     if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Restaurant ID format' });
    }
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

// Lire tous les restaurants
const getAllMenu = async (req, res) => {
  try {
    const restaurants = await Menu.find().populate('menu');
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const MenuDetails = async (req, res) => {
  try {
    const { menuId } = req.body;
    const menu = await MenuItem.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found!' });
    }
   return res.status(200).json({menu});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// const { restaurantId, name, type, ingredient, price, description, image } = req.body;

const updateMenuItem = async (req, res) => {
  try {
    const { menuItemId, name, type, ingredient, price, image } = req.body;

     const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      menuItemId, 
      { name, type, ingredient, price, image }, // Fields to update
      { new: true, runValidators: true } // Return the updated document & run validation
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item updated successfully', updatedMenuItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// available
const ChangeMenuItemStatus = async (req, res) => {
  try {
    const { menuItemId } = req.body;

    // Find the current menu item
    const menuItem = await MenuItem.findById(menuItemId);
     if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Toggle the `available` status
    const newAvailableStatus = !menuItem.available;

     const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      menuItemId, 
      { available: newAvailableStatus },   
      { new: true, runValidators: true }   
    );

    res.status(200).json({ 
      message: `Menu item availability changed to ${newAvailableStatus ? 'true' : 'false'}`, 
      updatedMenuItem 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const LikeMenu = async (req, res) => {
  try {
    await verifyAndAuth(req, res, async () => {
      const userID = req.payload._id;  
      const { menuId } = req.body;

      const menu = await MenuItem.findById(menuId);
      console.log(menu.name);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      if (menu.likes.includes(userID)) {
        return res.status(400).json({ message: 'Already liked this menu' });
      }


      try {
        menu.likes.push(userID);

        await menu.save();
        await calculateLikePercentage(res, menuId);   

       return  res.status(200).json({ message: 'Menu liked successfully', rating: menu.rating });
      } catch (saveError) {
        return res.status(500).json({ 
          message: 'Error saving the updated menu', 
          error: saveError.message 
        });
      }
    });
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Restaurant ID format' });
    }
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error calculating like percentage', error: error.message });
    }
  }
};

export const DislikeMenu= async (req, res) => {
  try {
    await verifyAndAuth(req, res, async () => {
      const userID = req.payload._id;  
      const { menuId } = req.body;

       const menu = await MenuItem.findById(menuId);
      if (!menu) {
        return res.status(404).json({ message: 'menu not found' });
      }

       if (!menu.likes.includes(userID)) {
        return res.status(400).json({ message: 'You have not liked this menu yet' });
      }



      try {
        menu.likes =   menu.likes.filter(id => id.toString() !== userID);
        await calculateLikePercentage(res,menuId);

        await menu.save();
        return res.status(200).json({ message: 'menu disliked successfully' ,rating:menu.rating });
      } catch (saveError) {
        return res.status(500).json({
          message: 'Error saving the updated menu',
          error: saveError.message
        });
      }
    });
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Restaurant ID format' });
    }
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

export const checkUserLike = async (req, res) => {
  try {
    await verifyAndAuth(req, res, async () => {
      const userID = req.payload._id;
      const { menuId } = req.body;

       const menu = await MenuItem.findById(menuId);
      if (!menu) {
        return res.status(404).json({ message: 'menu not found', liked: false });
      }

       const hasLiked = menu.likes.includes(userID);
      if (!hasLiked) {
        console.log("yeah its false");

        return res.status(200).json({ message: "You haven't  liked this menu", liked: false });
      }else{

        console.log("yeah its true");
        return res.status(200).json({ message: 'You have already liked this menu', liked: true });
      }
    });
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Restaurant ID format', liked: false });
    }
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error processing the request', liked: false });
    }
  }
};

export const calculateLikePercentage = async (res, menuId) => {
  try {
    if (!menuId) {
      return res.status(400).json({ message: 'Menu ID is required' });
    }

    console.log("Calculating like percentage for menu ID: ", menuId);

    const totalUsers = await getTotalUsersWithRole('USER');
    // console.log("Total users with role 'USER': ", totalUsers);
    if (totalUsers === 0) {
      return res.status(404).json({ message: 'No users found with role USER' });
    }

    const likesCount = await getMenuLikesCount(menuId);
    console.log("Likes count for menu ID ", menuId, ": ", likesCount);

    const percentage = (likesCount / totalUsers) * 100;

    const menu = await MenuItem.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    menu.rating = percentage.toFixed(0);
    await menu.save();

    console.log("Like percentage calculated: ", percentage);

    return res.status(200).json({ 
      message: 'Like percentage calculated and updated successfully',
      rate: menu.rating 
    });
  } catch (error) {
    console.error(`Error calculating like percentage: ${error.message}`);
    return res.status(500).json({ message: `Error calculating like percentage`, error: error.message });
  }
};



const getMenuLikesCount = async (menuId) => {
  try {
    const menu = await MenuItem.findById(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }
    console.log("Likes count for menu: ", menu.likes.length);
    return menu.likes.length;
  } catch (error) {
    console.error(`Error fetching Menu likes count: ${error.message}`);
    throw new Error(`Error fetching Menu likes count: ${error.message}`);
  }
};
export const getTotalUsersWithRole = async (role) => {
  try {
    const count = await UserModel.countDocuments({ role });
    console.log(`Total users with role ${role}: `, count);
    return count;
  } catch (error) {
    console.error(`Error counting users with role ${role}: ${error.message}`);
    throw new Error(`Error counting users with role ${role}: ${error.message}`);
  }
};

export default { createMenuItemAndAssign, MenuDetails, getAllMenu,updateMenuItem,ChangeMenuItemStatus,
  LikeMenu ,DislikeMenu,checkUserLike};
