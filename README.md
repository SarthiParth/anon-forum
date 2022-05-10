# Anon Forum

A forum which allows users to post their thoughts and reply to them anonymously and non-anonymously.

## Tech Stack

**Server:** Node, Express, MongoDB

## Environment Variables

To run this project **locally**, you will need to add the following environment variables to your `dev.env` file in the `config` folder.

`SECRET_KEY=your-secret-key`

`DB_CONNECT_TIMEOUT=30000`

`DB_AUTH_SOURCE=forum`

`DB_HB_FREQUENCY_MS=30000`

`DB_SERVER_SELECTION_TIMEOUT=5000`

`DB_SOCKET_TIMEOUT_MS=30000`

`API_URL=http://localhost:3000`

## Run Locally

Clone the project

```bash
  git clone git@github.com:SarthiParth/anon-forum.git
```

Go to the project directory

```bash
  cd anon-forum
```

Install dependencies

```bash
  npm install
```

Run mongo daemon

```bash
  ./mongod --bind_ip 127.0.0.1
```

Start the server

```bash
  npm start
```

## API Reference

### CORS (Important)

**All** requests must specify a whitelisted Origin in the request headers.
| Key | Value | Description |
| :------- | :---------------------- | :------------ |
| `Origin` | `http://localhost:3000` | **Required**. |

### Signup

Creates a new user.

```http
  POST /auth/signup
```

#### Sample Request Body (JSON)

```json
{
    "fullName": "John Doe",
    "username": "john",
    "password": "pass"
}
```

#### Success Response (201)

```json
{
    "ok": true,
    "message": "Signup successful",
    "user": {
        "fullName": "John Doe",
        "username": "john",
        "_id": "627a0e4e6eee457d1bf9a16f"
    }
}
```

### Login

Authenticates the user and provides a JWT access token which is valid for 24h.

```http
  POST /auth/login
```

#### Sample Request Body (JSON)

```json
{
    "username": "john",
    "password": "pass"
}
```

#### Success Response (200)

```json
{
    "ok": true,
    "message": "Login successful",
    "user": {
        "fullName": "John Doe",
        "username": "john",
        "_id": "627a0e4e6eee457d1bf9a16f"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjdhMGU0ZTZlZWU0NTdkMWJmOWExNmYiLCJpYXQiOjE2NTIxNjY5MTYsImV4cCI6MTY1MjI1MzMxNn0.2HcB1ZvseV1ZLAzUPdBDfHrMFzGbboisSWMDSauqsm4"
}
```

### Logout

Invalidates all future requests until they log in again.

```http
  POST /auth/logout
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

#### Success Response (200)

```json
{
    "ok": true,
    "message": "Logout successful"
}
```

### Post a thought

Creates a new thought in the forum. If `anonymous` is not provided in the request body, it defaults to `true`.

```http
  POST /api/v1/thought
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

#### Sample Request (JSON)

```json
{
    "text": "Thought 1",
    "anonymous": false
}
```

#### Success Response (201)

```json
{
    "ok": true,
    "message": "Thought created successfully",
    "thought": {
        "text": "Thought 1",
        "postedBy": "627a0e4e6eee457d1bf9a16f",
        "anonymous": false,
        "_id": "627a124c6eee457d1bf9a178",
        "createdAt": "2022-05-10T07:20:44.308Z",
        "updatedAt": "2022-05-10T07:20:44.308Z",
        "__v": 0
    }
}
```

### Reply to a thought

Creates a reply for a given `thoughtId`. If `anonymous` is not provided in the request body, it defaults to `true`.

```http
  POST /api/v1/reply/:thoughtId
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

Path Variables
| Key | Value | Description |
| :---------- | :--------- | :------------ |
| `thoughtId` | `ObjectId` | **Required**. |

#### Sample Request (JSON)

```json
{
    "text": "Reply 1"
}
```

#### Success Response (201)

```json
{
    "ok": true,
    "message": "Reply created successfully",
    "reply": {
        "text": "Reply 1",
        "parent": "627a124c6eee457d1bf9a178",
        "postedBy": "627a0e4e6eee457d1bf9a16f",
        "anonymous": true,
        "_id": "627a13166eee457d1bf9a181",
        "createdAt": "2022-05-10T07:24:06.522Z",
        "updatedAt": "2022-05-10T07:24:06.522Z",
        "__v": 0
    }
}
```

### Delete a thought

Deletes a thought if the requesting user created the thought. Also deletes all the replies for the thought.

```http
  DELETE /api/v1/thought/:thoughtId
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

