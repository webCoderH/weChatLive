const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/***
 * 判断用户滑动
 * 左滑还是右滑
 */
//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
const getTouchData = (endx, endy,startx, starty) => {
  var angx = endx - startx;
  var angy = endy - starty;
  var result = {};

  //如果滑动距离太短
  // console.log(Math.abs(angx), Math.abs(angy))
  if (Math.abs(angx) < 80 && Math.abs(angy) < 80) {
    return result;
  }

  var angle = getAngle(angx, angy);
  if (angle >= -135 && angle <= -45) {
    result.t = 'top';
  } else if (angle > 45 && angle < 135) {
    console.log(angy)
    result.t = 'bottom';
  } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
    result.t = 'left';
  } else if (angle >= -45 && angle <= 45) {
    result.t = 'right';
  }

  return result;
}
//获得角度
function getAngle(angx, angy) {
  return Math.atan2(angy, angx) * 180 / Math.PI;
};


var formatnum = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * 时间戳转化为年 月 日 时 分 秒
 * ts: 传入时间戳
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
*/
function tsFormatTime(timestamp, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(timestamp);
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  returnArr.push(year, month, day, hour, minute, second);

  returnArr = returnArr.map(formatnum);

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;

}
module.exports = {
  formatTime: formatTime,
  getTouchData : getTouchData,
  tsFormatTime: tsFormatTime
}
