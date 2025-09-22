"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const env_1 = require("../config/env");
const fs_1 = require("fs");
const path_1 = require("path");
const pathDir = (0, path_1.dirname)(env_1.env.databasePath);
(0, fs_1.mkdirSync)(pathDir, { recursive: true });
exports.db = new better_sqlite3_1.default(env_1.env.databasePath);
exports.db.pragma('foreign_keys = ON');
