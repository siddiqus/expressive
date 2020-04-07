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

function _getMinMaxFromSchemaDefition(schemaProperty) {
    let min = schemaProperty._rules.find((r) => r.name === "min");
    min = min ? min.args.limit : null;

    let max = schemaProperty._rules.find((r) => r.name === "max");
    max = max ? max.args.limit : null;

    return {
        min,
        max
    };
}

function _setMinMaxInSwaggerSchema(schemaProperty, type, schema) {
    const { min, max } = _getMinMaxFromSchemaDefition(schemaProperty);

    let minKey = "minimum";
    let maxKey = "maximum";

    if (type === "string") {
        minKey = "minLength";
        maxKey = "maxLength";
    } else if (type === "array") {
        minKey = "minItems";
        maxKey = "maxItems";
    }

    schema[minKey] = min;
    schema[maxKey] = max;
}

function _setSwaggerPropsForObject(type, schemaProperty, schema) {
    if (!(type === "object" && schemaProperty.$_terms.keys.length > 0)) return;

    const requiredProperties = [];
    const objectSchemaPropertyMap = {};

    schemaProperty.$_terms.keys.forEach((objectSchema) => {
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

function _setSwaggerPropsForArray(type, schemaProperty, schema) {
    if (type !== "array") return;

    const itemSchema = schemaProperty.$_terms.items[0];
    const hasItemSchema = schemaProperty.$_terms.items.length > 0;
    schema.items = hasItemSchema ? _getSchemaDefinitionForSwagger(itemSchema) : {};
}

function _getSchemaDefinitionForSwagger(schemaProperty) {
    const defaultValue = schemaProperty._flags.default;

    const type = _getTypeFromSchemaProperty(schemaProperty);

    const schema = {
        type
    };

    const multipleOf = schemaProperty._rules.find((r) => r.name === "multiple");
    schema.multipleOf = multipleOf ? multipleOf.args.base : null;

    const pattern = schemaProperty._rules.find((r) => r.name === "pattern");
    schema.pattern = pattern ? String(pattern.args.regex) : null;

    _setMinMaxInSwaggerSchema(schemaProperty, type, schema);

    schema.default = defaultValue ? JSON.stringify(defaultValue) : null;

    _setSwaggerPropsForObject(type, schemaProperty, schema);
    _setSwaggerPropsForArray(type, schemaProperty, schema);

    Object.keys(schema).forEach((key) => schema[key] === null && delete schema[key]);

    return schema;
}

function _getAllSwaggerParamsFromValidationSchema(schema, paramIn) {
    return Object.keys(schema).map((key) => {
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
}

function schemaToSwaggerRequestParameters(validationSchema) {
    const parameters = [];
    if (!validationSchema) return parameters;

    const {
        query,
        body,
        params: path,
        headers: header
    } = validationSchema;
    const parameterKeyMap = { query, body, path, header };

    Object.keys(parameterKeyMap).forEach((paramLocation) => {
        const schema = parameterKeyMap[paramLocation];
        if (schema) {
            const swaggerParams = _getAllSwaggerParamsFromValidationSchema(schema, paramLocation);
            parameters.push(...swaggerParams);
        }
    });

    return parameters;
}

module.exports = {
    schemaToSwaggerRequestParameters
};
