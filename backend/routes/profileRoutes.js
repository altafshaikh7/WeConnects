const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { bio, userId } = req.body;

  // future: DB me save karna
  console.log("Bio saved:", bio);

  res.json({ msg: "Saved" });
});

module.exports = router;