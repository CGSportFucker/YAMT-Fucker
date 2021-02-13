const dateFormatter = require('dateformat');
const crypto = require('crypto');
require('./statics');

const public_key = "-----BEGIN PUBLIC KEY-----\n" + PARAM_ENCYPT_RSA_PUBLIC_KEY + "\n-----END PUBLIC KEY-----";

function hmac_sha1(key, text) {
    return crypto.createHmac('sha1', key).update(text).digest('hex');
}

function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex').toUpperCase();
}

function param_encrypt(param) {
    var encryptedData = crypto.publicEncrypt({
            key: public_key,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(param)
    )
    return encryptedData.toString("base64");
}

function login_signature(url, time, params) {
    var text = url + '|' + time;
    for (var key in params) {
        var item = params[key];
        text = text + '|' + key + '=' + item
    }
    return hmac_sha1(HMAC_SHA1_KEY_LOGIN, text);
}

function pure_post_signature(url, time, user_id, access_secret, additional_items) {
    var text = url + '|' + user_id + '|' + time
    for (var item of additional_items) {
        text = text + '|' + item
    }
    return hmac_sha1(access_secret, text);
}

function current_date_string() {
    let now = new Date();
    var output = dateFormatter(now, "ddd, dd mmm yyyy h:MM:ss") + ' GMT';
    return output;
}

function is_in_Config(name, config) {
    for (let key in config.courses) {
        if (name == key) {
            return true;
        }
    }
    return false;
}

function is_valid_Config(config) {
    if (config.account == null) {
        console.log(current_date_string() + "   Error: 未设置account字段，这将导致登陆失败！");
        return false;
    }
    if (config.pwd == null) {
        console.log(current_date_string() + "   Error: 未设置pwd字段，这将导致登陆失败！");
        return false;
    }
    if (config.courses.length == 0) {
        console.log(current_date_string() + "   Warning: 未设置courses字段，这将导致没有任何课程将会被加入监听列表！");
    }
    if (config.timeout == null) {
        config.timeout = 0;
        console.log(current_date_string() + "   Notice: 未设置timeout字段，使用默认值：0 （永不自动停止）");
    }
    if (config.sleep == null) {
        config.sleep = 5;
        console.log(current_date_string() + "   Notice: 未设置sleep字段，使用默认值：5 （秒）");
    }
    for (let course in config.courses) {
        let courseDetail = config.courses[course];
        if (courseDetail.delay == null) {
            console.log(current_date_string() + "   Notice: " + course + "未设置delay字段，使用默认值：5 （秒）");
        }
        if (courseDetail.lat == null) {
            console.log(current_date_string() + "   Notice: " + course + "未设置lat字段，使用默认值：0 （不发送GPS信息）");
        }
        if (courseDetail.lng == null) {
            console.log(current_date_string() + "   Notice: " + course + "未设置lng字段，使用默认值：0 （不发送GPS信息）");
        }
    }
    return true;
}

function login_header_model() {
    return {
        'Host': 'api.mosoteach.cn',
        'x-app-id': HEADER_APP_ID,
        'content-type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
        'x-app-machine': HEADER_APP_MACHINE,
        'x-app-system-version': HEADER_APP_SYSTEM_VERSION,
        'x-device-code': HEADER_DEVICE_CODE,
        'x-scheme': 'https',
        'x-dpr': HEADER_DPR,
        'accept-language': 'zh-Hans-US;q=1, en-US;q=0.9',
        'x-mssvc-signature': '',
        'date': '',
        'user-agent': HEADER_USER_AGENT,
        'x-app-version': HEADER_APP_VERSION
    };
}

function login_form_model() {
    return {
        'account_name': '',
        'app_id': FORM_APP_ID,
        'app_version_name': FORM_APP_VERSION_NAME,
        'app_version_number': FORM_APP_VERSION_NUMBER,
        'device_code': FORM_DEVICE_CODE,
        'device_pn_code': FORM_DEVICE_PN_CODE,
        'device_type': FORM_DEVICE_TYPE,
        'public_key': FROM_LOGIN_PUBLIC_KEY,
        'system_version': FORM_SYSTEM_VERSION,
        'user_pwd': ''
    }
}

function pure_post_header_model() {
    return {
        'Host': 'api.mosoteach.cn',
        'x-app-id': HEADER_APP_ID,
        'content-type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
        'x-mssvc-sec-ts': '',
        'x-mssvc-access-id': '',
        'x-app-machine': HEADER_APP_MACHINE,
        'x-app-system-version': HEADER_APP_SYSTEM_VERSION,
        'x-device-code': HEADER_DEVICE_CODE,
        'x-scheme': 'https',
        'x-dpr': HEADER_DPR,
        'accept-language': 'zh-Hans-US;q=1, en-US;q=0.9',
        'x-mssvc-signature': '',
        'date': '',
        'user-agent': HEADER_USER_AGENT,
        'x-app-version': HEADER_APP_VERSION
    };
}

function cc_list_joined_header_model() {
    return pure_post_header_model();
}

function checkin_current_open_header_model() {
    return pure_post_header_model();
}

function checkin_current_open_form_model() {
    return {
        'clazz_course_id': ''
    }
}

function checkin_header_model() {
    return pure_post_header_model();
}

function checkin_GPS_form_model() {
    return {
        'checkin_id': '',
        'lat': '',
        'lng': '',
        'report_pos_flag': 'Y'
    }
}

function checkin_NO_GPS_form_model() {
    return {
        'checkin_id': '',
        'report_pos_flag': 'N'
    }
}


module.exports.hmac_sha1 = hmac_sha1;
module.exports.md5 = md5;


module.exports.param_encrypt = param_encrypt;
module.exports.login_signature = login_signature;
module.exports.pure_post_signature = pure_post_signature;



module.exports.current_date_string = current_date_string;



module.exports.is_in_Config = is_in_Config;
module.exports.is_valid_Config = is_valid_Config;



module.exports.login_header_model = login_header_model;
module.exports.login_form_model = login_form_model;

module.exports.cc_list_joined_header_model = cc_list_joined_header_model;

module.exports.checkin_current_open_header_model = checkin_current_open_header_model;
module.exports.checkin_current_open_form_model = checkin_current_open_form_model;

module.exports.checkin_header_model = checkin_header_model;
module.exports.checkin_GPS_form_model = checkin_GPS_form_model;
module.exports.checkin_NO_GPS_form_model = checkin_NO_GPS_form_model;