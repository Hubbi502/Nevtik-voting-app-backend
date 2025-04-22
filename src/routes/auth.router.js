import { Router } from "express";
import { readCSV, uploadCSV } from "../controllers/file.controller.js";
import { addUser, deleteUser, getCurrentUser, getSpecificUser, getUsers, login, logoutUser, updateUser } from "../controllers/user.controller.js";
import { isAddUserValid, isAdmin, isAuthorized, isDataValid, isLoginValid } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

const router = Router();
router.get("/users", isAuthorized,isAdmin, getUsers);
router.get("/users/:email",isAuthorized, getSpecificUser);
router.get("/user",isAuthorized, getCurrentUser)
router.put("/user/:id",isAuthorized,isAdmin, updateUser );
router.post("/login",isLoginValid, login);
router.post("/addUser",isAddUserValid,isAuthorized ,isAdmin, addUser);
router.post("/upload/csv", isAuthorized, isAdmin, upload.single('csv'), uploadCSV);
router.post("/addUser/csv/:filename", isAuthorized,isDataValid,isAdmin, readCSV);
router.delete("/deleteUser", isAuthorized, isAdmin, deleteUser);
router.post("/logout", logoutUser)
router.get("/hello", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});
export default router;