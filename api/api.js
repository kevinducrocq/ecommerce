var router = require("express").Router();
var async = require("async");
var faker = require("faker");

var Category = require("../models/category");
var Product = require("../models/product");

// création de 2 URLS get / post

// get : création à partir d'un nom de catégorie

router.get("/:name", function (request, response, next) {
  async.waterfall([
    //tableau de fonctions
    function (callback) {
      Category.findOne({ name: request.params.name }, function (err, category) {
        if (err) return next(err);
        callback(null, category);
      });
    },

    function (category, callback) {
      for (var i = 0; i < 15; i++) {
        var product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();
        product.save();
      }
    },
  ]);
  response.json({ message: "success" });
});

module.exports = router;
