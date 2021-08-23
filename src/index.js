"use strict";

const AWS = require("aws-sdk");
const db = require("@moggiez/moggies-db");
const helpers = require("@moggiez/moggies-lambda-helpers");
const auth = require("@moggiez/moggies-auth");

const { Handler } = require("./handler");

const DEBUG = false;

const tableConfig = {
  tableName: "domains",
  hashKey: "OrganisationId",
  sortKey: "DomainName",
};

exports.handler = function (event, context, callback) {
  const response = helpers.getResponseFn(callback);

  if (DEBUG) {
    response(200, event);
  }

  const user = auth.getUserFromEvent(event);
  const request = helpers.getRequestFromEvent(event);
  request.user = user;

  const table = new db.Table({ config: tableConfig, AWS: AWS });

  const handler = new Handler(table);
  handler.handle(request, response);
};
