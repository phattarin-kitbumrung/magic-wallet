import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import sinon from "sinon"

import { modelUser } from "./model/user"
import { modelTransaction } from "./model/transaction"
import {
  login,
  info,
  createUser,
  createWallet,
  getWallet,
  addTransaction,
  sendMultipleTransaction,
  transactionHistory,
} from "./service"

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/magic-wallet");
})
afterAll(async () => {
  await mongoose.connection.close()
})
describe('login', () => {
  it("Should login successfully!", async() => {
    const spy = jest.spyOn(modelUser, 'updateOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
    await login({ email: "test", password: "test" })
    const spyLogin = spy.mock.results[0].value
    expect(spyLogin.auth).toEqual("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds")
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
  it("Should return an error when user not found", async() => {
    const spy = jest.spyOn(modelUser, 'findOne').mockResolvedValueOnce(null)
    await expect(login({ email: "test", password: "test" })).rejects.toThrow("Invalid Credentials!")
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
})
describe('info', () => {
  it("Should get user successfully!", async() => {
    const auth = jwt.sign({ email: "test" }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: auth } as any)
    await info({ auth: auth })
    const spyInfo = spy.mock.results[0].value
    expect(spyInfo.auth).toEqual(auth)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
  it("Should return an error when token is invalid", async() => {
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
    await expect(info({ email: "test", password: "test", auth: "xxx" })).rejects.toThrow("Invalid Token!")
    expect(spy).toHaveBeenCalledTimes(0)
    spy.mockReset()
  })
})
describe('createUser', () => {
  it("Should create a new user successfully!", async() => {
      const spy = jest.spyOn(modelUser, 'create').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "test", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
      await createUser({ firstName: "test", lastName: "test", email: "test", password: "test" })
      const spyCreatedUser = spy.mock.results[0].value
      expect(spyCreatedUser.email).toEqual("test")
      expect(spyCreatedUser.auth).toEqual("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds")
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockReset()
  })
  it("Should return an error when email is duplicate", async() => {
    const spy = jest.spyOn(modelUser, "create").mockReturnValueOnce("E11000 duplicate key error collection: magic-wallet.users index: email_1 dup key: { email: \"test\" }" as any);
    await createUser({ firstName: "test", lastName: "test", email: "test", password: "test" })
    const spyCreatedUser = spy.mock.results[0].value;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyCreatedUser).toEqual("E11000 duplicate key error collection: magic-wallet.users index: email_1 dup key: { email: \"test\" }");
    spy.mockReset();
  })
})
describe('createWallet', () => {
  it("Should createWallet successfully!", async() => {
    const auth = jwt.sign({ email: "test" }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
    sinon.stub(modelUser, 'findOne').returns({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: auth } as any)
    const spy = jest.spyOn(modelUser, 'updateOne').mockReturnValueOnce({ "privateKey": "0xcd0b0062414516cd67a821b61df7dc8cb8564abb29def76b1eb864a22f007cdc", "walletAddress" : "0xfAE536624bC004351288eda89503fb5CDa206662" } as any)
    await createWallet({ auth: auth })
    const spyUpdate = spy.mock.results[0].value
    expect(spyUpdate.privateKey).toEqual("0xcd0b0062414516cd67a821b61df7dc8cb8564abb29def76b1eb864a22f007cdc")
    expect(spyUpdate.walletAddress).toEqual("0xfAE536624bC004351288eda89503fb5CDa206662")
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
    sinon.restore()
  })
  it("Should return an error when token is invalid", async() => {
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
    await expect(createWallet({ auth: "xxx" })).rejects.toThrow("Invalid Token!")
    expect(spy).toHaveBeenCalledTimes(0)
    spy.mockReset()
  })
})
describe('getWallet', () => {
  it("Should get wallet successfully!", async() => {
    const auth = jwt.sign({ email: "test" }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ 
      firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", 
      auth: auth, 
      keystore : {
        "version" : 3,
        "id" : "cfc307c5-dc73-47d3-af60-6b18ce0604e8",
        "address" : "fae536624bc004351288eda89503fb5cda206662",
        "crypto" : {
            "ciphertext" : "9f115f6f187e4ce716a239e60e339871a9b6e8ff4606acdcf9da29560fca04b8",
            "cipherparams" : {
                "iv" : "309e7c10fc8ace56a975f05e701637a2"
            },
            "cipher" : "aes-128-ctr",
            "kdf" : "scrypt",
            "kdfparams" : {
                "dklen" : 32,
                "salt" : "c02ad54987c4fd102eff9705097249748dc6e9135cbe5465636c4eea86c9bfcf",
                "n" : 8192,
                "r" : 8,
                "p" : 1
            },
            "mac" : "d790bca076c8c0d1f43d3e48be8609c0b348b436b86230b065587510ec683386"
        }
      },
      privateKey: "0xcd0b0062414516cd67a821b61df7dc8cb8564abb29def76b1eb864a22f007cdc",
      walletAddress: "0xfAE536624bC004351288eda89503fb5CDa206662" 
    } as any)
    await getWallet({ auth: auth })
    const spyGetWallet = spy.mock.results[0].value
    expect(spyGetWallet.privateKey).toEqual("0xcd0b0062414516cd67a821b61df7dc8cb8564abb29def76b1eb864a22f007cdc")
    expect(spyGetWallet.walletAddress).toEqual("0xfAE536624bC004351288eda89503fb5CDa206662")
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
  it("Should return an error when token is invalid", async() => {
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
    await expect(getWallet({ auth: "xxx" })).rejects.toThrow("Invalid Token!")
    expect(spy).toHaveBeenCalledTimes(0)
    spy.mockReset()
  })
})
describe('addTransaction', () => {
  it("Should addTransaction successfully!", async() => {
    const auth = jwt.sign({ email: "test" }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
    const transaction = {
      "messageHash" : "0x834acc9c6ecba0a7f36199d561e7b39c9efa1d89baff3259e4ecdcf6d836d8bd",
      "v" : "0xf4f5",
      "r" : "0x5a511db86c4f901660d11ece3329cbb726c2e80fdcea329c309650a4fb0e8ecb",
      "s" : "0x21f7136f1ae3dd953f1001197f613894f3c8efdffcead11d0f376a0bd0578786",
      "rawTransaction" : "0xf86e81cc843b9aca0882520894f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a76400008082f4f5a05a511db86c4f901660d11ece3329cbb726c2e80fdcea329c309650a4fb0e8ecba021f7136f1ae3dd953f1001197f613894f3c8efdffcead11d0f376a0bd0578786",
      "transactionHash" : "0xd1ec0fdb475021edb415acdeae3b8ca04f8a44f22f262ae2a36ccd54459a4d13"
    }

    jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ 
      firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC",
      auth: auth, privateKey: "0xcd0b0062414516cd67a821b61df7dc8cb8564abb29def76b1eb864a22f007cdc",
      walletAddress: "0xfAE536624bC004351288eda89503fb5CDa206662" 
    } as any)

    const spy = jest.spyOn(modelTransaction, 'create').mockReturnValueOnce({
      email: "test",
      transaction: transaction,
    } as any)

    await addTransaction({ auth: auth, to: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", value: "1" })
    const spyAddTransaction = spy.mock.results[0].value
    expect(spyAddTransaction.transaction).toEqual(transaction)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
  it("Should return an error when token is invalid", async() => {
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
    await expect(addTransaction({ auth: "xxx" })).rejects.toThrow("Invalid Token!")
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
})
describe('sendMultipleTransaction', () => {
  it("Should sendMultipleTransaction successfully!", async() => {
    const auth = jwt.sign({ email: "test" }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
    const transaction = {
      "messageHash" : "0x834acc9c6ecba0a7f36199d561e7b39c9efa1d89baff3259e4ecdcf6d836d8bd",
      "v" : "0xf4f5",
      "r" : "0x5a511db86c4f901660d11ece3329cbb726c2e80fdcea329c309650a4fb0e8ecb",
      "s" : "0x21f7136f1ae3dd953f1001197f613894f3c8efdffcead11d0f376a0bd0578786",
      "rawTransaction" : "0xf86e81cc843b9aca0882520894f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a76400008082f4f5a05a511db86c4f901660d11ece3329cbb726c2e80fdcea329c309650a4fb0e8ecba021f7136f1ae3dd953f1001197f613894f3c8efdffcead11d0f376a0bd0578786",
      "transactionHash" : "0xd1ec0fdb475021edb415acdeae3b8ca04f8a44f22f262ae2a36ccd54459a4d13"
    }

    jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ 
      firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC",
      auth: auth, privateKey: "0xcd0b0062414516cd67a821b61df7dc8cb8564abb29def76b1eb864a22f007cdc",
      walletAddress: "0xfAE536624bC004351288eda89503fb5CDa206662" 
    } as any)

    const spy = jest.spyOn(modelTransaction, 'create').mockReturnValueOnce({
      email: "test",
      transaction: transaction,
    } as any)

    await sendMultipleTransaction({ auth: auth, value: "1" })
    const spyAddTransaction = spy.mock.results[0].value
    expect(spyAddTransaction.transaction).toEqual(transaction)
    expect(spy).toHaveBeenCalledTimes(5)
    spy.mockReset()
  })
  it("Should return an error when token is invalid", async() => {
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
    await expect(sendMultipleTransaction({ auth: "xxx" })).rejects.toThrow("Invalid Token!")
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
})
describe('transactionHistory', () => {
  it("Should transactionHistory successfully!", async() => {
    const auth = jwt.sign({ email: "test" }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
    const transaction = {
      "messageHash" : "0x834acc9c6ecba0a7f36199d561e7b39c9efa1d89baff3259e4ecdcf6d836d8bd",
      "v" : "0xf4f5",
      "r" : "0x5a511db86c4f901660d11ece3329cbb726c2e80fdcea329c309650a4fb0e8ecb",
      "s" : "0x21f7136f1ae3dd953f1001197f613894f3c8efdffcead11d0f376a0bd0578786",
      "rawTransaction" : "0xf86e81cc843b9aca0882520894f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a76400008082f4f5a05a511db86c4f901660d11ece3329cbb726c2e80fdcea329c309650a4fb0e8ecba021f7136f1ae3dd953f1001197f613894f3c8efdffcead11d0f376a0bd0578786",
      "transactionHash" : "0xd1ec0fdb475021edb415acdeae3b8ca04f8a44f22f262ae2a36ccd54459a4d13"
    }

    jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ 
      firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC",
      auth: auth, privateKey: "0xcd0b0062414516cd67a821b61df7dc8cb8564abb29def76b1eb864a22f007cdc",
      walletAddress: "0xfAE536624bC004351288eda89503fb5CDa206662" 
    } as any)

    const spy = jest.spyOn(modelTransaction, 'aggregate').mockReturnValueOnce({
      transaction: [transaction]
    } as any)

    await transactionHistory({ auth: auth, value: "1" })
    const spyTransactionHistory = spy.mock.results[0].value
    expect(spyTransactionHistory.transaction).toEqual([transaction])
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
  it("Should return an error when token is invalid", async() => {
    const spy = jest.spyOn(modelUser, 'findOne').mockReturnValueOnce({ firstName: "test", lastName: "test", email: "test", password: "$2a$10$/UVgpxTJTuTmdO78Rnc0cOtDEs1KoM.4goNbYOFst.rcXDd5VnbUC", auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2NTAzMTcxMTMsImV4cCI6MTY1MDMyNDMxM30.CXPlU4HsOS-tT0D81ReEyH6kKpKAGU4C6Noi277Q4ds" } as any)
    await expect(transactionHistory({ auth: "xxx" })).rejects.toThrow("Invalid Token!")
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockReset()
  })
})