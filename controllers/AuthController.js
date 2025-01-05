import UserService from "../services/UserService.js";
import UserModel from "../models/UserModel.js";
import LivreurM from "../models/livreur.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import UserVerification from "../models/UserVerification.js";
import { verifyAndAuthLivreur } from "../middleware/verifyToken.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

dotenv.config();
const secretKey = process.env.SECRET_KEY;
import twilio from "twilio";
const clientTwilio = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "fedi.benromdhane@esprit.tn",
    pass: "pkln ixkq fpsa rpyd",
  },
});

const EXPIRED_TOKEN = 3 * 24 * 60 * 60;
const CreateToken = (id) => {
  return jwt.sign({ id }, secretKey, { expiresIn: EXPIRED_TOKEN });
};

async function Check_Google_Login(req, res) {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload["sub"];
    const email = payload["email"];
    const firstName = payload["given_name"];
    const lastName = payload["family_name"];
    const avatar = payload["picture"];

    // Vérification si l'utilisateur existe déjà dans la base de données
    let user = await UserService.checkuser(email); // Utiliser let ici

    if (!user) {
      // Si l'utilisateur n'existe pas, le créer
      user = new UserModel({
        firstName: firstName,
        lastName: lastName,
        email: email,
        avatar: avatar,
        googleId: googleId,
        password: "",
      });
      await user.save(); // Sauvegarder le nouvel utilisateur
    }
    console.log(user.email + "trouvé");
    // Préparer les données pour le token
    const tokenData = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    // Utiliser UserService pour générer le token
    const token = await UserService.generateToken(tokenData, secretKey, "5h");

    return res.json({
      status: 200,
      message: `${user.firstName} ${user.lastName} has been connected`,
      status: true,
      token: token,
    });
  } catch (error) {
    // Gérer les erreurs
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ status: false, token: "", error: error.message });
    }
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log("req =>", req.body);

    // Vérifier si l'utilisateur existe
    const user = await UserService.checkuser(email);
    if (!user) {
      return res.status(404).json({
        status: false,
        token: "",
        error: "User does not exist",
      });
    }

    // Comparer le mot de passe haché avec celui saisi
    const isMatch =    bcrypt.compare(password, user.password,10);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        token: "",
        error: "Invalid password",
      });
    }

    // Préparer les données du token
    const tokenData = {
      _id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    // Générer un token JWT
    const token = await UserService.generateToken(tokenData, secretKey, "5h");
    if (!token) {
      throw new Error("Failed to generate token");
    }

    console.log("token", req.res);

    // Retourner la réponse avec le token et les informations de l'utilisateur
    return res.status(200).json({
      status: true,
      message: `${user.firstName} ${user.lastName} has been connected`,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error.message); // Log l'erreur pour le débogage
    if (!res.headersSent) {
      // Assurez-vous qu'aucune autre réponse n'a été envoyée
      return res.status(500).json({
        status: false,
        token: "",
        error: error.message || "Internal server error",
      });
    }
  }
}

// async function register(req, res) {
//   try {
//     const {  firstName,
//         lastName,
//         userName,
//         email,
//         phoneNumber,
//         password,
//         adress,
//         birthdate,
//         about, } = req.body;
//         var avatar =req.file?.filename
//         const createUser = new UserM({
//         firstName,
//         lastName,
//         userName,
//         email,
//         phoneNumber,
//         password,
//         adress,
//         birthdate,
//         // avatar,
//         about,
//         });
//         await createUser.save();
//     res.status(201).json({ status: true, response: "User Registered" });
//   } catch (error) {
//     if (error.keyPattern) {
//       res.status(409).json({
//         status: false,
//         response: Object.keys(error.keyPattern)[0] + " already used",
//       });
//     } else {
//       res.status(500).json({ status: false, response: "Internal Server Error" });
//     }
//   }
// }

