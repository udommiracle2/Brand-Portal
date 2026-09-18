const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");
const { toObjectId } = require("../utils/objectId");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function publicBrand(doc) {
  if (!doc) return null;
  const { _id, passwordHash, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function signToken(brandId) {
  return jwt.sign({ brandId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Brand name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const brands = getDB().collection("brands");
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await brands.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const doc = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      logo: null,
      description: "",
      location: "",
      phone: "",
      whatsapp: "",
      instagram: "",
      website: "",
      createdAt: new Date(),
    };

    const { insertedId } = await brands.insertOne(doc);
    const token = signToken(insertedId.toString());

    res.status(201).json({ token, brand: publicBrand({ _id: insertedId, ...doc }) });
  } catch (err) {
    // Handles a rare race where two requests with the same email insert at once.
    if (err.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const brands = getDB().collection("brands");
    const brand = await brands.findOne({ email: email.toLowerCase().trim() });

    if (!brand || !bcrypt.compareSync(password, brand.passwordHash)) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const token = signToken(brand._id.toString());
    res.json({ token, brand: publicBrand(brand) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
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

module.exports = router;
