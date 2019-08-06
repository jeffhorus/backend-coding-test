# Ride API Docs

This is the API docs for Ride APIs

## Create Ride

You can create a ride using this API

### URL
`POST /rides`

### Request Body

**Specification**

- start_lat: `number` latitude coordinate of the pickup point
- start_long: `number` longitude coordinate of the pickup point
- end_lat: `number` latitude coordinate of the destination point
- end_long: `number` longitude coordinate of the destination point
- rider_name: `string` the rider name
- driver_name: `string` the driver name
- driver_vehicle: `string` the driver's vehicle

**Example**
```
{
    "start_lat": 10,
    "end_lat": 11,
    "start_long": 10,
    "end_long": 11,
    "rider_name": "Jeffrey",
    "driver_name": "Tofu",
    "driver_vehicle": "Buroq"
}
```

### Response Body

**Specification**

JSON array containing one JSON object

- rideID: `string` unique ID for the ride
- created: `ISO date string` date of when the ride is created
- startLat: `number` latitude coordinate of the pickup point
- startLong: `number` longitude coordinate of the pickup point
- endLat: `number` latitude coordinate of the destination point
- endLong: `number` longitude coordinate of the destination point
- riderName: `string` the rider name
- driverName: `string` the driver name
- driverVehicle: `string` the driver's vehicle

**Example**
```
[
    {
        "rideID": 1,
        "startLat": 10,
        "startLong": 10,
        "endLat": 11,
        "endLong": 11,
        "riderName": "Jeffrey",
        "driverName": "Tofu",
        "driverVehicle": "Buroq",
        "created": "2019-08-06 12:34:29"
    }
]
```

## Get Rides

You can get ride history with this API

### URL
`GET /rides`

### Query Parameters

- limit: `int` number of records you want to fetch
- page: `int` the page number you want to fetch

### Response Body

**Specification**

JSON array containing JSON objects

- rideID: `string` unique ID for the ride
- created: `ISO date string` date of when the ride is created
- startLat: `number` latitude coordinate of the pickup point
- startLong: `number` longitude coordinate of the pickup point
- endLat: `number` latitude coordinate of the destination point
- endLong: `number` longitude coordinate of the destination point
- riderName: `string` the rider name
- driverName: `string` the driver name
- driverVehicle: `string` the driver's vehicle

**Example**

`GET /rides`
```
[
    {
        "rideID": 1,
        "startLat": 10,
        "startLong": 10,
        "endLat": 11,
        "endLong": 11,
        "riderName": "Jeffrey",
        "driverName": "Tofu",
        "driverVehicle": "Buroq",
        "created": "2019-08-06 12:34:29"
    },
    {
        "rideID": 2,
        "startLat": 10,
        "startLong": 10,
        "endLat": 11,
        "endLong": 11,
        "riderName": "Jeffrey",
        "driverName": "Tofu",
        "driverVehicle": "Buroq",
        "created": "2019-08-06 12:37:59"
    },
    {
        "rideID": 3,
        "startLat": 10,
        "startLong": 10,
        "endLat": 11,
        "endLong": 11,
        "riderName": "Jeffrey",
        "driverName": "Tofu",
        "driverVehicle": "Buroq",
        "created": "2019-08-06 12:38:00"
    }
]
```

`GET /rides?limit=1&page=2`
```
[
    {
        "rideID": 2,
        "startLat": 10,
        "startLong": 10,
        "endLat": 11,
        "endLong": 11,
        "riderName": "Jeffrey",
        "driverName": "Tofu",
        "driverVehicle": "Buroq",
        "created": "2019-08-06 12:37:59"
    }
]
```

## Get a Ride by Ride ID

You can get a specific ride history with this API

### URL
`GET /rides/:id`

### URL Parameter

- id: `string` the unique ID sent through response as `rideID`

### Response Body

**Specification**

JSON array containing JSON objects

- rideID: `string` unique ID for the ride
- created: `ISO date string` date of when the ride is created
- startLat: `number` latitude coordinate of the pickup point
- startLong: `number` longitude coordinate of the pickup point
- endLat: `number` latitude coordinate of the destination point
- endLong: `number` longitude coordinate of the destination point
- riderName: `string` the rider name
- driverName: `string` the driver name
- driverVehicle: `string` the driver's vehicle

**Example**

`GET /rides/1`

```

[
    {
        "rideID": 1,
        "startLat": 10,
        "startLong": 10,
        "endLat": 11,
        "endLong": 11,
        "riderName": "Jeffrey",
        "driverName": "Tofu",
        "driverVehicle": "Buroq",
        "created": "2019-08-06 12:34:29"
    }
]
```