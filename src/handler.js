"use strict";
const VALIDATION_PERIOD_LENGTH_HOURS = 1;
const isValidDomain = require("is-valid-domain");

function makeid(length) {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class Handler {
  constructor(table) {
    const expectedTableName = "domains";
    if (table && table.getConfig().tableName != expectedTableName) {
      throw new Error(
        `Constructor expects '${expectedTableName}' table passed. The passed table name does not match '${expectedTableName}'.`
      );
    }
    this.table = table;
  }

  handle = async (request, response) => {
    const pathParams = request.pathParameters;
    try {
      if (request.httpMethod == "GET") {
        await this.get(
          pathParams.organisationId,
          pathParams.domainName,
          response
        );
      } else if (request.httpMethod == "POST") {
        await this.post(
          pathParams.organisationId,
          pathParams.domainName,
          response
        );
      } else if (request.httpMethod == "DELETE") {
        await this.delete(
          pathParams.organisationId,
          pathParams.domainName,
          response
        );
      } else {
        response(500, "Not supported.");
      }
    } catch (err) {
      response(500, err);
    }
  };

  get = async (organisationId, domainName, response) => {
    let data = null;
    try {
      if (domainName) {
        data = await this.table.get({
          hashKey: organisationId,
          sortKey: domainName,
        });
      } else {
        data = await this.table.query({ hashKey: organisationId });
      }
      const responseBody =
        "Items" in data
          ? {
              data: data.Items.map((item) => item),
            }
          : data.Item;
      response(200, responseBody);
    } catch (err) {
      response(500, err);
    }
  };

  post = async (organisationId, domainName, response) => {
    if (!isValidDomain(domainName)) {
      response(400, "Invalid domain name.");
      return;
    }

    if (!isValidDomain(domainName, { subdomain: false })) {
      response(400, "Invalid domain name. Subdomains not allowed.");
      return;
    }

    const randomId = makeid(32);
    const randomCode = makeid(32);
    let date = new Date();
    date.setHours(date.getHours() + VALIDATION_PERIOD_LENGTH_HOURS);
    const record = {
      ValidationRecordValue: `${randomCode}`,
      ValidationRecordName: `${randomId}_moggies_domainkey.${domainName}`,
      ValidationExpirationDate: date.toISOString(),
      ValidationState: "PENDING",
    };

    try {
      const data = await this.table.create({
        hashKey: organisationId,
        sortKey: domainName,
        record,
      });
      response(200, data);
    } catch (err) {
      response(500, err);
    }
  };

  delete = async (organisationId, domainName, response) => {
    try {
      const data = await this.table.delete({
        hashKey: organisationId,
        sortKey: domainName,
      });
      response(200, data);
    } catch (err) {
      response(500, err);
    }
  };
}

exports.Handler = Handler;
