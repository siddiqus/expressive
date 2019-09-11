module.exports = {
    tags: ["Users"],
    parameters: [
        {
            "name": "userId",
            "in": "path",
            "description": "User id",
            "required": true,
            "schema": {
                "type": "integer"
            }
        }
    ],
    "responses": {
        "200": {
            "description": "Specific user object",
            "schema": {
                "type": "object"
            }
        }
    }
}