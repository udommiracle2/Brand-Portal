const express = require("express");
const { getDB } = require("../db");
const { toObjectId } = require("../utils/objectId");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();
router.use(requireAuth);

function publicBrand(doc) {
  if (!doc) return null;
  const { _id, passwordHash, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

router.get("/", async (req, res, next) => {
  try {
    const id = toObjectId(req.brandId);
    if (!id) return res.status(404).json({ error: "Brand not found." });

    const brand = await getDB().collection("brands").findOne({ _id: id });
    if (!brand) return res.status(404).json({ error: "Brand not found." });

    res.json({ brand: publicBrand(brand) });
  } catch (err) {
    next(err);
  }
});

router.put("/", upload.single("logo"), async (req, res, next) => {
  try {
    const id = toObjectId(req.brandId);
    if (!id) return res.status(404).json({ error: "Brand not found." });

    const brands = getDB().collection("brands");
    const existing = await brands.findOne({ _id: id });
    if (!existing) return res.status(404).json({ error: "Brand not found." });

    const { name, description, location, phone, whatsapp, instagram, website } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : existing.logo;

    const update = {
      name: name ?? existing.name,
      description: description ?? existing.description,
      location: location ?? existing.location,
      phone: phone ?? existing.phone,
      whatsapp: whatsapp ?? existing.whatsapp,
      instagram: instagram ?? existing.instagram,
      website: website ?? existing.website,
      logo,
    };

    await brands.updateOne({ _id: id }, { $set: update });
    const brand = await brands.findOne({ _id: id });

    res.json({ brand: publicBrand(brand) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
