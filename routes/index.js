var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var bdresult = [];
var wbresult = [];
var blresult = [];

router.get('/list', function(req, res, next) {
  res.append('Access-Control-Allow-Origin', '*');
  var keyword = req.query.keyword;
  if (keyword === 'bdhotnews') {
    res.json(bdresult);
    return;
  }else if (keyword === 'wbhotsearch'){
    res.json(wbresult);
    return;
  }else if (keyword === 'bhotplay'){
    res.json(blresult);
    return;
  }
  res.json([]);
});

router.get('/entrance', function(req, res, next) {
  res.append('Access-Control-Allow-Origin', '*');
  var result = [
    {
      name: '百度热闻',
      keyword: 'bdhotnews'
    }, {
      name: '微博热搜',
      keyword: 'wbhotsearch'
    }, {
      name: 'B站热播',
      keyword: 'bhotplay'
    }
  ];
  res.json(result);
});

getwb();
function getwb() {
  request({
    url: 'http://s.weibo.com/top/summary?cate=realtimehot',
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode === 200) {
      $ = cheerio.load(body, {decodeEntities: false});
      var result = [];
      $('#pl_searchIndex .list_a > li').each(function (key, val) {
        var obj = {};
        var ele1 = $(val).find('a');
        var ele2 = $(val).find('a>span');
        var ele3 = $(ele2).find('em').remove();
        obj['title'] = ele2.text().trim();
        obj['href'] = 'http://s.weibo.com' + ele1.attr('href');
        obj['hot'] = +ele3.text();
        obj['desc'] = '';
        obj['pic'] = '';
        result.push(obj);
        if (key > 8) {
          return false;
        }
      });
      if (result.length !== 0) {
        wbresult = result;
      }
    }
    setTimeout(function () {
      getwb();
    }, 1000 * 60 * 2);
  });
}
getbl();
function getbl() {
  request({
    url: 'https://api.bilibili.com/x/web-interface/ranking?rid=0&day=1',
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode === 200) {
      var result = [];
      var originJson = JSON.parse(body);
      var list = originJson.data.list;
      for (var i = 0; i < 10; i++) {
        var val = list[i];
        var obj = {};
        obj['title'] = val.title;
        obj['href'] = 'https://m.bilibili.com/video/av' + val.aid + '.html';
        obj['desc'] = '';
        obj['hot'] = val.play;
        obj['pic'] = val.pic;
        result.push(obj);
      }
      if (result.length !== 0) {
        blresult = result;
      }
    }
    setTimeout(function () {
      getwb();
    }, 1000 * 60 * 2);
  });
}

getbd();
function getbd() {
  request({
    url: 'http://top.baidu.com/mobile_v2/buzz/hotspot',
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode === 200) {
      var result = [];
      var originJson = JSON.parse(body);
      for (var i = 0; i < 10; i++) {
        var val = originJson.result.topwords[i];
        var obj = {};
        obj['title'] = val.keyword;
        obj['hot'] = val.searches;
        result.push(obj);
      }
  
      for (var j = 0; j < 10; j++) {
        var val = originJson.result.descs[j];
        var obj = result[j];
        obj['href'] = val.content.data[0].originlink;
        obj['desc'] = val.content.data[0].description;
        obj['pic'] = val.content.data[0].image;
      }
      if (result.length !== 0) {
        bdresult = result;
      }
    }
    setTimeout(function () {
      getbd();
    }, 1000 * 60 * 2);
  });
}

module.exports = router;
