import { Router } from "express";
import { readCSV, uploadCSV } from "../controllers/file.controller.js";
import { getCurrentUser, getSpecificUser, getUsers, login, logoutUser, register } from "../controllers/user.controller.js";
import { isAuthorized, isDataValid, isLoginValid, isRegisterValid } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

const router = Router();
router.get("/users", isAuthorized, getUsers);
router.get("/users/:email",isAuthorized, getSpecificUser);
router.get("/user",isAuthorized, getCurrentUser)
router.post("/login",isLoginValid, login);
router.post("/register",isRegisterValid,isAuthorized , register);
router.post("/upload/csv", isAuthorized, upload.single('csv'), uploadCSV);
router.post("/register/csv/:filename", isAuthorized,isDataValid, readCSV)
router.post("/logout", logoutUser)

export default router;