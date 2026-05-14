const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
  return res
    .status(200)
    .json("Hello world api - 23110187 [test token after login]");
});

const {
  getProducts,
  getProductById,
  getCategories,
} = require("../controllers/productController");

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/forgot-password", forgotPassword);
routerAPI.post("/reset-password", resetPassword);

// Product routes
routerAPI.get("/products", getProducts);
routerAPI.get("/products/:id", getProductById);
routerAPI.get("/categories", getCategories);

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI; //export default
