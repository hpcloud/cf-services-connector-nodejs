# Cloud Foundy Services Connector (Node.js)

## About

This library provides a broker implementation to develop any custom service on
top of any Cloud Foundry based system.

The connector was written with the ideology of being super portable, lightweight,
simple to use, and to take advantage of the node.js module ecosystem. It allows 
for any service to be written in pure Node.js with minimal external
dependencies and memory footprint.

It's super portable, and doesn't need to be running inside a Stackato or
Cloud Foundry instance - it only needs Node.js installed.

## Getting Started with Echo

The example "echo service" demostrates the full use of a broker and should provide a 
good reference point to get started writing your own service.

On a Stackato VM, run the following commands to download and start the node.js service broker:

    $ npm install cf-services-connector
    $ (cd node_modules/cf-services-connector/example/echo-service& node server.js)

Create a service broker using the Stackato client:

    stackato create-service-broker demo-echo-service --url http://<STACKATO-VM-IP>:5001 --user demouser --password demopassword

Make the `default` service plan public:

    st update-service-plan --public default --vendor "Echo Service"

The echo service configurations are in `config/echo-service.json`.

## Creating Your Own Service

`git clone` this repo as the base service skeleton

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

### Logging

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

### Register the broker with the CC

Once you have the service setup and running, simply run the following against the
Cloud Foundry instance you wish to install the service to (requires admin):

    stackato create-service-broker demo-service --url http://<ip>:<port> --user <username> --password <password>

or using the `cf` client:

    cf add-service-broker demo-service --url http://<ip>:<port> --username <username> --password

To make the service broker plans accessible to organizations you must make
a couple of extra curl calls, outlined [here](http://docs.cloudfoundry.org/services/access-control.html). 
If you are using the `stackato` client:

    st update-service-plan <plan-name> --vendor <vendor-name>

## Further Reading

If you plan to extend or develop this connector, the
[Cloud Foundry Services API documentation](http://docs.cloudfoundry.org/services/api.html)
provides solid information for each version of the API.

## Reporting Issues & feedback

Feel free to open a Github issue or join the `#stackato` irc channel on `irc.freenode.net`.
