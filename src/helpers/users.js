const formatUserAuthentication = (user, token) => {
  const {
    id,
    first_name: firstName,
    last_name: lastName,
    username,
    avatar,
    phone_number: phoneNumber,
  } = user;
  return {
    avatar,
    id,
    username,
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    token,
  };
};

module.exports = { formatUserAuthentication };
