const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");
const { request } = require("express");

const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  checkEmail: function(email) {
    for (const user in this) {
      if (user.email === email) return true;
    }
  
    return false;
  }
};

function generateRandomString() {
  let output = "";
  let temp;

  const ranges = [[48, 57], [65, 90], [97, 122]];

  for (let i = 0; i < 6; i++) {
    temp = Math.floor(Math.random() * 3);
    output += String.fromCharCode(ranges[temp][0] + Math.floor(Math.random() * (ranges[temp][1] - ranges[temp][0])));
  }

  return output;
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase, user: users[req.cookies.user_id] });
});

app.get("/register", (req, res) => {
  res.render("urls_register", { user: users[req.cookies.user_id] });
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    res.render("urls_register", { user: users[req.cookies.user_id] });
    return;
  } else if (users.checkEmail(req.body.email)) {
    res.statusCode = 400;
    res.render("urls_register", { user: users[req.cookies.user_id] });
    return;
  }

  let id = generateRandomString();
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  };
  
  res.cookie("user_id", id);
  res.render("urls_index", { urls: urlDatabase, user: users[id] });
});

app.post("/login", (req, res) => {
  if (req.cookies.user_id === undefined) return;

  res.render("urls_index", { urls: urlDatabase, user: users[req.cookies.user_id] });
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.render("urls_index", { urls: urlDatabase, user: undefined })
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.render("urls_index", { urls: urlDatabase, user: users[req.cookies.user_id]});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies.user_id] });
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = "http://www." + req.body.longURL;

  const templateVars = {
    user: users[req.cookies.user_id],
    shortURL, 
    longURL: req.body.longURL
  };

  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL, 
    longURL: req.params.longURL 
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = "http://www." + req.body.longURL;
  res.render("urls_index", { urls: urlDatabase, user: users[req.cookies.user_id] });
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});