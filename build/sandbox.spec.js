"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YamlTableReader_1 = require("./YamlTableReader");
describe("TestSuite 1:", () => {
    var table = ` |
        |   ID  |NAME   |   SURNAME   | Value | Lists            |
        |   0   |Hans   |   Dampf     | 3.0   | [1,2,3,4]        |
        |   1   |Klaus  |   Im Glück  | 5.0   | [1,2,3,4,5,6,7]  |
        |   2   |Peter  |   Pan       | 8.0   | [1,2,3,4]        |      
    `;
    let yamlReader = new YamlTableReader_1.default(table);
    it("Should be Rows of Type TableInterface", () => {
        let dummy = yamlReader.getRow(0);
    });
    it("Should Parse Yaml List of Ints", () => {
        let hans = yamlReader.getRow(0);
        let klaus = yamlReader.getRow(1);
        // untyped, so we need to use [""] operator to access elements of object
        expect(hans["Lists"].length).toBe(4);
        // if typed we can enhance readability a lot
        expect(klaus.Lists.length).toBe(7);
    });
    it("Should Parse Header", () => {
        // use table to iterate tests
        expect(yamlReader.header[0]).toEqual("ID");
        expect(yamlReader.header[1]).toEqual("NAME");
        expect(yamlReader.header[2]).toEqual("SURNAME");
        expect(yamlReader.header.length).toBe(5);
    });
    it("Should Parse all Rows", () => {
        expect(yamlReader.rows.length).toBe(3);
    });
    it("Should have parsed Values as doubles", () => {
        yamlReader.rows.filter(value => value["NAME"] === "Peter").forEach(value => {
            expect(value["Value"] * 3).toBe(24.0);
        });
    });
});
describe("Test Table Compare", () => {
    var data = YamlTableReader_1.fixtureData `|
            | ID | Name | List |
            | 1  | Hans | [1,2,3] |
        `;
    var data2 = YamlTableReader_1.fixtureData `|
            | ID | Name | List  |
            | 1  | Hans | [1,2,3, 4] |
        `;
    it("Should compare to true as comparator only checks Name field", () => {
        let comparator = (a, b) => {
            return a.Name === b.Name;
        };
        expect(data.compare(data2, comparator)).toBe(true);
    });
    it("Should compare to false as second table has different Array in Lists field and not using comparator", () => {
        let comparator = (a, b) => {
            return a.Name === b.Name;
        };
        expect(data.compare(data2)).toBe(false);
    });
});
describe("TestSuite 2", () => {
    describe("Real TestCase with Data Fixture", () => {
        // now using tagged template-string to auto convert into YamlTableReader. JS Magic
        var testdata = YamlTableReader_1.fixtureData ` 
        |   ID  | Value1 | Value2 | Squared |
        |   0   |1       | 1      | 1       |
        |   1   |2       | 2      | 4       |
        |   2   |3       | 3      | 9      |
        `;
        // This actually creates a test for each row of the table above
        testdata.describeEach("Square Test", "[ID={ID}]:{Value1} x {Value2} should be equal to {Squared}", (row) => {
            expect((row.Value1 * row.Value2)).toBe(row.Squared);
        });
    });
});
describe("Using Booleans", () => {
    var table = YamlTableReader_1.fixtureData `
        | ID                  | N1      | N2      | Equals |
        | Should Be equal     | 1       | 1       | true  |
        | Shouldn't be equal  | 1       | 2       | false  |
        | Shouldn't be equal  | 1       | "hans"  | false  |
        | Should be equal     | hans    | "hans"  | true  |
    `;
    table.describeEach("Boolean Check:", "{N1} and {N2} {ID}", (row) => {
        expect(row.N1 === row.N2).toBe(row.Equals);
    });
});
//# sourceMappingURL=sandbox.spec.js.map