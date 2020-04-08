const { Joi } = require("celebrate");

function _isJoiObject(obj) {
    return Boolean(obj.type === "object" && obj.$_terms && obj.$_terms.keys);
}

function _getJoiObjectKeys(obj) {
    return obj.$_terms.keys;
}

function _getTypeFromSchemaProperty(schemaProperty) {
    const { type } = schemaProperty;
    if (["string", "array", "object", "boolean"].includes(type)) {
        return schemaProperty.type;
    }

    if (type === "number") {
        return schemaProperty._rules.some((e) => e.name === "integer") && "integer" || "number";
    }

    return "string";
}

function _getMinMaxFromSchemaDefition(schemaProperty) {
    let min = schemaProperty._rules.find((r) => r.name === "min");
    min = min && min.args.limit || null;

    let max = schemaProperty._rules.find((r) => r.name === "max");
    max = max && max.args.limit || null;

    return {
        min,
        max
    };
}

function _setMinMaxInSwaggerSchema(type, schemaProperty, schema) {
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
    if (!(type === "object" && _getJoiObjectKeys(schemaProperty).length > 0)) return;
    const requiredProperties = [];
    const objectSchemaPropertyMap = {};

    _getJoiObjectKeys(schemaProperty).forEach((objectSchema) => {
        if (objectSchema.schema._flags.presence === "required") {
            requiredProperties.push(objectSchema.key);
        }
        objectSchemaPropertyMap[objectSchema.key] = _getSchemaDefinitionForSwagger(
            objectSchema.schema
        );
    });
    schema.required = requiredProperties.length > 0 && requiredProperties || null;
    schema.properties = objectSchemaPropertyMap;
}

function _setSwaggerPropsForArray(type, schemaProperty, schema) {
    if (type !== "array") return;

    const hasItemSchema = schemaProperty.$_terms.items.length > 0;
    schema.items = hasItemSchema && _getSchemaDefinitionForSwagger(
        schemaProperty.$_terms.items[0]
    ) || {};
}

function _setMultipleOfSwaggerSchema(schemaProperty, schema) {
    const multipleOf = schemaProperty._rules.find((r) => r.name === "multiple");
    schema.multipleOf = multipleOf && multipleOf.args.base || null;
}

function _setPatternSwaggerSchema(schemaProperty, schema) {
    const pattern = schemaProperty._rules.find((r) => r.name === "pattern");
    schema.pattern = pattern && String(pattern.args.regex) || null;
}

function _setDefaultValueForSwaggerSchema(schemaProperty, schema) {
    const defaultValue = schemaProperty._flags.default;
    schema.default = defaultValue && JSON.stringify(defaultValue) || null;
}

function _clearNullValuesInObject(obj) {
    Object.keys(obj).forEach((key) => (obj[key] === undefined || obj[key] === null) && delete obj[key]);
}

function _setSwaggerPropsEnums(schemaProperty, schema) {
    if (!schemaProperty._valids) return;
    const validValues = [...schemaProperty._valids._values.values()];
    schema.enum = validValues;
}

function _setSwaggerPropsNullable(schemaProperty, schema) {
    if (schema.enum && schema.enum.includes(null)) {
        schema.nullable = true;
    }
}

function _getSchemaDefinitionForSwagger(schemaProperty) {
    const type = _getTypeFromSchemaProperty(schemaProperty);

    const schema = {
        type
    };

    _setDefaultValueForSwaggerSchema(schemaProperty, schema);
    _setMultipleOfSwaggerSchema(schemaProperty, schema);
    _setPatternSwaggerSchema(schemaProperty, schema);
    _setSwaggerPropsEnums(schemaProperty, schema);
    _setSwaggerPropsNullable(schemaProperty, schema);
    _setMinMaxInSwaggerSchema(type, schemaProperty, schema);
    _setSwaggerPropsForObject(type, schemaProperty, schema);
    _setSwaggerPropsForArray(type, schemaProperty, schema);

    _clearNullValuesInObject(schema);

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

function _getSwaggerParamsForBody(bodySchema) {
    const joiSchema = _isJoiObject(bodySchema) ? bodySchema : Joi.object(bodySchema);

    const schema = {
        type: "object"
    };

    _setSwaggerPropsForObject("object", joiSchema, schema);
    _clearNullValuesInObject(schema);

    return {
        name: "body",
        in: "body",
        schema
    };
}

function _getObjectNormalizedSchema(schema) {
    if (_isJoiObject(schema)) {
        return _getJoiObjectKeys(schema).reduce((map, schemaObj) => {
            map[schemaObj.key] = schemaObj.schema;
            return map;
        }, {});
    }
    return schema;
}

function _lowercaseHeaderSchemaKeys(headerSchema, paramLocation = "header") {
    if (paramLocation === "header") {
        Object.keys(headerSchema).forEach((key) => {
            headerSchema[key.toLowerCase()] = headerSchema[key];
            delete headerSchema[key];
        });
    }
}

function _addSwaggerParamsForNonBodyProps(parameterKeyMap, parameters) {
    Object.keys(parameterKeyMap).forEach((paramLocation) => {
        const normalizedSchema = _getObjectNormalizedSchema(parameterKeyMap[paramLocation]);
        _lowercaseHeaderSchemaKeys(normalizedSchema, paramLocation);
        const swaggerParams = _getAllSwaggerParamsFromValidationSchema(
            normalizedSchema,
            paramLocation
        );
        parameters.push(...swaggerParams);
    });
}

function joiSchemaToSwaggerRequestParameters(validationSchema) {
    const parameters = [];
    if (!validationSchema) return parameters;

    const {
        query,
        params: path,
        headers: header,
        body
    } = validationSchema;

    const parameterKeyMap = { query, path, header };

    _clearNullValuesInObject(parameterKeyMap);

    _addSwaggerParamsForNonBodyProps(parameterKeyMap, parameters);

    if (body && Object.keys(body).length > 0) {
        parameters.push(_getSwaggerParamsForBody(body));
    }

    return parameters;
}

function lowercaseHeaderSchemaProperties(validationSchema) {
    if (!validationSchema.headers) return;

    const { headers } = validationSchema;

    if (_isJoiObject(headers)) {
        _getJoiObjectKeys(validationSchema.headers).forEach((obj) => {
            obj.key = obj.key.toLowerCase();
        });

        const keysForById = [...validationSchema.headers._ids._byKey.keys()];
        keysForById.forEach((key) => {
            const lowercaseKey = key.toLowerCase();
            const mapValue = validationSchema.headers._ids._byKey.get(key);
            mapValue.id = mapValue.id.toLowerCase();
            validationSchema.headers._ids._byKey.set(lowercaseKey, mapValue);
            validationSchema.headers._ids._byKey.delete(key);
        });
    } else {
        _lowercaseHeaderSchemaKeys(validationSchema.headers);
    }
}

module.exports = {
    joiSchemaToSwaggerRequestParameters,
    lowercaseHeaderSchemaProperties
};
