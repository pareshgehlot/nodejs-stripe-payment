'use strict';

var Transactions = require( '../models/transactions.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );
var User_cc_details = require( '../models/user_cc_details.model.js' );


exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                return console.log( err );
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createTransaction = function( req, res, next ) {

    var alreadyCustomer = req.body.alreadyCustomer;
    console.log("\n alreadyCustomer : \n");
    console.log(alreadyCustomer);
    if(alreadyCustomer==true || alreadyCustomer=="true"){
      console.log("\n alreadyCustomer : \n");
      console.log(alreadyCustomer);
        Stripe.charges.create({
          amount: req.body.amount, // amount in cents, again
          currency: req.body.currency,
          customer: req.body.customerId // Previously stored, then retrieved
        },  function(err, charge) {
          // YOUR CODE: Save the customer ID and other info in a database for later!
          if ( err ) {
              return console.log( err );
          }
          console.log("\n no error in transaction in alreadyCustomer \n");
          var transaction = new Transactions( {
              transactionId: charge.id,
              amount: charge.amount,
              created: charge.created,
              currency: charge.currency,
              description: charge.description,
              paid: charge.paid,
              sourceId: charge.source.id
          } );
          transaction.save( function( err ) {
                  if ( err ) {
                    console.log("\n transaction error \n");
                      return res.status( 500 );
                  }
                  else {
                    console.log("\n transaction saved \n");
                      
                      res.status( 200 ).json( {
                          message: 'Payment is created.'
                      } );
                  }
              } );
              // asynchronously called
          
        } );        

    }

    if(alreadyCustomer==false || alreadyCustomer=="false"){
      console.log("\n alreadyCustomer : \n");
      console.log(alreadyCustomer);      
        var customerId = "";
        var charge_created = "";
        Stripe.customers.create({
          source: req.body.stripe_token,
          description: 'Charge for test@example.com'
        }).then(function(customer) {
          customerId = customer.id; 
          // return Stripe.charges.create({
          return Stripe.charges.create({
            amount: req.body.amount, // amount in cents, again
            currency: req.body.currency,
            customer: customer.id
          });
        }).then(function(charge) {
          // console.log("\n err \n");
          // console.log(err);
          console.log("\n\n");
          console.log("\n charge \n" + charge);
          // YOUR CODE: Save the customer ID and other info in a database for later!
          // if ( err ) {
          //     return console.log( err );
          // }
          console.log("\n before saving customer to db : \n");
          var user_cc_details = new User_cc_details( {
            username: req.session.user,
            customerId: customerId
          } );
          user_cc_details.save( function( err ) {
            console.log("\n in saving customer to db : \n");            
                  if ( err ) {
                    console.log("\n in err saving customer to db : \n");
                      return res.status( 500 );
                  }
                  else {

                    console.log("\n customer saved : \n");
                    // console.log(alreadyCustomer);                      
                      // res.status( 200 ).json( {
                      //     message: 'Payment is created.'
                      // } );
                  }
                  console.log("\n after if else saving customer to db : \n");
          } );
          
          // console.log("\n charge : \n");
          // console.log(charge_created);
          // console.log("\n\n");
          var transaction = new Transactions( {
              transactionId: charge.id,
              amount: charge.amount,
              created: charge.created,
              currency: charge.currency,
              description: charge.description,
              paid: charge.paid,
              sourceId: charge.source.id
          } );
          transaction.save( function( err ) {
                  if ( err ) {
                      return res.status( 500 );
                  }
                  else {

                      
                      res.status( 200 ).json( {
                          message: 'Payment is created.'
                      } );
                  }
              } );
              // asynchronously called

        });



        // Stripe.charges.create( {
        //     amount: req.body.amount,
        //     currency: req.body.currency,
        //     source: req.body.stripe_token,
        //     description: 'Charge for test@example.com'
        // }, function( err, charge ) {
        //     if ( err ) {
        //         return console.log( err );
        //     }
        //     var transaction = new Transactions( {
        //         transactionId: charge.id,
        //         amount: charge.amount,
        //         created: charge.created,
        //         currency: charge.currency,
        //         description: charge.description,
        //         paid: charge.paid,
        //         sourceId: charge.source.id
        //     } );
        //     transaction.save( function( err ) {
        //             if ( err ) {
        //                 return res.status( 500 );
        //             }
        //             else {

                        
        //                 res.status( 200 ).json( {
        //                     message: 'Payment is created.'
        //                 } );
        //             }
        //         } );
        //         // asynchronously called
        // } );        

    }


};
