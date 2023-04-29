import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

import authRouter from "./routes/user.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authRouter);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Listening on Port: ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(`Unable to connect to MongoDb: ${error}`));
