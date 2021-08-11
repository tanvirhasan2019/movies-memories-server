import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//import UserModal from "../models/user.js";

const secret = 'test';

export const hellow = async (req, res) => {
  
  try {
    

    res.status(200).json({ result: 'HI This message from server' });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
