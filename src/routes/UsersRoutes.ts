import express from "express"
import { getMe, login, signup } from "../controllers/UsersControllers"
import { requiresAuth } from "../middlewares/requiresAuth"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.get("/", requiresAuth, getMe)

export default router
