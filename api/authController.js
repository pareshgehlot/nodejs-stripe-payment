'use strict';

var User = require( '../models/user.model.js' );
var User_cc_details = require( '../models/user_cc_details.model.js' );
var jwt = require( 'jsonwebtoken' );
var config = require( '../config' );

exports.index = function( req, res ) {

    var alreadyCustomer=false;

    // find the user
    User.findOne( {
        name: req.body.name
    }, function( err, user ) {

        if ( err ) {
            throw err;
        }

        if ( !user ) {
            res.json( {
                success: false,
                message: 'Authentication failed. User not found.'
            } );
        }
        else if ( user ) {
            user.comparePassword( req.body.password, function( err, isMatch ) {
                if ( err ) {
                    throw err;
                }

                if(!isMatch) {
                    return res.status( 401 ).json( {
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    } );
                }

                // if user is found and password is right
                // create a token
                var token = jwt.sign( user, config.secret, {
                    expiresIn: 1440 // expires in 24 hours
                } );
                req.session.user = req.body.name;


                /* verify that customer has made payment before : starts */
                // find the user
                User_cc_details.findOne( {
                    username: req.body.name
                }, function( err, user ) {

                    console.log("\n user : \n");
                    console.log(user);

                    if ( err ) {
                        throw err;
                    }

                    if ( user ) {

                        var customerId = user.customerId

                        // return the information including token as JSON
                        res.render( 'transactions', {
                            token: token,
                            alreadyCustomer : true,
                            title: 'Transactions Page',
                            customerId : customerId
                        } );
                    }
                    else {

                        // console.log("req.session.user : " + req.session.user);

                        // return the information including token as JSON
                        res.render( 'transactions', {
                            token: token,
                            alreadyCustomer : false,                            
                            title: 'Transactions Page'
                        } );

                    }

                } );
                /* verify that customer has made payment before : ends */



            } );
        }

    } );
};

exports.register = function( req, res ) {

    // find the user
    User.findOne( {
        name: req.body.name
    }, function( err, user ) {

        if ( err ) {
            throw err;
        }

        if ( user ) {
            res.json( {
                success: false,
                message: 'Register failed. Username is not free'
            } );
        }
        else {
            user = new User( {
                name: req.body.name,
                password: req.body.password
            } );
            user.save( function( err ) {
                if ( err ) {
                    return res.status( 500 ).json( {
                        success: false,
                        message: 'Registration failed'
                    } );
                }

                // if user is found and password is right
                // create a token
                var token = jwt.sign( user, config.secret, {
                    expiresIn: 1440 // expires in 24 hours
                } );

                // return the information including token as JSON
                res.render( 'transactions', {
                    token: token,
                    alreadyCustomer : false,
                    title: 'Transactions Page'
                } );
            } );
        }

    } );
};
