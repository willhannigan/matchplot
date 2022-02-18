const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require('dotenv').config()
const app = express();

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}));

app.use(cors());

//db connection 
const db = require("./src/models");

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


//routes
require("./src/routes/club.routes")(app);

//Listen for requests on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});