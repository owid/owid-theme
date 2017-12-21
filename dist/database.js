"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var DatabaseConnection = /** @class */ (function () {
    function DatabaseConnection(conn) {
        this.conn = conn;
    }
    DatabaseConnection.prototype.query = function (queryStr, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.conn.query(queryStr, params, function (err, rows) {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    };
    DatabaseConnection.prototype.end = function () {
        this.conn.end();
    };
    return DatabaseConnection;
}());
exports.DatabaseConnection = DatabaseConnection;
function createConnection(props) {
    return new DatabaseConnection(mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: props.database
    }));
}
exports.createConnection = createConnection;
//# sourceMappingURL=database.js.map