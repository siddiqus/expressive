module.exports = {
    "tags": [
        "Hello"
    ],
    "parameters": [
        {
            "name": "User info",
            "in": "body",
            "description": "User first and last name",
            "required": true,
            "schema": {
                "$ref": "#/definitions/UserInfo"
            }
        }
    ],
    "description": "Say hello to user.",
    "responses": {
        "200": {
            "description": "Say hello.",
            "schema": {
                "type": "object",
                "properties": {
                    "hello": {
                        "type": "string",
                        "example": "Hello user name!"
                    }
                }
            }
        }
    }
}