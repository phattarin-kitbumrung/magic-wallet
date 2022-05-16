import jwt from "jsonwebtoken"
import dotenv from "dotenv"

import { verifyToken } from "./helper"
dotenv.config()

describe('verifyToken', () => {
    it("Should verifyToken successfully!", () => {
        const auth = jwt.sign({ email: "test" }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
        const decoded = jwt.verify(auth, process.env.SECRET_VALUE as string)
        const result = verifyToken(auth)
        expect(decoded).toEqual(result)
    })
    it("Should return error when missing auth", () => {
      expect(() => verifyToken("")).toThrowError("Token is required for authentication!")
    })
    it("Should return error when auth is invalid", () => {
      expect(() => verifyToken("xxx")).toThrowError("Invalid Token!")
    })
})
  