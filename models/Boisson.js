import mongoose from 'mongoose';

// Enum des types de suppléments
const supplementTypeEnum = {
  FRITE: 'frite',
  BOISSON: 'boisson',
  EAU: 'eau',
  SAUCE: 'sauce'
};

// Schéma Supplement
const supplementSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: Object.values(supplementTypeEnum),  
    required: true
  },

  price: {
    type: Number,
    required: true,
    min: [0, 'Le prix doit être supérieur ou égal à 0']
  },

  image: {
    type: String,
    required: true
  },
});

const Supplement = mongoose.model('Supplement', supplementSchema);
export default Supplement;
