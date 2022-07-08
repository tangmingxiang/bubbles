/*
 * @Author: TANG MINGXIANG
 * @Date: 2022-04-17 15:31:31
 * @LastEditors: TANG MINGXIANG
 * @LastEditTime: 2022-04-19 11:05:48
 * @FilePath: \EliminateBallGame\index.js
 */

/**
 * @description: 初始化函数
 */
function init(){
  let fragment = document.createDocumentFragment();
  let idx = 0;
  for(let i = 0; i < maxRows; i++){
    for(let j = 0; j < maxColumns - (i & 1); j++){
      let top = i * (ballSize - 6);
      let left = ballSize * (j + (i & 1)/2);
      let ele = document.createElement('div');
      ele.className = 'ball';
      ele.innerText = idx;
      ele.style.backgroundColor = 'red';
      ele.style.top = top + 'px';
      ele.style.left = left + 'px';
      ele.style.opacity = '0';
      let ball = {
        ele, idx, row:i, top, left, opacity: 0
      }
      ballsData.push(ball);
      fragment.appendChild(ele);
      idx++;
    }
  }
  oBallArea.appendChild(fragment);
};

/**
 * @description: 初始化炮台的位置
 */
function initArrow(){
  oArrow.style.left = (oBallArea.offsetWidth - oArrow.offsetWidth) / 2 + 'px';
  oArrow.style.top = oBallArea.offsetHeight - 30 + 'px';
}
/**
 * @description: 初始化子弹的位置与颜色
 */
function initBullet(){
  oBullet.style.display = 'block';
  oBullet.style.backgroundColor = randomColor();
  oBullet.style.left = (oBallArea.offsetWidth - ballSize) / 2 + 'px';
  oBullet.style.top = oBallArea.offsetHeight + 5 + 'px';
}

/**
 * @description: 返回一个随机颜色
 * @return {String} 16进制的随机颜色字符串
 */
function randomColor(){
  const COLORS = ['#fa5a5a', '#f0d264', '#82c8a0', '#7fccde', '#6698cb', '#cb99c5'];
  return COLORS[~~(Math.random() * COLORS.length)];
}

/**
 * @description: 返回相连且颜色相同的球的索引号
 * @param {Array} arr 存储已遍历及尚未遍历球的索引号
 * @param {Number} index 正在遍历索引号在 arr 中的位置
 * @return {Array} 相连且颜色相同的球的索引号
 */
function getConBallWithSameColor(arr, index = 0){
  if(index >= arr.length){
    return arr;
  }
  let sibling = getSiblingIdx(arr[index]);
  // 排除兄弟球中未展示的和颜色不一致的
  sibling = sibling.filter(item => item !== null && ballsData[item].opacity !== 0 && isSameColor(item,arr[index]));
  // 排除已经遍历过的球
  sibling = sibling.filter(item => (arr.indexOf(item) === -1));
  arr = arr.concat(sibling);
  return getConBallWithSameColor(arr, ++index);
}

/**
 * @description: 根据中心球的索引号获取兄弟球的索引号
 * @param {Number} idx 中心的索引号
 * @return {Array} 兄弟球的索引号
 */
function getSiblingIdx(idx){
  return getRightSiblingIdx(idx, {
    tl: idx - 10,
    tr: idx - 9,
    ml: idx - 1,
    mr: idx + 1,
    bl: idx + 9,
    br: idx + 10
  })
}

/**
 * @description: 返回 siblingIdxArr 中与索引号为 idx 的球真正相连的球的索引号
 * @param {Number} idx 中心球索引号
 * @param {Array} siblingIdxArr 索引号
 * @return {Array} 兄弟球的索引号
 */
function getRightSiblingIdx(idx, siblingIdxArr){
  return Object.entries(siblingIdxArr).reduce((acc, [key, value]) => {
    acc.push((ballsData[value] && isRightRow(ballsData[value].row, ballsData[idx].row, rowComp[key[0]])) ?
       value : null);
    return acc;
  },[])
}

/**
 * @description: 判断两球之间的行号是否正确
 * @param {Number} sRow
 * @param {Number} row
 * @param {Number} diffRow
 * @return {Boolean}
 */
function isRightRow(sRow, row, diffRow){
  return (row + diffRow) === sRow;
}

function isRightRowByIdx(sIdx, idx, diffRow){
  if(!ballsData[sIdx]){
    return false;
  }
  return (ballsData[idx].row + diffRow) === ballsData[sIdx].row;
}

