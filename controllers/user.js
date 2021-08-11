import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import UserModal from "../models/user.js";

const secret = 'test';

export const signin = async (req, res) => {

  const { email, password } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {

  const { email, password, firstName, lastName } = req.body;
  console.log('Signup method called');

  console.log('email - ', email , '  first - ', firstName , 'lastName - ', lastName , 'password - ', password);
  

  try {
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModal.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` });

    const token = jwt.sign( { email: result.email, id: result._id }, secret, { expiresIn: "1h" } );

    res.status(201).json({ result, token });

  } catch (error) {

    res.status(500).json({ message: "Something went wrong" });
    
    console.log(error);
  }
};



export const getUser = async (req, res) => {

  const {id } = req.params;
  console.log('id ', id)

  try {
    
    const User = await UserModal.findById(id)
    console.log('User ', User);
   
    if(User) return res.status(200).json({ data : {id : User._id , name : User.name , email: User.email, avatar:User.avatar } });
    res.status(400).json({ data : 'User Not Found' });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const UpdateProfile = async (req, res) => {

  const {id } = req.params;
  const {avatar, name, email } = req.body;

  try {
    
    const UpdateUser = await UserModal.findById(id)

    if (!UpdateUser) return res.status(404).send(`No User with id: ${id}`);

    const updatedUser = { name : name , email : email , avatar: avatar };
    await UserModal.findByIdAndUpdate(id, updatedUser, { new: true });
   
    res.status(200).json({ data: updatedUser });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};



