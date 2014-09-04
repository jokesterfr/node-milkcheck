/**
 * @author: Clément Désiles <main@jokester.fr>
 * @date: 01/09/2014
 * @description
 * This is a module to perform object checking easily.
 *
 * It will be stored in a proper autonomous module one day,
 * and be published on NPM registry with a test suite...
 *
 * The parser is by far, the more complex method under the hood. It generates
 * a string aimed to be compiled into a function thanks to an eval() call.
 */
'use strict';
var assert = require('assert');

var MilkCheck = {
	/*
	 * Gives a custom _boolean_ shaker for testing a property 
	 * booleanChecker does not return anything, to avoid issues 
	 * trying to sanitize it (which is clearly not appropriated here)
	 *
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the boolean must have
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return null
	 */
	boolean: function (schema) {
		schema = schema || {};

		// If an exact value schema is given, pre-check it
		if (schema.value) {
			assert(typeof schema.value === 'boolean', 'schema.value must be a boolean');
		}

		return function (obj, opt) {
			// Input is null or undefined
			// @see http://stackoverflow.com/a/2647967
			if (obj == null) {
				if (schema.mandatory && !opt.partial) {
					var e = new Error(opt.ariane + ' is missing');
					e.name = 'missing';
					throw e;
				}
				return;
			}

			// shake it
			if (schema.value) {
				if (obj === schema.value) return;
			} else {
				if (typeof obj === 'boolean') return;
			}

			// if we are here, obj is invalid
			var e = new Error(opt.ariane + ' is invalid');
			e.name = 'invalid';
			throw e;
		}
	},

	/*
	 * Gives a custom _string_ shaker for testing a property 
	 *
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the string must have
	 *     schema.maxLength - maximum length of string
	 *     schema.minLength - minimum length of string
	 *     schema.length - length of the string
	 *     schema.re - regex to apply to the string
	 *     schema.reg - alias to schema.re
	 *     schema.regex - alias to schema.re
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return modified obj (if sanitizing)
	 */
	string: function (schema) {
		schema = schema || {};

		// If an exact value schema is given, pre-check it
		if (schema.value) {
			assert(typeof schema.value === 'string', 'schema.value must be a string');
		}

		return function (obj, opt) {
			// Input is null or undefined
			// @see http://stackoverflow.com/a/2647967
			if (obj == null) {
				if (schema.mandatory && !opt.partial) {
					var e = new Error(opt.ariane + ' is missing');
					e.name = 'missing';
					throw e;
				}
				return;
			}

			// regex is alias of re
			schema.re = schema.re || schema.reg || schema.regex;

			// shake it
			if (schema.value) {
				if (obj === schema.value) return obj;
			} else {
				var res = typeof obj === 'string';
				if (schema.maxLength) res &= (obj.length <= schema.maxLength);
				if (schema.minLength) res &= (obj.length >= schema.minLength);
				if (schema.length) res &= (obj.length === schema.length);
				if (schema.re) res &= schema.re.test(obj);
				if (!!res) {
					return obj;	
				}
			}

			// if we are here, obj is invalid
			var e = new Error(opt.ariane + ' is invalid');
			e.name = 'invalid';
			throw e;
		}
	},


	/*
	 * Gives a custom _array_ shaker for testing a property 
	 *
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the array must have
	 *     schema.maxLength - maximum length of array
	 *     schema.minLength - minimum length of array
	 *     schema.length - length of the array
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return modified obj (if sanitizing)
	 */
	array: function (schema) {
		schema = schema || {};

		// If an exact value schema is given, pre-check it
		if (schema.value) {
			assert(Array.isArray(schema.value), 'schema.value must be an array');
		}

		return function (obj, opt) {
			// Input is null or undefined
			// @see http://stackoverflow.com/a/2647967
			if (obj == null) {
				if (schema.mandatory && !opt.partial) {
					var e = new Error(opt.ariane + ' is missing');
					e.name = 'missing';
					throw e;
				}
				return;
			}

			// shake it
			if (schema.value) {
				if (Array.isArray(obj)) {
					var i = schema.value.length;
					if (i === obj.length) {
						while (i--) {
							if (schema.value[i] !== obj[i]) break;
						}
						if (!i) return obj;
					}
				}
				var e = new Error(opt.ariane + ' is invalid');
				e.name = 'invalid';
				throw e;
			} else {
				var res = Array.isArray(obj);
				if (schema.length) res &= obj.length === schema.length;
				if (schema.maxLength) res &= obj.length <= schema.maxLength;
				if (schema.minLength) res &= obj.length >= schema.minLength;
				if (!!res) return obj;
			}

			// if we are here, obj is invalid
			var e = new Error(opt.ariane + ' is invalid');
			e.name = 'invalid';
			throw e;
		}
	},

	/*
	 * Gives a custom _number_ shaker for testing a property 
	 *
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the number must have
	 *     schema.isFloat - the value must be float
	 *     schema.isInteger - the value must be integer
	 *     schema.isPositive - the value must be >= 0
	 *     schema.isNegative - the value must be <= 0
	 *     schema.isNotNull - the value must be !== 0
	 *     schema.maximum - top range value (included)
	 *     schema.minimum - bottom range value (included)
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return modified obj (if sanitizing)
	 */
	number: function (schema) {
		schema = schema || {};

		// If an exact value schema is given, pre-check it
		if (schema.value) {
			assert(typeof schema.value === 'number', 'schema.value must be an number');
		}
		if (schema.maximum) {
			assert(typeof schema.maximum === 'number', 'schema.maximum must be an number');
		}
		if (schema.minimum) {
			assert(typeof schema.minimum === 'number', 'schema.minimum must be an number');
		}

		return function (obj, opt) {
			// Input is null or undefined
			// @see http://stackoverflow.com/a/2647967
			if (obj == null) {
				if (schema.mandatory && !opt.partial) {
					var e = new Error(opt.ariane + ' is missing');
					e.name = 'missing';
					throw e;
				}
				return;
			}

			// shake it
			if (schema.value) {
				if (obj === schema.value) return obj;
			} else {
				var res = typeof obj === 'number';
				if (schema.isFloat) res &= (obj === +obj && obj !== (obj|0));
				if (schema.isInteger) res &= (obj === +obj && obj === (obj|0));
				if (schema.isPositive) res &= (obj >= 0);
				if (schema.isNegative) res &= (obj <= 0);
				if (schema.isNotNull) res &= (obj !== 0);
				if (schema.maximum) res &= (obj <= schema.maximum);
				if (schema.minimum) res &= (obj >= schema.minimum);
				if (!!res) return obj;
			}

			// if we are here, obj is invalid
			var e = new Error(opt.ariane + ' is invalid');
			e.name = 'invalid';
			throw e;
		}
	},

	/*
	 * Gives a custom _mac address_ shaker for testing a property 
	 * @example a0:b1:c2:d3:e4:f5
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the string must have
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return null
	 */
	mac: function (schema) {
		schema = schema || {};
		schema.re = /^([0-9a-f]{2}[:]){5}([0-9a-f]{2})$/;
		return MilkCheck.string(schema);
	},

	/*
	 * Gives a custom _IP v4 address_ shaker for testing a property 
	 * @example 192.168.0.22
	 * @see http://en.wikipedia.org/wiki/IP_address#IPv4_addresses
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the string must have
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return null
	 */
	ipv4: function (schema) {
		schema = schema || {};
		schema.re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return MilkCheck.string(schema);
	},

	/*
	 * Gives a custom _IP v6 address_ shaker for testing a property 
	 * @example FE80:0000:0000:0000:0202:B3FF:FE1E:8329
	 * @see http://en.wikipedia.org/wiki/IP_address#IPv6_addresses
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the string must have
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return null
	 */
	ipv6: function (schema) {
		schema = schema || {};
		schema.re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return MilkCheck.string(schema);
	},

	/*
	 * Gives a custom _MongoDB ObjectId_ shaker for testing a property 
	 * @example ObjectId("53f4b9031cf6455b326f4c7a")
	 * @see http://api.mongodb.org/java/current/org/bson/types/ObjectId.html
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the string must have
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return null
	 */
	objectId: function (schema) {
		schema = schema || {};
		schema.re = /^[0-9a-fA-F]{24}$/;
		return MilkCheck.string(schema);
	},

	/*
	 * Gives a custom _email_ shaker for testing a property 
	 * @example main@jokester.fr
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the string must have
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return null
	 */
	email: function (schema) {
		schema = schema || {};
		schema.re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return MilkCheck.string(schema);
	},

	/*
	 * Gives a custom _SIRET_ shaker for testing a property 
	 * @example 532 685 104 00012 or 53268510400012
	 * @see http://fr.wikipedia.org/wiki/Syst%C3%A8me_d%27identification_du_r%C3%A9pertoire_des_%C3%A9tablissements
	 * @param {Object} schema - schema rules to customize shaker
	 *     schema.mandatory - value can't be undefined or null (complete check)
	 *     schema.value - exact value the string must have
	 * @return {Function} 
	 *     @throws Errors 'missing' or 'invalid'
	 *     @takes (Object obj, Object opt)
	 *         obj - the property to check
	 *         opt - checking options
	 *     @return null
	 */
	siret: function (schema) {
		schema = schema || {};

		// Takes with or without spaces
		schema.re = /^[0-9]{3} ?[0-9]{3} ?[0-9]{3} ?[0-9]{5}$/;

		// Add a checker after string check
		return MilkCheck.extend(schema, {
			type: 'string',
			check: function (obj, opt) {
				// check the sum
				obj = obj.replace(/\s/g, '');
				var sum = 0;
				for (var i = obj.length - 1; i >=0 ; i--) {
					var n = parseInt(obj[i], 10);
					if (i%2) n = n;
					else n = 2*n;
					if (n > 10) n -= 9;
					sum += n;
				}

				// bad checksum
				if (sum%10) return false;

				// sanitize the string
				if (opt.sanitize) {
					obj = obj.split('');
					obj.splice(3, 0, ' ');
					obj.splice(7, 0, ' ');
					obj.splice(11, 0, ' ');
					return obj.join('');
				}
			}
		});
	},

	/**
	 * Extends a prebuild type, adding a 
	 * @param {Object} extOpt - extending options
	 * @param {String} extOpt.type - basic type to extend
	 * @param {Function} extOpt.check - check method to add to basic type
	 * @return {Function}
	 */
	extend: function (schema, extOpt) {
		schema = schema || {};
		extOpt = extOpt || {};
		assert(typeof extOpt.type === 'string', 'no type to extend');
		assert(typeof extOpt.check === 'function', 'no check method');
		assert(MilkCheck.hasOwnProperty(extOpt.type), 'type unknown to MilkCheck');
		var stringShaker = MilkCheck.string(schema);
		return function (obj, opt) {
			stringShaker(obj, opt);
			var res = extOpt.check(obj, opt);
			/* If checking method return a boolean
			 * and does not throw anything */
			if (res === false) {
				var e = new Error(opt.ariane + ' is invalid');
				e.name = 'invalid';
				throw e;
			} else {
				return res;
			}
		}
	}
};

