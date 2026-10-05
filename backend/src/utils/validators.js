const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

module.exports = { validateEmail, validatePassword };
