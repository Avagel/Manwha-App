const express = require("express");
const router = express.Router();
const {} = require("../controllers/controller");


router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);
router.post("/", userController.createUser);

module.exports = router;
