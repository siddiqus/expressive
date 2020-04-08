const { Joi } = require('celebrate');

function _isJoiObject(obj) {
  return Boolean(obj.type === 'object' && obj.$_terms && obj.$_terms.keys);
}

function _getJoiObjectKeys(obj) {
  return obj.$_terms.keys;
}

function _getTypeFromjoiSchema(joiSchema) {
  const { type } = joiSchema;
  if (['string', 'array', 'object', 'boolean'].includes(type)) {
    return joiSchema.type;
  }

  if (type === 'number') {
    return (
      (joiSchema._rules.some(e => e.name === 'integer') && 'integer') ||
      'number'
    );
  }

  return 'string';
}

function _getMinMaxFromSchemaDefition(joiSchema) {
  let min = joiSchema._rules.find(r => r.name === 'min');
  min = (min && min.args.limit) || null;

  let max = joiSchema._rules.find(r => r.name === 'max');
  max = (max && max.args.limit) || null;

  return {
    min,
    max
  };
}

function _setMinMaxInSwaggerSchema(type, joiSchema, swaggerSchema) {
  const { min, max } = _getMinMaxFromSchemaDefition(joiSchema);

  let minKey = 'minimum';
  let maxKey = 'maximum';

  if (type === 'string') {
    minKey = 'minLength';
    maxKey = 'maxLength';
  } else if (type === 'array') {
    minKey = 'minItems';
    maxKey = 'maxItems';
  }

  swaggerSchema[minKey] = min;
  swaggerSchema[maxKey] = max;
}

function _setSwaggerPropsForObject(type, joiSchema, swaggerSchema) {
  if (!(type === 'object' && _getJoiObjectKeys(joiSchema).length > 0)) return;
  const requiredProperties = [];
  const objectjoiSchemaMap = {};

  _getJoiObjectKeys(joiSchema).forEach(objectSchema => {
    if (objectSchema.schema._flags.presence === 'required') {
      requiredProperties.push(objectSchema.key);
    }
    objectjoiSchemaMap[objectSchema.key] = _getSchemaDefinitionForSwagger(
      objectSchema.schema
    );
  });
  swaggerSchema.required =
    (requiredProperties.length > 0 && requiredProperties) || null;
  swaggerSchema.properties = objectjoiSchemaMap;
}

function _setSwaggerPropsForArray(type, joiSchema, swaggerSchema) {
  if (type !== 'array') return;

  const hasItemSchema = joiSchema.$_terms.items.length > 0;
  swaggerSchema.items =
    (hasItemSchema &&
      _getSchemaDefinitionForSwagger(joiSchema.$_terms.items[0])) ||
    {};
}

function _setMultipleOfSwaggerSchema(joiSchema, swaggerSchema) {
  const multipleOf = joiSchema._rules.find(r => r.name === 'multiple');
  swaggerSchema.multipleOf = (multipleOf && multipleOf.args.base) || null;
}

function _setPatternSwaggerSchema(joiSchema, swaggerSchema) {
  const pattern = joiSchema._rules.find(r => r.name === 'pattern');
  swaggerSchema.pattern = (pattern && String(pattern.args.regex)) || null;
}

function _setDefaultValueForSwaggerSchema(joiSchema, swaggerSchema) {
  const defaultValue = joiSchema._flags.default;
  swaggerSchema.default =
    (defaultValue && JSON.stringify(defaultValue)) || null;
}

function _clearNullValuesInObject(obj) {
  Object.keys(obj).forEach(
    key => (obj[key] === undefined || obj[key] === null) && delete obj[key]
  );
}

function _setSwaggerPropsEnums(joiSchema, swaggerSchema) {
  if (!joiSchema._valids) return;
  const validValues = [...joiSchema._valids._values.values()];
  swaggerSchema.enum = validValues;
}

function _setSwaggerPropsNullable(swaggerSchema) {
  if (swaggerSchema.enum && swaggerSchema.enum.includes(null)) {
    swaggerSchema.nullable = true;
  }
}