/**
 * The Schema constructor
 * @class Schema
 * @param {Object || Function} schema
 * @return {Schema} 
 */
var Schema = function(schema) {
	/**
	 * A recursive analysis of input schema
	 * @param {Object} schema or sub-shema
	 * @return none
	 * @throws 'AssertionError' if the given schema is not properly set
	 */
	(function _analyseSchema (obj) {
		var type = typeof schema;
		if (type !== 'function' && type !== 'object') {
			var e = new Error('input schema is invalid');
			e.name = 'invalidSchema';
			throw e;
		}
		if (type === 'object') {
			for (var l in obj) _analyseSchema(obj[l]);
		}
	})(schema);

	// Private schema variable
	var _schema = schema;

	/**
	 * Recursively check the given object.
	 * please note that while testing it, 
	 * @param {Anything} obj - entity to check against the schema
	 * @param {Object} opt - options to pass to the schema parsers @optional
	 * @param {Object | Function} schema - or sub schema made of checker functions
	 * @param {Object} parent - keep the original object reference for sanitizing
	 * @return this
	 * @throws exceptions throwen by the above called method, which are:
	 *          - 'missing' when a key value is missing (and no 'partial' option is given)
	 *          - 'invalid' when a key value has an incorrect format
	 *         and another one, if you messed up the call:
	 */
	this.check = function (obj, opt, schema, parent) {
		opt = opt || {};
		schema = schema || _schema;
		parent = parent || obj;

		// Call schema checker (checking methods)
		if (typeof schema === 'function') {
			var obj = schema(obj, opt);
			if (opt.sanitize && obj) {
				parent[opt.ariane] = obj;
			}
			return;
		} else if (typeof schema === 'object') {

			// Obj structure is not coherent with schema
			if (typeof obj !== 'object') {
				var e = new Error(opt.ariane + ' is invalid');
				e.name = 'invalid';
				throw e;
			}

			// Drop obj properties if not described in schema
			for (var l in obj) {
				if (!schema.hasOwnProperty(l)) delete obj[l];
			}

			// Sub-schema parsing
			for (var l in schema) {

				// Object copy of opt
				var newOpt = {};
				for (var m in opt) { newOpt[m] = opt[m] }
				newOpt.ariane = opt.ariane ? opt.ariane + '.' + l : l;

				// Recursive call of sub-schemas checkers
				this.check(obj[l], newOpt, schema[l], parent);
			}
		} else {
			var e = new Error();
			e.name = 'AssertionError';
			throw e;
		}
		return this;
	}
}

// Aliases
MilkCheck.ip = MilkCheck.ipv4;
MilkCheck.objectID = MilkCheck.objectId;
MilkCheck.do = MilkCheck.check;

// Add class Schema to MilkCheck
MilkCheck.Schema = Schema;

// Export MilkCheck
module.exports = MilkCheck;