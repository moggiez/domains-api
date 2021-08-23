const uuid = require("uuid");
const { Handler } = require("../handler");
const { buildLambdaRequest, mockTable } = require("./helpers");

const helpers = require("@moggiez/moggies-lambda-helpers");
const auth = require("@moggiez/moggies-auth");
const { Table } = require("@moggiez/moggies-db");
jest.mock("@moggiez/moggies-db");

const response = jest.fn();

describe("Handler.handle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls this.get when httpMethod is GET", () => {
    const orgId = uuid.v4();
    const domainName = uuid.v4();
    const event = buildLambdaRequest(
      "GET",
      "/domain",
      `${orgId}/domains/${domainName}`,
      {
        TestField: 1,
      },
      {
        organisationId: orgId,
        domainName,
      }
    );
    const user = auth.getUserFromEvent(event);
    const request = helpers.getRequestFromEvent(event);
    request.user = user;

    const handler = new Handler(mockTable());
    handler.get = jest.fn();

    handler.handle(request, response);

    expect(handler.get).toHaveBeenCalledWith(orgId, domainName, response);
  });

  it("returns 400 when POST with invalid domainName", async () => {
    const domainName = "not-a-domain";
    const event = buildLambdaRequest(
      "POST",
      "/domain",
      `${uuid.v4()}/domains/${domainName}`,
      {},
      {
        organisationId: uuid.v4(),
        domainName,
      }
    );
    const user = auth.getUserFromEvent(event);
    const request = helpers.getRequestFromEvent(event);
    request.user = user;

    const handler = new Handler(mockTable());

    await handler.handle(request, response);

    expect(response).toHaveBeenCalledWith(400, "Invalid domain name.");
  });

  it("returns 400 when POST with invalid domainName including subdomain", async () => {
    const domainName = "subdomain.validDomain.co.uk";
    const event = buildLambdaRequest(
      "POST",
      "/domain",
      `${uuid.v4()}/domains/${domainName}`,
      {},
      {
        organisationId: uuid.v4(),
        domainName,
      }
    );
    const user = auth.getUserFromEvent(event);
    const request = helpers.getRequestFromEvent(event);
    request.user = user;

    const handler = new Handler(mockTable());

    await handler.handle(request, response);

    expect(response).toHaveBeenCalledWith(
      400,
      "Invalid domain name. Subdomains not allowed."
    );
  });

  it("returns 200 when POST with valid domainName", async () => {
    const domainName = "validDomain.co.uk";
    const event = buildLambdaRequest(
      "POST",
      "/domain",
      `${uuid.v4()}/domains/${domainName}`,
      {},
      {
        organisationId: uuid.v4(),
        domainName,
      }
    );
    const user = auth.getUserFromEvent(event);
    const request = helpers.getRequestFromEvent(event);
    request.user = user;

    const handler = new Handler(mockTable());

    await handler.handle(request, response);

    expect(response).toHaveBeenCalledWith(200, undefined);
  });

  it("calls this.post when httpMethod is POST", () => {
    const orgId = uuid.v4();
    const domainName = uuid.v4();
    const payload = {
      TestField: 1,
    };
    const event = buildLambdaRequest(
      "POST",
      "/domain",
      `${orgId}/domains/${domainName}`,
      payload,
      {
        organisationId: orgId,
        domainName,
      }
    );
    const user = auth.getUserFromEvent(event);
    const request = helpers.getRequestFromEvent(event);
    request.user = user;

    const handler = new Handler(mockTable());
    handler.post = jest.fn();

    handler.handle(request, response);

    expect(handler.post).toHaveBeenCalledWith(orgId, domainName, response);
  });

  it("calls this.delete when httpMethod is DELETE", () => {
    const orgId = uuid.v4();
    const domainName = uuid.v4();
    const event = buildLambdaRequest(
      "DELETE",
      "/domain",
      `${orgId}/domains/${domainName}`,
      {},
      {
        organisationId: orgId,
        domainName,
      }
    );
    const user = auth.getUserFromEvent(event);
    const request = helpers.getRequestFromEvent(event);
    request.user = user;

    const handler = new Handler(mockTable());
    handler.delete = jest.fn();

    handler.handle(request, response);

    expect(handler.delete).toHaveBeenCalledWith(orgId, domainName, response);
  });
});
