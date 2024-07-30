import express from "express";
import cors from "cors";
import Routes from "./routes/Routes.js";
import connectDB from "./config/dbConfig.js";

const app = express();
const port = 3001;

connectDB();
app.use(cors());
app.use(express.json());

app.use("/api", Routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
