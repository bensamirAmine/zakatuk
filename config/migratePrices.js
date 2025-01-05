import mongoose from 'mongoose';
import MenuItem from '../../models/menuItem.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const migratePrices = async () => {
  try {
    // Trouver tous les documents dans la collection MenuItem
    const items = await MenuItem.find();

    for (let item of items) {
      if (typeof item.price === 'number') {
        // Si le prix est un nombre, le convertir en chaîne de caractères
        item.price = item.price.toString();
        await item.save();
      }
    }

    console.log('Migration des prix terminée');
    mongoose.disconnect();
  } catch (error) {
    console.error('Erreur lors de la migration des prix:', error);
    mongoose.disconnect();
  }
};

migratePrices();
