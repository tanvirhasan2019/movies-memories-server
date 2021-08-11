import express from "express";
const router = express.Router();

import { signin, signup, getUser , UpdateProfile } from "../controllers/user.js";
import auth from "../middleware/auth.js";


router.post("/signin", signin);
router.post("/signup", signup);
router.get('/:id', auth , getUser);
router.patch('/update/:id', auth , UpdateProfile);


export default router;