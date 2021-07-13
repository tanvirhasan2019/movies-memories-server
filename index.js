
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';




//import postRoutes from './routes/posts.js';
import userRouter from "./routes/user.js";
import hellow from './routes/hellow.js';
import postRoutes from './routes/post.js';


const app = express();
dotenv.config();

app.use(express.json({ limit: '30mb', extended: true }))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

//app.use('/posts', postRoutes);
//app.use("/user", userRouter);

app.use("/user", userRouter);
app.use('/posts', postRoutes);
app.use('/', hellow);


const CONNECTION_URL = 'mongodb+srv://tanvirhasan:tanvirhasan01687339737@cluster0.1avf3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const PORT = 5001;


mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

mongoose.set('useFindAndModify', false);