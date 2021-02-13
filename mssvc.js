const axios = require('axios');
const qs = require('qs');
const util = require('./util');
require('./statics');


function login(account, pwd, callback) {
    var url = DOMAIN_PREFIX + `/passport/login_s`;
    var headers = util.login_header_model();
    var form = util.login_form_model();

    form.account_name = util.param_encrypt(account);
    form.user_pwd = util.param_encrypt(pwd);

    headers.date = util.current_date_string();
    headers['x-mssvc-signature'] = util.login_signature(url, headers.date, form);

    axios({
        method: 'post',
        url: url,
        headers: headers,
        data: qs.stringify(form)
    }).then(res => {
        // console.log(res.data);
        callback(res.data);
    });
}

function cc_list_joined(access_id, access_secret, sec_ts, user_id, callback) {
    var url = DOMAIN_PREFIX + `/cc/list_joined`;
    var headers = util.cc_list_joined_header_model();

    headers['x-mssvc-access-id'] = access_id;
    headers['x-mssvc-sec-ts'] = sec_ts;
    headers.date = util.current_date_string();
    headers['x-mssvc-signature'] = util.pure_post_signature(url, headers.date, user_id, access_secret, []);

    axios({
        method: 'post',
        url: url,
        headers: headers
    }).then(res => {
        callback(res.data);
    });

}

function current_open_checkin(course_id, access_id, access_secret, sec_ts, user_id, callback) {
    var url = DOMAIN_PREFIX + `/checkin/current_open`;
    var headers = util.checkin_current_open_header_model();
    var form = util.checkin_current_open_form_model();

    form.clazz_course_id = course_id;

    headers['x-mssvc-access-id'] = access_id;
    headers['x-mssvc-sec-ts'] = sec_ts;
    headers.date = util.current_date_string();
    headers['x-mssvc-signature'] = util.pure_post_signature(url, headers.date, user_id, access_secret, [util.md5('clazz_course_id=' + course_id)]);

    axios({
        method: 'post',
        url: url,
        headers: headers,
        data: qs.stringify(form)
    }).then(res => {
        callback(res.data);
    });

}

function checkin(checkin_id, lat, lng, access_id, access_secret, sec_ts, user_id, callback) {
    var url = CHECKIN_DOMAIN;
    var headers = util.checkin_header_model();
    var form = util.checkin_GPS_form_model();
    if (lat == '0' || lng == '0') {
        form = util.checkin_NO_GPS_form_model();
    } else {
        form.lat = lat;
        form.lng = lng;
    }
    form.checkin_id = checkin_id;

    headers.Host = 'checkin.mosoteach.cn:19528';
    headers['x-mssvc-access-id'] = access_id;
    headers['x-mssvc-sec-ts'] = sec_ts;
    headers.date = util.current_date_string();
    headers['x-mssvc-signature'] = util.pure_post_signature(url, headers.date, user_id, access_secret, []);

    axios({
        method: 'post',
        url: url,
        headers: headers,
        data: qs.stringify(form)
    }).then(res => {
        callback(res.data);
    });

}




module.exports.login = login;
module.exports.cc_list_joined = cc_list_joined;
module.exports.current_open_checkin = current_open_checkin;
module.exports.checkin = checkin;