import { Router } from "express";
import { searchUser } from "../controllers/searchController";
import { authenticateJWT } from "../middleware/auth";
import { searchLimiter } from "../middleware/security";

const router = Router()



router.get("/", authenticateJWT, searchLimiter, searchUser)


export default router