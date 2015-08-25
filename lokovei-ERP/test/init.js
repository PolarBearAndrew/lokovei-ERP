process.env.NODE_ENV = 'test';

var app = require('../app.js');
var chai = require('chai');
var request = require('supertest');

global.should = chai.should();
global.request = request(app);
