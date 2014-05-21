/*
 * Cloud Foundry Services Connector
 * Copyright (c) 2014 ActiveState Software Inc. All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/** @module Broker */

'use strict';

var Semver = require('semver');
var Common = require('../common');
var Events = require('events');
var Logule = require('logule');
var Util = require('util');

/**
 * The primary broker class
 * @constructor
 * @param {Object} opts - Broker options.
 */
var Broker = function(opts) {

    var missingOpts = [];
    var missingServiceOpts = [];
    var mismatchedOpts = [];

    var requiredOpts = {
        apiVersion: String,
        authUser: String,
        authPassword: String,
        database: Object,
        name: String,
        port: Number,
        services: Array
    };

    var requiredServiceOpts = {
        plans: Object
    };

    if (!opts) {
        throw new Error('Options not supplied to the broker');
    }

    if (!opts.services) {
        throw new Error('"service" options key not supplied to the broker');
    }

    for (var opt in requiredOpts) {
        if (!opts.hasOwnProperty(opt)) {
            missingOpts.push(opt);
        }
    }

    for (var sopt in requiredServiceOpts) {
        for (var service in opts.services[service]) {
            if (!opts.services[service].hasOwnProperty(sopt)) {
                missingServiceOpts.push(sopt);
            }
        }
    }

    if (missingOpts.length > 0) {
        throw new Error('Missing options: ' + missingOpts.join(', '));
    }

    if (missingServiceOpts.length > 0) {
        throw new Error('Missing service options: ' + missingServiceOpts.join(', '));
    }

    opts.port = process.env.PORT || opts.port;

    opts.semver = Semver.parse(opts.apiVersion);
    opts.version = opts.semver.major;

    var Broker;

    if (opts.semver.major === 2) {
        Broker = require('./v2');
    }

    if (!Broker) {
        throw new Error('Unsupported service API version: ' + opts.apiVersion);
    }

    return new Broker(opts);
};

/* Must inherit here, before custom prototypes are assigned */
Util.inherits(Broker, Events.EventEmitter);

module.exports = Broker;
