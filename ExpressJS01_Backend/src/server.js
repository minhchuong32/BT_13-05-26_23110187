require("dotenv").config();
//import các nguồn cần dùng
const express = require("express"); //commonjs
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/app");
const connection = require("./config/database");
const { getHomepage } = require("./controllers/homeController");
const cors = require("cors");
const app = express(); //cau hinh app la express
//cau hình port, neu tìm thay port trong env, khong thì tra ve 8888
const port = process.env.PORT || 8888;
app.use(cors()); //config cors
app.use(express.json()); // //config req.body cho json
app.use(express.urlencoded({ extended: true })); // for form data
configViewEngine(app); //config template engine
//config route cho view ejs
const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use("/", webAPI);
//khai bao route cho API
app.use("/v1/api/", apiRoutes);
(async () => {
  try {
    //ket noi database using mongoose
    await connection();
    //lang nghe port trong env
    app.listen(port, () => {
      console.log(`Backend Nodejs App listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();
