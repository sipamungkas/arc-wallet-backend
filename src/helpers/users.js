const formatUserAuthentication = (user, token) => {
  const {
    id,
    first_name: firstName,
    last_name: lastName,
    username,
    avatar,
  } = user;
  return {
    avatar,
    id,
    first_name: firstName,
    last_name: lastName,
    username,
    token,
  };
};

module.exports = { formatUserAuthentication };
