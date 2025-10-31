# CollEco API Specification (Draft)

## Overview
This API enables integration with CollEco for channel management, bookings, and partner services (hotels, flights, car rentals).

## Base URL
`https://api.colleco.com/v1/`

---

## Authentication
- API Key via header: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Hotels
#### Search Hotels
- `GET /hotels/search`
- **Query Params:**
  - `location` (string)
  - `checkin` (date, YYYY-MM-DD)
  - `checkout` (date, YYYY-MM-DD)
  - `guests` (int)
- **Response:**
```json
{
  "results": [
    {
      "hotelId": "string",
      "name": "string",
      "location": "string",
      "price": "number",
      "amenities": ["string"],
      "availability": true
    }
  ]
}
```

#### Book Hotel
- `POST /hotels/book`
- **Body:**
```json
{
  "hotelId": "string",
  "checkin": "YYYY-MM-DD",
  "checkout": "YYYY-MM-DD",
  "guests": int,
  "guestInfo": { "name": "string", "email": "string" }
}
```
- **Response:**
```json
{
  "bookingId": "string",
  "status": "confirmed|pending|failed"
}
```

---

### 2. Flights
#### Search Flights
- `GET /flights/search`
- **Query Params:**
  - `from` (string)
  - `to` (string)
  - `depart` (date)
  - `return` (date, optional)
  - `passengers` (int)
- **Response:**
```json
{
  "results": [
    {
      "flightId": "string",
      "airline": "string",
      "from": "string",
      "to": "string",
      "depart": "YYYY-MM-DD",
      "price": "number",
      "availability": true
    }
  ]
}
```

#### Book Flight
- `POST /flights/book`
- **Body:**
```json
{
  "flightId": "string",
  "passengers": int,
  "passengerInfo": [{ "name": "string", "email": "string" }]
}
```
- **Response:**
```json
{
  "bookingId": "string",
  "status": "confirmed|pending|failed"
}
```

---

### 3. Car Rentals
#### Search Cars
- `GET /cars/search`
- **Query Params:**
  - `location` (string)
  - `pickup` (date)
  - `dropoff` (date)
- **Response:**
```json
{
  "results": [
    {
      "carId": "string",
      "company": "string",
      "model": "string",
      "price": "number",
      "availability": true
    }
  ]
}
```

#### Book Car
- `POST /cars/book`
- **Body:**
```json
{
  "carId": "string",
  "pickup": "YYYY-MM-DD",
  "dropoff": "YYYY-MM-DD",
  "driverInfo": { "name": "string", "email": "string" }
}
```
- **Response:**
```json
{
  "bookingId": "string",
  "status": "confirmed|pending|failed"
}
```

---

## Contact
- Technical Representative: Collin MKhize
- Email: [your-email@example.com]

## Notes
- All endpoints return JSON.
- Error responses include `error` and `message` fields.
- This is a draft; endpoints and fields may change as integration progresses.
