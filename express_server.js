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

const generateRandomString = () => {
  const list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomizedId = "";
  for (let i = 0; i < 6; i++) {
    let generate = Math.floor(Math.random() * list.length);
    randomizedId += list.charAt(generate);
  }
  return randomizedId;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});


// Add route representing the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route for /urls, renders to urls_index.ejs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
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
  res.render("urls_new");
});

// Route for /urls/:id, renders to  urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

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
app.post("/login", (req, res) => {
  const userName = req.body.username;
  res.cookie('username', userName);
  res.redirect("/urls")
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// Set up an event handler to show that we are listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});