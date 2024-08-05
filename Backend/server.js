import express from "express";
import cors from "cors";
import Routes from "./src/routes/Routes.js";
import connectDB from "./src/config/dbConfig.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = `${process.env.Port}`;

connectDB();
app.use(cors());
app.use(express.json());

app.use("/api", Routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
