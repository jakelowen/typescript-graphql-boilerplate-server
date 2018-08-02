import generateDeterministicCacheId from "./generateDeterministicCacheId";
import decodeDeterministicCacheId from "./decodeDeterministicCacheId";

test("generate determinist cache and decode", async () => {
  const payload = {
    table: {
      name: "foo",
      uniqueColumn: "bar"
    },
    where: {
      bar_is: "baz"
    },
    orderBy: { sort: "baz", direction: "ASC" },
    limit: 10,
    after: "yadda",
    ttl: 140
  };
  const encoded = generateDeterministicCacheId(payload);
  expect(typeof encoded).toBe("string");
  const decoded = decodeDeterministicCacheId(encoded);
  expect(decoded).toEqual(payload);
});
