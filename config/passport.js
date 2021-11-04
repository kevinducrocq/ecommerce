var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var User = require("../models/user");

//1- serialize et desirialize

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  // On vérifie que l'utilisateur existe
  User.findById(id, function (err, user) {
    // succès : OK
    done(err, user);
  });
});

//2- Passerelle
passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallBack: true,
    },
    function (email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(
            null,
            false,
            { message: "Utilisateur non-trouvé" }
            // request.flash("loginMessage", "Utilisateur non existant")
          );
        }
        if (!user.comparePassword(password)) {
          return done(
            null,
            false,
            { message: "Les mots de passe ne correspondent pas" }
            // request.flash(
            //   "loginMessage",
            //   "Les mots de passe ne correspondent pas"
            // )
          );
        }
        // retourne l'utilisateur si aucune erreur n'intervient
        return done(null, user);
      });
    }
  )
);

//3- Méthode personnalisée pour valider

exports.isAuthenticated = function (request, response, next) {
  if (request.isAuthenticated()) {
    return next();
  }
  response.redirect("/login");
};
