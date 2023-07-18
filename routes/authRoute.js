const express = require("express");
const {
  createUser,
  loginUser,
  getallUser,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  refreshTokenHandle,
  logout,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/all-users", authMiddleware, isAdmin, getallUser);
router.get("/refresh", refreshTokenHandle);
router.get("/logout", logout);

router.get("/:id", getSingleUser);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleware, updateUser);

router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;
