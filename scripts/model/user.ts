import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  auth: { type: String },
  walletAddress: { type: String },
  privateKey: { type: String },
  keystore: { type: Object },
})

export const modelUser = mongoose.model("user", userSchema)
