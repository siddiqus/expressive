class SwaggerEndpoint {
    constructor(summary, description) {
        this.summary = summary;
        this.description = description;
        this.responses = {};
        this.parameters = [];
    }

    addResponse({
        code,
        description,
        schema,
        produces = ["application/json"]
    }) {
        this.responses[code] = {
            produces,
            description,
            schema
        };
        return this;
    }

    addPathParam({ name, description, type, required, schema }) {
        this.parameters.push({
            name,
            description,
            type,
            required,
            schema,
            in: "path"
        });
        return this;
    }

    addRequestBody({ description, required, schema, name = "body" }) {
        this.parameters.push({
            name,
            in: "body",
            description,
            schema,
            required
        });
        return this;
    }

    addQueryParam({ name, description, required, schema }) {
        this.parameters.push({
            name,
            in: "query",
            description,
            schema,
            required
        });
        return this;
    }
}

module.exports = {
    SwaggerEndpoint
};
