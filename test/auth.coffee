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
request = request('http://wrong:auth@localhost:5000')

describe 'GET /v2/catalog', ->
  it 'should reject the incorrect basic auth credentials', (done) ->
    request.get('/v2/catalog')
    .expect 401, done
