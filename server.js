const express = require("express"); // import express module
const app = express(); // create an instance of express
const bcrypt = require("bcrypt"); // import bcrypt module for password hashing
const port = 3033; // set the port number for the server
const pool = require("./db"); // import the pool object from db.js file which contains database connection settings
const path = require("path"); // import path module to work with file and directory paths
const mime = require("mime"); // import mime module to get MIME type of a file
const flash = require("connect-flash"); // import connect-flash module for flash messages
const passport = require("passport"); // import passport module for authentication
const initializePassport = require("./passport-config"); // import initializePassport function from passport-config.js
const session = require("express-session"); // import express-session module for session management
const pgSession = require("connect-pg-simple")(session); // import connect-pg-simple module to store session data in PostgreSQL database
const multer = require("multer"); // import multer module to handle file uploads
const uuid = require("uuid").v4; // import uuid module to generate unique IDs
const bodyParser = require("body-parser");
const cheerio =require('cheerio');

initializePassport(passport); // initialize Passport with the passport-config.js settings

app.set("view engine", "ejs"); // set the view engine to ejs

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false })); // use the urlencoded middleware to parse incoming requests with urlencoded payloads
app.use(express.static(path.join(__dirname, "public"))); // serve static files from the public folder

app.use(
  session({
    secret: "uNb2G9tkhb", // set the secret used to sign the session ID cookie
    resave: false, // do not save the session if it is not modified
    saveUninitialized: false, // do not create a session until something is stored
    store: new pgSession({
      pool: pool, // specify the database connection pool to use for storing sessions
      tableName: "sessions", // specify the name of the table to store session data
    }),
  })
);

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

const storage = multer.diskStorage({
  destination: "public/outfit_images/images", // specify the destination folder for uploaded images
  filename: (req, file, cb) => {
    console.log(file); // log the uploaded file details to the console
    cb(null, Date.now() + path.extname(file.originalname)); // specify the filename for the uploaded file
  },
});

const upload = multer({ storage: storage }); // create a multer object to handle file uploads

// Passport initialization
app.use(flash()); // use the connect-flash middleware for flash messages
app.use(passport.initialize()); // use the passport middleware for authentication
app.use(passport.session()); // use the passport middleware for session management

const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  } else {
    res.redirect("/login");
  }
};

app.post(
  "/loginform",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    try {
      const query = `SELECT userid, email FROM users WHERE email = $1`;
      const values = [req.body.email];
      const { rows } = await pool.query(query, values);

      req.session.isAuthenticated = true;
      req.session.user = { userid: rows[0].userid, email: rows[0].email };
      req.session.save(function () {
        res.redirect("/");
      });
    } catch (error) {
      console.error("Error finding user:", error);
      res.redirect("/login");
    }
  }
);

app.post("/uploadclothes", upload.single("image"), async (req, res) => {
  console.log(req.file);
  const { type, color, size, fabric, category, season, Occasion, colorCode } =
    req.body;
  const userid = req.session.user.userid;

  const imageName = req.file.filename;

  const itemQuery = `INSERT INTO ClothingItem (userid,imageupload,colorName,colorCode,ClothesSize,FabricType,categoryName) VALUES ($1, $2,$3,$4,$5,$6,$7) RETURNING *`;
  const itemValues = [
    userid,
    imageName,
    color,
    colorCode,
    size,
    fabric,
    category,
  ];

  const categoryQuery = `INSERT INTO category (categoryName,clothingtype,clothingseason) VALUES ($1, $2,$3) RETURNING *`;
  const categoryValues = [category, type, season];

  const occasionQuery = `INSERT INTO occasion (occasionname,userid,colorName) VALUES ($1, $2,$3) RETURNING *`;
  const occasionValues = [Occasion, userid, color];

  const queries = [
    pool.query(categoryQuery, categoryValues),
    pool.query(itemQuery, itemValues),
    pool.query(occasionQuery, occasionValues),
  ];

  try {
    const results = await Promise.all(queries); // all queries run in parallel

    res.redirect("/outfits");
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.passwordInput, 10);
    if (req.body.passwordInput != req.body.confirmPasswordInput) {
      console.log("Passwords do not match.");
      return res.redirect("/signup");
    }

    const id = Date.now().toString(); // TRY UUID
    const query = `INSERT INTO users (userid,username, email, password) VALUES ($1, $2, $3,$4) RETURNING *`;
    const values = [
      id,
      req.body.usernameInput,
      req.body.emailInput,
      hashedPassword,
    ];
    const { rows } = await pool.query(query, values);
    console.log("User created:", rows[0]);
    res.redirect("/login");
  } catch (error) {
    console.error("Error creating user:", error);
    res.redirect("/register");
  }
});

app.post("/cardFav",async (req, res) => {
  try {
    const cardId = req.body.cardId;
    const isSelected = req.body.isSelected;
    // console.log("Card id = "+cardId);
    // console.log("isSelected = "+isSelected);
    if (isSelected) {
      // Add card details to the database
      const query = "insert into itemfavourite values ($1,$2)";
      const {rows}= await pool.query(query,[cardId,isSelected]);
    } else {

      const query = "delete from itemfavourite where item_id=$1";
      const {rows}= await pool.query(query,[cardId]);

      
    }
    res.sendStatus(200);

  }catch (error) {
    console.error("Error creating outfit:", error);
    res.redirect("/401");
  }

});

