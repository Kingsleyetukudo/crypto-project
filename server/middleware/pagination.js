import { getPagination } from "../utils/pagination.js";

export const withPagination = (options = {}) => (req, res, next) => {
  req.pagination = getPagination(req.query, options);
  next();
};
