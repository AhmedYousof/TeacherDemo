const router = require("express").Router();
const Category = require("../models/category");
const User = require("../models/user");

router.get("/add-subject", (req, res, next) => {
  res.render("admin/add-category", { message: req.flash("success") });
});

router.post("/add-subject", (req, res, next) => {
  const category = new Category();
  category.name = req.body.name;

  category.save(err => {
    if (err) return next(err);
    req.flash("success", "Successfully Add Category");
    return res.redirect("/add-subject");
  });
});

module.exports = router;
