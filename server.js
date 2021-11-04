// 3 librairies pour gérer les messages flash
var flash = require("express-flash");
var session = require("express-session");
var cookieParser = require("cookie-parser");

// inclure la librairie express(serveur)
var express = require("express");

// morgan(passerelle)
var morgan = require("morgan");

// librairie mongoose
var mongoose = require("mongoose");
var mongo = require("mongodb");

// moteur de templates
var ejs = require("ejs");
var engine = require("ejs-mate");

// Passerelle pour se connecter à node (node => bdd)
var passport = require("passport");

// stockage des sessions (id) et cookies
var mongoStore = require("connect-mongo")(session);

// déclaration du modèle category
var Category = require("./models/category");

// pour utiliser le middleware (gestion des qtés dans le panier)
var cartLength = require("./middlewares/middleware");

// stocker l'objet express dans une variable plus courte
var app = express();

// Inclure le fichier secret.js
var secret = require("./config/secret");

// connexion à la BDD

mongoose
  .connect(secret.database, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// PASSERELLES(middlewares)
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(morgan("dev"));
app.engine(ejs, engine);
app.set("view engine", "ejs");

// affichage des messages flash et des gestin des cookies
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new mongoStore({
      url: secret.database,
      autoReconnect: true,
    }),
    cookie: { maxAge: 180 * 60 * 1000 },
  })
);
app.use(flash());

// authentification
app.use(passport.initialize());
app.use(passport.session());

// attribution par défaut de l'objet USER à toutes les mainroutes
app.use(function (request, response, next) {
  response.locals.user = request.user;
  response.locals.login = request.isAuthenticated();
  response.locals.session = request.session;
  next();
});

// pour rechercher toutes les catégories
app.use(function (request, response, next) {
  Category.find({}, function (err, categories) {
    if (err) return next(err);
    // On stocke les catégories dans le paramètre categories
    response.locals.categories = categories;
    next();
  });
});

// pour utiliser notre middleware : gestion des quantités dans le panier
app.use(cartLength);

// définition du chemin (routes) des pages principales
var mainRoutes = require("./routes/main");
app.use(mainRoutes);

var userRoutes = require("./routes/user");
app.use(userRoutes);

var adminRoutes = require("./routes/admin");
app.use(adminRoutes);

var apiRoutes = require("./api/api");
app.use("/api", apiRoutes);

// methode listen d'express
app.listen(secret.port, function (err) {
  if (err) throw err;
  console.log("Le serveur est lancé sur le port" + secret.port);
});
