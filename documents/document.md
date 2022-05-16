mutation register($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
  createUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
    email
    auth
  }
}

mutation userLogin($email: String!, $password: String!) {
  login(email: $email, password: $password) {
  	auth
  }
}

query getUserInfo($auth: String!) {
    info(auth: $auth) {
    	firstName
    	lastName
    	email
    	password
    }
}

mutation newWallet($auth: String!) {
  createWallet(auth: $auth) {
  	walletAddress
    privateKey
  }
}

query wallet($auth: String!) {
    getWallet(auth: $auth) {
   		  address
        privateKey
        index
    }
}

mutation transaction($auth: String!, $to: String!, $value: String!) {
  addTransaction(auth: $auth, to: $to, value: $value) {
  	email
    transaction {
      messageHash
      v
      r
      s
      rawTransaction
      transactionHash
    }
  }
}

mutation mutlipleTransaction($auth: String!, $value: String!) {
  sendMultipleTransaction(auth: $auth, value: $value) {
  	email
    transaction {
      messageHash
      v
      r
      s
      rawTransaction
      transactionHash
    }
  }
}

query getTransactions($auth: String!) {
  transactionHistory(auth: $auth) {
  	messageHash
    v
    r
  	s
    rawTransaction
    transactionHash
  }
}
