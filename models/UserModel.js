import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    googleId: {
      type: String,  
      unique: true,  
      sparse: true,  
      required: false,  
    },
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

    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,

    },
    password: {
      type: String,
      required: true,

    },
    adress: {
      type: String,
      required: false,

    },
    birthdate: {
      type: Date,
      required: false,

    },
    banned: {
      type: Boolean,
      default: false,
    },
    etatDelete: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      required: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER','INDIVIDUAL','COMPANY'],
      default: 'INDIVIDUAL',
    },
    // Gestion des biens
    balance: {
      type: Number,
      default: 0, // Argent liquide (en dinars)
    },
    goldWeight: {
      type: Number,
      default: 0, // Poids d'or en grammes
    },
    goldPricePerGram: {
      type: Number,
      default: 209, // Prix actuel de l'or par gramme
    },
     transactionHistory: [
      {
        type: {
          type: String,
          enum: ['ADD', 'SUBTRACT'],  
          required: true,
        },
        category: {
          type: String,
          enum: ['GOLD', 'CASH'], 
          required: true,
        },
        amount: {
          type: Number,
          required: true, 
        },
        acquisitionDate: {
          type: Date,
          required: true,
           
        },
         declarationDate:{
          type : Date,
          default: Date.now
        }
      },
    ],
    zakatCalculated: {
      type: Boolean,
      default: false,
    },
    NissabAcquisitionDate: {
      type: Date,
      default:Date.now(),
      required:false  
    },
    zakatAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.addTransaction = function (type, category, amount,acquisitionDate) {
   this.transactionHistory.push({
    type,
    category,
    amount,
    acquisitionDate
  });

  // Mettre à jour les totaux
  if (category === 'GOLD') {
    if (type === 'ADD') {
      this.goldWeight += amount; 
      console.log("add gold"); 
      this.acquisitionDate = acquisitionDate;

     } else if (type === 'SUBTRACT') {
      this.goldWeight = Math.max(0, this.goldWeight - amount); 
      console.log("SUBTRACT gold"); 

    }
  } else if (category === 'CASH') {
    if (type === 'ADD') {
      this.balance += amount;  
      console.log("Add cash"); 
      console.log(this.balance);
      this.acquisitionDate = acquisitionDate;

    } else if (type === 'SUBTRACT') {
      console.log("SUBTRACT cash"); 

      this.balance = Math.max(0, this.balance - amount); // Retirer du solde
      console.log(this.balance);

    }
  }
  this.zakatAmount = (this.goldWeight * this.goldPricePerGram) + this.balance;
  
 
  
};

userSchema.methods.recalculateTotals = function () {
   this.balance = 0;
   this.goldWeight = 0;

   this.transactionHistory.forEach((transaction) => {
    if (transaction.category === 'CASH') {
      if (transaction.type === 'ADD') {
        this.balance += transaction.amount;
      } else if (transaction.type === 'SUBTRACT') {
        this.balance -= transaction.amount;
      }
    } else if (transaction.category === 'GOLD') {
      if (transaction.type === 'ADD') {
        this.goldWeight += transaction.amount;
      } else if (transaction.type === 'SUBTRACT') {
        this.goldWeight -= transaction.amount;
      }
    }
  });

  // Garantir que les valeurs ne soient pas négatives
  this.balance = Math.max(0, this.balance);
  this.goldWeight = Math.max(0, this.goldWeight);
};
userSchema.methods.calculateNissab = function (NISSAB) {
  let cumulativeBalance = 0;
  let nissabDate = null;
  this.transactionHistory.sort((a, b) => new Date(a.acquisitionDate) - new Date(b.acquisitionDate));
 
  this.transactionHistory.forEach((transaction) => {
    if (transaction.type === 'ADD') {
      cumulativeBalance += transaction.category === 'CASH'
        ? transaction.amount
        : transaction.amount * this.goldPricePerGram;
    } else if (transaction.type === 'SUBTRACT') {
      cumulativeBalance = Math.max(
        0,
        cumulativeBalance - (transaction.category === 'CASH'
          ? transaction.amount
          : transaction.amount * this.goldPricePerGram)
      );
    }

    if (cumulativeBalance >= NISSAB && !this.zakatCalculated) {
      nissabDate = transaction.acquisitionDate;
    }
  });

  this.zakatCalculated = cumulativeBalance >= NISSAB;
  this.NissabAcquisitionDate = nissabDate || '0000-00-00';
  return cumulativeBalance;
};

// userSchema.pre("save", async function () {
//   try {
//     var user = this;
//     console.log(user.password);
//      const salt = await bcrypt.genSalt(10);
//     const hashpass = await bcrypt.hash(user.password, salt);
//     user.password = hashpass;
//   } catch (error) {
//     throw error;
//   }
// });
userSchema.pre("findOneAndUpdate", async function () {
  try {
    if (this._update.password) {
      const salt = await bcrypt.genSalt(10);
      const hashpass = await bcrypt.hash(this._update.password, salt);
      this._update.password = hashpass;
    }
  } catch (error) {
    throw error;
  }
});
const UserModel = model("User", userSchema);
export default UserModel;
 // const NISSAB = 13000; 
  //   if (this.zakatAmount >= NISSAB) {
  //   if (!this.NissabAcquisitionDate) {
  //     // Nissab atteint pour la première fois
  //     this.NissabAcquisitionDate = acquisitionDate;
  //     this.zakatCalculated = true;
  //     console.log(`Nissab atteint pour la première fois le : ${acquisitionDate}`);
  //   }
  // } else {
  //   // Si le montant total tombe sous le seuil, réinitialiser la date et le statut
  //   this.NissabAcquisitionDate = null;
  //   this.zakatCalculated = false;
  // }