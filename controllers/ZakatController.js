
import UserModel from "../models/UserModel.js";
import dotenv from "dotenv";
import {verifyAndAuth} from "../middleware/verifyToken.js"; 

dotenv.config();



async function addTransaction(req, res) {
await verifyAndAuth(req, res, async () => {
  try {
    const userID = req.payload._id;
    const { type, category, amount, acquisitionDate } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const utcDate = new Date(acquisitionDate + 'T00:00:00.000Z');
    user.addTransaction(type, category, amount, utcDate);

    const NISSAB = 19000;

    // Trier les transactions par date d'acquisition
    user.transactionHistory.sort((a, b) => new Date(a.acquisitionDate) - new Date(b.acquisitionDate));

    let cumulativeBalance = 0;
    let nissabDate = null;

    for (const transaction of user.transactionHistory) {
      if (transaction.type === 'ADD') {
        if(transaction.category == "CASH"){
        cumulativeBalance += transaction.amount;
        }
        else if(transaction.category == "GOLD"){
          cumulativeBalance += transaction.amount * user.goldPricePerGram
        }
      }
       else if (transaction.type === 'SUBTRACT') {
        if(transaction.category == "CASH"){

        cumulativeBalance = Math.max(0, cumulativeBalance - transaction.amount);
      }
      else if(transaction.category == "GOLD"){
        cumulativeBalance = Math.max(0, cumulativeBalance - (transaction.amount * user.goldPricePerGram));

      }
    }
   
     // Vérifier si le Nisâb est atteint pour la première fois
      if (cumulativeBalance >= NISSAB) {
        if (!user.zakatCalculated) {
           nissabDate = transaction.acquisitionDate;
        }
        user.zakatCalculated = true; // Réactiver zakatCalculated
      } else if(cumulativeBalance < NISSAB) {
        user.zakatCalculated = false;
        user.NissabAcquisitionDate = "0000-00-00"  
      }
     
    }

    // Mettre à jour la date du Nisâb
    user.NissabAcquisitionDate = nissabDate;

    // Sauvegarder l'utilisateur avec les mises à jour
    await user.save();

    res.status(200).json({
      message: 'Transaction added successfully',
      zakatCalculated: user.zakatCalculated,
      NissabAcquisitionDate: user.NissabAcquisitionDate,
      total: cumulativeBalance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction', error });
  }
});
}

// async function addTransaction(req, res) {
//   await verifyAndAuth(req, res, async () => {
//     try {
//       const userID = req.payload._id;
//       const { type, category, amount, acquisitionDate } = req.body;

//       if (!type || !category || !amount || !acquisitionDate) {
//         return res.status(400).json({ message: 'Bad request' });
//       }

//       const user = await UserModel.findById(userID);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }


//       // Convert acquisitionDate en UTC
//       const utcDate = new Date(acquisitionDate + 'T00:00:00.000Z');

//       user.addTransaction(type, category, amount, utcDate);


    
//       const NISSAB = 13000;

//       // Trier l'historique par acquisitionDate (ascendant)
//       user.transactionHistory.sort((a, b) => new Date(a.acquisitionDate) - new Date(b.acquisitionDate));

//       console.log("transaction History"+ user.transactionHistory.toString);
//       // Calculer le solde cumulé
//       let cumulativeBalance = 0;
//       let nissabDate = null;

//       for (const transaction of user.transactionHistory) {
//         if(transaction.type == "ADD")
//         cumulativeBalance += transaction.amount;
//         console.log("cumulativeBalance"+cumulativeBalance);

//         if (cumulativeBalance >= NISSAB   && !nissabDate) {
//           user.zakatCalculated = true,
//           nissabDate = transaction.acquisitionDate;
//         } else if (cumulativeBalance < NISSAB){
//           user.zakatCalculated = false;

//         }
//       }

//       // Mettre à jour les champs de l'utilisateur
//       user.zakatCalculated = cumulativeBalance >= NISSAB;
//       user.NissabAcquisitionDate = nissabDate || null;

//       await user.save();
//       res.status(200).json({
//         message: 'Transaction added successfully',
//         zakatCalculated: user.zakatCalculated,
//         totalBalance: cumulativeBalance,
//         nissabAcquisitionDate: nissabDate,
//       });
   
//       // Réponse
 
//     } catch (error) {
//       res.status(500).json({ message: 'Error adding transaction', error });
//     }
//   });
// }


// async function addTransaction  (req, res)   {
//   await verifyAndAuth(req, res, async () => {
//     try {
//       const userID = req.payload._id;
//       const { type, category, amount,acquisitionDate } = req.body;
//       if(!type && !category && !amount){
//         return res.status(400).json({ message: 'Bad request' });

//       }
//       const user = await UserModel.findById(userID);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
    
//       console.log(req.body); 
//       const utcDate = new Date(acquisitionDate + 'T00:00:00.000Z');
//       user.addTransaction(type, category, amount, utcDate);
//       const NISSAB = 13000; 
//       if (user.zakatAmount >= NISSAB) {
//       if (!user.NissabAcquisitionDate) {
//         // Nissab atteint pour la première fois
//         user.NissabAcquisitionDate = acquisitionDate;
//         user.zakatCalculated = true;
//         console.log(`Nissab atteint pour la première fois le : ${acquisitionDate}`);
//       }
//     } else if(user.zakatAmount < NISSAB){
//        user.zakatCalculated = false;
//     }
//       await user.save();

//       res.status(200).json({
//         message: 'Transaction added successfully',
//         bool: user.zakatCalculated,
//         total: user.zakatAmount,
//         // balance: user.balance +"DT",
//         // goldWeight: (user.goldWeight/1000) + "K",
//        });
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding transaction', error });
//   }})
// };

async function recalculateTotals  (req, res)   {
  await verifyAndAuth(req, res, async () => {
    try {
      const userID = req.payload._id;

    const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


     user.recalculateTotals();
    
    await user.save();

    res.status(200).json({
      total : user.zakatAmount,
        history: user.transactionHistory,

    });
  } catch (error) {
    res.status(500).json({ message: 'Error recalculating totals', error });
  }
})};
async function deleteTransaction(req, res) {
await verifyAndAuth(req, res, async () => {
  try {
    const userID = req.payload._id;  
    const { transactionID } = req.body;  

     const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Trouver la transaction à supprimer
    const transactionToDelete = user.transactionHistory.find(
      (transaction) => transaction._id.toString() === transactionID
    );

    if (!transactionToDelete) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
      const initialLength = user.transactionHistory.length;
    user.transactionHistory = user.transactionHistory.filter(
      (transaction) => transaction._id.toString() !== transactionID
    );

    if (initialLength === user.transactionHistory.length) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

      if (transactionToDelete.category=="GOLD"){
        user.zakatAmount -= (transactionToDelete.amount*user.goldPricePerGram)
      }
      else if (transactionToDelete.category=="CASH"){
          user.zakatAmount -= transactionToDelete.amount;

      }
      const NISSAB = 19000;

    // Trier les transactions par date d'acquisition
    user.transactionHistory.sort((a, b) => new Date(a.acquisitionDate) - new Date(b.acquisitionDate));

    let cumulativeBalance = 0;
    let nissabDate = null;

    for (const transaction of user.transactionHistory) {
      if (transaction.type === 'ADD') {
        if(transaction.category == "CASH"){
        cumulativeBalance += transaction.amount;
        }
        else if(transaction.category == "GOLD"){
          cumulativeBalance += transaction.amount * user.goldPricePerGram
        }
      }
       else if (transaction.type === 'SUBTRACT') {
        if(transaction.category == "CASH"){

        cumulativeBalance = Math.max(0, cumulativeBalance - transaction.amount);
      }
      else if(transaction.category == "GOLD"){
        cumulativeBalance = Math.max(0, cumulativeBalance - (transaction.amount * user.goldPricePerGram));

      }
    }
   
     // Vérifier si le Nisâb est atteint pour la première fois
      if (cumulativeBalance >= NISSAB) {
        if (!user.zakatCalculated) {
           nissabDate = transaction.acquisitionDate;
        }
        user.zakatCalculated = true; // Réactiver zakatCalculated
      } else if(cumulativeBalance < NISSAB) {
        user.zakatCalculated = false;
        user.NissabAcquisitionDate = "0000-00-00"  
      }
     
    }

    // Mettre à jour la date du Nisâb
    user.NissabAcquisitionDate = nissabDate;

      await user.save();

    res.status(200).json({
      message: 'Transaction deleted successfully',
      
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
});
}
async function updateTransaction(req, res) {
await verifyAndAuth(req, res, async () => {
  try {
    const userID = req.payload._id;  
    const { transactionID, amount } = req.body;  

    // Rechercher l'utilisateur
    const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Trouver la transaction à mettre à jour
    const transactionToUpdate = user.transactionHistory.find(
      (transaction) => transaction._id.toString() === transactionID
    );

    if (!transactionToUpdate) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

     const amountDifference = amount - transactionToUpdate.amount;

     transactionToUpdate.amount = amount;

     if (transactionToUpdate.type === 'ADD') {
          if(transactionToUpdate.category == "CASH"){
            user.zakatAmount += amountDifference;
            user.balance+= amountDifference;

          }
          else if(transactionToUpdate.category=="GOLD"){
             user.goldWeight+=amountDifference;
             user.zakatAmount += amountDifference*user.goldPricePerGram;        

      }
    
    } else {
      
      if(transactionToUpdate.category == "CASH"){
        user.balance-=amountDifference;
        user.zakatAmount -= amountDifference;


      }
      else if(transactionToUpdate.category=="GOLD"){
        user.zakatAmount -= amountDifference*user.goldPricePerGram;
user.goldWeight-=goldPricePerGram

      }
    }
    const NISSAB = 19000;

    // Trier les transactions par date d'acquisition
    user.transactionHistory.sort((a, b) => new Date(a.acquisitionDate) - new Date(b.acquisitionDate));

    let cumulativeBalance = 0;
    let nissabDate = null;

    for (const transaction of user.transactionHistory) {
      if (transaction.type === 'ADD') {
        if(transaction.category == "CASH"){
        cumulativeBalance += transaction.amount;
        }
        else if(transaction.category == "GOLD"){
          cumulativeBalance += transaction.amount * user.goldPricePerGram
        }
      }
       else if (transaction.type === 'SUBTRACT') {
        if(transaction.category == "CASH"){

        cumulativeBalance = Math.max(0, cumulativeBalance - transaction.amount);
      }
      else if(transaction.category == "GOLD"){
        cumulativeBalance = Math.max(0, cumulativeBalance - (transaction.amount * user.goldPricePerGram));

      }
    }
   
     // Vérifier si le Nisâb est atteint pour la première fois
      if (cumulativeBalance >= NISSAB) {
        if (!user.zakatCalculated) {
           nissabDate = transaction.acquisitionDate;
        }
        user.zakatCalculated = true; // Réactiver zakatCalculated
      } else if(cumulativeBalance < NISSAB) {
        user.zakatCalculated = false;
        user.NissabAcquisitionDate = "0000-00-00"  
      }
     
    }

    // Mettre à jour la date du Nisâb
    user.NissabAcquisitionDate = nissabDate;

    // Enregistrer les changements
    await user.save();

    // Répondre avec succès
    res.status(200).json({
      message: 'Transaction updated successfully',
      });
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error });
  }
});
}




export default { recalculateTotals,addTransaction,deleteTransaction,updateTransaction
  };
