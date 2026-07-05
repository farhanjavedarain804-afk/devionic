const parsePagination = (query = {}, defaults = {}) => {
  const page = Math.max(parseInt(query.page || defaults.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || defaults.limit || '50', 10), 1), defaults.maxLimit || 200);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
