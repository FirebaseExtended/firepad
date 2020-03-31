/** Monaco Adapter Unit Tests */
describe('Monaco Operations Test', function () {
    /** Editor Content */
    var editorContent =
`module Conway {

    export class Cell {
        public row: number;
        public col: number;
        public live: boolean;
        
        constructor(row: number, col: number, live: boolean) {
            this.row = row;
            this.col = col;
            this.live = live
        }
    }
}
`;
    class Range {
      constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
        this.startLineNumber = startLineNumber;
        this.startColumn = startColumn;
        this.endLineNumber = endLineNumber;
        this.endColumn = endColumn;
      }

      isEmpty() {
        return this.startLineNumber === this.endLineNumber && this.startColumn === this.endColumn;
      }
    }


    /** Editor Changes */
    var operations = [
      { rangeLength: 0, text: ' */', rangeOffset: 302, range: new Range(15, 1, 15, 1), forceMoveMarkers: false },
      { rangeLength: 0, text: '/* ', rangeOffset: 0, range: new Range(1, 1, 1, 1), forceMoveMarkers: false }
    ];

    window.monaco = {
      Range,
    };

    it('should convert Monaco Editor changes to Text Operation', function () {
        var MonacoAdapter = firepad.MonacoAdapter;
        var operationFromMonacoChange = MonacoAdapter.prototype.operationFromMonacoChange;
        var context = {
          lastDocLines: editorContent.split('\n'),
          getModel() {
            return {
              getEOL() {
                return '\n';
              },
            };
          },
        };
        var pair = operationFromMonacoChange.call(context, operations, editorContent.length);

        /** Base Length of First Operation must be Target Length of Second Operation */
        expect(pair[1].targetLength).toEqual(pair[0].baseLength);

        /** Base Length of Second Operation must be Target Length of First Operation */
        expect(pair[0].targetLength).toEqual(pair[1].baseLength);
        /** Correct Operations Returned */
        expect(pair[0]).toEqual(new firepad.TextOperation().retain(0).insert('/* ').retain(302).insert(' */'));
    });
});