const setCurrentLocationforDelivery = async (req, res) => {
  await verifyAndAuthLivreur(req, res, async () => {
    try {
      const userID = req.payload._id;

      const { latitude, longitude } = req.body;
      const updatedLivreur = await LivreurM.findByIdAndUpdate(
        userID,
        {
          deliveryLocation: {
            latitude,
            longitude,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedLivreur) {
        return res.status(404).json({ message: "Livreur non trouvé" });
      }

      // Retourner le livreur mis à jour
      return res.status(200).json({ message: "Localisation mise à jour" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserService.checkuser(email);
    console.log(user);
    if (!user) {
      res
        .status(404)
        .json({ status: false, token: "", error: "User does not exist" });
    }
    if (user.role === "ADMIN") {
      const isMatch = await UserService.comparePassword(
        password,
        user.password
      );
      if (isMatch === false) {
        res
          .status(401)
          .json({ status: false, token: "", error: "Invalid password" });
      }

      const tokenData = {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };
      const token = await UserService.generateToken(tokenData, secretKey, "5h");
      res.status(200).json({
        message: `${user.firstName} ${user.lastName} has been connected`,
        status: true,
        token: token,
      });
    } else {
      res.status(403).json({
        status: false,
        token: "",
        error: "You are not authorized to perform this action",
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, token: "", error: error });
  }
}
const signup_Amdin = async (req, res) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    phoneNumber,
    password,
    adress,
    birthdate,
    about,
  } = req.body;
  try {
    const newUser = new UserModel({
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      password,
      adress,
      birthdate,
      about,
      role: "ADMIN",
      verified: false,
    });

    newUser
      .save()
      .then((result) => {
        console.log(result);
        sendVerificationEmail({ _id: result._id, email: email }, res);
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message: " An error was occured while saving User",
        });
      });

    const token = CreateToken(newUser._id);
    console.log(" user  token : " + token);
    newUser.token = token;
  } catch (error) {
    console.log(error);
    res.status(400).send("Bad request so Admin not created");
  }
};

const signup_User = async (req, res) => {
  const { firstName, lastName, userName, email, phoneNumber, password } =
    req.body;

  try {
    // Hachage du mot de passe avant l'enregistrement
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur avec le mot de passe haché
    const newUser = new UserModel({
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      password: hashedPassword, // Stocker le mot de passe haché
      role: "INDIVIDUAL",
      verified: true,
    });

    // Sauvegarder l'utilisateur dans la base de données
    const savedUser = await newUser.save();

    // Générer un token après la sauvegarde
    const token = CreateToken(savedUser._id);
    savedUser.token = token;

    // Enregistrer à nouveau avec le token
    await savedUser.save();

    // Répondre avec succès
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error during user signup:", error);

    // Gérer les erreurs
    res.status(500).json({
      status: "Failed",
      message: "An error occurred while creating the user",
      error: error.message,
    });
  }
};

const signup_Livreur = async (req, res) => {
  const { firstName, lastName, userName, email, phoneNumber, password } =
    req.body;
  try {
    const newUser = new LivreurM({
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      password,
    });

    newUser
      .save()
      .then((result) => {
        console.log(result);
        sendVerificationEmail({ _id: result._id, email: email }, res);
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message: " An error was occured while saving User",
        });
      });
  } catch (error) {
    console.log(error);
    res.status(400).send("Bad request so user not created");
  }
};

const sendVerificationEmail = ({ _id, email }, res) => {
  const CURRENT_URL = "http://localhost:1919/";

  // mail options
  const Mail_Option = {
    // from: "fedi.benrodhane@esprit.tn",
    to: email, // Replace with recipient's email address
    subject: "Verify your email",
    html: `<p> Please Verify your  <b>Email adress</b> to complete the sign up into your account.</p>
               <p> this link  <b> expires in 6 hours</b>.</p>
               <div style="font-family: inherit; text-align: center"><span style="color: #ffbe00; font-size: 18px">
               <p> Press <a href=${CURRENT_URL + "verify/" + _id}>HERE</a>
               </span></div><div></div></div></td>
  
                   To proceed.</p>`,
  };

  const newverification = UserVerification({
    UserID: _id,
    createdAt: Date.now(),
    expiredAt: Date.now() + 21600000, //6 hours
  });
  newverification.save().then(() => {
    try {
      transporter
        .sendMail(Mail_Option)
        .then(() => {
          res.json({
            status: "Pending",
            message: "Email verification was sent ! Check it !!",
          });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "Failed",
            message: "Couldn't send mail  verification !!",
          });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "Failed",
            message: "Couldn't save  verification Email Data!",
          });
        });
    } catch (erro) {
      console.error("Erreur lors de l'envoi de l'email :", error.message);
    }
  });
};
async function livreurLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserService.checkDelear(email);

    if (!user) {
      return res
        .status(404)
        .json({ status: false, token: "", error: "User does not exist" });
    }
    console.log(user);

    const isMatch = await UserService.comparePassword(password, user.password);
    if (isMatch === false) {
      return res
        .status(401)
        .json({ status: false, token: "", error: "Invalid password" });
    }

    const tokenData = {
      _id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
    const token = await UserService.generateToken(tokenData, secretKey, "5h");

    return res.json({
      status: 200,
      message: `${user.firstName} ${user.lastName} has been connected`,
      status: true,
      user: user,

      token: token,
    });
  } catch (error) {
    // Ensure no other responses are sent if an error occurs
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ status: false, token: "", error: error.message });
    }
  }
}
export default {
  signup_User,
  signup_Amdin,
  login,
  loginAdmin,
  sendVerificationEmail,
  signup_Livreur,
  livreurLogin,
  setCurrentLocationforDelivery,
  Check_Google_Login,
};
