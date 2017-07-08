var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var bdresult = [];
var wbresult = [];

router.get('/list', function(req, res, next) {
  res.append('Access-Control-Allow-Origin', '*');
  var keyword = req.query.keyword;
  if (keyword === 'bdhotnews') {
    res.json(bdresult);
  }else if (keyword === 'wbhotsearch'){
    res.json(wbresult);
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
    if (!err && response.statusCode == 200) {
      $ = cheerio.load(body, {decodeEntities: false});
      var result = [];
      $('#pl_searchIndex .list_a>li').each(function (key, val) {
        var obj = {};
        var ele1 = $(val).find('a');
        var ele2 = $(val).find('a>span');
        obj['title'] = (key+1) + '. ' + ele2.html();
        obj['href'] = 'http://s.weibo.com' + ele1.attr('href');
        obj['desc'] = '';
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

getbd();
function getbd() {
  request({
    url: 'http://top.baidu.com/news?fr=topindex',
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      $ = cheerio.load(iconv.decode(body, 'gb2312'), {decodeEntities: false});
      var result = [];
      $('#new_list_div>.news_list').each(function (key, val) {
        var obj = {};
        var ele1 = $(val).find('.title_3 > .fl > h2 > a');
        var ele2 = $(val).find('.news_tex');
        obj['title'] = (key+1) + '. ' + ele1.text();
        obj['href'] = ele1.attr('href');
        obj['desc'] = ele2.text();
        result.push(obj);
        if (key > 8) {
          return false;
        }
      });
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
