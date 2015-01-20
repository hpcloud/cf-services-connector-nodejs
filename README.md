# Cloud Foundry Services Connector (Node.js)
---

## About

This library provides a broker implementation to develop any custom service on
top of any Cloud Foundry based system.

The connector was written with the ideology of being super portable, lightweight,
simple to use, and to take advantage of the node.js module ecosystem. It allows 
for any service to be written in pure Node.js with minimal external
dependencies and memory footprint.

It's super portable, and doesn't need to be running inside a Stackato or
Cloud Foundry instance - it only needs Node.js installed.

## Installation

Either `git clone` this repo as the base service skeleton, or: `npm install cf-services-connector` in your new service.

## Usage

There is an "echo service" demonstrating full use of the broker in
`example/echo-service` that should provide a good reference point to get
started writing your own service.

Once you are in the example/echo-service directory:

    node server.js

The recommended way is to use the connector API directly, for example:

### Broker (coffeescript):
```coffeescript
    Broker = require 'cf-services-connector'
    
    config = require 'config/custom-service' # JSON config file
    
    broker = new Broker(config)
    
    broker.start  (err) ->
        broker.log.error(err)
      
    broker.on 'error', (err) ->
        broker.log.error(err)
    
    broker.on 'provision', (req, next) ->
        # Do custom provisioning action / generate credentials
        # The API allows 'dashboard_url' to be returned here, i.e.:
        # next({dashboard_url: "http://example/instance1" }) 
        next();

    broker.on 'unprovision', (req, next) ->
        # Delete service instance
        # req.params.id
        next()
    
    broker.on 'bind', (req, next) ->
        # Take any action for binding
        reply =
            credentials =
                host: '192.168.100.200'
                port: 9999
                user: 'demo'
                pass: 'demo'

        next(credentials)
    
    broker.on 'unbind', (service, cb) ->
        # Undo instance binding
        # here we tell the CC this instance does not exist
        reply =
            doesNotExist: true
        next(reply)
    
```

## Register the broker with the CC

Once you have the service setup, simply run the following against the
Cloud Foundry instance you wish to install the service to (requires admin):

    stackato create-service-broker demo-service --url http://<ip>:5001 --user demouser --password demopassword

or using the `cf` client:

    cf create-service-broker demo-service demouser demopassword http://<ip>:5001

The username and password are defined in echo-service/config/echo-service.json

To make the service broker plans accessible to organizations you must make
a couple of extra curl calls, outlined [here](http://docs.cloudfoundry.org/services/access-control.html). 
If you are using the `stackato` client:

    stackato update-service-plan --public default --vendor "Echo Service"
    stackato update-service-plan --public secondary --vendor "Echo Service"

### Binding to an Application

Services made available through a service broker can be bound to an application in the same manner as any other service. Assuming you have an application named demo-app, the following are ways to expose your service to the app.

#### Using manifest.yml

```
applications
- name: demo-app
  services:
    my-echo-service:
      type: Echo Service
```

#### Provision a Service Instance During App Push

Note: As of `cf` CLI v6 `cf push` no longer uses an interactive prompt.
Using the `stackato` client:

```
$ stackato push
# Non-service prompts and outputs omitted
Create services to bind to 'demo-app' ? [yN]: y
What kind of service ?
1. default.Echo Service
2. free.filesystem
3. free.mysql
4. free.postgresql
5. secondary.Echo Service
Choose:? 1
Specify the name of the service [default.Echo Service-608e1]
[default.Echo Service-608e1]:
Service default.Echo Service-608e1:
Creating new service [default.Echo Service-608e1] ... OK
  Binding default.Echo Service-608e1 to demo-app ... OK
Create another ? [yN]: N
Uploading Application [demo-app] ...
# Remainder of deployment logs omitted
```

#### Provision a Service and Bind to an App

Using the `stackato` client:

```
$ stackato create-service 'Echo Service'
1. default: This is the first plan
2. secondary: This is the secondary plan
Please select the service plan to enact:? 1
Creating new service [Echo Service-608e1] ... OK
$ stackato push -n --no-start
$ stackato bind-service 'Echo Service-608e1' demo-app
  Binding Echo Service-608e1 to demo-app ... OK
```

or using the `cf` client:

```
$ cf create-service 'Echo Service' default my-echo-service
Creating service my-echo-service in org Organization / space Space as user...
OK
$ cf push --no-start
$ cf bind-service demo-app my-echo-service
Binding service my-echo-service to app demo-app in org Organization / space Space as user...
OK
```

### Using the Service
When a service is bound to an application, information about the service is made available through the VCAP_SERVICES environment variable. Use this information to access and consume the service. Details on the consuming the service are application and service dependent.

```
{
    "Echo Service": [
        {
            "name": "default.Echo Service-608e1",
            "label": "Echo Service",
            "tags": [],
            "plan": "default",
            "credentials": {
                "echo": "echo",
                "anotherEcho": "anotherEcho"
            }
        }
    ]
}
```

## Logging

The logging system uses `Logule`. The `debug` and `trace` levels are
suppressed by default, you can add a `logule.json` to your services base
directory, with the following to enable debugging:

```json
  "emitter"  : {
    "enabled"   : false,
    "mutable"   : false,
    "suppress"  : []
  }
```

See [Logule](https://github.com/clux/logule) for more information.

## Further Reading

If you plan to extend or develop this connector, the
[Cloud Foundry Services API documentation](http://docs.cloudfoundry.org/services/api.html)
provides solid information for each version of the API.

## Reporting Issues & feedback

Feel free to open a Github issue or join the `#stackato` irc channel on `irc.freenode.net`.
