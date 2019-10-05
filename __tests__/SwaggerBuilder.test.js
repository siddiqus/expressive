const { SwaggerEndpoint } = require("../src/SwaggerBuilder");

const expectedOutput = {
    summary: "Get a list of CVs for a given job description",
    description: "Get a list of CVs for a given job description",
    parameters: [
        {
            name: "jdId",
            in: "path",
            required: true,
            type: "string",
            description: "Job description ID",
            schema: {
                type: "object",
                properties: {
                    bucketName: {
                        type: "string"
                    },
                    bucketKey: {
                        type: "string"
                    }
                }
            }
        },
        {
            name: "body",
            in: "body",
            required: true,
            type: "string",
            description: "CV ID",
            schema: {
                type: "object",
                properties: {
                    bucketName: {
                        type: "string"
                    },
                    bucketKey: {
                        type: "string"
                    }
                }
            }
        }
    ],
    responses: {
        200: {
            produces: ["application/json"],
            description: "List of CVs for the given job description",
            schema: {
                type: "object",
                properties: {
                    url: {
                        type: "string"
                    }
                }
            }
        },
        400: {
            produces: ["application/json"],
            description: "Some error description",
            schema: {
                type: "object",
                properties: {
                    errorMessage: {
                        type: "string"
                    }
                }
            }
        }
    }
};

describe("SwaggerBuilder", () => {
    it("Should transform endpoint doc", () => {
        const output = new SwaggerEndpoint(
            expectedOutput.summary,
            expectedOutput.description
        );

        expect(output.summary).toEqual(expectedOutput.summary);
        expect(output.description).toEqual(expectedOutput.description);

        output.addResponse({
            code: 200,
            description: "List of CVs for the given job description",
            schema: {
                type: "object",
                properties: {
                    url: {
                        type: "string"
                    }
                }
            }
        });

        expect(output.responses[200]).toEqual(expectedOutput.responses[200]);

        output.addResponse({
            code: 400,
            description: "Some error description",
            schema: {
                type: "object",
                properties: {
                    errorMessage: {
                        type: "string"
                    }
                }
            },
            produces: ["application/json"]
        });

        expect(output.responses[400]).toEqual(expectedOutput.responses[400]);

        output.addPathParam({
            name: "jdId",
            required: true,
            type: "string",
            description: "Job description ID",
            schema: {
                type: "object",
                properties: {
                    bucketName: {
                        type: "string"
                    },
                    bucketKey: {
                        type: "string"
                    }
                }
            }
        });

        expect(output.parameters[0]).toEqual(expectedOutput.parameters[0]);

        const requestBody = {
            required: true,
            description: "CV ID",
            schema: {
                type: "object",
                properties: {
                    bucketName: {
                        type: "string"
                    },
                    bucketKey: {
                        type: "string"
                    }
                }
            }
        };

        output.addRequestBody(requestBody);

        expect(output.parameters[1]).toEqual({
            ...requestBody,
            name: "body",
            in: "body"
        });

        output.addRequestBody({
            ...requestBody,
            name: "someBody"
        });

        expect(output.parameters[2]).toEqual({
            ...requestBody,
            name: "someBody",
            in: "body"
        });

        const queryParam = {
            name: "some query param",
            description: "some query desc",
            required: true,
            schema: {
                type: "integer"
            }
        };

        output.addQueryParam(queryParam);

        expect(output.parameters[3]).toEqual({
            ...queryParam,
            in: "query"
        });
    });
});
