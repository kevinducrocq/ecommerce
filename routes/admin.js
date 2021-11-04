var router = require("express").Router();

var Category = require("../models/category");
var Product = require("../models/product");

// URL ajouter une catégorie

router.get("/add-category", function (request, response, next) {
  response.render("admin/add-category", {
    message: request.flash("success"),
  });
});

router.post("/add-category", function (request, response, next) {
  var category = new Category();

  category.name = request.body.name;

  // On sauvegarde
  category.save(function (err) {
    if (err) return next(err);
    request.flash("success", "La catégorie a bien été créée");

    return response.redirect("/add-category");
  });
});

// URL ajouter un produit

router.get("/add-product", function (request, response, next) {
  response.render("admin/add-product", {
    message: request.flash("success"),
  });
});

router.post("/add-product", function (request, response, next) {
  var product = new Product();

  product.category = request.body.category;
  product.name = request.body.name;
  product.price = request.body.price;
  product.image = request.body.image;

  // On sauvegarde
  product.save(function (err) {
    if (err) return next(err);
    request.flash("success", "Le nouveau produit a bien été créé");

    return response.redirect("/add-product");
  });
});

module.exports = router;
