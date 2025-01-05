import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  
  name: { type: String, required: true ,unique:true},
  password: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true ,unique:true },
  openingHours: { type: String, required: true }, // ex: "Mon-Fri: 8am-10pm, Sat-Sun: 10am-11pm"
  description: { type: String },
  image: { type: String },
  menu: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }, 
  ],
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }, 
  ],
  currentLocation: {
    latitude: { type: String, default: 0, required: false },
    longitude: { type: String, default: 0, required: false },
  },

  // foodTypes: { type: String ,required:true},

  deliveryTime: { type: String ,required:false,default:"25 min"},
  rating: { type: String ,required:false ,default:0}, 

},
  {
  timestamps: true,
  });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
