// express_server.js

// dependencies and helper functions
const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { urlsForUser, getUserByKey, generateRandomString } = require("./helpers");

const app = express(); // creates an express application
const PORT = 8080; // the application will listen to this port number

// databases for users and shortened URLs
const urlDatabase = {};
const users = {};

app.set("view engine", "ejs"); // sets the template engine to ejs
app.use(bodyParser.urlencoded({extended: true})); // sets application middleware to bodyParser

// creates a new cookie session middleware which will
// store the user id
app.use(cookieSession({
  user_id: "",
  keys: ["12345", "abcde"]
}));

// GET "/"
//   if logged in redirects to "/urls"
//   if not logged in redirects to "/login"
app.get("/", (req, res) => {
  const user = users[req.session.user_id];

  if (!user) { // if no user is logged in
    res.redirect("/login");
  } else { // if a user is logged in
    res.redirect("/urls");
  }
});

// GET "/urls"
//   if logged in renders html with header and URL table
//   if not logged in returns HTML with an error message
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  if (!user) {
    res.status(400).send("Please login to see your URLs!");
  } else {
    const urls = urlsForUser(user.id, urlDatabase);
    res.render("urls_index", { urls, user });
  }
});

// GET "/register"
//   if logged in redirects to "/urls"
//   if not logged in renders an HTML with a register form
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];

  if (!user) {
    res.render("urls_register", { user });
  } else {
    res.redirect("/urls");
  }
});

// POST "/register"
//   if given email and password are valid then creates a
//   new user, logs them in, and redirects to "/urls"
//   if given email and password are invalid, returns HTML
//   with an error message
app.post("/register", (req, res) => {
  const user = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  };

  if (!user.email || !user.password) { // the given email or password is invalid
    res.status(400).send("Please enter a valid email address/password.\n");
  } else if (getUserByKey("email", req.body.email, users)) { // if the given email is already registered
    res.status(400).send("Email address is already in use.\n");
  } else {
    user.password = bcrypt.hashSync(user.password, 10); // hashes password
    users[user.id] = user; // adds newly created user to the users database
    req.session.user_id = user.id; // sets cookie for new user
    res.redirect("/urls");
  }
});

// GET "/login"
//   if logged in redirects to "/urls"
//   if not logged in renders an HTML with a login form
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  if (!user) {
    res.render("urls_login", { user });
  } else {
    res.redirect("/urls");
  }
});

// POST "/login"
//   if email/password is valid, sets cookie for user
//   and redirects to "/urls"
//   if email/password is invalid, returns HTML with an
//   error message
app.post("/login", (req, res) => {
  // finds the user ID of the given email (if possible)
  const id = getUserByKey("email", req.body.email, users);
  const user = users[id];

  // if email is not registered or password is incorrect
  if (!user || !bcrypt.compareSync(req.body.password, users[id].password)) {
    res.status(400).send("Incorrect email address or password.\n");
  } else {
    req.session.user_id = id; // sets cookie for user
    res.redirect("/urls");
  }
});

// POST "/logout"
//   deletes cookies and redirects to /urls
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  res.redirect("/urls");
});

// GET "/urls/new"
//   if logged in, renders HTML with the header and 
//   a shortened URL form
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];

  if (!user) {
    res.render("urls_login",  { user });
  } else {
    res.render("urls_new", { user });
  }
});

// POST "/urls"
//   if logged in, shortens a given long URL for the current
//   user and redirects to "urls/:shortURL"
//   if not logged in, returns HTML with an error message
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];

  if (!user) {
    res.status(400).send("Please login to access URLs\n");
  } else {
    const shortURL = generateRandomString();
    const longURL = "http://www." + req.body.longURL;
    
    // adds new shortened URL to url database
    urlDatabase[shortURL] = {
      longURL,
      userID: user.id // associates URL to current user
    };
    
    res.redirect("/urls/" + shortURL);
  }
});

// GET "/urls/:shortURL"
//   if user is logged in and owns the URL then renders
//   HTML with the header, the short URL and an editing form
//   returns HTML with an error message if:
//      - user is not logged in
//      - URL for the given ID does not exist
//      - user does not have access to given URL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;

  if (!user) { // if no user is logged in
    res.status(400).send("Please login to access URLs.\n");
  } else if (!urlDatabase[shortURL]) { // if a URL with the given URL does not exist
    res.status(400).send("URL for the given ID does not exist.\n");
  } else if (user.id !== urlDatabase[shortURL].userID) { // if URL user ID does not match logged user ID
    res.status(400).send("No access to given URL.\n");
  } else {
    const longURL = req.params.longURL;
    res.render("urls_show", { longURL, shortURL, user });
  }
});

// POST "/urls/:shortURL/edit"
//   if user is logged in and owns the URL then it is updated
//   and then redirected to "/urls"
//   returns HTML with an error message if:
//      - user is not logged in
//      - user does not have access to given URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const longURL = req.params.longURL;

  if (!user) {
    res.status(400).send("Please login to access URLs.\n");
  } else if (user.id !== urlDatabase[shortURL].userID) {
    res.status(400).send("No access to given URL.\n");
  } else {
    // edits the longURL for the given ID
    urlDatabase[shortURL].longURL = "http://www." + longURL;
    res.redirect("/urls");
  }
});

// POST "/urls/:shortURL/delete"
//   if user is logged in and owns the URL then it is deleted
//   and then redirected to "/urls"
//   returns HTML with an error message if:
//      - user is not logged in
//      - user does not have access to given URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;

  if (!user) {
    res.status(400).send("Please login to access URLs.\n");
  } else if (user.id !== urlDatabase[shortURL].userID) {
    res.status(400).send("No access to given URL.\n");
  } else {
    // deletes URL for url database
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

// GET "/u/:shortURL"
//   if URL for the given id exists then redirects to its
//   corresponding long URL
//   if URL for the given id does not exist then returns
//   HTML with an error message
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.status(400).send("URL for the given ID does not exist.\n");
  }
});

// express application listens to what port number PORT stores
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});