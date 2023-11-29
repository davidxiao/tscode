import { prepareData } from "../src/utils";

describe("utils", () => {
  it("prepareData should work", () => {
    const data = {
      id: 65737,
    };
    const expected = Buffer.from([0x81, 0x0c, 0x7b, 0x22, 0x69, 0x64, 0x22, 0x3a, 0x36, 0x35, 0x37, 0x33, 0x37, 0x7d]);
    const actual = prepareData(JSON.stringify(data));
    expect(actual).toBeDefined();
    expect(expected.compare(actual!)).toEqual(0);
  });
});
