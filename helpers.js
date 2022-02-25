// creates an object containing urls for a given ID
const urlsForUser = (id, database) => {
  // an object which will store the urls
  const urls = {};

  // returns an empty object if id is not valid
  if (!id) return urls;

  // for loop that runs each shortened URL in the databse
  for (let shortURL in database) {
    // creates a new key-value pair in urls object if
    // a shortened URL has the user ID as the given ID
    if (database[shortURL].userID === id) {
      urls[shortURL] = database[shortURL];
    }
  }

  return urls;
};

// gets user ID based on a key-value pair and returns
// undefined if matching user is not found
const getUserByKey = (key, value, database) => {
  // for loop that runs for each user in the database
  for (const user in database) {
    // if key-value pair is found, returns the key/ID
    // it was found in
    if (database[user][key] === value) {
      return user;
    }
  }

  return undefined;
};

// generates random string which will be used for
// shortURL and user IDs
const generateRandomString = function() {
  let result = "";
  let temp;

  // the ranges of the demical values of numbers,
  // and uppercase and lowercase letters
  const ranges = [[48, 57], [65, 90], [97, 122]];

  for (let i = 0; i < 6; i++) {
    // temp determines which range is used
    temp = Math.floor(Math.random() * 3);
    // generates a random decimal number between the
    // given range and converts it into characters
    result += String.fromCharCode(ranges[temp][0] + Math.floor(Math.random() * (ranges[temp][1] - ranges[temp][0])));
  }

  return result;
};

module.exports = {
  urlsForUser,
  getUserByKey,
  generateRandomString
};