// helpersTeest.js

const { assert } = require('chai');
const { getUserByKey } = require('../helpers.js');

// a fake user database for testing
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// getUserByKey function
describe('getUserByKey', function() {
  // testing function with a valid email
  it('should return a user with valid email', function() {
    const user = getUserByKey("email", "user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(expectedUserID, user);
  });

  // testing function with an invalid email
  it('should return undefined', function() {
    const user = getUserByKey("email", "user3@example.com", testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(expectedUserID, user);
  });
});