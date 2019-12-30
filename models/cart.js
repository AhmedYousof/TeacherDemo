const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  total: { type: Number, default: 0 },
  courses: [
    {
      course: { type: Schema.Types.ObjectId, ref: "User" },
      quantity: { type: Number, default: 1 },
      price: { type: Number, default: 0 }
    }
  ]
});

module.exports = mongoose.model("Cart", cartSchema);