app.post("/outfitForm", async (req, res) => {
  try {
    const userid = req.session.user.userid;

    const { Occasion,outfitname,hoverIMG0,hoverIMG1, hoverIMG2, hoverIMG3, hoverIMG4, hoverIMG5 } = req.body;

    {
      const query = `INSERT INTO outfit (userid,outfitname,overalltype) VALUES ($1, $2,$3) RETURNING *`;
      const values = [userid, outfitname,Occasion];
      const { rows } = await pool.query(query, values);
    }

    const arrayIMG = [
      hoverIMG0,
      hoverIMG1,
      hoverIMG2,
      hoverIMG3,
      hoverIMG4,
      hoverIMG5
    ];
    let i;
    for(i=0;i<=5;i++)
    {
      if(arrayIMG[i]!="none.png")
      {
        let itemID;
        let outfitID;

        console.log("IMAGE NAME = "+ arrayIMG[i]);
       {
         const queryImg = 'SELECT item_id from clothingitem where imageupload like $1' ;
         const {rows} = await pool.query(queryImg,[arrayIMG[i]]);
         itemID = rows[0].item_id;
        }
        {
          const query = 'SELECT outfit_id from outfit where outfitname = $1';
          const {rows}=await pool.query(query,[outfitname]);
           outfitID = rows[0].outfit_id;
        }
        console.log("ITEM ID = "+itemID);
        console.log("OUTFITID =  = "+ outfitID);

        const insertQuery = "INSERT into outfit_clothes values ($1,$2) RETURNING *";
        const {rows} = await pool.query(insertQuery,[outfitID,itemID]);

      }

    }
    res.redirect("/outfits");                                 // redirect TO LOOKS PAGE fix lookstab
  } catch (error) {
    console.error("Error creating outfit:", error);
    res.redirect("/401");
  }
});



app.get("/", function (req, res) {
  res.render("index", {
    css: ["/css/shared.css", "/css/style.css", "/css/signupStyles.css"],
  });
});

app.get(
  ["/css/shared.css", "/css/style.css", "/css/signupStyles.css"],
  function (req, res) {
    res.setHeader("Content-Type", mime.getType("css"));
    res.sendFile(path.join(__dirname, "public", "css", path.basename(req.url)));
  }
);

app.use(express.json());

app.get("/signup", (req, res) => {
  res.render("signup.ejs", {
    css: ["/css/style.css", "/css/signupStyles.css"],
  });
});

app.get("/login", (req, res) => {
  res.render("login.ejs", {
    css: ["/css/shared.css", "/css/loginStyles.css"],
  });
});
app.get("/contactUs", (req, res) => {
  res.render("contactUs.ejs", {
    css: ["/css/shared.css", "/css/contactUs.css"],
  });
});
app.get("/401", (req, res) => {
  res.render("401.ejs", {
    css: ["/css/shared.css", "/css/error.css"],
  });
});

app.get("/outfits", function (req, res) {
  if (!req.session.isAuthenticated) {
    res.redirect("/401");
  }

  res.render("outfits.ejs", {
    css: ["/css/shared.css", "/css/outfits.css", "/css/outfits2.css"],
    scripts: ["/app/outfit.js"],
  });
});

app.get("/outfitCards", isAuthenticated,async(req,res)=>{
  try{
    const userid = req.session.user.userid;
    const query = 'SELECT * FROM outfit WHERE userid = $1';
    const {rows} = await pool.query(query,[userid]); 

    res.send(rows);
  }catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

});

app.get("/outfitdetail", isAuthenticated,async(req,res)=>{
  try{
 
    const outfitid=req.query.outfitid;
    const query = 'select c.*,clothingtype from clothingitem c inner join outfit_clothes o ON(o.item_id=c.item_id) inner join category d ON (d.categoryname =c.categoryname) where o.outfit_id= $1';
    const {rows} = await pool.query(query,[outfitid]); 

    res.send(rows);
  }catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

});




app.get("/clothes", isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const clothType = req.query.clothingtype;
    // console.log("clothtype = = =" + clothType);
    if (clothType == "all") {
      const query =
        "select  * from clothingitem c inner join occasion a  on (c.item_id=a.item_id)  inner join category d on (d.categoryname=c.categoryname) where c.userid=$1";
      const { rows } = await pool.query(query, [userid]);
      // console.log("HELLO");
      res.send(rows);
    } else {
      const query =
        "select  * from clothingitem c inner join occasion a  on (c.item_id=a.item_id)  inner join category d on (d.categoryname=c.categoryname and lower(d.clothingtype)=lower($2))  where c.userid= $1";
      const { rows } = await pool.query(query, [userid, clothType]);
      // console.log("H123ELLO");
      res.send(rows);
    }

    // console.log('rows =  = = = ='+ rows + "rows count");
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/clothdetail", isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const itemId = req.query.item_id;
    // console.log('item id =  = = '+ itemId);
    const query =
      "SELECT * FROM clothingitem c INNER JOIN occasion a ON (c.item_id=a.item_id) INNER JOIN category d ON (d.categoryname=c.categoryname) WHERE c.userid=$1 AND c.item_id=$2";
    const { rows } = await pool.query(query, [userid, itemId]);

    if (rows.length === 0) {
      res.status(404).send("Clothing item not found");
      return;
    }

    res.send(rows);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/outfitSlides", isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const clothingType = req.query.clothingtype;

    const query =
      "SELECT * FROM clothingitem c INNER JOIN category d ON (d.categoryname=c.categoryname and  lower(d.clothingtype)= lower($2)) WHERE c.userid=$1";
    const { rows } = await pool.query(query, [userid, clothingType]);
    if (rows.length == 0) {
      res.status(404).send("Clothing item not found");
      return;
    }

    res.send(rows);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/loginlogout", (req, res) => {
  const loggedinBool = req.session.isAuthenticated;
  if (loggedinBool) res.json(loggedinBool);
  else res.json(false);
  // console.log("LOGGED IN BOOL =  " + loggedinBool);
});



app.listen(port, () => console.log(`App listening on port ${port}`));
