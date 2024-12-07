import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.get("/api/config", (req, res) => { 
  res.json({API_KEY: process.env.API_KEY})
});

const port = process.env.PORT || 3000;
app.listen(port, (req, res) => {console.log(`Server is running on port ${port}`);});