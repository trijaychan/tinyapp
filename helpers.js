// creates an object containing urls for a given ID
const urlsForUser = (id, database) => {
  const urls = {};

  if (!id) return urls;

  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      urls[shortURL] = database[shortURL];
    }
  }

  return urls;
};

// gets user ID based on a key-value pair and returns
// null if matching user is not found
const getUserByKey = (key, value, database) => {
  for (const user in database) {
    if (database[user][key] === value) {
      return user;
    }
  }

  return undefined;
};

// generates a random ID for shortURLs and user IDs
const generateRandomString = function() {
  let output = "";
  let temp;

  const ranges = [[48, 57], [65, 90], [97, 122]];

  for (let i = 0; i < 6; i++) {
    temp = Math.floor(Math.random() * 3);
    output += String.fromCharCode(ranges[temp][0] + Math.floor(Math.random() * (ranges[temp][1] - ranges[temp][0])));
  }

  return output;
};

module.exports = {
  urlsForUser,
  getUserByKey,
  generateRandomString
};