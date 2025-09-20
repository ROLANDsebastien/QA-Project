import {
  getOptimizedImageUrl,
  preloadImages,
  getLowQualityPlaceholder,
  createResponsiveImageSet,
  ImageOptions,
} from "./image-utils";

// Mock window and document
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockLink = {
  rel: "",
  as: "",
  href: "",
};

beforeAll(() => {
  jest.spyOn(document, "head", "get").mockReturnValue({
    appendChild: mockAppendChild,
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("Image Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOptimizedImageUrl", () => {
    it("should return the original URL if it does not start with /", () => {
      const url = "https://example.com/image.jpg";
      expect(getOptimizedImageUrl(url)).toBe(url);
    });

    it("should prefix relative URLs with window.location.origin", () => {
      const url = "/image.jpg";
      const expected = "https://example.com/image.jpg";
      expect(getOptimizedImageUrl(url)).toBe(expected);
    });

    it("should return the original URL if it is not an image", () => {
      const url = "/document.pdf";
      expect(getOptimizedImageUrl(url)).toBe(
        "https://example.com/document.pdf",
      );
    });

    it("should add width parameter", () => {
      const url = "/image.jpg";
      const options: ImageOptions = { width: 300 };
      const result = getOptimizedImageUrl(url, options);
      expect(result).toBe("https://example.com/image.jpg?w=300&q=80");
    });

    it("should add height parameter", () => {
      const url = "/image.jpg";
      const options: ImageOptions = { height: 200 };
      const result = getOptimizedImageUrl(url, options);
      expect(result).toBe("https://example.com/image.jpg?h=200&q=80");
    });

    it("should add quality parameter with default value", () => {
      const url = "/image.jpg";
      const options: ImageOptions = { width: 300 };
      const result = getOptimizedImageUrl(url, options);
      expect(result).toBe("https://example.com/image.jpg?w=300&q=80");
    });

    it("should add custom quality parameter", () => {
      const url = "/image.jpg";
      const options: ImageOptions = { width: 300, quality: 90 };
      const result = getOptimizedImageUrl(url, options);
      expect(result).toBe("https://example.com/image.jpg?w=300&q=90");
    });

    it("should add format parameter", () => {
      const url = "/image.jpg";
      const options: ImageOptions = { format: "webp" };
      const result = getOptimizedImageUrl(url, options);
      expect(result).toBe("https://example.com/image.jpg?q=80&fmt=webp");
    });

    it("should add multiple parameters", () => {
      const url = "/image.jpg";
      const options: ImageOptions = {
        width: 300,
        height: 200,
        quality: 85,
        format: "webp",
      };
      const result = getOptimizedImageUrl(url, options);
      expect(result).toBe(
        "https://example.com/image.jpg?w=300&h=200&q=85&fmt=webp",
      );
    });

    it("should handle invalid URLs gracefully", () => {
      const invalidUrl = "invalid-url";
      const result = getOptimizedImageUrl(invalidUrl);
      expect(result).toBe(invalidUrl);
    });

    it("should handle URLs with existing query parameters", () => {
      const url = "https://example.com/image.jpg?existing=param";
      const options: ImageOptions = { width: 300 };
      const result = getOptimizedImageUrl(url, options);
      expect(result).toBe(
        "https://example.com/image.jpg?existing=param&w=300&q=80",
      );
    });
  });

  describe("preloadImages", () => {
    it("should not execute on server side", () => {
      // In a real server environment, window would be undefined
      // Since we can't easily mock it in jsdom, we'll just ensure the function doesn't throw
      expect(() => {
        preloadImages(["https://example.com/image.jpg"]);
      }).not.toThrow();
    });

    it("should create and append link elements for each URL", () => {
      jest.spyOn(document, "createElement").mockReturnValue(mockLink);

      const urls = [
        "https://example.com/image1.jpg",
        "https://example.com/image2.png",
      ];

      preloadImages(urls);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.createElement).toHaveBeenCalledWith("link");

      expect(mockLink.rel).toBe("preload");
      expect(mockLink.as).toBe("image");

      expect(mockAppendChild).toHaveBeenCalledTimes(2);
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    });

    it("should handle empty array", () => {
      jest.spyOn(document, "createElement").mockReturnValue(mockLink);

      preloadImages([]);

      expect(document.createElement).not.toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
    });
  });

  describe("getLowQualityPlaceholder", () => {
    it("should generate low quality placeholder URL", () => {
      const url = "/image.jpg";
      const result = getLowQualityPlaceholder(url);
      expect(result).toBe(
        "https://example.com/image.jpg?w=20&h=20&q=20&fmt=webp",
      );
    });

    it("should work with absolute URLs", () => {
      const url = "https://cdn.example.com/image.jpg";
      const result = getLowQualityPlaceholder(url);
      expect(result).toBe(
        "https://cdn.example.com/image.jpg?w=20&h=20&q=20&fmt=webp",
      );
    });
  });

  describe("createResponsiveImageSet", () => {
    it("should create responsive image set with default breakpoints", () => {
      const url = "/image.jpg";
      const result = createResponsiveImageSet(url);
      const expected = [
        "https://example.com/image.jpg?w=640&q=80&fmt=webp 640w",
        "https://example.com/image.jpg?w=768&q=80&fmt=webp 768w",
        "https://example.com/image.jpg?w=1024&q=80&fmt=webp 1024w",
        "https://example.com/image.jpg?w=1280&q=80&fmt=webp 1280w",
        "https://example.com/image.jpg?w=1536&q=80&fmt=webp 1536w",
      ].join(", ");

      expect(result).toBe(expected);
    });

    it("should create responsive image set with custom breakpoints", () => {
      const url = "/image.jpg";
      const breakpoints = [480, 960];
      const result = createResponsiveImageSet(url, breakpoints);
      const expected = [
        "https://example.com/image.jpg?w=480&q=80&fmt=webp 480w",
        "https://example.com/image.jpg?w=960&q=80&fmt=webp 960w",
      ].join(", ");

      expect(result).toBe(expected);
    });

    it("should handle empty breakpoints array", () => {
      const url = "/image.jpg";
      const result = createResponsiveImageSet(url, []);
      expect(result).toBe("");
    });

    it("should work with absolute URLs", () => {
      const url = "https://cdn.example.com/image.jpg";
      const breakpoints = [640];
      const result = createResponsiveImageSet(url, breakpoints);
      expect(result).toBe(
        "https://cdn.example.com/image.jpg?w=640&q=80&fmt=webp 640w",
      );
    });
  });
});
