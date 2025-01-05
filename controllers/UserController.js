 import UserM from "../models/UserModel.js"; 



const updateAccount = async (req, res) => {
  try {
    const {  
        firstName,
        lastName,
        userName,
        email,
        //phoneNumber,
        //adress,
        //birthdate,
       // about 
      } = req.body;
    var avatar =req.file?.filename
console.log("avatar"+avatar);
    const newUser = {
        firstName,
        lastName,
        userName,
        email,
        //phoneNumber,
        //adress,
        //birthdate,
        //about,
        avatar,
    };

    await UserM.findByIdAndUpdate(req.payload._id, newUser);
    res.status(200).json({ message: "Account updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await UserM.findByIdAndUpdate(req.payload._id, {
        etatDelete: true,
      });
    if(!user){
        return res.status(404).json({ message:"User not found!" })
    };
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await UserM.findById(req.payload._id);
    if (!user) {
        return res.status(404).json({ message:"User not found!" })
   }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  console.log(req.body.role);
  try {
    const allUsers = await UserM.find({role: "USER",etatDelete:false});
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllAdmins = async (req, res) => {
  console.log(req.body.role);
  try {
    const allUsers = await UserM.find({role: "ADMIN",etatDelete:false});
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const banUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await UserM.findByIdAndUpdate(userId, {
            banned: true,
          });
        if(!user){
            return res.status(404).json({ message:"User not found!" })
        };
        res.status(200).json({ message: "User blocked successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};
const unBanUser = async (req, res) => {
    try {
      const userId = req.body.userId;
        const user = await UserM.findByIdAndUpdate(userId, {
            banned: true,
          });
        if(!user){
            return res.status(404).json({ message:"User not found!" })
        };
        res.status(200).json({ message: "User activated successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

export default { updateAccount, deleteAccount, getUser, getAllUsers ,banUser,unBanUser,getAllAdmins};