Path Variables
| Key | Value | Description |
| :---------- | :--------- | :------------ |
| `thoughtId` | `ObjectId` | **Required**. |

#### Success Response (200)

```json
{
    "ok": true,
    "message": "Thought and its replies deleted successfully"
}
```

#### Error Response when the user tries to delete someone else's thought (403)

```json
{
    "ok": false,
    "error": "InsufficientPermissions",
    "message": "You do not have enough permission to perform this action"
}
```

### Delete a reply

Deletes a reply if the requesting user created the reply.

```http
  DELETE /api/v1/reply/:replyId
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

Path Variables
| Key | Value | Description |
| :-------- | :--------- | :------------ |
| `replyId` | `ObjectId` | **Required**. |

#### Success Response (200)

```json
{
    "ok": true,
    "message": "Reply deleted successfully"
}
```

#### Error Response when the user tries to delete someone else's reply (403)

```json
{
    "ok": false,
    "error": "InsufficientPermissions",
    "message": "You do not have enough permission to perform this action"
}
```

### List all thoughts

Lists all the thoughts posted on the forum with pagination. Hides `postedBy` info if the thought is anonymous. In case the requesting user posted the thought, the `postedBy` info is visible to the user. Also displays the number of `totalReplies` for each thought along with the first two replies on the thought (same anonymous rules apply for replies as well). Also provides the metadata such as `totalThoughts` and `totalPages`.

```http
  GET /api/v1/thought
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

Query Params
| Key | Value | Description |
| :------ | :---- | :--------------------------- |
| `page` | `Int` | **Optional**. Default is 1. |
| `limit` | `Int` | **Optional**. Default is 10. |

#### Success Response (200)

```json
{
    "ok": true,
    "count": 4,
    "thoughts": [
        {
            "_id": "627a180e6eee457d1bf9a199",
            "text": "Thought 4",
            "postedBy": {
                "_id": "627a17e76eee457d1bf9a18e",
                "fullName": "Jane Doe",
                "username": "jane"
            },
            "anonymous": false,
            "createdAt": "2022-05-10T07:45:18.872Z",
            "totalReplies": 1,
            "firstTwoReplies": [
                {
                    "_id": "627a18296eee457d1bf9a19d",
                    "text": "Reply 3",
                    "postedBy": {
                        "_id": "627a17e76eee457d1bf9a18e",
                        "fullName": "Jane Doe",
                        "username": "jane"
                    },
                    "anonymous": false,
                    "createdAt": "2022-05-10T07:45:45.115Z"
                }
            ]
        },
        {
            "_id": "627a18076eee457d1bf9a196",
            "text": "Thought 3",
            "postedBy": {
                "_id": "627a17e76eee457d1bf9a18e",
                "fullName": "Jane Doe",
                "username": "jane"
            },
            "anonymous": true,
            "createdAt": "2022-05-10T07:45:11.995Z",
            "totalReplies": 0,
            "firstTwoReplies": []
        },
        {
            "_id": "627a17b56eee457d1bf9a188",
            "text": "Thought 2",
            "postedBy": "anonymous",
            "anonymous": true,
            "createdAt": "2022-05-10T07:43:49.554Z",
            "totalReplies": 0,
            "firstTwoReplies": []
        },
        {
            "_id": "627a124c6eee457d1bf9a178",
            "text": "Thought 1",
            "postedBy": {
                "_id": "627a0e4e6eee457d1bf9a16f",
                "fullName": "John Doe",
                "username": "john"
            },
            "anonymous": false,
            "createdAt": "2022-05-10T07:20:44.308Z",
            "totalReplies": 2,
            "firstTwoReplies": [
                {
                    "_id": "627a13166eee457d1bf9a181",
                    "text": "Reply 1",
                    "postedBy": "anonymous",
                    "anonymous": true,
                    "createdAt": "2022-05-10T07:24:06.522Z"
                },
                {
                    "_id": "627a17cb6eee457d1bf9a18c",
                    "text": "Reply 2",
                    "postedBy": {
                        "_id": "627a0e4e6eee457d1bf9a16f",
                        "fullName": "John Doe",
                        "username": "john"
                    },
                    "anonymous": false,
                    "createdAt": "2022-05-10T07:44:11.344Z"
                }
            ]
        }
    ],
    "meta": {
        "totalThoughts": 4,
        "totalPages": 1
    }
}
```

