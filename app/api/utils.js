const jwt = require("jsonwebtoken");
const User = require("../models/user").default;

exports.createToken = function (user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.secret, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
};

exports.decodeToken = function (token) {
  var userInfo = {};
  try {
    var decoded = jwt.verify(token, process.env.secret);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {}

  return userInfo;
};

exports.validate = async function (decoded, request) {
  const user = await User.findOne({ _id: decoded.id });
  if (!user) {
    return { isValid: false };
  } else {
    return { isValid: true };
  }
};

exports.getUserIdFromRequest = function (request) {
  var userId = null;
  try {
    const authorization = request.headers.authorization;
    var token = authorization.split(" ")[1];
    var decodedToken = jwt.verify(token, process.env.secret);
    userId = decodedToken.id;
  } catch (e) {
    userId = null;
  }
  return userId;
};
