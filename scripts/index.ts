import express from "express"
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"

import {
    login,
    info,
    createUser,
    createWallet,
    getWallet,
    addTransaction,
    sendMultipleTransaction,
    transactionHistory
} from "./service"

// GraphQL schema
const schema = buildSchema(`
    type Query {
        info(auth: String!): User
        getWallet(auth: String!): Wallet
        transactionHistory(auth: String!): [createTransaction]
    }
    type Mutation {
        createUser(firstName: String!, lastName: String!, email: String!, password: String!): User
        login(email: String!, password: String!): User
        createWallet(auth: String!): User
        addTransaction(auth: String!, to: String, value: String): Transaction
        sendMultipleTransaction(auth: String!, value: String): [Transaction]
    }
    type User {
        firstName: String
        lastName: String
        email: String
        password: String
        auth: String
        walletAddress: String
        privateKey: String
    }
    type Wallet {
        address: String
        privateKey: String
        index: Int
    }
    type Transaction {
        email: String
        transaction: createTransaction
    }
    type createTransaction {
        messageHash: String
        v: String
        r: String
        s: String
        rawTransaction: String
        transactionHash: String
    }
`)
   
// Root resolver
const root = {
    login: login,
    info: info,
    createUser: createUser,
    createWallet: createWallet,
    getWallet: getWallet,
    addTransaction: addTransaction,
    sendMultipleTransaction: sendMultipleTransaction,
    transactionHistory: transactionHistory
}

// Create an express server and a GraphQL endpoint
const app = express()
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}))
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'))