/**
 * @description: 判断两个球的颜色是否相同
 */
function isSameColor(idx, sIdx){
  if(ballsData[idx] && ballsData[sIdx]){
    return ballsData[idx].ele.style.backgroundColor === ballsData[sIdx].ele.style.backgroundColor;
  }
  return false;
}

/**
 * @description: 获取与根节点失去连接的球的索引
 * @return {Array} 返回与根节点失去连接的球的索引
 */
function traceConnect(){
  // 存储与根节点存在连接的索引，以减少判断次数
  let connected = [];
  // 存储与根节点失去连接的索引
  let noConnected = [];
  // 用于内部函数 traceConnectIdx 中, 存储已加入过判断序列的索引, 免得重复调用, 进入死循环
  let sibling = [];
  for(let i = 10, len = ballsData.length; i < len; i++){
    // 与根节点存在连接 或 颜色为‘黑色’的球体跳过循环
    if(connected.indexOf(i) !== -1 || ballsData[i].opacity === 0){
      continue;
    }
    sibling = [];
    let flag = traceConnectIdx(i);
    if(flag){
      continue;
    }else {
      noConnected.push(i);
    }
  }
  return noConnected;

  /**
   * @description: traceConnect 的内部函数, 迭代判断 索引号为 idx 的小球, 是否与根节点存在连接
   * @param {Number} idx 索引号
   * @return {Boolean} true 存在连接, false 失去连接
   */  
  function traceConnectIdx(idx){
    let newSibling = getSiblingIdx(idx);
    newSibling = newSibling.filter((item) => (item !== null && sibling.indexOf(item) === -1 && ballsData[item].opacity !== 0));
    sibling.push(idx, ...newSibling);
    let flag = newSibling.some(item => (connected.indexOf(item) !== -1 || item < 10));
    if(flag){
      connected.concat(newSibling.filter((item) => (connected.indexOf(item) === -1)));
      return flag;
    }
    if(newSibling.length > 0){
      for(let i = 0, len = newSibling.length; i < len; i++){
        flag  = traceConnectIdx(newSibling[i]);
        if(flag){
          connected.concat(newSibling.filter((item) => (connected.indexOf(item) === -1)));
          return flag;
        }
      }
    }
    return false;
  }
}

/**
 * @description: 通过调用 animate 函数实现小球的坠落效果
 * @param {*} ele
 * @return {*}
 */
function dropOff(ele,cb) {
  idDropOff = true;
  animate({
    ele,
    styleJson: {
      top: ele.offsetTop + 40 + 'px',
      opacity: 0,
      transform: 'scale(.5)'
    },
    callback() {
      cb && cb();
      // 这一行的目的主要是消除 transform: 'scale(.5)' 样式
      // 否则这个球再出现的时候，就自动先缩小一半了
      ele.style.cssText = '';
      ele.style.opacity = 0;
    }
  })
}

/**
 * @description: 通过 transition 实现运动效果
 * @param {*} ele DOM 元素
 * @param {*} styleJson 需要改变的样式
 * @param {*} time  过渡时间 单位ms 默认500ms
 * @param {*} speed 过渡速度曲线 默认linear
 * @param {*} callback 过渡完成后的回调函数
 */
function animate({ ele, styleJson, time, speed, callback }){
  ele = ele || oBox;
  time = time || 500;
  styleJson = styleJson || { transform: 'scale(1.15)' };
  speed = speed || 'linear'
  ele.style.transition = `${time}ms ${speed}`;
  for(key in styleJson){
    ele.style[key] = styleJson[key];
  }

  ele.addEventListener('transitionend', end, false);
  function end(){
    setTimeout(function(){
      callback && callback();
    });
    ele.removeEventListener('transitionend', end, false);
    /**
     *  注意点: transition: none 时, 仅仅只有第一次样式变换是有过渡效果的   
     *    none 与 all 相对应 ?
     */
    ele.style.transition = '0';
    // ele.style.transition = 'none';
  }
}

/**
 * @description: 返回 ele 距离文档左上角的 left 和 top 值
 * @param {DOM} ele
 * @return {Object}
 */
function getPosition(ele){
  let left = 0;
  let top = 0;
  while(ele.offsetParent) {
    left += ele.offsetLeft;
    top += ele.offsetTop;
    ele = ele.offsetParent;
  }
  return {
    left, top
  }
}