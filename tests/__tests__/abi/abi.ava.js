import test from "ava";
import { generateAbiSnippet } from "./util.js";

test("Simple function", async (t) => {
  const abi = await generateAbiSnippet("simple_function.ts");
  t.deepEqual(abi.body.functions[0], {
    name: "add",
    kind: "view",
    params: {
      serialization_type: "json",
      args: [
        {
          name: "a",
          type_schema: {
            type: "number",
          },
        },
        {
          name: "b",
          type_schema: {
            type: "number",
          },
        },
      ],
    },
    result: {
      serialization_type: "json",
      type_schema: {
        type: "number",
      },
    },
  });
});

test("JSON Schema", async (t) => {
  const abi = await generateAbiSnippet("json_schema.ts");

  t.is(abi.body.functions[0].params.args.length, 1);
  t.is(abi.body.functions[0].params.serialization_type, "json");
  t.deepEqual(abi.body.functions[0].params.args[0], {
    name: "a",
    type_schema: {
      type: "number",
    },
  });

  t.deepEqual(abi.body.functions[1].params.args[0], {
    name: "a",
    type_schema: {
      type: "string",
    },
  });

  t.deepEqual(abi.body.functions[2].params.args, [
    {
      name: "a",
      type_schema: {
        type: "boolean",
      },
    },
    {
      name: "b",
      type_schema: {
        type: "null",
      },
    },
  ]);

  t.deepEqual(abi.body.functions[3].params.args, [
    {
      name: "a",
      type_schema: {
        items: [{ type: "boolean" }],
        maxItems: 1,
        minItems: 1,
        type: "array",
      },
    },
    {
      name: "b",
      type_schema: {
        items: [{ type: "boolean" }, { type: "boolean" }],
        maxItems: 2,
        minItems: 2,
        type: "array",
      },
    },
    {
      name: "c",
      type_schema: {
        items: [{ type: "boolean" }, { type: "boolean" }, { type: "boolean" }],
        maxItems: 3,
        minItems: 3,
        type: "array",
      },
    },
  ]);

  t.deepEqual(abi.body.functions[4].params.args, [
    {
      name: "a",
      type_schema: {
        items: { type: "boolean" },
        type: "array",
      },
    },
  ]);

  // typescript use structural type, so no ref to Pair
  t.deepEqual(abi.body.functions[5].params.args, [
    {
      name: "a",
      type_schema: {
        items: [{ type: "number" }, { type: "number" }],
        type: "array",
        minItems: 2,
        maxItems: 2,
      },
    },
    { name: "b", type_schema: { $ref: "#/definitions/PairNamed" } },
  ]);
  t.deepEqual(abi.body.root_schema.definitions["PairNamed"], {
    properties: {
      first: {
        type: "number",
      },
      second: {
        type: "number",
      },
    },
    type: "object",
  });

  t.deepEqual(abi.body.root_schema.definitions["IpAddrKind"], {
    enum: [0, 1],
    type: "number",
  });
  t.deepEqual(abi.body.root_schema.definitions["IpV4"], {
    type: "object",
    properties: {
      kind: {
        $ref: "#/definitions/IpAddrKind.V4",
      },
      octets: {
        items: [
          { type: "number" },
          { type: "number" },
          { type: "number" },
          { type: "number" },
        ],
        maxItems: 4,
        minItems: 4,
        type: "array",
      },
    },
  });
  t.deepEqual(abi.body.root_schema.definitions["IpV6"], {
    type: "object",
    properties: {
      kind: {
        $ref: "#/definitions/IpAddrKind.V6",
      },
      address: {
        type: "string",
      },
    },
  });
  t.deepEqual(abi.body.functions[6].params.args, [
    {
      name: "simple",
      type_schema: { $ref: "#/definitions/IpAddrKind" },
    },
    {
      name: "complex",
      type_schema: {
        anyOf: [
          {
            $ref: "#/definitions/IpV4",
          },
          {
            $ref: "#/definitions/IpV6",
          },
        ],
      },
    },
  ]);
});

test("Modifiers function", async (t) => {
  const abi = await generateAbiSnippet("modifiers.ts");
  t.is(abi.body.functions[0].kind, "view");
  t.is(abi.body.functions[0].modifiers, undefined);

  t.is(abi.body.functions[1].kind, "call");
  t.is(abi.body.functions[1].modifiers, undefined);

  t.is(abi.body.functions[2].kind, "call");
  t.deepEqual(abi.body.functions[2].modifiers, ["init"]);

  t.is(abi.body.functions[3].kind, "call");
  t.deepEqual(abi.body.functions[3].modifiers, ["payable"]);

  t.is(abi.body.functions[4].kind, "call");
  t.deepEqual(abi.body.functions[4].modifiers, ["private"]);
});

test("Function return", async (t) => {
  const abi = await generateAbiSnippet("return.ts");
  t.deepEqual(abi.body.functions[0], {
    name: "foo",
    kind: "view",
  });
  t.deepEqual(abi.body.functions[1], {
    name: "bar",
    kind: "view",
    result: {
      serialization_type: "json",
      type_schema: {
        type: "number",
      },
    },
  });
});
