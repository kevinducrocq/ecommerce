var router = require("express").Router();
var User = require("../models/user");
var Cart = require("../models/cart");
var async = require("async");

var passport = require("passport");
var passportConf = require("../config/passport");

// url SIGN UP
router.get("/signup", function (request, response) {
  response.render("account/signup", { errors: request.flash("errors") });
});

router.post("/signup", function (request, response, next) {
  
  async.waterfall([
    function (callback) {
      var user = new User();

      user.profile.firstname = request.body.firstname;
      user.profile.lastname = request.body.lastname;
      user.email = request.body.email;
      user.password = request.body.password;
      user.profile.picture = user.gravatar();

      //fait une requête vers la BDD
      User.findOne({ email: request.body.email }, function (err, existingUser) {
        if (existingUser) {
          // console.log(request.body.email + "Déja enregistré dans la BDD");

          request.flash(
            "errors",
            "Email déjà présent dans la base de données."
          );
          return response.redirect("/signup");
        } else {
          // On enregistre alors dans la BDD
          user.save(function (err) {
            var cart = new Cart();
            cart.owner = user._id;
            cart.save(function (err) {
              if (err) return next(err);
              request.logIn(user, function (err) {
                if (err) return next(err);
                return response.redirect("/profile");
              });
            });
            if (err) return next(err);
            // response.json("Nouvel utilisateur créé");
            callback(null, user);
            return response.redirect("/login");
          }); // fin de save
        }
      }); // fin de findOne
    },
  ]);
});

// url LOGIN
router.get("/login", function (request, response) {
  if (request.user) return response.redirect("/");

  response.render("account/login", { message: request.flash("loginMessage") });
});

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// url PAGE PROFIL
router.get("/profile", function (request, response) {
  User.findOne({ _id: request.user._id }, function (err, user) {
    if (err) return next(err);
    response.render("account/profile", { user: user });
  });
});

// url LOGOUT
router.get("/logout", function (request, response, next) {
  request.logout();
  response.redirect("/");
});

// url EDIT-PROFILE
router.get("/edit-profile", function (request, response, next) {
  response.render("account/edit-profile", {
    message: request.flash("success"),
  });
});

router.post("/edit-profile", function (request, response, next) {
  User.findOne({ _id: request.user._id }, function (err, user) {
    if (err) return next(err);
    if (request.body.firstname) user.profile.firstname = request.body.firstname;
    if (request.body.lastname) user.profile.lastname = request.body.lastname;
    if (request.body.address) user.address = request.body.address;

    user.save(function (err) {
      if (err) return next(err);
      request.flash("success", "Vos informations ont bien été modifiées");
      return response.redirect("/edit-profile");
    });
  });
});

module.exports = router;
