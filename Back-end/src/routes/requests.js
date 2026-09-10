const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const c = require("../../controllers/requestController");

router.use(auth);   // every route below requires a valid token

router.get("/", c.list);
router.post("/", c.create);
router.get("/:id", c.getOne);
router.patch("/:id", c.update);
router.post("/:id/convert", c.convert);
router.get("/:id/activity", c.activity);

module.exports = router;