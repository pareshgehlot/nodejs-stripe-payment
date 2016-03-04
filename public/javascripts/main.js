'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
// example :
// Stripe.setPublishableKey( 'pk_test_Gsdfs4654654654' );
Stripe.setPublishableKey( 'stripe Public key' );
var isSubmit = false;
var alreadyCustomer = false;
$( document ).ready( function() {
    $( '#submittransaction' ).click( function() {
        console.log( 'ok' + $( '.card-number' ).val() + " => " + $( '.card-cvc' ).val() +  " => " + $( '.card-expiry-month' ).val() +  " => " + $( '.card-expiry-year' ).val());
        if ( !isSubmit ) {
            Stripe.card.createToken( {
                number: $( '.card-number' ).val(),
                cvc: $( '.card-cvc' ).val(),
                exp_month: $( '.card-expiry-month' ).val(),
                exp_year: $( '.card-expiry-year' ).val()
            }, function( status, response ) {
                if ( response.error ) {
                    // Show the errors on the form
                    $( '.payment-errors' ).removeClass("alert alert-success");
                    $( '.payment-errors' ).addClass("alert alert-danger");
                    $( '.payment-errors' ).text( response.error.message );
                    setTimeout(function(){ 
                        $( '.payment-errors' ).delay(500).fadeOut();
                    }, 3000);                    
                }
                else {
                    // response contains id and card, which contains additional card details
                    var token = response.id;
                    // Insert the token into the form so it gets submitted to the server

                    var $form = $("#payment_form");
                    $form.append( $( '<input type="hidden" name="stripeToken" />' ).val( token ) );
                    // and submit
                    $.ajax( {
                        url: '/createtransaction',
                        type: 'POST',
                        headers: {
                            'x-access-token': $( '#token' ).html()
                        },
                        data: {
                            amount: $( '#amount' ).val(),
                            currency: $( '#currency' ).val(),
                            stripe_token: token,
                            alreadyCustomer : false
                        }
                    } ).done( function( response ) {
                        alert("response.message : " + response.message);
                        if ( response.message ) {
                            $( '.payment-errors' ).removeClass("alert alert-danger");
                            $( '.payment-errors' ).addClass("alert alert-success");
                            $( '.payment-errors' ).text( response.message );
                            setTimeout(function(){ 
                                $( '.payment-errors' ).delay(500).fadeOut();
                            }, 3000);
                        }
                    } );
                }

            } );
        }

    } );


    $( '#submitalreadydonetransaction' ).click( function() {
        alert("here in alreadyCustomer");

        var customerId = $("#customerId").val();
        alert("here in alreadyCustomer" + customerId);
        console.log("here in alreadyCustomer" + customerId);
        // and submit
        $.ajax( {
            url: '/createtransaction',
            type: 'POST',
            headers: {
                'x-access-token': $( '#token' ).html()
            },
            data: {
                amount: $( '#amount' ).val(),
                currency: $( '#currency' ).val(),
                customerId: customerId,
                alreadyCustomer : true                
            }
        } ).done( function( response ) {
            alert("here in done" + response.message);
            if ( response.message ) {
                $( '.payment-errors' ).removeClass("alert alert-danger");
                $( '.payment-errors' ).addClass("alert alert-success");                
                $( '.payment-errors' ).text( response.message );
                setTimeout(function(){ 
                    $( '.payment-errors' ).delay(500).fadeOut();
                }, 3000);                
            }
        } );


    });

} );
