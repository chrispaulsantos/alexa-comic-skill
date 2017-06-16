/**
 * Created by chris on 6/3/17.
 * const url = 'http://www.midtowncomics.com/store/weeklyreleasebuy.asp'
 */
const url = 'http://www.midtowncomics.com/store/ajax_wr_instore.asp';
const request = require('request');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

main();

function main(){
    console.log('Retrieving next weeks releases');
    // Retrieve data from midtown
    request(url, function(err, res, json){
        console.log('Processing data');
        weekly_releases = process(json);
        console.log('Uploading data');
        upload(weekly_releases);
    });
}

function upload(data) {
    const db = connect();
    const Week = db.model('week', mongoose.Schema({date: {type: 'String'},comics: {}}));
    var week = new Week({
        date: data.date,
        comics: data.comics
    });
    week.save();
    db.close();
    return;
}

function process(json){
    var weekly_releases={}, marvel=[], dc=[], dh=[];
    weekly_releases.comics = {};

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
    var date = array[0].pr_deact;
    date = moment(date, 'MM/DD/YYYY hh:mm:ss A').add(6, 'hours');
    date = date.format('MM/DD/YYYY');

    weekly_releases.comics.marvel = marvel;
    weekly_releases.comics.dc = dc;
    weekly_releases.comics.dh = dh;
    weekly_releases.date = date;
    return weekly_releases;
}

var connect = function(){
    var url = 'mongodb://localhost:27017/weeklyreleases';

    var conn = mongoose.createConnection(url, function(err){
        if(err){
            console.log(err);
        } else {
            //console.log('mongoDB connection created.');
        }
    });
    return conn;
}