import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import authRoute from "./routes/AuthRoutes.js";
import userRoute from "./routes/UserRoute.js";
import zakatRoutes from "./routes/ZakatRoutes.js";

import restaurantRoutes from "./routes/Restaurant/restaurantRoutes.js";
import commanderoutes from "./routes/Commande/commandeRoutes.js";
import menuRoutes from "./routes/Menu/menuRoutes.js";
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import './config/DBConnection.js';; // Assurez-vous que le chemin est correct

import { swaggerUi, swaggerDocs } from './config/swagger.js';


dotenv.config();
const app =express()
const port=process.env.PORT || 1919;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
// app.use(morgan('common'));  

app.use(morgan('dev'));  

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
const limiter = rateLimit({
  windowMs: 60 * 1000 + 15 * 1000, 
  max: 1000, 
  message: 'Too many requests from this IP, please try again later.',
  skipFailedRequests: true, 
  skipSuccessfulRequests: false 
});
app.use(limiter);


app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/zakat", zakatRoutes);

app.use("/commande", commanderoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/menu", menuRoutes);
 

app.get('/test', (req, res) => {
  res.send('Test réussi!');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});





 
 
 