const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const request = require('request-promise');
const app = express();
const box_key = "scuatvAGHM9ke1RfXDVgJmE61D5HobSw";
const options = {
  method: 'POST',
  uri: 'https://api-ap-southeast-2-production.boxever.com/v2/callFlows',
  body: {
    "context": {
      "browserId": "1920c00f-b9ff-4e3e-b2d8-bcc9258ea9b6",
      "clientKey": box_key,
      "channel": "WEB",
      "language": "EN",
      "currencyCode": "SGD",
      "uri": "Home Page Post Login",
      "region": "Destinations",
      "pointOfSale": "accentureshowcase.com"
    }
  },
  json: true
  // JSON stringifies the body automatically
};

const identity_event = {
  method: 'GET',
  uri: 'https://api-ap-southeast-2-production.boxever.com/v1.2/event/create.json?client_key=scuatvAGHM9ke1RfXDVgJmE61D5HobSw&message=',
  json: true

};
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.post('/fulfillment', (req, res) => {
  console.log(req.body);
  const Errresponse = {
    fulfillmentText: "Your API call does not work fine !",
  }
  console.log("action: " + req.body.queryResult.action);
  if (req.body.queryResult.action == "input.offers") {
    //identity_event.uri = identity_event.uri + req.body.originalDetectIntentRequest.payload;
    console.log(req.body.originalDetectIntentRequest.payload);
    options.body.context.browserId = req.body.originalDetectIntentRequest.payload.browser_id;
    options.body.context.channel = req.body.originalDetectIntentRequest.payload.channel;
    options.body.context.currencyCode = req.body.originalDetectIntentRequest.payload.currency;
    options.body.context.language = req.body.originalDetectIntentRequest.payload.language;
    options.body.context.pointOfSale = req.body.originalDetectIntentRequest.payload.pos;
    
    //console.log("Identity Event");
    //request(identity_event)
    // .then(function (response) {
    // Handle the response
    //  console.log(response);
    request(options)
      .then(function (response) {
        // Handle the response
        // console.log(response)
        console.log("In Offers");
        console.log("Offers Response")

        console.log(response);
        let resp = {

          fulfillmentText: response.result.offers[0].attributes.Name,
          fulfillmentMessages: [{

            /*  card: {
               title: response.result.offers[0].attributes.Type,
               subtitle: response.result.offers[0].attributes.Name,
               image_uri: response.result.offers[0].attributes.ImageUrl,
               buttons: [{
                 text: "Read More",
                 postback: response.result.offers[0].attributes.LinkUrl
               }]
             }, */
            payload: {
              message: "Here is what I found: ",
              ignoreTextResponse: false,
              platform: "kommunicate",
              /*  metadata: {
                 // replace this with metadata JSON supported by kommunicate 
                 contentType: "300",
                 templateId: "9",
                 payload: [{
                   caption: response.result.offers[0].attributes.Name,
                   url: response.result.offers[0].attributes.ImageUrl
                 }, {
                   caption: response.result.offers[1].attributes.Name,
                   url: response.result.offers[1].attributes.ImageUrl
                 }]
               } */
              metadata: {
                contentType: "300",
                templateId: "7",
                payload: {
                  headerImgSrc: response.result.offers[0].attributes.ImageUrl,
                  headerText: "Destinations",
                  elements: [{
                      imgSrc: response.result.offers[0].attributes.ImageUrl,
                      title: response.result.offers[0].attributes.Name,
                      description: response.result.offers[0].description,
                      action: {
                        url: response.result.offers[0].attributes.LinkUrl,
                        type: "link"
                      }
                    },
                    {
                      imgSrc: response.result.offers[1].attributes.ImageUrl,
                      title: response.result.offers[1].attributes.Name,
                      description: response.result.offers[1].description,
                      action: {
                        url: response.result.offers[1].attributes.LinkUrl,
                        type: "link"
                      }
                    }

                  ],
                  buttons: [{
                    name: "See us on facebook",
                    action: {
                      url: "https://www.google.com",
                      type: "link"
                    }
                  }]
                }

              }
            }
          }, ]
        };
        console.log(resp);
        res.json(resp);
      })
      .catch(function (err) {
        // Deal with the error
        res.json(Errresponse);
      })

    // })



  } else if (req.body.queryResult.action == "input.welcome") {
    console.log("In Welcome");
    /* let resp = {
      fulfillmentMessages: [{
        payload: {
          message: "Hello! " + req.body.originalDetectIntentRequest.payload.user_first_name + " How can I help you?",
          platform: "kommunicate"
        }
      }]
    }; */
    console.log("Name: " + req.body.originalDetectIntentRequest.payload.firstname);
    let resp = {
      fulfillmentText: ""
    };
    if (req.body.originalDetectIntentRequest.payload.firstname != null) {
      resp.fulfillmentText = "Hello " + req.body.originalDetectIntentRequest.payload.firstname + "! How can I help you?"

    } else {
      resp.fulfillmentText = "Hello! How can I help you?"

    }
    res.json(resp);
  } else if (req.body.queryResult.action == "input.offertype") {
    console.log("in offertype");

    var offType = "";
    var noOfOffers = "";
    if (req.body.queryResult.parameters.destination) {
      offType = "destination";
      noOfOffers =  req.body.queryResult.parameters.numberofoffers ? req.body.queryResult.parameters.numberofoffers : "3";
    }
    else if(req.body.queryResult.parameters.experience){
      offType = "experience";
      noOfOffers =  req.body.queryResult.parameters.numberofoffers ? req.body.queryResult.parameters.numberofoffers : "3";
    }
    else if(req.body.queryResult.parameters.product){
      offType = "product";
      noOfOffers =  req.body.queryResult.parameters.numberofoffers ? req.body.queryResult.parameters.numberofoffers : "3";
    }

    const offerTypesInput = {
      method: 'GET',
      uri: 'https://api-ap-southeast-2-production.boxever.com/v1.2/event/create.json?client_key='+box_key+
              '&message={"browser_id":"'+req.body.originalDetectIntentRequest.payload.browser_id+'",'+
              '"channel":"'+req.body.originalDetectIntentRequest.payload.channel+'",'+
              '"type":"VIEW",'+
              '"language":"'+req.body.originalDetectIntentRequest.payload.language+'",'+
              '"currency":"'+req.body.originalDetectIntentRequest.payload.currency+'",'+
              '"page":"'+req.body.originalDetectIntentRequest.payload.page+'",'+
              '"pos":"'+req.body.originalDetectIntentRequest.payload.pos+'",'+
              '"session_data":{"offerType":"'+offType+'",'+
                                '"numOffers":"'+noOfOffers+'"}}'
    };
     // json: true,
      /*body: {
        "browserId": req.body.originalDetectIntentRequest.payload.browser_id,
        "clientKey": box_key,
        "channel": req.body.originalDetectIntentRequest.payload.channel,
        "language": req.body.originalDetectIntentRequest.payload.language,
        "currencyCode": req.body.originalDetectIntentRequest.payload.currency,
        "page": req.body.originalDetectIntentRequest.payload.page,
        "type": "VIEW",
        "pos": req.body.originalDetectIntentRequest.payload.pos,
        "session_data": {}
      }*/
  

    /*if (req.body.queryResult.parameters.destination) {
      offerTypesInput.body.session_data = {
        "offerType": "destination",
        "numOffers": req.body.queryResult.parameters.numberofoffers ? parseInt(req.body.queryResult.parameters.numberofoffers) : 3
      }
    } else if (req.body.queryResult.parameters.experience) {
      offerTypesInput.body.session_data = {
        "offerType": "experience",
        "numOffers": req.body.queryResult.parameters.numberofoffers ? parseInt(req.body.queryResult.parameters.numberofoffers) : 3
      }
    } else if (req.body.queryResult.parameters.product) {
      offerTypesInput.body.session_data = {
        "offerType": "product",
        "numOffers": req.body.queryResult.parameters.numberofoffers ? parseInt(req.body.queryResult.parameters.numberofoffers) : 3
      }
    }*/
    /*console.log("here are the offerTypesInput");
    console.log(offerTypesInput);

    request(offerTypesInput)
      .catch(function (err) {
        // Deal with the error
        res.json(Errresponse);
      })
    console.log("after offerTypesInput");*/


    options.body.context.browserId = req.body.originalDetectIntentRequest.payload.browser_id;
    options.body.context.channel = req.body.originalDetectIntentRequest.payload.channel;
    options.body.context.currencyCode = req.body.originalDetectIntentRequest.payload.currency;
    options.body.context.language = req.body.originalDetectIntentRequest.payload.language;
    options.body.context.pointOfSale = req.body.originalDetectIntentRequest.payload.pos;
    options.body.context.uri = "chatbot";
    options.body.context.region = "scenario1";

   // console.log("options");
    //console.log(options);

    console.log("#### OFFERTYPESINPUT ####");
    console.log(offerTypesInput);

    request(offerTypesInput)
    .then(function(response){
      console.log("in first call - offerTypesInput");
      console.log("#### OPTIONS ####");
      console.log(options);
      request(options)
      .then(function(response){
          console.log("in second call - options");
          console.log(response);
      })
      .catch(function(err){
        res.json(Errresponse);
      })
    })
    .catch(function(err){
      res.json(Errresponse);
    })

    /*request(options)
      .then(function (response) {
        // Handle the response
        // console.log(response)
        console.log("In ANOTHER OPTIONS");
        console.log("ANOTHER Offers Response");
        console.log(response);
      })
      .catch(function (err) {
        // Deal with the error
        res.json(Errresponse);
      })*/

  } else if (req.body.queryResult.action == "input.loyalty") {
    console.log(req.body.originalDetectIntentRequest.payload);
    options.body.context.browserId = req.body.originalDetectIntentRequest.payload.browser_id;
    options.body.context.channel = req.body.originalDetectIntentRequest.payload.channel;
    options.body.context.currencyCode = req.body.originalDetectIntentRequest.payload.currency;
    options.body.context.language = req.body.originalDetectIntentRequest.payload.language;
    options.body.context.pointOfSale = req.body.originalDetectIntentRequest.payload.pos;
    options.body.context.uri = "chatbot",
    options.body.context.region = "scenario2";
    request(options)
      .then(function (response) {
        // Handle the response
        // console.log(response)
        console.log("In Loyalty");
       // console.log("Loyalty Response")
        //console.log(response);
        var length = response.result.offers.length;
        console.log("length = " + length);
        let resp = {
          fulfillmentText: response.result.offers[0].attributes.Name,
          fulfillmentMessages: [{
            payload: {
              message: "I've picked these just for you",
              ignoreTextResponse: false,
              platform: "kommunicate",
              metadata: {
                contentType: "300",
                templateId: "7",
                payload: {
                  headerImgSrc: response.result.offers[0].attributes.ImageUrl,
                  headerText: "Destinations",
                  elements: [{
                      imgSrc: response.result.offers[0].attributes.ImageUrl,
                      title: response.result.offers[0].attributes.Name,
                      description: response.result.offers[0].description,
                      action: {
                        url: response.result.offers[0].attributes.LinkUrl,
                        type: "link"
                      }
                    },
                    {
                      imgSrc: response.result.offers[1].attributes.ImageUrl,
                      title: response.result.offers[1].attributes.Name,
                      description: response.result.offers[1].description,
                      action: {
                        url: response.result.offers[1].attributes.LinkUrl,
                        type: "link"
                      }
                    }

                  ],
                  buttons: [{
                    name: "See us on facebook",
                    action: {
                      url: "https://www.google.com",
                      type: "link"
                    }
                  }]
                }

              }
            }
          }, ]
        };
        console.log(resp);
        res.json(resp);
      })
      .catch(function (err) {
        // Deal with the error
        res.json(Errresponse);
      })
  } else {
    res.json(Errresponse);
  }

});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));