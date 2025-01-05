import Restaurant from '../../models/restaurant.js';
import {verifyAdmin,verifyAndAuth} from "../../middleware/verifyToken.js"; 
import UserModel from '../../models/UserModel.js';
 
 
// Créer un nouveau restaurant
const createRestaurant = async (req, res) => {
  try {
    const { name, password, street, city, postalCode, country, phoneNumber, openingHours, description ,latitude,  // Added latitude
    longitude } = req.body;
    var image =req.file?.filename
  
    const newRestaurant = new Restaurant({
      name,
      password,
      street,
      city,
      postalCode,
      country,
      phoneNumber,
      openingHours,
      description,
      image,
       currentLocation: {
        latitude: latitude || 0,  
        longitude: longitude || 0,  
       }
    });

    await newRestaurant.save();
    res.status(201).json({ message: 'Restaurant added successfully', newRestaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getRestaurantById = async (req, res) => {
  try {
    const {restaurantId}=req.body;
    const restaurant = await Restaurant.findById(restaurantId).populate('menu');
     if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found!' });
    }

   res.status(200).json({restaurant});
   console.log("affiche par id")

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
const getAllRestaurants = async (req, res) => {
  try {
    console.log('Received request for all restaurants');
    
    // redisClient.get('restaurants', async (err, cachedData) => {
    //   if (err) {
    //     console.error('Error retrieving from Redis', err);
    //     return res.status(500).json({ message: 'Server error' });

    //   }

    //   if (cachedData) {
    //     console.log("Restaurants retrieved from cache");
    //     res.set('Cache-Control', 'public, max-age=3600');
    //     return res.status(200).json(JSON.parse(cachedData));
    //   }
      

      console.log('Fetching restaurants from the database');
      const restaurants = await Restaurant.find().populate({
        path: 'menu',
        select: '-available',
      });
      // console.log("Restaurants from DB:", restaurants);

        res.status(200).json(restaurants);
      console.log("Restaurants displayed");
    // });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// Mettre à jour un restaurant par ID
const updateRestaurant = async (req, res) => {
  try {
    const { name, password, street, city, postalCode, country, phoneNumber, openingHours, description, rate } = req.body;
    const updatedRestaurant = {
      name,
      password,
      street,
      city,
      postalCode,
      country,
      phoneNumber,
      openingHours,
      description,
      rate,
    };

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updatedRestaurant, { new: true });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found!' });
    }
    res.status(200).json({ message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un restaurant par ID
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found!' });
    }
    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
export const LikeRestaurant = async (req, res) => {
  try {
     await verifyAndAuth(req, res, async () => {
      const userID = req.payload._id;  
      const { restaurantId } = req.body;

      // Trouvez le restaurant
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

       if (restaurant.likes.includes(userID)) {
        return res.status(400).json({ message: 'Already liked this restaurant' });
      }
       restaurant.likes.push(userID);
        calculateLikePercentage(res,restaurantId);
       try {
        await restaurant.save();
        res.status(200).json({ message: 'Restaurant liked successfully' });
      } catch (saveError) {
        res.status(500).json({
          message: 'Error saving the updated restaurant',
          error: saveError.message
        });
      }
    });
  } catch (error) {
     if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Restaurant ID format' });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error calculating like percentage' });
    }  }
};
export const DislikeRestaurant = async (req, res) => {
  try {
    await verifyAndAuth(req, res, async () => {
      const userID = req.payload._id;  
      const { restaurantId } = req.body;

      // Trouver le restaurant
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

       if (!restaurant.likes.includes(userID)) {
        return res.status(400).json({ message: 'You have not liked this restaurant yet' });
      }

       restaurant.likes = restaurant.likes.filter(id => id.toString() !== userID);

      // Calculer à nouveau le pourcentage de likes après suppression
      await calculateLikePercentage(res,restaurantId);

      try {
        await restaurant.save();
        res.status(200).json({ message: 'Restaurant disliked successfully' });
      } catch (saveError) {
        res.status(500).json({
          message: 'Error saving the updated restaurant',
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

export const calculateLikePercentage = async ( res,restaurantId) => {
  try {
    // const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const totalUsers = await getTotalUsersWithRole('USER');
    if (totalUsers === 0) {
      return res.status(404).json({ message: 'No users found with role USER' });
    }


     const likesCount = await getRestaurantLikesCount(restaurantId);
     const percentage = (likesCount / totalUsers) * 100;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });

    }
    

    restaurant.rating = percentage.toFixed(0);
    await restaurant.save();

    return res.status(200).json({ 
      message: 'Like percentage calculated and updated successfully',
      rate: restaurant.rate 
    });
  } catch (error) {
    console.error(`Error calculating like percentage: ${error.message}`);
    return res.status(500).json({ message: `Error calculating like percentage`, error: error.message });
  }
};
export const GetRate = async ( res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const totalUsers = await getTotalUsersWithRole('USER');
    if (totalUsers === 0) {
      return res.status(404).json({ message: 'No users found with role USER' });
    }


     const likesCount = await getRestaurantLikesCount(restaurantId);
     const percentage = (likesCount / totalUsers) * 100;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });

    }
    

    restaurant.rating = percentage.toFixed(2);
 
    return res.status(200).json({ 
      message: 'Like percentage calculated and updated successfully',
      rate: restaurant.rating
    });
  } catch (error) {
    console.error(`Error calculating like percentage: ${error.message}`);
    return res.status(500).json({ message: `Error calculating like percentage`, error: error.message });
  }
};
export const getTotalUsersWithRole = async (role) => {
  try {
    const count = await UserModel.countDocuments({ role });
    return count;
  } catch (error) {
    throw new Error(`Error counting users with role ${role}: ${error.message}`);
  }
};
export const checkUserLike = async (req, res) => {
  try {
    await verifyAndAuth(req, res, async () => {
      const userID = req.payload._id;
      const { restaurantId } = req.body;

       const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found', liked: false });
      }

       const hasLiked = restaurant.likes.includes(userID);
      if (!hasLiked) {
        console.log("yeah its false");

        return res.status(200).json({ message: "You haven't  liked this restaurant", liked: false });
      }else{

        console.log("yeah its true");
        return res.status(200).json({ message: 'You have already liked this restaurant', liked: true });
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

const getRestaurantLikesCount = async (restaurantId) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    return restaurant.likes.length;
  } catch (error) {
    throw new Error(`Error fetching restaurant likes count: ${error.message}`);
  }
};
export default { createRestaurant, getRestaurantById, getAllRestaurants, 
  updateRestaurant, deleteRestaurant ,DislikeRestaurant,LikeRestaurant,
  calculateLikePercentage,checkUserLike};
