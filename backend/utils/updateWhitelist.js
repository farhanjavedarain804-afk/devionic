const pickAllowedUpdates = (payload = {}, allowedFields = []) => {
  const updates = {};
  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updates[field] = payload[field];
    }
  }
  return updates;
};

module.exports = {
  pickAllowedUpdates,
};
