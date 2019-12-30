const router = require("express").Router();
const User = require("../models/user");
const Category = require("../models/category");
const Cart = require("../models/cart");

const dateFormat = require("dateformat");

/*let paginate = (req, res, next) => {
  const perPage = 9;
  let page = req.params.page;
  Product.find()
    .skip(perPage * page)
    .limit(perPage)
    .populate("category")
    .exec((err, products) => {
      if (err) return next(err);
      Product.count().exec((err, count) => {
        if (err) return next(err);
        res.render("main/product-main", {
          products: products,
          pages: count / perPage
        });
      });
    });
};*/

router.get("/cart", (req, res, next) => {
  Cart.findOne({ owner: req.user._id })
    .populate("courses.course")
    .exec((err, foundCart) => {
      if (err) return next(err);
      res.render("main/cart", {
        foundCart: foundCart,
        message: req.flash("remove")
      });
    });
});

const list = new Cart();
const Onecourse = list.courses;

router.post("/notifaction/:id", (req, res, next) => {
  User.findById({ _id: req.params.id }, (err, one) => {
    if (err) return next(err);
    one.students.push({
      student: req.body.student_id,
      name: req.body.student_name,
      picture: req.body.student_pic,
      subject: req.body.subject,
      address: req.body.student_address,
      date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
    });
    const user = req.user;
    user.courses.push({
      teacher: req.body.teacher_id,
      name: req.body.teacher_name,
      subject: req.body.teacher_subject,
      price: req.body.teacher_sallary,
      address: req.body.teacher_address,
      date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
      //      total: +req.body.teacher_sallary
    });
    user.total = (user.total + parseFloat(req.body.teacher_sallary)).toFixed(2);

    user.save(err => {
      if (err) return next(err);
      return;
    });

    one.save(err => {
      if (err) return next(err);
      return res.redirect("/cart");
    });
  });
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    if (err) return next(err);
    foundCart.courses.pull(String(req.body.item));
    foundCart.total = (
      foundCart.total - parseFloat(req.body.teacher_sallary)
    ).toFixed(2);

    foundCart.save(function(err, found) {
      if (err) return next(err);
      return;
    });
  });
});

router.get("/notifaction/:id", (req, res, next) => {
  User.findOne({ _id: req.params.id }, (err, teacher) => {
    if (err) return next(err);
    res.render("main/students-list", {
      teacher
    });
  });
});

router.get("/courses-list/:id", (req, res, next) => {
  User.findOne({ _id: req.params.id }, (err, student) => {
    if (err) return next(err);
    res.render("main/courses-list", {
      student
    });
  });
});

router.post("/remove-student", (req, res, next) => {
  const one = req.user;
  one.students.pull(String(req.body.item));
  one.save(function(err) {
    if (err) return next(err);
    res.redirect("/profile");
  });
});

router.post("/product/:product_id", (req, res, next) => {
  Cart.findOne({ owner: req.user._id }, (err, cart) => {
    cart.courses.push({
      course: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });

    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save(err => {
      if (err) return next(err);
      return res.redirect("/cart");
    });
  });
});

router.post("/remove", function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    foundCart.courses.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found) {
      if (err) return next(err);
      req.flash("remove", "Successfully removed");
      res.redirect("/cart");
    });
  });
});
/*router.post("/search", (req, res, next) => {
  res.redirect("/search?q=" + req.body.q);
});
router.get("/search", (req, res) => {
  if (req.query.q) {
    Product.search(
      {
        query_string: { query: req.query.q }
      },
      (err, results) => {
        results: if (err) return next(err);
        const data = results.hits.hits.map(hit => {
          return hit;
        });
        res.render("main/search-result", {
          query: req.query.q,
          data: data
        });
      }
    );
  }
});*/

router.get("/", (req, res, next) => {
  User.find({}, function(err, products) {
    if (err) {
      console.log(err);
    } else {
      res.render("main/product-main", { products: products });
    }
  });
});

router.get("/page/:page", (req, res, next) => {
  paginate(req, res, next);
});

router.get("/about", (req, res) => {
  res.render("main/about");
});

router.get("/products/:id", (req, res, next) => {
  Category.findById({ _id: req.params.id }, (err, subjects) => {
    if (err) return next(err);
    res.render("main/category", {
      subjects
    });
  });
});

router.get("/product/:id", (req, res, next) => {
  User.findById({ _id: req.params.id }, (err, users) => {
    if (err) return next(err);
    res.render("main/product", {
      users: users
    });
  });
});

module.exports = router;
