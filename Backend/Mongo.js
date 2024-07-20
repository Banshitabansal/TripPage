import express from 'express';
import mongoose from 'mongoose'; 
import cors from 'cors';
import User from './user.js'; 

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/UserData')
  .then(() => {
    console.log("Database Connection Done.");
  })
  .catch((error) => {
    console.error("Something Went Wrong.", error);
  });

  app.post("/", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const newUser = new User({ username, password, email });
      await newUser.save();
      res.status(201).json({ message: "Data Saved", user: newUser });
    } catch (error) {
      res.status(500).json({ error: "Error saving data: " + error.message });
    }
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
