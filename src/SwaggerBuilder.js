function _addParam(
  parameters,
  paramType,
  { name, description, type, required, schema }
) {
  parameters.push({
    in: paramType,
    name,
    description,
    type,
    required,
    schema
  });
}

module.exports = class SwaggerEndpoint {
  constructor(summary, description) {
    this.summary = summary;
    this.description = description;
    this.responses = {};
    this.parameters = [];
  }

  addResponse({ code, description, schema, produces = ['application/json'] }) {
    this.responses[code] = {
      produces,
      description,
      schema
    };
    return this;
  }

  addPathParam({ name, description, type, required, schema }) {
    _addParam(this.parameters, 'path', {
      name,
      description,
      schema,
      required,
      type
    });
    return this;
  }

  addRequestBody({ description, required, schema, name = 'body' }) {
    _addParam(this.parameters, 'body', {
      name,
      description,
      schema,
      required
    });
    return this;
  }

  addQueryParam({ name, description, required, schema }) {
    _addParam(this.parameters, 'query', {
      name,
      description,
      schema,
      required
    });
    return this;
  }
};
