// connexion entre node et mongoDB
const mongoose = require("mongoose");

// chargement de bcrypt(crypte les mdp)
const bcrypt = require("bcrypt-nodejs");

// mongoose avec méthodes
const Schema = mongoose.Schema;

// cypto
var crypto = require("crypto");

//création du modèle (la classe) pour user

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: String,
  profile: {
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    picture: { type: String, default: "" },
  },
  address: String,
  history: [
    {
      date: Date,
      paid: {
        type: Number,
        default: 0,
      },
    },
  ],
});

// cryptage du mot de passe (bcrypt)

UserSchema.pre("save", function (next) {
  var user = this;

  // crypter le mot de passe seulement s'il a été modifié ou si il est nouveau

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next;
    // crypter le mdp avec le nouveau salt

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// comparaison entre mdp entré et celui présent dans la bdd
// fonction personnalisée avec mongoose

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Fonction perso pour afficher un avatar
UserSchema.methods.gravatar = function (size) {
  if (!this.size) size = 200;

  // si l'e-mail ne correspond pas, alors on retourne une image aléatoire
  if (!this.email)
    return "https://gravatar.com/avatar/?s" + size + "&d=robohash";

  //crypter afin que chaque utilisateur ait une image unique

  var md5 = crypto.createHash("md5").update(this.email).digest("hex");

  // on retourne l'image
  return "https://gravatar.com/avatar/?s" + md5 + "?s=" + size + "&d=robohash";
};

module.exports = mongoose.model("User", UserSchema);
