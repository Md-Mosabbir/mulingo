import { Router } from "express";
import { searchUser } from "../controllers/searchController";
import { authenticateJWT } from "../middleware/auth";

const router = Router()



router.get("/", authenticateJWT, searchUser)


export default router