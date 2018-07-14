import {safeLoad} from "js-yaml";
import './StringExtension'; // just interested in the side effects

export interface TestData {
    header: Array<string>;
    rows: Array<object>;

    getRow<T extends object>(number: number): T;

    describeEach(description: string, shouldFormatString: string, cb: (row: object) => any)

    /**
     * Compare two tables
     * @param otherTable
     */
    compare(otherTable: TestData, comparator?: (rowL: object, rowR: object) => boolean): boolean;
}

export default class YamlTableReader {
    private tableString: string;
    private _header: Array<string> = new Array<string>();
    private _rows: Array<object> = new Array<object>();

    get header(): Array<string> {
        return this._header;
    }

    get rows(): Array<object> {
        return this._rows;
    }

    constructor(tableString: string) {
        this.tableString = tableString;
        this.parseTableString(this.tableString);
    }


    /**
     *
     * @param {TestData} otherTable
     * @param {(rowL: object, rowR: object) => boolean} comparator
     * @returns {boolean}
     */
    public compare(otherTable: TestData, comparator: (rowL: object, rowR: object) => boolean): boolean {

        if (this.rows.length != otherTable.rows.length) {
            return false;
        }
        // if comparator is provided use it to match all rows
        for (let i = 0; i < this.rows.length; i++) {
            if (comparator != null) {
                if (!comparator(this.getRow(i), otherTable.getRow(i))) {
                    return false;
                }
            } else {
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
    private parseTableString(tableString: string) {
        // split by line breaks. skip empty lines
        let lines =
            tableString
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
                object[this._header[index]] = safeLoad(value);
            }));
            this._rows.push(object);
        });
    }

    public getRow<T extends object>(number: number): T {
        return <T>this.rows[number];
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
    public describeEach(description: string, formatString: string, cb: (row: object) => any) {
        for (let i = 0; i < this.rows.length; i++) {
            let theDescription = `${description} : ${formatString.formatUsingObject( this.getRow(i))}`;
            it(theDescription, () => {
                cb( this.getRow(i));
            })
        }
    }

}

export function fixtureData(literals, ...placeholders): TestData {
    let result = literals.join();
    return <TestData>new YamlTableReader(result);
}




