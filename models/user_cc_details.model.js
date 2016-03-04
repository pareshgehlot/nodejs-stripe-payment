'use strict';

var mongoose = require( 'mongoose' );
var config = require( '../config' );


var user_cc_details_Schema = mongoose.Schema( {
    username: String,
    customerId: String
} );

var user_cc_details = mongoose.model( 'user_cc_details', user_cc_details_Schema );

module.exports = user_cc_details;
