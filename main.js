const fs = require("fs");
const mssvcClient = require("./mssvc");
const util = require("./util");

const config_raw = fs.readFileSync("./config.json");
const config = JSON.parse(config_raw);

console.log(`
欢迎使用云班课（蓝墨云）自动签到
----------------------------------------------------------
Author: https://github.com/CGSportFucker
Repo: https://github.com/CGSportFucker/YAMT-Fucker
LICENSE: GPLv3
----------------------------------------------------------
`);

if (!util.is_valid_Config(config)) {
    console.log(util.current_date_string() + "   Error: 无效的配置文件！自动签到已退出！");
    return;
}

mssvcClient.login(config.account, config.pwd, function(result) {
    if (result.result_code != 0) {
        console.log(util.current_date_string() + "   Error: 登陆失败，原因为：" + result.result_msg + " 自动签到已退出!");
        return;
    }

    const user_info = result.user;
    console.log(util.current_date_string() + "   Notice: 登陆成功   你好，" + user_info.nick_name);

    mssvcClient.cc_list_joined(user_info.access_id, user_info.access_secret, user_info.last_sec_update_ts_s, user_info.user_id, function(result) {

        if (result.result_code != 0) {
            console.log(result.result_msg);
            console.log(util.current_date_string() + "   Error: 获取课程列表失败，已退出");
            return;
        }

        const cc_list = result.rows;
        console.log(util.current_date_string() + "   Notice: 成功获取课程列表");

        var courses = []

        for (var course of cc_list) {
            if (course.status == 'CLOSED') {
                console.log(util.current_date_string() + "   Notice: " + course.course.name + "已结束，将不会加入监听列表");
                continue;
            }
            if (!util.is_in_Config(course.course.name, config)) {
                console.log(util.current_date_string() + "   Notice: " + course.course.name + "并未在配置文件中出现，将不会加入监听列表");
                continue;
            }

            courses.push({
                'course_id': course.id,
                'course_name': course.course.name
            });

            console.log(util.current_date_string() + "   Notice: " + course.course.name + "已加入监听列表");

        }
        console.log(util.current_date_string() + "   Notice: 监听列表构建完成");

        if (courses.length == 0) {
            console.log(util.current_date_string() + "   Error: 监听列表为空，没有可自动签到的课程！自动签到已退出！");
            return;
        }

        const checkin_task = setInterval(() => {
            console.log(util.current_date_string() + "   Notice: 正在检测签到...");
            for (var course of courses) {
                mssvcClient.current_open_checkin(course.course_id, user_info.access_id, user_info.access_secret, user_info.last_sec_update_ts_s, user_info.user_id, function(result) {
                    if (!result.result_code == 0) {
                        return
                    }

                    const checkin = result.data;
                    const checkin_config = config.courses[course.course_name]

                    if (checkin.checkin_flag == 'Y') {
                        return
                    }
                    console.log(util.current_date_string() + "   Notice: 已检测到 " + course.course_name + " 的签到,正在延迟签到 ");
                    setTimeout(() => {
                        mssvcClient.checkin(checkin.id, checkin_config.lat, checkin_config.lng, user_info.access_id, user_info.access_secret, user_info.last_sec_update_ts_s, user_info.user_id, function(result) {
                            if (result.result_code == 0) {
                                console.log(util.current_date_string() + "   Notice: " + course.course_name + " 已成功签到! ");
                            } else {
                                console.log(util.current_date_string() + "   Warning: " + course.course_name + " 签到失败! 原因:" + result.result_msg);
                            }
                        });
                    }, checkin_config.delay * 1000);

                });
            }
        }, config.sleep * 1000);

        if (config.timeout > 0) {
            setTimeout(() => {
                clearInterval(checkin_task);
                console.log(util.current_date_string() + "   Notice: 已工作" + String(config.timeout) + "分钟，自动签到已退出");
            }, config.timeout * 60 * 1000);
        }

    })

})