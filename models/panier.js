import mongoose from 'mongoose';

const panierItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }, // Relation avec le restaurant
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },  
  quantity: { 
    type: Number, 
    default: 1, 
    min: [1, 'La quantité minimale est 1'], 
    required: true 
  } ,
  subtotal: { type: Number, required: true }  ,
  supplement: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplement', required: false }, 
],
 
});

const PanierItem = mongoose.model('PanierItem', panierItemSchema);

export default PanierItem;
