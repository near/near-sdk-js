import test from "ava";
import { generateAbiSnippet } from "./util.js"

test("Simple function", async (t) => {
  const abi = await generateAbiSnippet("simple_function.ts");
  t.deepEqual(abi.body.functions[0], {
    name: 'add',
    kind: 'view',
    modifiers: [],
    params: {
      serialization_type: 'json',
      args: [
        {
          name: 'a',
          type_schema: {
            type: 'number',
          },
        },
        {
          name: 'b',
          type_schema: {
            type: 'number',
          },
        },
      ]
    },
    result: {
      serialization_type: 'json',
      type_schema: {
        type: 'number',
      }
    }
  })
});

test("JSON Schema", async (t) => {
  const abi = await generateAbiSnippet("json_schema.ts");

  t.is(abi.body.functions[0].params.args.length, 1);
  t.is(abi.body.functions[0].params.serialization_type, 'json');
  t.deepEqual(abi.body.functions[0].params.args[0], {
    name: 'a',
    type_schema: {
      type: 'number',
    },
  })

  t.deepEqual(abi.body.functions[1].params.args[0], {
    name: 'a',
    type_schema: {
      type: 'string',
    },
  })

  t.deepEqual(abi.body.functions[2].params.args, [{
    name: 'a',
    type_schema: {
      type: 'boolean',
    },
  },
  {
    name: 'b',
    type_schema: {
      type: 'null',
    },
  }])

  t.deepEqual(abi.body.functions[3].params.args, [{
    name: 'a',
    type_schema: {
      items: [{ type: 'boolean' }],
      maxItems: 1,
      minItems: 1,
      type: 'array'
    },
  },
  {
    name: 'b',
    type_schema: {
      items: [{ type: 'boolean' }, { type: 'boolean' }],
      maxItems: 2,
      minItems: 2,
      type: 'array'
    },
  },
  {
    name: 'c',
    type_schema: {
      items: [{ type: 'boolean' }, { type: 'boolean' }, { type: 'boolean' }],
      maxItems: 3,
      minItems: 3,
      type: 'array'
    },
  }])

  t.deepEqual(abi.body.functions[4].params.args, [{
    name: 'a',
    type_schema: {
      items: {type: 'boolean' },
      type: 'array'
    },
  }])

  console.log(abi.body.functions[5].params.args)
})
