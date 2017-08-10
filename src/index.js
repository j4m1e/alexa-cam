/**

Version 0.1 Alpha
Code cut by Jamie Tyler
Copyright 2017 CenturyLink Ltd.

Synopsis: This lambda function is for use with an Alexa skill which using the invocation 
word of Boris and various utterances one being, "Alex, ask boris to create a cloud instance".
This fires the intent CreateInstance which will deploy an AWS instance via the CAM API. This
is purely for demonstration purpuses only. 

*/
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('CreateIntent');
    },

    'CreateIntent': function () {

        var randomWord = makeid();
        var payload = {
            "schema": "http://elasticbox.net/schemas/deploy-instance-request",
            "owner": "<INSERT WORKSPACE NAME HERE>",
            "name": "AWS - Alexa Skill to CAM API - " + randomWord,
            "box": {
                "id": "<INSERT DEPLOYMENT BOX ID HERE>"
            },
            "instance_tags": [
            ],
            "automatic_updates": "off",
            "policy_box": {
                "id": "<INSERT DEPLOYMENT BOX ID HERE>",
                "variables": [
                ]
            }
        };

        httpsPost(payload,  myResult => {
                console.log("sent     : " + JSON.stringify(payload));
                console.log("received : " + myResult);

                this.emit(':tell', 'Instance creation has been accepted for processing by Cloud Application Manager. It will be called ' + myResult );

            }
        );

    }
};

// END of Intent Handlers ---------------------------------------------------------------------
// Paste in any helper functions below --------------------------------------------------------

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var https = require('https');
// https is a default part of Node.JS.  Read the developer doc:  https://nodejs.org/api/https.html

function httpsPost(myData, callback) {

    console.log('httpsPost function has been called with the payload of: ' + JSON.stringify(myData));
    var post_data = myData;
    // options & headers for the https post request
    var authToken = '<INSERT CAM API AUTH TOKEN HERE>';
    var post_options = {
        host: 'elasticbox.com',
        port: '443',
        path: '/services/instances/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(post_data)),
            'ElasticBox-Token': authToken,
            'ElasticBox-Release': '4.0'
        }
    };

    var post_req = https.request(post_options, res => {
        res.setEncoding('utf8');
        console.log('HTTPS Status Code: ' + res.statusCode);
        var returnData = "";
        res.on('data', chunk =>  {
            returnData += chunk;
        });
        res.on('end', () => {
            // this particular API returns a JSON structure

            instanceName = JSON.parse(returnData).name;
            console.log(JSON.stringify(instanceName));
            callback(JSON.stringify(instanceName));

        });
    });
    post_req.write(JSON.stringify(post_data));
    post_req.end();

}