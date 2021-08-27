"use strict";

class InternalHandler {
  constructor({ table }) {
    const domainsTableName = "domains";

    if (!table || table.getConfig().tableName != domainsTableName) {
      throw new Error(
        `Constructor expects '${domainsTableName}' table passed. The passed table name does not match '${domainsTableName}'.`
      );
    }

    this.table = table;
  }

  handle = async (event) => {
    const actionMethod = this[event.action];
    if (!actionMethod) {
      throw Error("Not supported action.");
    }
    const actionParameters = event.parameters;

    return actionMethod(actionParameters);
  };

  getDomainsPendingValidation = async ({}) => {
    return await this.table.query({
      hashKey: "PENDING",
      indexName: "DomainValidationState",
    });
  };

  setDomainValidationState = async ({
    organisationId,
    domainName,
    validationState,
  }) => {
    return await this.table.update({
      hashKey: organisationId,
      sortKey: domainName,
      updatedFields: { ValidationState: validationState },
    });
  };
}

exports.InternalHandler = InternalHandler;
