node-milkcheck
==============

Presentation
------------

*Milkcheck* is a tool to help you checking input data, and sanitize their values when possible.

You can install it simply by doing:

    npm install milkcheck

Then use it into your project:

```javascript
var milkcheck = require('milkcheck');

// Define an object schema
var schema = new milkcheck.Schema({
    firstname: milkcheck.string({
        maxLength: 255,
        mandatory: true
    }),
    lastname: milkcheck.string({
        maxLength: 255,
        mandatory: true
    }),
    role: milkcheck.string({
        reg: /^(user|admin)$/,
        mandatory: true
    }),
    email: milkcheck.email()
});

// This is our incorrect user data
var user = {
    firstname: 'Edward',
    lastname: 'Snow',
    role: 'messiah'
};

// Check user data
try { milkcheck.check(user) }
catch (e) {
    console.error(e.name); // "InvalidContent"
    console.error(e.message); // "role is invalid"
}
```

Checking a variable
-------------------

While checking a variable, you can pass some checking options to *milkcheck*, such as:

* __sanitize__: for extended types which support it, this can change the format on the fly of recognized format (ie: fix missing spaces, lowercase...). This highly depends on the chosen convention, and helps getting homogeneous strings with more flexible entries.
* __partial__: this will tell the checker to check only given variable, and not throw any error if one is missing (even mandatory ones). This is useful if you consider editing the content partially.

(no other option so far, contribute if you need more).

Usage:

```javascript
milkcheck.check(user, { sanitize: true });
```

Built-in types
---------------

### Boolean

milkcheck.__boolean__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the boolean must have

### Number

milkcheck.__number__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the number must have
    schema.isFloat - the value must be float
    schema.isInteger - the value must be integer
    schema.isPositive - the value must be >= 0
    schema.isNegative - the value must be <= 0
    schema.isNotNull - the value must be !== 0
    schema.maximum - top range value (included)
    schema.minimum - bottom range value (included)

### Array

milkcheck.__array__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the array must have
    schema.maxLength - maximum length of array
    schema.minLength - minimum length of array
    schema.length - length of the array

### String

milkcheck.__string__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the string must have
    schema.maxLength - maximum length of string
    schema.minLength - minimum length of string
    schema.length - length of the string
    schema.re - regex to apply to the string
    schema.reg - alias to schema.re
    schema.regex - alias to schema.re

Extra types
-----------

More types are coming soon, for now I only needed these:

### MAC address

milkcheck.__mac__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the string must have

Example: *a0:b1:c2:d3:e4:f5*

### IPv4 address

milkcheck.__ipv4__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the string must have

Example: *192.168.0.22*

### IPv6 address

milkcheck.__ipv6__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the string must have

Example: *FE80:0000:0000:0000:0202:B3FF:FE1E:8329*

### MongoDB ObjectId

milkcheck.__mongoId__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the string must have

Example: *53f4b9031cf6455b326f4c7a*

### email

milkcheck.__email__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the string must have

Example: *main@jokester.fr*

### siret

milkcheck.__siret__() takes a schema object:

    schema.mandatory - value can't be undefined or null (complete check)
    schema.value - exact value the string must have

Example: *532 685 104 00012* or *53268510400012*

Extending types
---------------

This package will never be exhaustive in that topic, so we provide a method to extend built-in types: milkcheck.__extend__().

Example of use:

```javascript
var lolcat = function(schema) {
    return milkcheck.extend(schema, {
        type: 'string',
        check: function (obj, opt) {
            if (schema.cheat) return true;

            // Count lolcat occurencies
            var l = (obj.match(/(lol|cuz|haz)/g) || []).length; 

            // Check ratio
            if (l < (obj.length / 6)) {
                return false;
            }

            // sanitize the string
            if (opt.sanitize) {
                return 'lol'; // <- this is the more sensible thing to say so far
            }
            return true;
        }
    }
});

// Use it in our schema
var schema = new milkshake.Schema({
    watIwilSay2u: lolcat({ cheat: true })
})
```

Play nicely with restify
------------------------

This project aim to simplify the way you check input data, and this design is especially helpful if you want to check data from a webservice before writing them in a database.
For example if you use [restify](http://mcavage.me/node-restify/), you can check your input data this way:

```javascript
var schema = new milkcheck.Schema({
    name: milkcheck.string()
});

server.put('/suppliers', function (req, res, next) {
    schema.check(req.params);
    db.collection('suppliers').insert(supplier, function (err, result) {
        if (err) return next(restify.BadGatewayError('db error'));
        res.send(result);
        return next();
    });
});

server.on('uncaughtException', function (req, res, route, err) {
    switch (err.name) {
        case 'MissingParameter': 
            res.send(new restify.MissingParameterError(e.message));
            break;
        case 'InvalidContent':
            res.send(new restify.InvalidContentError(e.message));
            break;
        default:
            res.send(new restify.InternalError(err.message));
            break;
    }
});
```

Contributing
------------
Please use github as you like, contributions are very welcome.

Licence
-------

MIT



