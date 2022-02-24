const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { urlsForUser, getUserByKey, generateRandomString } = require("./helpers");

const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abcde"
  },
};

const users = {};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  user_id: "",
  keys: ["bruh"]
}));

// index page 

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  const user = users[req.session.user_id];
  res.render("urls_index", { urls, user });
});

// register page

app.get("/register", (req, res) => {
  res.render("urls_register", { user: users[req.session.user_id] });
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || getUserByKey("email", req.body.email, users)) {
    res.statusCode = 400;
    res.render("urls_register", { user: users[req.session.user_id] });
    return;
  }

  let id = generateRandomString();
  users[id] = {
    id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  
  req.session.user_id = id;
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  const user = users[id];
  res.render("urls_index", { urls, user });
});

// login page

app.get("/login", (req, res) => {
  res.render("urls_login", { user: users[req.session.user_id] });
})

app.post("/login", (req, res) => {
  const id = getUserByKey("email", req.body.email, users);

  if (!id || !bcrypt.compareSync(req.body.password, users[id].password)) {
    res.statusCode = 403;
    res.render("urls_login", { user: users[req.session.user_id] });
  } else {
    req.session.user_id = id;
    const urls = urlsForUser(id, urlDatabase);
    const user = users[id];
    res.render("urls_index", { urls, user });
  }
});

// post logout

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  res.render("urls_index", { urls, user: undefined });
});

// new url page

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_login",  { user: users[req.session.user_id] });
  } else {
    res.render("urls_new", { user: users[req.session.user_id] });
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: "http://www." + req.body.longURL,
    userID: req.session.user_id
  };

  const templateVars = {
    user: users[req.session.user_id],
    shortURL, 
    longURL: req.body.longURL
  };

  res.render("urls_show", templateVars);
});

// shortURL functionalities

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please login to access URLs.\n");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("URL with the given ID does not exist.\n")
  } else if (urlDatabase[req.params.shortURL]) {
    if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
      res.status(400).send("No access to given ID.\n");
    }
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL, 
      longURL: req.params.longURL 
    };

    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please login to access URLs.\n");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("URL with the given ID does not exist.\n")
  } else if (urlDatabase[req.params.shortURL]) {
    if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
      res.status(400).send("No access to given ID.\n");
    }
  } else {
    urlDatabase[req.params.shortURL].longURL = "http://www." + req.body.longURL;

    const urls = urlsForUser(req.session.user_id, urlDatabase);
    const user = users[req.session.user_id];
    res.render("urls_index", { urls, user });
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please login to access URLs.\n");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("URL with the given ID does not exist.\n")
  } else if (urlDatabase[req.params.shortURL]) {
    if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
      res.status(400).send("No access to given ID.\n");
    }
  } else {
    delete urlDatabase[req.params.shortURL];
    const urls = urlsForUser(req.session.user_id, urlDatabase);
    const user = users[req.session.user_id];
    res.render("urls_index", { urls, user });
  }
});

// when server launches

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});