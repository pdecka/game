# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
```
POST /auth/register
Body: {
  email: string
  username: string
  password: string
  phone?: string
}
```

#### Login
```
POST /auth/login
Body: {
  email: string
  password: string
}
Response: {
  access_token: string
  refresh_token: string
  user: User
}
```

#### Verify OTP
```
POST /auth/verify-otp
Body: {
  email: string
  otp: string
}
```

#### Get Profile
```
GET /auth/profile
Headers: Authorization: Bearer <token>
```

#### Enable 2FA
```
POST /auth/enable-2fa
Headers: Authorization: Bearer <token>
Response: {
  secret: string
  qrCode: string
}
```

#### Confirm 2FA
```
POST /auth/confirm-2fa
Headers: Authorization: Bearer <token>
Body: {
  token: string
}
```

### Wallet

#### Get Balance
```
GET /wallet/balance?currency=INR
Headers: Authorization: Bearer <token>
```

#### Get Transactions
```
GET /wallet/transactions?limit=50&offset=0
Headers: Authorization: Bearer <token>
```

### Games

#### Play Dice
```
POST /games/dice
Headers: Authorization: Bearer <token>
Body: {
  betAmount: number
  currency: "INR" | "USDT" | "BTC"
  multiplier: number
  target: "high" | "low"
  clientSeed?: string
}
```

#### Play Crash
```
POST /games/crash
Headers: Authorization: Bearer <token>
Body: {
  betAmount: number
  currency: "INR" | "USDT" | "BTC"
  cashOutAt: number
  clientSeed?: string
}
```

#### Play Mines
```
POST /games/mines
Headers: Authorization: Bearer <token>
Body: {
  betAmount: number
  currency: "INR" | "USDT" | "BTC"
  gridSize: number
  mines: number
  positions: number[]
  clientSeed?: string
}
```

#### Get Game History
```
GET /games/history?limit=50
Headers: Authorization: Bearer <token>
```

### Payments

#### Create Deposit
```
POST /payments/deposit
Headers: Authorization: Bearer <token>
Body: {
  amount: number
  currency: "INR" | "USDT" | "BTC"
  method: "razorpay" | "usdt" | "btc"
}
```

#### Create Withdrawal
```
POST /payments/withdrawal
Headers: Authorization: Bearer <token>
Body: {
  amount: number
  currency: "INR" | "USDT" | "BTC"
  method: "razorpay" | "usdt" | "btc"
  address?: string
  accountDetails?: object
}
```

### Bonus

#### Get My Bonuses
```
GET /bonus/my-bonuses
Headers: Authorization: Bearer <token>
```

### KYC

#### Submit KYC
```
POST /kyc/submit
Headers: Authorization: Bearer <token>
Body: {
  documentType: string
  documentNumber?: string
  frontImageUrl: string
  backImageUrl?: string
  selfieImageUrl?: string
}
```

#### Get KYC Status
```
GET /kyc/status
Headers: Authorization: Bearer <token>
```

### Admin (Requires Admin Role)

#### Get Dashboard
```
GET /admin/dashboard
Headers: Authorization: Bearer <token>
```

#### Suspend User
```
POST /admin/users/:userId/suspend
Headers: Authorization: Bearer <token>
Body: {
  reason: string
}
```

#### Credit Wallet
```
POST /admin/wallet/credit
Headers: Authorization: Bearer <token>
Body: {
  userId: string
  amount: number
  currency: "INR" | "USDT" | "BTC"
  reason: string
}
```

#### Approve Withdrawal
```
POST /admin/withdrawals/:paymentId/approve
Headers: Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
