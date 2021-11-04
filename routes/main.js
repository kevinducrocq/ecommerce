var router = require("express").Router();
var category = require("../models/category");
var Product = require("../models/product");
var Cart = require("../models/cart");
var User = require("../models/user");
var async = require("async");
var stripe = require("stripe")(
  "sk_test_51Jk8oDCetpwHurzPmOoSU63hSiLKBl4vy8XxuwgHCICRVOqBlEQMr1JegxM6DRU8MgT02rzgZPoFM1EiHqUYoiJx00E148tMcy"
);

var Order = require("../models/order");

// création url de la page d'accueil
router.get("/", function (request, response) {
  response.render("main/home");
});

router.get("/about", function (request, response) {
  response.render("main/about");
});

// url pour afficher les produits d'une catégorie
router.get("/products/:id", function (request, response, next) {
  Product.find({ category: request.params.id })
    .populate("category")
    .exec(function (err, products) {
      if (err) return next(err);
      response.render("main/category", { products: products });
    });
});

////////////
// PANIER //
////////////

// Url pour afficher un produit
router.get("/product/:id", function (request, response, next) {
  Product.findById({ _id: request.params.id }, function (err, product) {
    if (err) return next(err);
    response.render("main/product", { product: product });
  });
});

router.post("/product/:product_id", function (request, response, next) {
  // On cherche le propriétaire du panier
  Cart.findOne({ owner: request.user._id }, function (err, cart) {
    // on ajoute le produit au panier
    cart.items.push({
      item: request.body.product_id,
      price: parseFloat(request.body.priceValue),
      quantity: parseInt(request.body.quantity),
    });

    // total du panier est incrémenté du prix des produits ajoutés
    cart.total = (cart.total + parseFloat(request.body.priceValue)).toFixed(2);

    // sauvegarde du panier dans la bdd
    cart.save(function (err) {
      if (err) return next(err);

      // Si ok, on redirige l'utilisateur vers la page CART
      return response.redirect("/cart");
    });
  });
});

// Route CART
router.get("/cart", function (request, response, next) {
  Cart.findOne({ owner: request.user._id })
    .populate("items.item")
    .exec(function (err, foundCart) {
      if (err) return next(err);
      response.render("main/cart", {
        foundCart: foundCart,
        message: request.flash("remove"),
      });
    });
});

// Route pour supprimer un article du panier
router.post("/remove", function (request, response, next) {
  //identifier le propriétaire du panier
  Cart.findOne({ owner: request.user._id }, function (err, foundCart) {
    // On supprime de la liste le produit
    foundCart.items.pull(String(request.body.item));
    // On décrémente la somme globale
    foundCart.total = (
      foundCart.total - parseFloat(request.body.price)
    ).toFixed(2);
    // sauvegarde dans la BDD
    foundCart.save(function (err, found) {
      if (err) return next(err);
      // On affiche un message
      request.flash("remove", "Produit supprimé");
      // On redirige vers le panier
      response.redirect("/cart");
    });
  });
});

//Payment//

router.get("/paymentOk", function (request, response) {
  response.render("main/paymentOk.js");
});

router.post("/payment", function (request, response) {
  var stripeToken = request.body.stripeToken;

  var charge = {
    amount: request.body.stripeMoney * 100,
    currency: "EUR",
    card: stripeToken,
  };

  stripe.charges.create(charge, function (err, resp) {
    if (err) {
      console.log(err);
    } else {
      if (resp.paid) {
        var data = { success: "Paiement accepté" };
        response.render("main/paymentOk", data);
      }
      var order = new Order({
        user: user,
        cart: Cart,
        address: User.address,
        name: User.lastname,
        paymentId: charge.card.id,
      });
      order.save(function (err, result) {
        Cart = null;
      });
    }
  });
});

module.exports = router;
