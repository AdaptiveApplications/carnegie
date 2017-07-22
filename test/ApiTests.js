'use strict';

// npm install --global mocha
// npm install chai

var chai = require('chai');
var expect = chai.expect;

chai.should();

function isEven(num) {
	return num % 2 === 0;
}

describe('unit tests', function() {
	it('should return true when the number is even', function(){
		isEven(4).should.be.true;
	})
	
	it('should return false when the number is odd', function(){
		isEven(5).should.be.false;
	})
	
});