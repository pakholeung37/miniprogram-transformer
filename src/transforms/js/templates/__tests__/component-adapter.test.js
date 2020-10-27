const ComponentAdapter = require("../component-adapter").default

describe("Component adapter", () => {
  test("behaviors -> mixins", () => {
    const behavior = { name: "behaviors" }
    const source = {
      behaviors: [behavior],
    }
    const target = {
      mixins: [behavior],
    }
    expect(ComponentAdapter(source)).toEqual(target)
  })
  test("property -> props", () => {
    const observe = (newValue, oldValue) => {
      console.log("a")
    }
    const source = {
      properties: {
        a: {
          type: String,
          value: "a",
        },
        b: {
          type: Boolean,
        },
        c: Object,
        d: {
          type: String,
          value: "d",
          observer: observe,
        },
      },
    }
    const target = {
      props: {
        a: {
          type: String,
          default: "a",
        },
        b: {
          type: Boolean,
        },
        c: Object,
        d: {
          type: String,
          default: "d",
        },
      },
      watch: {
        d: observe,
      },
    }
    expect(ComponentAdapter(source)).toEqual(target)
  })
  test("data -> data", () => {
    const source = {
      data: {
        a: "a",
        b: "b",
      },
    }
    const target = {
      data() {
        return {
          a: "a",
          b: "b",
        }
      },
    }
    expect(ComponentAdapter(source).data()).toEqual(target.data())
  })
})
