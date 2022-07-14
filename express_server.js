// Create web server with express
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // express now using EJS as its templating engine
app.use(express.urlencoded({ extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Helper Function - Generate random ID
const generateRandomString = () => {
  const list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomizedId = "";
  for (let i = 0; i < 6; i++) {
    let generate = Math.floor(Math.random() * list.length);
    randomizedId += list.charAt(generate);
  }
  return randomizedId;
};

// Helper Function - Determine if email exists
const getUserByEmail = function(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

// Route for /urls, renders to urls_index.ejs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // Saving key-value pairs to the urlDatabase
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/:${[id]}`);
});

// Route for /urls/new, renders to urls_new.ejs
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}
  res.render("urls_new", templateVars);
});

// Route for /urls/:id, renders to  urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.updatedlongURL
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
})

// Redirecting the generated shortUrl to it's corresponsding longUrl
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase.shortURL;
  res.redirect(longURL);
});

// Deleting Urls
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  console.log("delete", shortURL)
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("login_page", templateVars);
})

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(403).send("Missing email and/or password");
  }

  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(403).send("Invalid credentials");
  }

  res.cookie('user_id', users.id);
  res.redirect("/urls")
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Register users
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("registration_page", templateVars);
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Email or Password is empty");
  }
  
  const emailExists = getUserByEmail(users, email);
  if (emailExists) {
    return res.status(400).send("An account with this email already exists");
  }

  const id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: password
  }

  res.cookie('user_id', users.id);
  res.redirect("/urls");
});


// Set up an event handler to show that we are listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});