function _getSchemaDefinitionForSwagger(joiSchema) {
  const type = _getTypeFromjoiSchema(joiSchema);

  const swaggerSchema = {
    type
  };

  _setDefaultValueForSwaggerSchema(joiSchema, swaggerSchema);
  _setMultipleOfSwaggerSchema(joiSchema, swaggerSchema);
  _setPatternSwaggerSchema(joiSchema, swaggerSchema);
  _setSwaggerPropsEnums(joiSchema, swaggerSchema);
  _setSwaggerPropsNullable(swaggerSchema);
  _setMinMaxInSwaggerSchema(type, joiSchema, swaggerSchema);
  _setSwaggerPropsForObject(type, joiSchema, swaggerSchema);
  _setSwaggerPropsForArray(type, joiSchema, swaggerSchema);

  _clearNullValuesInObject(swaggerSchema);

  return swaggerSchema;
}

function _getAllSwaggerParamsFromValidationSchema(schema, paramIn) {
  return Object.keys(schema).map(key => {
    const joiSchema = schema[key];
    const schemaDefinition = _getSchemaDefinitionForSwagger(joiSchema);
    const isRequired = joiSchema._flags.presence === 'required';
    return {
      name: key,
      in: paramIn,
      required: isRequired,
      schema: schemaDefinition
    };
  });
}

function _getSwaggerParamsForBody(bodySchema) {
  const joiSchema = _isJoiObject(bodySchema)
    ? bodySchema
    : Joi.object(bodySchema);

  const swaggerSchema = {
    type: 'object'
  };

  _setSwaggerPropsForObject('object', joiSchema, swaggerSchema);
  _clearNullValuesInObject(swaggerSchema);

  return {
    name: 'body',
    in: 'body',
    schema: swaggerSchema
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

function _lowercaseHeaderSchemaKeys(headerSchema, paramLocation = 'header') {
  if (paramLocation === 'header') {
    Object.keys(headerSchema).forEach(key => {
      headerSchema[key.toLowerCase()] = headerSchema[key];
      delete headerSchema[key];
    });
  }
}

function _addSwaggerParamsForNonBodyProps(parameterKeyMap, parameters) {
  Object.keys(parameterKeyMap).forEach(paramLocation => {
    const normalizedSchema = _getObjectNormalizedSchema(
      parameterKeyMap[paramLocation]
    );
    _lowercaseHeaderSchemaKeys(normalizedSchema, paramLocation);
    const swaggerParams = _getAllSwaggerParamsFromValidationSchema(
      normalizedSchema,
      paramLocation
    );
    parameters.push(...swaggerParams);
  });
}

function joiSchemaToSwaggerRequestParameters(validationSchema) {
  if (!validationSchema) return [];

  const { query, params: path, headers: header, body } = validationSchema;

  const parameters = [];
  if (body && Object.keys(body).length > 0) {
    parameters.push(_getSwaggerParamsForBody(body));
  }

  const parameterKeyMap = { query, path, header };
  _clearNullValuesInObject(parameterKeyMap);
  _addSwaggerParamsForNonBodyProps(parameterKeyMap, parameters);

  return parameters;
}

function lowercaseHeaderSchemaProperties(validationSchema) {
  if (!validationSchema.headers) return;

  const { headers } = validationSchema;

  if (_isJoiObject(headers)) {
    _getJoiObjectKeys(validationSchema.headers).forEach(obj => {
      obj.key = obj.key.toLowerCase();
    });

    const byKey = validationSchema.headers._ids._byKey;
    const keysForById = [...byKey.keys()];
    keysForById.forEach(key => {
      const lowercaseKey = key.toLowerCase();
      const mapValue = byKey.get(key);
      mapValue.id = mapValue.id.toLowerCase();
      byKey.set(lowercaseKey, mapValue);
      byKey.delete(key);
    });
  } else {
    _lowercaseHeaderSchemaKeys(validationSchema.headers);
  }
}

module.exports = {
  joiSchemaToSwaggerRequestParameters,
  lowercaseHeaderSchemaProperties
};
