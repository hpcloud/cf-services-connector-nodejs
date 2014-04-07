#
# Cloud Foundry Services Connector
# Copyright (c) 2014 ActiveState Software Inc. All rights reserved.
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#

assert = require ('assert')
request = require('supertest')
request = request('http://user:pass@localhost:5000')

describe 'GET /v2/catalog', ->
  it 'respond with the services catalog json', (done) ->
    request.get('/v2/catalog')
    .set('x-broker-api-version', '2.1')
    .expect (res) ->
        assert(res.body.services)
        assert(res.body.services.length > 0)
        assert(res.body.services[0]["name"] == "Test Service")
    .expect (res) ->
        assert(res.body.services[0].plans)
        assert(res.body.services[0].plans.length > 0)
        assert(res.body.services[0].plans[0]["name"] == "free")
    .expect('Content-Type', /json/)
    .expect 200, done

describe 'GET /v2/catalog with incorrect API header', ->
  it 'respond with ', (done) ->
    request.get('/v2/catalog')
    .set('x-broker-api-version', '99999999999999.9999999999999999')
    .expect 412, done

