const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = "http://www." + req.body.longURL;
  const templateVars = { shortURL, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});