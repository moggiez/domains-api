"use strict";

const AWS = require("aws-sdk");
const db = require("@moggiez/moggies-db");
const helpers = require("@moggiez/moggies-lambda-helpers");
const auth = require("@moggiez/moggies-auth");

const { InternalHandler } = require("./internalHandler");
const { Handler } = require("./handler");

const DEBUG = false;

const tableConfig = {
  tableName: "domains",
  hashKey: "OrganisationId",
  sortKey: "DomainName",
  indexes: {
    DomainValidationState: {
      hashKey: "ValidationState",
      sortKey: "DomainName",
    },
    Domains: {
      hashKey: "DomainName",
      sortKey: "OrganisationId",
    },
  },
};

exports.handler = async function (event, context, callback) {
  const table = new db.Table({ config: tableConfig, AWS: AWS });
  if ("isInternal" in event && event.isInternal) {
    if (DEBUG) {
      return event;
    }

    const internalHandler = new InternalHandler({ table });
    return await internalHandler.handle(event);
  } else {
    const response = helpers.getResponseFn(callback);

    if (DEBUG) {
      response(200, event);
    }

    const user = auth.getUserFromEvent(event);
    const request = helpers.getRequestFromEvent(event);
    request.user = user;

    const handler = new Handler(table);
    await handler.handle(request, response);
  }
};
