var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  cart: { type: Object, required: true },
  address: String,
  name: { type: String, required: true },
  paymentId: { type: String, required: true },
});

module.exports = mongoose.model("Order", OrderSchema);
