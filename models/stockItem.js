import mongoose from 'mongoose';

const stockItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }, // Relation avec le restaurant
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }, // Relation avec l'article du menu
  quantity: { type: Number, required: true }
});

const StockItem = mongoose.model('StockItem', stockItemSchema);

export default StockItem;
