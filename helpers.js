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

//Helper Function: Filtering urlDatabase
const urlsForUser = function(urlDatabase, userID) {
  let userUrls = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      userUrls[url] = urlDatabase[url];
    }
  } return userUrls;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};