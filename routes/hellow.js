import express from "express";
const router = express.Router();

import { hellow} from "../controllers/hellow.js";

router.get('', hellow);
//router.post("/signup", signup);

export default router;