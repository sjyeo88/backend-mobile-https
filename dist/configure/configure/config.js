"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerConfig {
    constructor() {
        this.dbSetting = {
            host: '182.162.104.243',
            user: 'root',
            password: '!dutkak3',
            port: 3306,
            database: 'USER',
        };
        this.jwt_password = 'test';
    }
}
exports.ServerConfig = ServerConfig;
