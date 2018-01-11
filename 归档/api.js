
//统一拿数据
var urllib = require('urllib');
var errorcode = require('../lib/errorcode');
var domain = 'http://127.0.0.1:8221';

module.exports = {
  getPackaging: function (body, cb) {
    var url = '/socket/packagings',
      query = '?filters[code]=' + body.packaging + '&batch=' + body.batch;
    urllib.request((domain + url + query), function (err, data, res) {
      if (err) {
        cb(errorcode(err));
      }
      else if (!err && res.statusCode == 200) {
        var r = JSON.parse(data.toString());
        if(r.errcode) {
          cb(r);
        } else {
          cb(null,r);
        }
      } else {
        cb(errorcode(-1));
      }
    });
  },
  savePackaging: function (data, cb) {
    var url = '/socket/packagings';
    urllib.request(domain + url,{
      method: 'POST',
      data: data,
      headers: {
        'Accept-Language': 'zh',
        'Content-Type': 'application/json'
      }
    }, function (err, data, res) {
      if (err) {
        cb(errorcode(err));
      }
      else if (!err && res.statusCode == 200) {
        var r = JSON.parse(data.toString());
        if(r.errcode) {
          cb(r);
        } else {
          cb(null,r);
        }
        
      } else {
        cb(errorcode(-1));
      }
    });
  },
  savePackagingReverse: function (data, cb) {
    var url = '/socket/packagingsReverse';
    urllib.request(domain + url,{
      method: 'POST',
      data: data,
      headers: {
        'Accept-Language': 'zh',
        'Content-Type': 'application/json'
      }
    }, function (err, data, res) {
      if (err) {
        cb(errorcode(err));
      }
      else if (!err && res.statusCode == 200) {
        var r = JSON.parse(data.toString());
        if(r.errcode) {
          cb(r);
        } else {
          cb(null,r);
        }
        
      } else {
        cb(errorcode(-1));
      }
    });
  },
  savePackagingBeyond: function(data, cb) {
    var url = '/socket/packagingBeyond';
    urllib.request(domain + url,{
      method: 'POST',
      data: data,
      headers: {
        'Accept-Language': 'zh',
        'Content-Type': 'application/json'
      }
    }, function (err, data, res) {
      if (err) {
        cb(errorcode(err));
      }
      else if (!err && res.statusCode == 200) {
        var r = JSON.parse(data.toString());
        if(r.errcode) {
          cb(r);
        } else {
          cb(null,r);
        }
        
      } else {
        cb(errorcode(-1));
      }
    });
  },
  finishOrder: function(data, cb){
    var url = '/socket/outorder';
   urllib.request(domain + url,{
      method: 'POST',
      data: data,
      headers: {
        'Accept-Language': 'zh',
        'Content-Type': 'application/json'
      }
    }, function (err, data, res) {
      if (err) {
        cb(errorcode(err));
      }
      else if (!err && res.statusCode == 200) {
        var r = JSON.parse(data.toString());
        if(r.errcode) {
          cb(r);
        } else {
          cb(null,r);
        }
        
      } else {
        cb(errorcode(-1));
      }
    });
  }
};