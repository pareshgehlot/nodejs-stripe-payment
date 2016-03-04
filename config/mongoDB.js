'use strict';

var mongoose = require( 'mongoose' );
var config = require( './index.js' );

mongoose.connect( config.mongoURI );
