const uuid = require('uuid');
const assert = require('uvu/assert');
const HashID = require('hashids/cjs');
const { Suite } = require('benchmark');
const { nanoid: nanoid2 } = require('nanoid/non-secure');
const { nanoid } = require('nanoid');
const { uid: single } = require('../single');
const { uid: secure } = require('../secure');
const { uid } = require('../dist');

const size_11 = {
	'hashids/fixed': new HashID('', 11),
	'nanoid/non-secure': nanoid2.bind(nanoid2, 11),
	'nanoid': nanoid.bind(nanoid, 11),
	'uid/secure': secure.bind(secure, 11),
	'uid/single': single.bind(single, 11),
	'uid': uid.bind(uid, 11),
};

const size_16 = {
	'hashids/fixed': new HashID('', 16),
	'nanoid/non-secure': nanoid2.bind(nanoid2, 16),
	'nanoid': nanoid.bind(nanoid, 16),
	'uid/secure': secure.bind(secure, 16),
	'uid/single': single.bind(single, 16),
	'uid': uid.bind(uid, 16),
};

const size_25 = {
	'cuid': require('cuid'),
	'hashids/fixed': new HashID('', 25),
	'nanoid/non-secure': nanoid2.bind(nanoid2, 25),
	'nanoid': nanoid.bind(nanoid, 25),
	'uid/secure': secure.bind(secure, 25),
	'uid/single': single.bind(single, 25),
	'uid': uid.bind(uid, 25),
};

const size_36 = {
	'uuid/v1': uuid.v1,
	'uuid/v4': uuid.v4,
	'hashids/fixed': new HashID('', 36),
	'nanoid/non-secure': nanoid2.bind(nanoid2, 36),
	'nanoid': nanoid.bind(nanoid, 36),
	'@lukeed/uuid/secure': require('@lukeed/uuid/secure').v4,
	'@lukeed/uuid': require('@lukeed/uuid').v4,
	'uid/secure': secure.bind(secure, 36),
	'uid/single': single.bind(single, 36),
	'uid': uid.bind(uid, 36),
};

function pad(str) {
	return str + ' '.repeat(20 - str.length);
}

function runner(group, size) {
	let num = 0;

	console.log(`\nValidation (length = ${size}): `);
	Object.keys(group).forEach(name => {
		try {
			num = 0;
			const lib = group[name];
			const isHash = name.startsWith('hashids');
			const output = isHash ? lib.encode(num++) : lib();

			assert.type(output, 'string', 'returns string');
			assert.is.not(output, isHash ? lib.encode(num++) : lib(), 'unqiue strings');

			console.log('  ✔', pad(name), `(example: "${output}")`);
		} catch (err) {
			console.log('  ✘', pad(name), `(FAILED @ "${err.message}")`);
		}
	});

	console.log(`\nBenchmark (length = ${size}):`);
	const bench = new Suite().on('cycle', e => {
		console.log('  ' + e.target);
		num = 0; // hashids reset
	});

	Object.keys(group).forEach(name => {
		if (name.startsWith('hashids')) {
			num = 0;
			bench.add(pad(name), () => {
				group[name].encode(num++);
			});
		} else {
			bench.add(pad(name), () => {
				group[name]();
			});
		}
	});

	bench.run();
}

// ---

runner(size_11, 11);
runner(size_16, 16);
runner(size_25, 25);
runner(size_36, 36);