### List an individual thought

Displays a particular thought and all it's replies. Hides `postedBy` info if the thought/reply is anonymous. In case the requesting user posted the thought/reply, the `postedBy` info is visible to the user.

```http
  GET /api/v1/thought/:thoughtId
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

Path Variables
| Key | Value | Description |
| :---------- | :--------- | :------------ |
| `thoughtId` | `ObjectId` | **Required**. |

#### Success Response (200)

```json
{
    "ok": true,
    "thought": {
        "_id": "627a124c6eee457d1bf9a178",
        "text": "Thought 1",
        "postedBy": {
            "_id": "627a0e4e6eee457d1bf9a16f",
            "fullName": "John Doe",
            "username": "john"
        },
        "anonymous": false,
        "createdAt": "2022-05-10T07:20:44.308Z",
        "updatedAt": "2022-05-10T07:20:44.308Z",
        "__v": 0
    },
    "replies": [
        {
            "_id": "627a13166eee457d1bf9a181",
            "text": "Reply 1",
            "parent": "627a124c6eee457d1bf9a178",
            "postedBy": "anonymous",
            "anonymous": true,
            "createdAt": "2022-05-10T07:24:06.522Z",
            "updatedAt": "2022-05-10T07:24:06.522Z",
            "__v": 0
        },
        {
            "_id": "627a17cb6eee457d1bf9a18c",
            "text": "Reply 2",
            "parent": "627a124c6eee457d1bf9a178",
            "postedBy": {
                "_id": "627a0e4e6eee457d1bf9a16f",
                "fullName": "John Doe",
                "username": "john"
            },
            "anonymous": false,
            "createdAt": "2022-05-10T07:44:11.344Z",
            "updatedAt": "2022-05-10T07:44:11.344Z",
            "__v": 0
        }
    ]
}
```

### List all thoughts for a given user

Lists all the thoughts posted by a particular user with pagination. If the user provides `userId` other than their own, only non-anonymous thoughts are returned. Also displays the number `totalReplies` for each thought along with the first two replies on the thought (Hides `postedBy` info if the reply is anonymous. In case the requesting user posted the reply, the `postedBy` info is visible to the user). Also provides the metadata such as `totalThoughts` and `totalPages`.

```http
  GET /api/v1/thought/user/:userId
```

| Key             | Value            | Description                      |
| :-------------- | :--------------- | :------------------------------- |
| `Authorization` | `Bearer <TOKEN>` | **Required**. Your access token. |

Query Params
| Key | Value | Description |
| :------ | :---- | :--------------------------- |
| `page` | `Int` | **Optional**. Default is 1. |
| `limit` | `Int` | **Optional**. Default is 10. |

Path Variables
| Key | Value | Description |
| :------- | :--------- | :------------ |
| `userId` | `ObjectId` | **Required**. |

#### Success Response (200)

```json
{
    "ok": true,
    "count": 1,
    "thoughts": [
        {
            "_id": "627a124c6eee457d1bf9a178",
            "text": "Thought 1",
            "postedBy": {
                "_id": "627a0e4e6eee457d1bf9a16f",
                "fullName": "John Doe",
                "username": "john"
            },
            "anonymous": false,
            "createdAt": "2022-05-10T07:20:44.308Z",
            "totalReplies": 2,
            "firstTwoReplies": [
                {
                    "_id": "627a13166eee457d1bf9a181",
                    "text": "Reply 1",
                    "postedBy": "anonymous",
                    "anonymous": true,
                    "createdAt": "2022-05-10T07:24:06.522Z"
                },
                {
                    "_id": "627a17cb6eee457d1bf9a18c",
                    "text": "Reply 2",
                    "postedBy": {
                        "_id": "627a0e4e6eee457d1bf9a16f",
                        "fullName": "John Doe",
                        "username": "john"
                    },
                    "anonymous": false,
                    "createdAt": "2022-05-10T07:44:11.344Z"
                }
            ]
        }
    ],
    "meta": {
        "totalThoughts": 1,
        "totalPages": 1
    }
}
```
