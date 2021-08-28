const uuid = require("uuid");
const { Handler } = require("../handler");
const {
  mockTable,
  getPromiseWithReturnValue,
  getPromiseWithReject,
} = require("./helpers");

const { Table } = require("@moggiez/moggies-db");
jest.mock("@moggiez/moggies-db");

const response = jest.fn();

describe("Handler.post", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls create on table", async () => {
    const table = mockTable();
    const orgId = uuid.v4();
    const domainName = "moggies.io";

    const returnValue = { test: uuid.v4() };
    table.create.mockReturnValue(getPromiseWithReturnValue(returnValue));

    const handler = new Handler(table);
    await handler.post(orgId, domainName, response);

    expect(table.create).toHaveBeenCalledWith({
      hashKey: orgId,
      sortKey: expect.any(String),
      record: expect.objectContaining({
        ValidationExpirationDate: expect.any(String),
        ValidationRecordName: expect.any(String),
        ValidationRecordValue: expect.any(String),
      }),
    });
    expect(response).toHaveBeenCalledWith(200, returnValue);
  });

  it("returns 500 when table throws an error", async () => {
    const table = mockTable();
    const orgId = uuid.v4();
    const domainName = "validDomain.com";

    table.create.mockImplementation(() =>
      getPromiseWithReject("This is my error")
    );

    const handler = new Handler(table);
    await handler.post(orgId, domainName, response);

    expect(table.create).toHaveBeenCalledWith({
      hashKey: orgId,
      sortKey: domainName,
      record: expect.any(Object),
    });
    expect(response).toHaveBeenCalledWith(500, "This is my error");
  });
});
