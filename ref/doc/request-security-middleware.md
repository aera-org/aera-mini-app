# Request Security Middlewares

This document describes the security middlewares implemented to protect API endpoints from replay attacks and unauthorized access.

## Timestamp Validation Middleware

The timestamp validation middleware ensures that requests are not older than 5 minutes, preventing replay attacks.

### How It Works

1. Each request must include an `X-Request-Timestamp` header with a Unix timestamp in milliseconds.
2. The middleware checks that the timestamp is not older than 5 minutes.
3. If the timestamp is missing, invalid, or too old, the request is rejected.

### Implementation Details

```typescript
// Request header example:
// X-Request-Timestamp: 1647894563000
```

#### Response Codes

- `400 Bad Request` - Missing or invalid timestamp header
- `400 Bad Request` - Timestamp is older than 5 minutes

## Hash Validation Middleware

The hash validation middleware verifies that requests are authentic by checking a hash created from the request parameters and timestamp.

### How It Works

1. Each request must include an `X-Request-Hash` header with a hash value.
2. The hash is calculated using:
   - Request parameters (query params for GET/DELETE, body for POST/PUT/PATCH)
   - X-Request-Timestamp value
   - Server's secret key

### Hash Calculation

The hash is calculated as:

```
hash = SHA256(requestParameters + timestamp)
```

Where:

- `requestParameters` is:
  - For GET/DELETE: the URL query string
  - For POST/PUT/PATCH with JSON body: stringified JSON
  - For form submissions: form parameters as URL encoded string
- `timestamp` is the value from the X-Request-Timestamp header

### Implementation Details

```typescript
// Request headers example:
// X-Request-Timestamp: 1647894563000
// X-Request-Hash: 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b
```

#### Response Codes

- `400 Bad Request` - Missing hash or timestamp header
- `401 Unauthorized` - Invalid hash

## Usage in Client Applications

Client applications should:

1. Generate a timestamp (current time in milliseconds)
2. Gather request parameters
3. Calculate the hash using the formula above
4. Send the request with the proper headers

### Example (JavaScript)

```javascript
const timestamp = Date.now();
const requestParams = JSON.stringify(requestBody); // For POST/PUT/PATCH
// or
const requestParams = new URLSearchParams(queryParams).toString(); // For GET/DELETE

const dataToHash = requestParams + timestamp;
const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

// Add headers to request
headers['X-Request-Timestamp'] = timestamp;
headers['X-Request-Hash'] = hash;
```

## Implementation in Frontend Application

In our frontend application, these security features are implemented in the Axios interceptors that automatically:

1. Generate and add a timestamp to every request (`X-Request-Timestamp` header)
2. Calculate and add the request hash (`X-Request-Hash` header)

The implementation can be found in `src/api/axios.ts`.

### Development Environment

In development environments, these security measures are bypassed to facilitate easier testing by checking the `VITE_ENV` environment variable.
