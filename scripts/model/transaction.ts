import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  transaction: { type: Object },
})

export const modelTransaction = mongoose.model("transaction", transactionSchema)
