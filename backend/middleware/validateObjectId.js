const mongoose = require("mongoose");
const validateObjectId =
  (...names) =>
  (req, res, next) => {
    for (const name of names) {
      if (!mongoose.isObjectIdOrHexString(req.params[name]))
        return res.status(400).json({ message: `Invalid ${name}` });
    }
    next();
  };
module.exports = validateObjectId;
