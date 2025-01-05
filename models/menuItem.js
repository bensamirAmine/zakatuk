import mongoose from 'mongoose';

 const ingredientSchema = new mongoose.Schema({
   name: { type: String, required: true },
  quantity: { type: String } ,
  available: { type: Boolean, default: true },
 }, { _id : false });
 
const menuItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },  
  name: { type: String, required: true },
  typeMenu: { 
    type: String, 
    required: true, 
    enum: [
      'Entrée', 'Menu Ciabatta','Menu Tacos','Sandwich', 'Main Course',
      'Dessert',  'Boisson', 'Specialty', 'Pizza','Crépe Sallé','Crépe sucré','Salade', 
      'Burger',
      'Sushi',
      'Pasta',
      'Soup',
      'Tacos',
      'Wrap',
      'Seafood',
      'Barbecue',
      'Grillades',
      'Appetizers',
      'Vegan',
      'Vegetarian',
      'Gluten-Free',
      'Healthy',
      'Tapas',
      'Brunch',
      'Plat du jour',
      'Petit-déjeuner',
      'Smoothie',
      'Cocktails',
      'Vin',
      'Bières',
      'Mocktails',
      'Glaces',
      'Gaufres',
      'Tartes',
      'Pâtisserie',
      'Plats traditionnels',
      'Street Food'
    ]
       , default: 'Specialty'  
  },
  specialty: { type: String },  
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: String, required:false,default: 0},
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }, 
  ],
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
