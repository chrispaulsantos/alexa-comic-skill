/**
 * Created by chris on 6/3/17.
 */
const request = require('request');
const url = 'http://www.midtowncomics.com/store/ajax_wr_instore.asp';

request(url, function(err, res, body){
    let test = JSON.parse(body)
    let array = eval(body);
    var weekly_releases={}, marvel=[], dc=[], dh=[];

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
    console.log(marvel)

    weekly_releases.marvel = marvel;
    weekly_releases.dc = dc;
    weekly_releases.dh = dh;
});