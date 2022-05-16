import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Web3 from "web3"

import { mongodb_connect } from "./database"
import { modelUser } from "./model/user"
import { modelTransaction } from "./model/transaction"
import { verifyToken } from "./helper"

mongodb_connect(process.env.MONGO_URL as string)
dotenv.config()
const web3 = new Web3(process.env.WEB3_URL as string)
interface IArgs {
    firstName?: string
    lastName?: string
    email?: string 
    password?: string
    auth?: string 
    to?: string 
    value?: string
}

export async function login(args: IArgs) {
    // Find user by email   
    const user = await modelUser.findOne({ email: args.email })
    if (user !== null && (await bcrypt.compare(args.password as string, user.password))) {
        // Create token
        const auth = jwt.sign({ email: args.email }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
        user.auth = auth
        await modelUser.updateOne(user)

        return { auth: auth }
    }

    throw new Error("Invalid Credentials!")
}
export async function info(args: IArgs) {
    verifyToken(args.auth as string)

    return await getUser(args.auth as string)
}
export async function createUser(args: IArgs) {
     // Encrypt user password
     const encryptedPassword = await bcrypt.hash(args.password as string, 10)
 
     // Create token
     const auth = jwt.sign({ email: args.email }, process.env.SECRET_VALUE as string, { expiresIn: "2h" })
    //  args.auth = auth
 
     // Create user
     const user = {
         firstName: args.firstName,
         lastName: args.lastName,
         email: args.email,
         password: encryptedPassword,
         auth: auth
     }
     // Save user to database
     await modelUser.create(user)
 
   return { email: args.email, auth: auth }
}
export async function createWallet(args: IArgs) {    
    verifyToken(args.auth as string)
    const user = await getUser(args.auth as string)
    const account = web3.eth.accounts.create(process.env.SECRET_VALUE as string)
    const wallet = web3.eth.accounts.wallet.add(account)
    const keystore = wallet.encrypt(process.env.SECRET_VALUE as string)
    user.walletAddress = account.address
    user.privateKey = account.privateKey
    user.keystore = keystore
    await modelUser.updateOne(user)

    return {
        walletAddress: user.walletAddress,
        privateKey: user.privateKey
    }
}
async function getUser(auth: string) {
    // Find user by token   
    const user = await modelUser.findOne({ token: auth })
    if(user === null) {
        return new Error("Invalid Credentials!")
    }
    
    return user
}
export async function getWallet(args: IArgs) {
    verifyToken(args.auth as string)
    const user = await getUser(args.auth as string)
    const wallet = web3.eth.accounts.wallet.decrypt([user.keystore], process.env.SECRET_VALUE as string)

    return wallet['0']
}
export async function addTransaction(args: IArgs) {
    verifyToken(args.auth as string)
    const user = await getUser(args.auth as string)

    web3.eth.sendTransaction({
        from: args.to,
        gasPrice: "20000000000",
        gas: "21320",
        to: user.walletAddress,
        value: web3.utils.toWei(String(Number(args.value) + 1), 'ether'),
        data: "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe"
    })
    const createTransaction = await web3.eth.accounts.signTransaction(
        {
           from: user.walletAddress,
           to: args.to,
           value: web3.utils.toWei(args.value as string, 'ether'),
           gas: '21000',
        },
        user.privateKey
    )
    await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction as string
    )

    const transaction = {
        email: user.email,
        transaction: createTransaction
    }
    await modelTransaction.create(transaction)

    return transaction
}
export async function sendMultipleTransaction(args: IArgs) {
    verifyToken(args.auth as string)  
    const user = await getUser(args.auth as string)

    const accounts = await web3.eth.getAccounts()
    const transactions = []
    for (let i = 0; i < 5; i++) {
        web3.eth.sendTransaction({
            from: accounts[i],
            gasPrice: "20000000000",
            gas: "21320",
            to: user.walletAddress,
            value: web3.utils.toWei(String(Number(args.value) + 1), 'ether'),
            data: "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe"
        })
        const createTransaction = await web3.eth.accounts.signTransaction(
            {
               from: user.walletAddress,
               to: accounts[i],
               value: web3.utils.toWei(args.value as string, 'ether'),
               gas: '21000',
            },
            user.privateKey
        )      
         // Deploy transaction
        await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction as string
        )
        const transaction = {
            email: user.email,
            transaction: createTransaction
        }
        transactions.push(transaction)
        await modelTransaction.create(transaction)
    }

    return transactions
}
export async function transactionHistory(args: IArgs) {
    verifyToken(args.auth as string)
    const user = await getUser(args.auth as string) as any
    const transactions = await modelTransaction.aggregate(
        [ 
            { $match: { email: user.email } },
            { 
                $project: 
                {   _id: 0, messageHash: "$transaction.messageHash", v: "$transaction.v",
                    r: "$transaction.r", s: "$transaction.s", rawTransaction: "$transaction.rawTransaction", 
                    transactionHash: "$transaction.transactionHash" 
                } 
            }
        ]
    )

    return transactions
}