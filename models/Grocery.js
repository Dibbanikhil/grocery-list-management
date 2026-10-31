const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required."],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number."
      }
    },
    category: {
      type: String,
      default: "Other",
      trim: true,
      maxlength: 50
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    purchased: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grocery", grocerySchema);
