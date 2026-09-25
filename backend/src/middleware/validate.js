const { error } = require('../utils/response');

/**
 * Zod schema validator middleware
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[source]);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return error(res, 'Validation failed', 400, issues);
      }
      req[source] = parsed.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  validate,
};
