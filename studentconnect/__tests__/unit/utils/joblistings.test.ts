//Ai generated tests:

jest.mock(require.resolve("../../../lib/supabase/client"), () => {
  const mockSingle = jest.fn();
  const mockEq = jest.fn(() => ({ single: mockSingle }));
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
  const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
  const mockFrom = jest.fn((table: string) => {
    if (table === "job_postings") {
      return {
        select: mockSelect,
        delete: mockDelete,
      };
    }
    return {};
  });

  return {
    createClient: () => ({
      from: mockFrom,
    }),
    __mocks__: {
      mockFrom,
      mockSingle,
      mockEq,
      mockDelete,
      mockDeleteEq,
    },
  };
});

const {
  getJoblistingById,
  deleteJoblisting,
} = require("../../../lib/supabase/database");

const clientModule = require("../../../lib/supabase/client");
const mocks = clientModule.__mocks__;

// ---- TESTS ----

describe("Joblistings database functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns joblisting when found", async () => {
    const mockJob = { id: "1", title: "Test Job" };

    mocks.mockSingle.mockResolvedValue({
      data: mockJob,
      error: null,
    });

    const result = await getJoblistingById("1");

    expect(result).toEqual(mockJob);
    expect(mocks.mockFrom).toHaveBeenCalledWith("job_postings");
    expect(mocks.mockEq).toHaveBeenCalledWith("id", "1");
  });

  it("returns null when not found (PGRST116)", async () => {
    mocks.mockSingle.mockResolvedValue({
      data: null,
      error: { code: "PGRST116" },
    });

    const result = await getJoblistingById("999");

    expect(result).toBeNull();
  });

  it("delete calls correct id", async () => {
    await deleteJoblisting("1");

    expect(mocks.mockFrom).toHaveBeenCalledWith("job_postings");
    expect(mocks.mockDelete).toHaveBeenCalled();
  });
});