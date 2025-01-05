import mongoose from 'mongoose';
 
const commandeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },  
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },  
  panierItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PanierItem', required: true }],  
  deliveryLocation: {  
    latitude: { 
      type: Number, 
      required: true 
    },
    longitude: { 
      type: Number, 
      required: true 
    }
  },
  deliveryAddress: { 
    type: String, 
    required: true 
  },
  paymentMethod: { type: String, enum: ['Carte bancaire', 'Especes', 'PayPal'], required: true }, 
  totalProductAmount: { type: Number, required: false },    
  totalAmount: { type: Number, required: true }, // Total général (produits + livraison + service)
  status: { type: String, enum: ['En attente', 'En cours', 'Livré', 'Annulé'], default: 'En attente' },
  orderDate: { type: Date, default: Date.now },
 },
  
{
  timestamps: true,
});
 
const Commande = mongoose.model('Commande', commandeSchema);
 
export default Commande;
