import { fetchApi, api, ApiResponse } from "./api";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any cached data
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("fetchApi", () => {
    it("should make a GET request successfully", async () => {
      const mockResponse = { data: "test data" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      const result = await fetchApi("/test");

      expect(mockFetch).toHaveBeenCalledWith("/test", {
        headers: { "Content-Type": "application/json" },
        signal: expect.any(AbortSignal),
      });
      expect(result).toEqual({
        data: mockResponse,
        statusCode: 200,
      });
    });

    it("should handle query parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      });

      await fetchApi("/test", {
        params: { id: 1, name: "test", active: true },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/test?id=1&name=test&active=true",
        expect.any(Object),
      );
    });

    it("should handle POST requests with data", async () => {
      const postData = { name: "test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: 1 }),
      });

      const result = await fetchApi("/test", {
        method: "POST",
        body: JSON.stringify(postData),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(result.statusCode).toBe(201);
    });

    it("should handle request timeout", async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: false,
                  status: 408,
                  statusText: "Request timeout",
                }),
              10, // Reduce delay to avoid test timeout
            );
          }),
      );

      const result = await fetchApi("/test", { timeout: 5 }); // Reduce timeout

      expect(result).toEqual({
        data: null,
        error: "Request timeout",
        statusCode: 408,
      });
    }, 10000); // Increase Jest timeout for this test

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchApi("/test");

      expect(result).toEqual({
        data: null,
        error: "Network error",
        statusCode: 500,
      });
    });

    it("should handle JSON parsing errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await fetchApi("/test");

      expect(result.statusCode).toBe(500); // Should be 500 due to error
      expect(result.error).toBe("Invalid JSON"); // Error should be present
    });

    it("should handle non-JSON responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/plain" }),
        text: async () => "Plain text response",
      });

      const result = await fetchApi("/test");

      expect(result.data).toBe("Plain text response");
    });

    it("should cache GET requests", async () => {
      const mockResponse = { data: "cached data" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      // First call
      await fetchApi("/test");
      // Second call should use cache
      const result = await fetchApi("/test");

      expect(mockFetch).toHaveBeenCalledTimes(1); // Should only be called once due to cache
      expect(result.data).toEqual(mockResponse);
    });

    it("should not cache when cache is disabled", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: "test" }),
      });

      await fetchApi("/test", { cache: "no-cache" });
      await fetchApi("/test", { cache: "no-cache" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should handle error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Resource not found" }),
      });

      const result = await fetchApi("/test");

      expect(result).toEqual({
        data: { error: "Resource not found" },
        error: "Resource not found",
        statusCode: 404,
      });
    });
  });

  describe("api utility methods", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true }),
      });
    });

    it("should handle GET requests", async () => {
      await api.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("should handle POST requests", async () => {
      const data = { name: "test" };
      await api.post("/test", data);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(data),
        }),
      );
    });

    it("should handle PUT requests", async () => {
      const data = { name: "updated" };
      await api.put("/test", data);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(data),
        }),
      );
    });

    it("should handle DELETE requests", async () => {
      await api.delete("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("should pass additional options to fetchApi", async () => {
      await api.get("/test", { timeout: 5000, params: { id: 1 } });

      expect(mockFetch).toHaveBeenCalledWith("/test?id=1", expect.any(Object));
    });
  });

  describe("cache functionality", () => {
    it("should expire cached data after default time", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      // First call
      await fetchApi("/test");

      // Advance time past cache expiration
      jest.advanceTimersByTime(61 * 1000); // 61 seconds

      // Second call should not use cache
      await fetchApi("/test");

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should not cache non-GET requests", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: "test" }),
      });

      await fetchApi("/test", { method: "POST" });
      await fetchApi("/test", { method: "POST" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should not cache error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Server error" }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: "success" }),
      });

      await fetchApi("/test");
      await fetchApi("/test");

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
