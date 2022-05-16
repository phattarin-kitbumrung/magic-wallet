import jwt from "jsonwebtoken"

export const verifyToken = (auth: string) => {
    if (!auth) {
        throw Error("Token is required for authentication!")
    }
    try {
        const decoded = jwt.verify(auth, process.env.SECRET_VALUE as string)
        return decoded
    } catch (err) {
        throw Error("Invalid Token!")
    }
}
  