const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) return secret.trim();
  return 'devionic_secure_jwt_secret_change_in_production';
};

module.exports = {
  getJwtSecret,
};
