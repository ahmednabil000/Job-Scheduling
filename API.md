# Job Scheduling API

Documentation for the Job Scheduling service endpoints.

## Create Job

**Route**: `POST /jobs`

**Request Shape**:

- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "string (required, e.g., 'email-sender')",
    "interval": "number (required, seconds)",
    "data": "object (required, payload specific to job type)"
  }
  ```

**Supported Job Data Payloads**:

1. **`email-sender`**

   ```json
   {
     "to": "user@example.com",
     "from": "admin@example.com"
   }
   ```

2. **`sms-sender`**
   ```json
   {
     "to": "+1234567890",
     "message": "Your verification code is 1234"
   }
   ```

**Expected Responses**:

- **201 Created**: Job successfully scheduled.

  ```json
  {
    "jobId": "uuid-string"
  }
  ```

- **400 Bad Request**: Unknown job name.

  ```json
  {
    "statusCode": 400,
    "message": "Unknown job name: {name}",
    "error": "Bad Request"
  }
  ```

- **400 Bad Request**: Invalid job data payload.
  ```json
  {
    "statusCode": 400,
    "message": "Invalid {name} job data: {validation_error_message}",
    "error": "Bad Request"
  }
  ```

---

## Get All Jobs

**Route**: `GET /jobs`

**Request Shape**:

- No parameters required.

**Expected Responses**:

- **200 OK**: List of all jobs.
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "status": "PENDING | RUNNING | FAILED",
      "data": { ... },
      "interval": number,
      "lastRunAt": "ISO Date",
      "nextRunAt": "ISO Date",
      "createdAt": "ISO Date"
    },
    ...
  ]
  ```

---

## Get Job by ID

**Route**: `GET /jobs/:id`

**Request Shape**:

- **Params**: `id` (UUID string)

**Expected Responses**:

- **200 OK**: Job details found.

  ```json
  {
    "id": "uuid",
    "name": "string",
    "status": "PENDING | RUNNING | FAILED",
    "data": { ... },
    "interval": number,
    "lastRunAt": "ISO Date",
    "nextRunAt": "ISO Date",
    "createdAt": "ISO Date"
  }
  ```

- **200 OK**: Job not found.
  ```json
  null
  ```
