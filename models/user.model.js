'use strict';

var mongoose = require( 'mongoose' );
var bcrypt = require('bcrypt');
var config = require( '../config' );
var apiError = require('../api/api-error');


var userSchema = mongoose.Schema( {
    name: String,
    password: String
} );


userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if(!this.isModified('password')) {
        return next();
    }

    // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return next(new apiError.Misconfigured('Failed to generate salt','salt_generation_error',err));
        }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(new apiError.Misconfigured('Failed to hash password salt','password_hashing_error',err));
            }

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    var self = this;

    if(!this.password) {
        return cb(null,false);
    }

    bcrypt.compare(candidatePassword, self.password, function(err, isMatch) {
        if (err) {
            return cb(new apiError.Misconfigured('Failed to check password hash','password_hash_check_error',err));
        }
        cb(null, isMatch);
    });
};

var User = mongoose.model( 'User', userSchema );

module.exports = User;
