function _getTypeFromSchemaProperty(schemaProperty) {
    const { type } = schemaProperty;
    if (["string", "array", "object", "boolean"].includes(type)) {
        return schemaProperty.type;
    }

    if (type === "number") {
        return schemaProperty._rules.some((e) => e.name === "integer") ? "integer" : "number";
    }

    return "string";
}

function _getSchemaDefinitionForSwagger(schemaProperty) {
    const defaultValue = schemaProperty._flags.default;

    const type = _getTypeFromSchemaProperty(schemaProperty);

    const schema = {
        type
    };

    let min = schemaProperty._rules.find((r) => r.name === "min");
    min = min ? min.args.limit : null;

    let max = schemaProperty._rules.find((r) => r.name === "max");
    max = max ? max.args.limit : null;

    const multipleOf = schemaProperty._rules.find((r) => r.name === "multiple");
    schema.multipleOf = multipleOf ? multipleOf.args.base : null;

    const pattern = schemaProperty._rules.find((r) => r.name === "pattern");
    schema.pattern = pattern ? String(pattern.args.regex) : null;

    let minKey;
    let maxKey;
    if (["number", "integer"].includes(type)) {
        minKey = "minimum";
        maxKey = "maximum";
    } else if (type === "string") {
        minKey = "minLength";
        maxKey = "maxLength";
    } else if (type === "array") {
        minKey = "minItems";
        maxKey = "maxItems";
    }

    schema[minKey] = min;
    schema[maxKey] = max;

    schema.default = defaultValue ? JSON.stringify(defaultValue) : null;

    if (type === "object" && schemaProperty.$_terms.keys.length > 0) {
        const requiredProperties = [];
        const objectSchemaPropertyMap = {};

        const objectSchemas = schemaProperty.$_terms.keys;
        objectSchemas.forEach((objectSchema) => {
            if (objectSchema.schema._flags.presence === "required") {
                requiredProperties.push(objectSchema.key);
            }
            objectSchemaPropertyMap[objectSchema.key] = _getSchemaDefinitionForSwagger(
                objectSchema.schema
            );
        });
        schema.required = requiredProperties.length > 0 ? requiredProperties : null;
        schema.properties = objectSchemaPropertyMap;
    }

    if (type === "array") {
        const itemSchema = schemaProperty.$_terms.items[0];
        const hasItemSchema = schemaProperty.$_terms.items.length > 0;
        schema.items = hasItemSchema ? _getSchemaDefinitionForSwagger(itemSchema) : {};
    }

    Object.keys(schema).forEach((key) => schema[key] === null && delete schema[key]);

    return schema;
}

function schemaToSwaggerRequestParameters(validationSchema) {
    const parameters = [];
    if (!validationSchema) return parameters;

    const { params, query, body, headers } = validationSchema;

    const parameterKeyMap = {
        path: params,
        query,
        body,
        headers
    };

    Object.keys(parameterKeyMap).forEach((paramIn) => {
        const schema = parameterKeyMap[paramIn];
        if (schema) {
            const swaggerParams = Object.keys(schema).map((key) => {
                const schemaProperty = schema[key];
                const schemaDefinition = _getSchemaDefinitionForSwagger(schemaProperty);
                const isRequired = schemaProperty._flags.presence === "required";
                return {
                    name: key,
                    in: paramIn,
                    required: isRequired,
                    schema: schemaDefinition
                };
            });
            parameters.push(...swaggerParams);
        }
    });

    return parameters;
}

module.exports = {
    schemaToSwaggerRequestParameters
};
