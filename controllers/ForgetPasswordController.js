import UserService from "../services/UserService.js";
import UserM from "../models/UserModel.js";
 import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import UserVerification from '../models/UserVerification.js'
import Messagetosent from "../models/message.js";

dotenv.config();
const secretKey = process.env.SECRET_KEY;
import  twilio  from 'twilio';
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


async function forgetPwd(req, res) {
    try {
      const { email} = req.body;
      const user = await UserService.checkuser(email);
      const random = await UserService.generateCode();
      if (!user) {
        res.status(404).json({ status: false, token: "", error: "User not found" });
      } else {
        const tokenData = {
          _id: user._id,
          email: user.email,
          code: random,
        };
        const token = await UserService.generateToken(
          tokenData,
          secretKey,
          "1h"
        );
        await transporter
          .sendMail({
            from: '"Fedi 👻" <fedi.benromdhane@esprit.tn>',
            to: user.email,
            subject: "Reset your password",
            html: `<h1><strong>Hi! ${user.firstName}</strong></h1><h3>We have received a request to reset your password.</h3>Verification code:${random}`,
          })
          .then(() => {
            console.log(`Message sent:${token}`);
          })
          .catch((error) => {
            console.log(error);
          });
          res.status(200).json({ status: true, token: token, error: "" });
      }
    } catch (error) {
      res.status(500).json({ status: false, token: "", error: error });
    }
  }
  //______________________________________________________________
async function forgetPwdSms(req, res) {
    console.log("forget");
    try {
      const random = await UserService.generateCode();
      const user = await UserM.findOne({
        $or: [
          {
            email: req.body.data,
          },
          {
            phoneNumber: req.body.data,
          },
        ],
      });
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        await user.updateOne({ forgetPwd: random });
        const tokenData = {
          _id: user._id,
          email: user.email,
          code: random,
        };
        console.log("token code", random);
        const token = await UserService.generateToken(
          tokenData,
          secretKey,
          "5h"
        );
        client.messages
          .create({
            body: `Hi! ${user.firstName} We have received a request to reset your password. Verification code:${random}`,
            from: "+12565308558",
            to: "+21692703351",
          })
          .then((message) => console.log(message.sid))
          .catch((error) => {
            console.log(error);
          });
        console.log(`Message sent:${token}`);
        res.status(200).json({ status: true, token: token });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  const forgot_password_sms= async (req, res) => {
    const verificationCode = Math.floor(1000 + Math.random() * 9000);

    try {
      const { phoneNumber } = req.body;
  
      if (!phoneNumber) {
        res.status(400).send("All input is required");
        return;
      }
      const user = await UserService.checkuser(phoneNumber);

      // const user = await user.findOne({ telephone });
      console.log("user phone"+user.phoneNumber);
      if (!user) {
        res.json({
          status: "Failed",
          message: "Sorry ! You are not registered!"
        });
        return;
      }
      //  const code = new Code({
      //   UserID: user._id, // This ensures the _id is a string.
      //   code: verificationCode
      // });
  
      //  await  code.save();
      await sendMessage(  verificationCode, telephone );

   
      const payload = {
        telephone: user.telephone,
        id: user._id,
        code: verificationCode
      };
  
      const token = jwt.sign(payload, secretKey, { expiresIn: '15m' });
   
      res.send({
        message: 'Code has been sent',
         Token: token,
        Code:verificationCode
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  }  
  // ---------------------- Send Message ----------------------
async function sendMessage(body,number) {

    try {
      const message = client.messages.create({
        to: number, 
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `Your verification code is: ${body}`
      });

       const messageRecord = new Messagetosent({
        to: number,
        body: message.body,
        dateSent: new Date(),
        sid: message.sid
      });
  
      // Save the message record to the database
      await  messageRecord.save();
      console.log('Message sent and saved:', message.sid);
  
       return {
        success: true,
        message: 'Verification code sent.',
        sid: message.sid
      };
      
    } catch (error) {
      console.error('Error sending message:', error);
  
       return {
        success: false,
        message: 'Failed to send verification code.',
        error: error.message
      };
    }
  
  }  
    //______________________________________________________________

async function otp(req, res) {
    try{
      const code = req.payload.code;
      const paramCode = req.body.data;
      console.log(paramCode);
      if (code.trim() === paramCode.trim()) {
        const tokenData = {
          _id: req.user._id,
          email: req.user.email,
          code: code,
        };
        const token = await UserService.generateToken(tokenData, "secretKey", "5m");
        res.status(200).json({ status: true, token: token, error: "" });
      } else {
        res.status(403).json({ status: false, token: "", error: "Invalid code" });
      }
    } catch (error) {
      res.status(500).json({ status: false, token: "", error: error });
    }
  }
async function newPwd(req, res) {
    try {
      const user = await UserM.findOneAndUpdate(
        { _id: req.payload._id },
        { password: req.body.password},
        { new: true }
      );
      if (!user) {
        res
          .status(404)
          .json({ status: false, token: "", error: "User not found" });
      } else {
        res
          .status(200)
          .json({ status: true, token: "", error: "" });
      }
    } catch (error) {
      res.status(500).json({ status: false, token: "", error: error });
    }
  }
  
  const  sendVerificationEmail = ({_id,email},res) => {
    const  CURRENT_URL = "http://localhost:1919/";
       
     // mail options
        const  Mail_Option = {
        // from: "fedi.benrodhane@esprit.tn",
        to: email, // Replace with recipient's email address
        subject: 'Verify your email',
        html: `<p> Please Verify your  <b>Email adress</b> to complete the sign up into your account.</p>
               <p> this link  <b> expires in 6 hours</b>.</p>
               <div style="font-family: inherit; text-align: center"><span style="color: #ffbe00; font-size: 18px">
               <p> Press <a href=${CURRENT_URL+"verify/"+_id}>HERE</a>
               </span></div><div></div></div></td>
  
                   To proceed.</p>`,
        };
    
       
       
                     const newverification = UserVerification({
                      UserID : _id,
                       createdAt :Date.now(),
                      expiredAt :Date.now()+21600000  //6 hours     
                    })
                     newverification.save()
                                   .then(()=>{
                                   try{
                                          transporter
                                              .sendMail(Mail_Option)
                                              .then(()=>{
                                                res.json({
                                                  status : "Pending",
                                                  message :"Email verification was sent ! Check it !!"
                                                })
                                                
                                              })
                                              .catch((error) =>{
                                                console.log(error);
                                                res.json({
                                                  status: "Failed",
                                                  message: "Couldn't send mail  verification !!"
                                                })
                                    })
                                   .catch((error) =>{
                                    console.log(error);
                                    res.json({
                                      status: "Failed",
                                      message: "Couldn't save  verification Email Data!"
                                    })
                                   }) 
             }
             catch(erro){
              console.error('Erreur lors de l\'envoi de l\'email :', error.message);
  
             }
                                  })
           
     }
     export default {  forgetPwd, newPwd, otp, forgot_password_sms,forgetPwdSms,sendVerificationEmail };
