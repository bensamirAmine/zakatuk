import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const livreurSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      userName: {
        type: String,
        required: true,
        unique: true,

      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        unique: true,
      },
    password: {  type: String,required: true  },
    status: { type: String, enum: ['Disponible', 'Occupé'], default: 'Disponible' },
    
    
    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' ,default:[]}, 
    ],
    banned: {
      type: Boolean,
      required :false,

      default: false,
    },
    etatDelete: {
      type: Boolean,
      required :false,

      default: false,
    },
    verified:{
      type:Boolean,
      required :false,
      default:false
    },
    deliveryLocation: {  
      latitude: { 
        type: Number, 
        required: false,
        default:0 
      },
      longitude: { 
        type: Number, 
         required: false,
        default:0 
      }
    },
},

 {timestamps : true }
);

livreurSchema.pre("save", async function () {
  try {
    var user = this;
    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(user.password, salt);
    user.password = hashpass;
  } catch (error) {
    throw error;
  }
});
const Livreur = mongoose.model('Livreur', livreurSchema);

export default Livreur;
