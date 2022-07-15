// Create web server with express
const express = require("express");

const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cookieSession({
  name: "session",
  keys: ["oreo's with milk"], // secret key
  maxAge: 24 * 60 * 60 * 1000
}));

const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // express now using EJS as its templating engine
app.use(express.urlencoded({ extended: true}));

const urlDatabase = {};
const users = {};

const {generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');

// Routing to main page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Register users
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
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

  const hashPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: hashPassword
  };

  req.session.user_id = id;
  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("login_page", templateVars);
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(403).send("Missing email and/or password");
  }

  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(403).send("Invalid credentials");
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(400).send("Invalid credentials");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Route for /urls, renders to urls_index.ejs
app.get("/urls", (req, res) => {
  let templateVars ={ urls: null, user: null };

  if (req.session) {
    const userID = req.session.user_id;
    const user = users[userID];
    
    let urls = urlsForUser(urlDatabase, userID);
    templateVars = {urls, user};
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let userID = users[req.session.user_id].id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${[shortURL]}`);
});

// Route for /urls/new, renders to urls_new.ejs
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", {user});
  }
});

// Route for /urls/:id, renders to  urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render("urls_show", templateVars);

});

// Editing longURL
app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const shortURL = req.params.id;
    const longURL = req.body.updatedlongURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Redirecting the generated shortUrl to it's corresponsding longUrl
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Deleting Urls
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    let shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    return res.status(400).send("No access");
  }
});

// Set up an event handler to show that we are listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});