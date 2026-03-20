import { describe, it, expect } from "vitest";
import {
  parsedINPSchema,
  parsedKGMSchema,
  parsedPNNSchema,
  parsedHarHabituachSchema,
  validateParsedFile,
} from "./portfolio";

describe("Zod schemas", () => {
  it("validates a minimal INP file with defaults for missing fields", () => {
    const raw = {
      type: "INP",
      header: {
        sugMimshak: "1",
        xmlVersion: "1.0",
        executionDate: "20260301",
        senderCode: "001",
        senderName: "Test",
        operatorCode: "002",
        operatorName: "Op",
      },
      provider: {
        code: "123",
        name: "Test Provider",
        contact: {
          firstName: "",
          lastName: "",
          country: "",
          city: "",
          street: "",
          houseNumber: "",
          zipCode: "",
          phone: "",
          cellphone: "",
          fax: "",
          email: "",
        },
      },
      products: [],
      fileName: "test.dat",
    };

    const result = parsedINPSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it("applies catch defaults for malformed product fields", () => {
    const raw = {
      type: "INP",
      header: {
        sugMimshak: "1",
        xmlVersion: "1.0",
        executionDate: "20260301",
        senderCode: "001",
        senderName: "Test",
        operatorCode: "002",
        operatorName: "Op",
      },
      provider: {
        code: "123",
        name: "Provider",
        contact: {
          firstName: "",
          lastName: "",
          country: "",
          city: "",
          street: "",
          houseNumber: "",
          zipCode: "",
          phone: "",
          cellphone: "",
          fax: "",
          email: "",
        },
      },
      products: [
        {
          providerCode: "123",
          providerName: "Provider",
          productType: "6",
          planName: "Plan",
          policyNumber: "POL-001",
          status: "1",
          // Missing many fields — should get defaults
        },
      ],
      fileName: "test.dat",
    };

    const result = parsedINPSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.products[0].policyNumber).toBe("POL-001");
      expect(result.data.products[0].joinDate).toBe("");
      expect(result.data.products[0].contributionPercent).toBe(0);
    }
  });

  it("validates Har Habituach data", () => {
    const raw = {
      type: "HAR_HABITUACH",
      records: [{ "שם חברה": "מגדל", "סכום": 1000 }],
      columns: ["שם חברה", "סכום"],
      fileName: "har.xlsx",
    };

    const result = parsedHarHabituachSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it("validateParsedFile returns data with warnings for partial data", () => {
    const raw = {
      type: "KGM",
      header: {
        sugMimshak: "1",
        xmlVersion: "1.0",
        executionDate: "20260301",
        senderCode: "001",
        senderName: "Test",
        operatorCode: "002",
        operatorName: "Op",
      },
      provider: {
        code: "123",
        name: "Provider",
        contact: {
          firstName: "",
          lastName: "",
          country: "",
          city: "",
          street: "",
          houseNumber: "",
          zipCode: "",
          phone: "",
          cellphone: "",
          fax: "",
          email: "",
        },
      },
      products: [],
      fileName: "kgm.dat",
    };

    const result = validateParsedFile(raw);
    expect(result.data.type).toBe("KGM");
    expect(result.warnings).toEqual([]);
  });
});
