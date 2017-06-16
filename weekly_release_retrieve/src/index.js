'use strict';
const Alexa = require("alexa-sdk");
const request = require('request');
const URL = 'http://www.midtowncomics.com/store/ajax_wr_instore.asp';
const APP_ID = 'amzn1.ask.skill.10736cba-646c-44e6-bac3-03e0708f1919';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('SayHello');
    },
    'GetComicIntent': function () {
        this.emit('GetComics')
    },
    'GetComics': function () {
        var output = '';
        var weekly_releases = {};
        request(URL, (err, res, json) => {
            console.log('Processing data');
            weekly_releases = process(json);
            weekly_releases.marvel.forEach(comic => {
                if (comic.match(/Star Wars/)){
                    comic = comic.replace(/(^.+Cover [A-Z])(.+$)/, '$1');
                    output += comic + ', ';
                }
            });
            this.emit(':tell', 'Next weeks comics are ' + output);
        });
    }
};

function process(json){
    var weekly_releases={}, marvel=[], dc=[], dh=[];

    // Correct malformed JSON string
    var quoted = json.replace(/(['"])?([a-zA-Z_]+)(['"])?:/g, '"$2": '); // Quotes keys
    var commaed = quoted.replace(/,(})/g, '$1'); // Removes commas from the last key
    var corrected = commaed.replace(/,(])/g, '$1'); // Removes comma from before end of the array
    const array = JSON.parse(corrected);

    array.forEach(function (item) {
        if (item.mn_name === 'Marvel'){
            marvel.push(item.pr_ttle);
        }
        if (item.mn_name == 'DC'){
            dc.push(item.pr_ttle);
        }
        if (item.mn_name == 'Dark Horse'){
            dh.push(item.pr_ttle);
        }
    });

    weekly_releases.marvel = marvel;
    weekly_releases.dc = dc;
    weekly_releases.dh = dh;
    return weekly_releases;
}