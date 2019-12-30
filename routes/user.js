const router = require("express").Router();
const User = require("../models/user");
const passport = require("passport");
const passportConf = require("../config/passport");
const Cart = require("../models/cart");
const Category = require("../models/category");
const async = require("async");

router.get("/login", function(req, res) {
  if (req.user) return res.redirect("/");
  res.render("accounts/login", { message: req.flash("loginMessage") });
});

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/profile", (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return next(err);
    res.render("accounts/profile", { user: user });
  });
});

router.get("/signup", (req, res, next) => {
  if (req.user) return res.redirect("/");

  res.render("accounts/signup", { errors: req.flash("errors") });
});

router.post("/signup", (req, res, next) => {
  async.waterfall([
    callback => {
      const user = new User();

      user.profile.name = req.body.name;
      user.password = req.body.password;
      user.email = req.body.email;
      user.role = req.body.role;

      user.profile.picture = user.gravatar();

      User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (existingUser) {
          req.flash("errors", "this user is already taken");
          return res.redirect("/signup");
        } else {
          user.save(function(err, user) {
            if (err) return next(err);
            callback(null, user);
          });
        }
      });
    },

    user => {
      const cart = new Cart();
      cart.owner = user._id;
      cart.save(err => {
        if (err) return next(err);
        req.logIn(user, err => {
          if (err) return next(err);
          res.redirect("/profile");
        });
      });
    }
  ]);
});

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

router.get("/edit-profile", (req, res, next) => {
  Category.find({ Category: req.params.id }, (err, categories) => {
    if (err) return next(err);
    res.render("accounts/edit-profile", {
      categories,
      success: req.flash("success")
    });
  });
});

router.post("/edit-profile", (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;
    if (req.body.sallary) user.sallary = req.body.sallary;
    if (req.body.subjects) user.subjects = req.body.subjects;

    user.save(err => {
      if (err) return next(err);
      req.flash("success", "Successfully Edited your Profile");
      return res.redirect("/edit-profile");
    });
  });
});

router.get("/reserve/:id", (req, res, next) => {
  User.findOne({ _id: req.params.id }, (err, teacher) => {
    if (err) return next(err);
    res.render("accounts/reserve", { teacher });
  });
});

router.get("/reserve-agreement", (req, res, next) => {
  User.findOne({ user: req.params.id }, (err, user) => {
    if (err) return next(err);
    res.render("accounts/reserve", { user: user });
  });
});
router.post("/reserve-agreement", (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return next(err);
    if (req.body.subject) user.subjects += req.body.subject.split(",");

    user.save(err => {
      if (err) return next(err);
      req.flash("success", "Do you want to join this course?");
      return res.redirect("/profile");
    });
  });
});
module.exports = router;
