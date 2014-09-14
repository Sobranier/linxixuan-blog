function Weixin() {
};

/**
 * 处理追踪数据
 * @param xml类型的object
 * @return String 处理结果
 */
Weixin.getType = function (xmlObj) {
    return xmlObj.msgtype[0];
};

Weixin.handleText = function (xmlObj) {
    if (xmlObj.content[0].indexOf('-') !== -1) {
        this.handleTrack(xmlObj);
    } else {
        this.handleMusic(xmlObj);
    }
}
/**
 * 处理追踪数据
 * @param xml类型的object
 * @return String 处理结果
 */
Weixin.handleTrack = function (xmlObj) {
    var content = xmlObj.content[0].split('-'),
        type = content.shift(),
        info = content.join('-');

    if (xmlObj.fromusername.indexOf('oZtA5t1cwg6kooV2X_Hvvxko2t6A') >= 0) {
        if (content.length > 0) {
            var RUN = 'r',
                WEIGHT = 'w',
                PUSH = 'p';

            switch(type) {
            case RUN:
                type = 'run';
                break;
            case WEIGHT:
                type = 'weight';
                break;
            default:
                type = 'push';
            }

            /*track = new Track({
                info: info,
                time: data.createtime[0],
                type: type,
                name: 'linxixuan',
            });*/

            return this.getMsg('保存成功');
        } else {
            return this.getMsg('数据格式错误');
        }
    } else {
        return this.getMsg('你不是我的主人~呱');
    } 
};

/**
 * 处理分享的音乐
 * @param xml类型的object
 * @return String 处理结果
 */
Weixin.handleMusic = function (xmlObj) {
    return this.getMsg('这是一个音乐');
};

/**
 * 处理图片
 * @param xml类型的object
 * @return String 处理结果
 */
Weixin.handlePic = function (content) {
    return this.getMsg('这是一个图片');
}

Weixin.sendMsg = function (content) {
        var msgTpl = '<xml><ToUserName>' + data.fromusername[0] + '</ToUserName><FromUserName>' + data.tousername[0]+ '</FromUserName><CreateTime>' + (+new Date() / 1000).toFixed(0) + '</CreateTime><MsgType>text</MsgType><Content>' + content + '</Content></xml>';
};

module.exports = Weixin;
