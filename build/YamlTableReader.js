"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = require("js-yaml");
require("./StringExtension"); // just interested in the side effects
class YamlTableReader {
    constructor(tableString) {
        this._header = new Array();
        this._rows = new Array();
        this.tableString = tableString;
        this.parseTableString(this.tableString);
    }
    get header() {
        return this._header;
    }
    get rows() {
        return this._rows;
    }
    /**
     *
     * @param {TestData} otherTable
     * @param {(rowL: object, rowR: object) => boolean} comparator
     * @returns {boolean}
     */
    compare(otherTable, comparator) {
        if (this.rows.length != otherTable.rows.length) {
            return false;
        }
        // if comparator is provided use it to match all rows
        for (let i = 0; i < this.rows.length; i++) {
            if (comparator != null) {
                if (!comparator(this.getRow(i), otherTable.getRow(i))) {
                    return false;
                }
            }
            else {
                for (const value of this.header) {
                    var left = this.getRow(i)[value];
                    var right = otherTable.getRow(i)[value];
                    if ((left !== right)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    /**
     * Parse Table String into data table
     * @param tableString
     */
    parseTableString(tableString) {
        // split by line breaks. skip empty lines
        let lines = tableString
            .split(/\n/)
            .filter(value => (value.match(/\|/g) || []).length > 1)
            .map(value => value.trim().replace(/^\|/, "").replace(/\|$/, "").trim());
        if (lines.length != 0) {
            // first row == header
            lines[0].split(/\|/).forEach(value => this._header.push(value.trim()));
        }
        lines.slice(1).map((row) => {
            // split again
            let object = {};
            row.split(/\|/).map(((value, index) => {
                // parse each field as yaml string
                object[this._header[index]] = js_yaml_1.safeLoad(value);
            }));
            this._rows.push(object);
        });
    }
    getRow(number) {
        return this.rows[number];
    }
    /**
     * Iterating eacht Row of the Testdata to
     * generate a testcase by calling it(..). This needs to be called within
     * an active jasmine describe(...) section.
     * For each row in the Testdata the provided expectation callback is called and passed in the row data
     * for assertion.
     * @param description Description to be prepended to the it(...) description.
     * @param formatString Format String has access to the row and it's values by using {name} within the template string
     * @param cb
     */
    describeEach(description, formatString, cb) {
        for (let i = 0; i < this.rows.length; i++) {
            let theDescription = `${description} : ${formatString.formatUsingObject(this.getRow(i))}`;
            it(theDescription, () => {
                cb(this.getRow(i));
            });
        }
    }
}
exports.default = YamlTableReader;
function fixtureData(literals, ...placeholders) {
    let result = literals.join();
    return new YamlTableReader(result);
}
exports.fixtureData = fixtureData;
//# sourceMappingURL=YamlTableReader.js.map