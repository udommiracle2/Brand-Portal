const express = require("express");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const { toObjectId } = require("../utils/objectId");
const { requireAuth } = require("../middleware/auth");
const { upload, uploadDir } = require("../middleware/upload");

const router = express.Router();
router.use(requireAuth);

function collection() {
  return db.getDB().collection("products");
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).map((s) => s.trim()).filter(Boolean);
  } catch {
    // fall through to comma-split below
  }
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function serialize(doc) {
  const { _id, brandId, ...rest } = doc;
  return { id: _id.toString(), brandId: brandId.toString(), ...rest };
}

async function findOwned(id, brandId) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  return collection().findOne({ _id: objectId, brandId: toObjectId(brandId) });
}

// GET /api/products?search=&category=&status=available|out_of_stock|unavailable
router.get("/", async (req, res, next) => {
  try {
    const { search = "", category = "", status = "" } = req.query;

    const query = { brandId: toObjectId(req.brandId) };

    if (search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ name: regex }, { category: regex }];
    }
    if (category.trim()) {
      query.category = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }
    if (status === "available") {
      query.available = true;
      query.stock = { $gt: 0 };
    } else if (status === "out_of_stock") {
      query.stock = { $lte: 0 };
    } else if (status === "unavailable") {
      query.available = false;
    }

    const docs = await collection().find(query).sort({ updatedAt: -1 }).toArray();
    res.json({ products: docs.map(serialize) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const doc = await findOwned(req.params.id, req.brandId);
    if (!doc) return res.status(404).json({ error: "Product not found." });
    res.json({ product: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

router.post("/", upload.array("images", 6), async (req, res, next) => {
  try {
    const { name, category, description = "", price, stock = 0 } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "Name, category and price are required." });
    }

    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const now = new Date();

    const doc = {
      brandId: toObjectId(req.brandId),
      name: name.trim(),
      category: category.trim(),
      description,
      price: Number(price),
      sizes: toStringArray(req.body.sizes),
      colours: toStringArray(req.body.colours),
      stock: Number(stock) || 0,
      images,
      available: true,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await collection().insertOne(doc);
    res.status(201).json({ product: serialize({ _id: insertedId, ...doc }) });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", upload.array("images", 6), async (req, res, next) => {
  try {
    const existing = await findOwned(req.params.id, req.brandId);
    if (!existing) return res.status(404).json({ error: "Product not found." });

    const { name, category, description, price, stock, available, keepImages } = req.body;

    let images = existing.images || [];
    if (keepImages !== undefined) {
      images = toStringArray(keepImages);
    }
    const newImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
    images = [...images, ...newImages];

    const update = {
      name: name ?? existing.name,
      category: category ?? existing.category,
      description: description ?? existing.description,
      price: price !== undefined ? Number(price) : existing.price,
      sizes: req.body.sizes !== undefined ? toStringArray(req.body.sizes) : existing.sizes,
      colours: req.body.colours !== undefined ? toStringArray(req.body.colours) : existing.colours,
      stock: stock !== undefined ? Number(stock) : existing.stock,
      images,
      available:
        available !== undefined ? available === "true" || available === true : existing.available,
      updatedAt: new Date(),
    };

    await collection().updateOne({ _id: existing._id }, { $set: update });
    const doc = await collection().findOne({ _id: existing._id });
    res.json({ product: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await findOwned(req.params.id, req.brandId);
    if (!existing) return res.status(404).json({ error: "Product not found." });

    (existing.images || []).forEach((imgPath) => {
      const filePath = path.join(uploadDir, path.basename(imgPath));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await collection().deleteOne({ _id: existing._id });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/stock  { stock }
router.patch("/:id/stock", async (req, res, next) => {
  try {
    const existing = await findOwned(req.params.id, req.brandId);
    if (!existing) return res.status(404).json({ error: "Product not found." });

    const stock = Number(req.body.stock);
    if (Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({ error: "Stock must be a non-negative number." });
    }

    await collection().updateOne({ _id: existing._id }, { $set: { stock, updatedAt: new Date() } });
    const doc = await collection().findOne({ _id: existing._id });
    res.json({ product: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/availability  { available }
router.patch("/:id/availability", async (req, res, next) => {
  try {
    const existing = await findOwned(req.params.id, req.brandId);
    if (!existing) return res.status(404).json({ error: "Product not found." });

    const available = !!req.body.available;
    await collection().updateOne(
      { _id: existing._id },
      { $set: { available, updatedAt: new Date() } }
    );
    const doc = await collection().findOne({ _id: existing._id });
    res.json({ product: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/price  { price }
router.patch("/:id/price", async (req, res, next) => {
  try {
    const existing = await findOwned(req.params.id, req.brandId);
    if (!existing) return res.status(404).json({ error: "Product not found." });

    const price = Number(req.body.price);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ error: "Price must be a non-negative number." });
    }

    await collection().updateOne({ _id: existing._id }, { $set: { price, updatedAt: new Date() } });
    const doc = await collection().findOne({ _id: existing._id });
    res.json({ product: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
