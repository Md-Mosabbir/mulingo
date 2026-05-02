import { Router } from "express";
import { createPrivateRoom } from "../controllers/chatController";
import { authenticateJWT } from "../middleware/auth";


const router = Router()


router.post("/private",authenticateJWT, createPrivateRoom)


export default router