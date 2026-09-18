const express = require("express");
const { getDB } = require("../db");
const { toObjectId } = require("../utils/objectId");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const products = await getDB()
      .collection("products")
      .find(
        { brandId: toObjectId(req.brandId) },
        { projection: { stock: 1, available: 1, views: 1 } }
      )
      .toArray();

    const totalProducts = products.length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const availableProducts = products.filter((p) => p.available && p.stock > 0).length;
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);

    res.json({ totalProducts, availableProducts, outOfStock, totalViews });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
