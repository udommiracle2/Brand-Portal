const { ObjectId } = require("mongodb");

// Returns a valid ObjectId, or null if the given string isn't one
// (instead of throwing, which would otherwise crash every route on a bad id).
function toObjectId(id) {
  if (!id || !ObjectId.isValid(id)) return null;
  // Guards against 12-char plain strings that ObjectId.isValid technically
  // accepts (e.g. hex-ish 12-char tokens) but aren't real Mongo ids.
  return new ObjectId(String(id));
}

module.exports = { toObjectId, ObjectId };
