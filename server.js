const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const port = 3035;
const pool = require("./db");
const path = require("path");
const mime = require("mime");
const flash = require("connect-flash");
const passport = require("passport");
const initializePassport = require("./passport-config");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const multer = require("multer");
const uuid = require("uuid").v4;
const bodyParser = require("body-parser");
const cheerio = require("cheerio");

initializePassport(passport);

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "uNb2G9tkhb",
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
      pool: pool,
      tableName: "sessions",
    }),
  })
);

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash("success_msg", "You have successfully logged out.");
      res.redirect("/");
    }
  });
});

const storage = multer.diskStorage({
  destination: "public/outfit_images/images",
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});
app.use(passport.initialize());
app.use(passport.session());

const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  } else {
    req.flash("error_msg", "Please log in to access this page.");
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
        req.flash("success_msg", "You have successfully logged in.");
        res.redirect("/");
      });
    } catch (error) {
      console.error("Error finding user:", error);
      req.flash("error_msg", "An error occurred. Please try again.");
      res.redirect("/login");
    }
  }
);

app.post("/uploadclothes", upload.single("image"), async (req, res) => {
  console.log(req.file);
  const { type, color, size, fabric, category, season, Occasion, colorCode } =
    req.body;
    try {
  const userid = req.session.user.userid;
  if (!req.file) {
    req.flash("error_msg", "No file received. Please upload an image.");
    return res.redirect("/outfits");  // Redirect to the same page or error page
    
  }

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

  
    const results = await Promise.all(queries);
    req.flash("success_msg", "Clothing item uploaded successfully.");
    res.redirect("/outfits");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "An error occurred. Please try again.");
    return res.redirect("/outfits");
  }
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.passwordInput, 10);
    if (req.body.passwordInput !== req.body.confirmPasswordInput) {
      req.flash("error_msg", "Passwords do not match.");
      return res.redirect("/signup");
    }

    const id = Date.now().toString();
    const query = `INSERT INTO users (userid, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [
      id,
      req.body.usernameInput,
      req.body.emailInput,
      hashedPassword,
    ];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      req.flash("error_msg", "An error occurred. Please try again.");
      return res.redirect("/register");
    }

    req.flash(
      "success_msg",
      "You have successfully registered. Please log in."
    );
    res.redirect("/login");
  } catch (error) {
    console.error("Error creating user:", error);
    req.flash("error_msg", "An error occurred. Please try again.");
    res.redirect("/register");
  }
});

app.post("/cardFav", async (req, res) => {
  try {
    const cardId = req.body.cardId;
    const isSelected = req.body.isSelected;

    if (isSelected) {
      // Add card details to the database
      const query = "insert into itemfavourite values ($1,$2)";
      const { rows } = await pool.query(query, [cardId, isSelected]);
    } else {
      const query = "delete from itemfavourite where item_id=$1";
      const { rows } = await pool.query(query, [cardId]);
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Error creating outfit:", error);
    res.redirect("/401");
  }
});

app.post("/outfitForm", async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const {
      Occasion,
      outfitname,
      hoverIMG0,
      hoverIMG1,
      hoverIMG2,
      hoverIMG3,
      hoverIMG4,
      hoverIMG5,
    } = req.body;
    const arrayIMG = [
      hoverIMG0,
      hoverIMG1,
      hoverIMG2,
      hoverIMG3,
      hoverIMG4,
      hoverIMG5,
    ];

    const outfitQuery = `INSERT INTO outfit (userid, outfitname, overalltype) VALUES ($1, $2, $3) RETURNING *`;
    const outfitValues = [userid, outfitname, Occasion];
    const { rows: outfitRows } = await pool.query(outfitQuery, outfitValues);
    const outfitId = outfitRows[0].outfit_id;

    let successCount = 0;
    const insertQueries = [];

    for (let i = 0; i <= 5; i++) {
      if (arrayIMG[i] !== "none.png") {
        const itemQuery = `SELECT item_id FROM clothingitem WHERE imageupload = $1`;
        const itemValues = [arrayIMG[i]];
        const { rows: itemRows } = await pool.query(itemQuery, itemValues);

        if (itemRows.length > 0) {
          const itemId = itemRows[0].item_id;
          insertQueries.push(
            pool.query(
              "INSERT INTO outfit_clothes (outfit_id, item_id) VALUES ($1, $2) RETURNING *",
              [outfitId, itemId]
            )
          );
          successCount++;
        }
      }
    }

    await Promise.all(insertQueries);

    if (successCount > 0) {
      req.flash("success_msg", "Outfit created successfully.");
      res.redirect("/outfits#looks");
    } else {
      req.flash("error_msg", "Failed to create outfit. Please try again.");
      res.redirect("/401");
    }
  } catch (error) {
    console.error("Error creating outfit:", error);
    req.flash("error_msg", "An error occurred. Please try again.");
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
    scripts: ["/app/signup.js"],
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

app.get("/outfitCards", isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const query = "SELECT * FROM outfit WHERE userid = $1";
    const { rows } = await pool.query(query, [userid]);

    if (rows.length > 0) {
      req.flash("success_msg", "Outfit cards retrieved successfully.");
    } else {
      req.flash("error_msg", "No outfit cards found.");
    }

    res.send(rows);
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "An error occurred. Please try again.");
    res.sendStatus(500);
  }
});

app.get("/outfitdetail", isAuthenticated, async (req, res) => {
  try {
    const outfitid = req.query.outfitid;
    const query =
      "SELECT c.*, clothingtype FROM clothingitem c INNER JOIN outfit_clothes o ON (o.item_id = c.item_id) INNER JOIN category d ON (d.categoryname = c.categoryname) WHERE o.outfit_id = $1";
    const { rows } = await pool.query(query, [outfitid]);

    if (rows.length > 0) {
      req.flash("success_msg", "Outfit details retrieved successfully.");
    } else {
      req.flash("error_msg", "Outfit details not found.");
    }

    res.send(rows);
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "An error occurred. Please try again.");
    res.sendStatus(500);
  }
});

app.get("/clothes", isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const clothType = req.query.clothingtype;
    console.log("clothtype = = =" + clothType);
    if (clothType == "all") {
      const query =
        "SELECT c.*, a.occasion_id, a.occasionname, d.clothingtype, d.clothingseason, i.favourites FROM clothingitem c INNER JOIN occasion a ON (c.item_id = a.item_id) INNER JOIN category d ON (d.categoryname = c.categoryname) LEFT JOIN itemfavourite i ON (i.item_id = c.item_id) WHERE c.userid = $1 ORDER BY i.favourites ASC";
      const { rows } = await pool.query(query, [userid]);
      if (rows.length > 0) {
        req.flash("success_msg", "All clothing items retrieved successfully.");
      } else {
        req.flash("error_msg", "No clothing items found.");
      }
      res.send(rows);
    } else if (clothType === "favourites") {
      const query =
        "SELECT c.*, a.occasion_id, a.occasionname, d.clothingtype, d.clothingseason, i.favourites FROM clothingitem c INNER JOIN occasion a ON (c.item_id = a.item_id) INNER JOIN category d ON (d.categoryname = c.categoryname) INNER JOIN itemfavourite i ON (i.item_id = c.item_id) WHERE c.userid = $1 ORDER BY i.favourites ASC";
      const { rows } = await pool.query(query, [userid]);
      if (rows.length > 0) {
        req.flash(
          "success_msg",
          "Favorite clothing items retrieved successfully."
        );
      } else {
        req.flash("error_msg", "No favorite clothing items found.");
      }
      res.send(rows);
    } else {
      const query =
        "SELECT c.*, a.occasion_id, a.occasionname, d.clothingtype, d.clothingseason, i.favourites FROM clothingitem c INNER JOIN occasion a ON (c.item_id = a.item_id) INNER JOIN category d ON (d.categoryname = c.categoryname AND LOWER(d.clothingtype) = LOWER($2)) LEFT JOIN itemfavourite i ON (i.item_id = c.item_id) WHERE c.userid = $1";
      const { rows } = await pool.query(query, [userid, clothType]);
      if (rows.length > 0) {
        req.flash(
          "success_msg",
          `Clothing items of type "${clothType}" retrieved successfully.`
        );
      } else {
        req.flash(
          "error_msg",
          `No clothing items found for type "${clothType}".`
        );
      }
      res.send(rows);
    }
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "An error occurred. Please try again.");
    res.sendStatus(500);
  }
});

app.get("/clothdetail", isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const itemId = req.query.item_id;
    const query =
      "SELECT * FROM clothingitem c INNER JOIN occasion a ON (c.item_id = a.item_id) INNER JOIN category d ON (d.categoryname = c.categoryname) WHERE c.userid = $1 AND c.item_id = $2";
    const { rows } = await pool.query(query, [userid, itemId]);

    if (rows.length === 0) {
      req.flash("error_msg", "Clothing item not found.");
      res.status(404).send("Clothing item not found");
      return;
    }

    req.flash("success_msg", "Clothing item details retrieved successfully.");
    res.send(rows);
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "An error occurred. Please try again.");
    res.sendStatus(500);
  }
});

app.get("/outfitSlides", isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const clothingType = req.query.clothingtype;

    const query =
      "SELECT * FROM clothingitem c INNER JOIN category d ON (d.categoryname = c.categoryname AND LOWER(d.clothingtype) = LOWER($2)) WHERE c.userid = $1";
    const { rows } = await pool.query(query, [userid, clothingType]);

    if (rows.length === 0) {
      req.flash("error_msg", "No clothing items found for the specified type.");
      res.status(404).send("Clothing items not found");
      return;
    }

    req.flash("success_msg", "Clothing items retrieved successfully.");
    res.send(rows);
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "An error occurred. Please try again.");
    res.sendStatus(500);
  }
});

app.get("/loginlogout", (req, res) => {
  const loggedinBool = req.session.isAuthenticated;
  if (loggedinBool) res.json(loggedinBool);
  else res.json(false);
});

app.listen(port, () => console.log(`App listening on port ${port}`));
