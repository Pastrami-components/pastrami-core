// export default getService(runVanillaRequest);
// TODO test and see if the lazy instance method is needed
export const config = {
  token: undefined
};

export function get(url) {
  console.log('this', this.method);
  this._method = 'GET';
  this._url = url;
  return this;
}

export function get(url) {
  this._method = 'GET';
  this._url = url;
  return this;
}

export function send(callback) {
  var requestConfig = {
    method: this._method,
    url: this._url,
    headers: {}
  };

  // this function exists in the modue file
  var result = runRequest(requestConfig, callback);
  if (typeof callback !== 'function') { return result; }
}

// function setMethodUrl(inst, method, url) {
//   var instance = getInstance(inst);
//   instance.method = method;
//   instance.url = url;
//   return instance;
// }

// function getInstance(self) {
//   if (self._created) { return self; }
//
//   var instance = createInstance();
//   instance.config = self.config;
//   instance._created = true;
//   return instance;
// }


// function getService(runRequest) {
//   var constructor = function () {
//     var _service = createInstance();
//     _service.config = createConfigInstance();
//     return _service;
//   };
//   // transfer instance methods to constructor function
//   var _serviceMethods = createInstance();
//   Object.keys(_serviceMethods).forEach(function (key) {
//     constructor[key] = _serviceMethods[key];
//   });
//   constructor.config = createConfigInstance();
//   return constructor;
//
//
//   function createConfigInstance() {
//     return {
//       token: undefined,
//       venue: undefined,
//       organization: undefined,
//       context: undefined,
//       serviceUrls: {}
//     };
//   }
//
//   function createInstance() {
//     return {
//       service: service,
//       get: get,
//       post: post,
//       put: put,
//       patch: patch,
//       head: head,
//       del: del,
//       clean: clean,
//       headers: headers,
//       auth: auth,
//       venue: venue,
//       context: context,
//       organization: organization,
//       data: data,
//       queryParams: queryParams,
//       paramsJQLike: paramsJQLike,
//       formData: formData,
//       timeout: timeout,
//       external: external,
//       send: send
//     };
//   }
// }


function runRequest(requestConfig, callback) {
  if (typeof callback === 'function') {
    xhr(requestConfig, function (err, response) {
      if (err) {
        callback(true, {
          body: err,
          status: undefined,
          headers: headerNOOP
        });
        return;
      }

      callback(response.statusCode >= 400, {
        body: response.body,
        status: response.statusCode,
        headers: getHeadersMethod(response.headers)
      });
    });
  } else {
    return new Promise(function (resolve, reject) {
      xhr(requestConfig, function (err, response) {
        if (err) {
          reject(true, {
            body: err,
            status: undefined,
            headers: headerNOOP
          });
          return;
        }

        if (response.statusCode >= 400) {
          reject({
            body: response.body,
            status: response.statusCode,
            headers: getHeadersMethod(response.headers)
          });
        } else {
          resolve({
            body: response.body,
            status: response.statusCode,
            headers: getHeadersMethod(response.headers)
          });
        }
      });
    });
  }
}

function xhr(config, callback) {
  var aborted = false;
  var timeoutTimer;
  var request = new XMLHttpRequest();
  var failureResponse = {
    body: undefined,
    headers: {},
    statusCode: 0,
    method: config.method,
    url: config.url,
    rawRequest: request
  };

  formatData(config);

  request.onprogress = function(){};
  request.onload = onload;
  request.onerror = onerror;
  request.ontimeout = onerror;

  request.open(config.method, config.url, true);

  // set headers
  Object.keys(config.headers || {}).forEach(function (key) {
    request.setRequestHeader(key, config.headers[key]);
  });

  function onload() {
    if (aborted) { return; }
    if (timeoutTimer) { clearTimeout(timeoutTimer); }

    var status;
    var response = failureResponse;
    var err = undefined;

    if (status !== 0) {
      response = {
        body: getBody(request),
        statusCode: request.status,
        method: config.method,
        headers: parseHeaders(request.getAllResponseHeaders()),
        url: config.url,
        rawRequest: request
      };
    } else {
      err = new Error("Internal XMLHttpRequest Error");
    }

    callback(err, response);
  }

  function onerror(err) {
    if (timeoutTimer) { clearTimeout(timeoutTimer); }
    if(!(err instanceof Error)){
        err = new Error('' + (err || 'Unknown XMLHttpRequest Error'));
    }
    err.statusCode = 0;
    callback(err, failureResponse);
  }

  //sets the timeout
  if (typeof config.timeout === 'number') {
    timeoutTimer = setTimeout(function() {
      aborted = true;
      request.abort();
    }, config.timeout);
  }

  //send the request
  request.send(config.data);
}

function getBody(request) {
  var body = undefined;
  if (request.response) {
    body = request.response;
  } else {
    body = request.responseText || getXml(request)
  }

  // attemp to parse json
  if (body) {
    try {
      body = JSON.parse(body)
    } catch (e) {}
  }

  return body
}

function parseHeaders(rawHeaders) {
  if (!rawHeaders) { return {}; }
  var result = {}

  rawHeaders.trim().split('\n').forEach(function (raw) {
    var split = raw.trim().split(':');
    var key = split[0].trim().toLowerCase();
    var value = split[1];

    if (result[key] === undefined) {
      result[key] = value
    } else if (Array.isArray(result[key])) {
      result[key].push(value)
    } else {
      result[key] = [result[key], value]
    }
  });

  return result;
}

function formatData(config) {
  if (config.method === 'GET' && config.method === 'HEAD') {
    delete config.data;
    return;
  }

  var headers = {
    'Content-Type': undefined,
    'Accept': undefined
  };

  if (typeof config.data === 'object' && config.data !== null) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    config.data = JSON.stringify(config.data);
  }

  var isFormData = config.form || (config.headers['Content-Type'] && config.headers['Content-Type'].indexOf('x-www-form-urlencoded') > 1);
  if (isFormData) {
    var data = '';
    Object.keys(config.form || {}).forEach(function () {
      if (isFormData) {
        data += encodeURIComponent(key) + '=' + encodeURIComponent(_data[key]) + '&';
      } else {
        data += key + '=' + _data[key] + '\n\r';
      }
    });
  }

  // set headers without overwriting the current value
  config.headers['Content-Type'] = config.headers['Content-Type'] || headers['Content-Type'];
  config.headers['Accept'] = config.headers['Accept'] || headers['Accept'];
}

function getXml(request) {
  if (request.responseType === 'document' || request.responseType === '') {
    return request.responseXML
  }
  return null
}

function getHeadersMethod(headersObj) {
  return function headers(name) {
    return headersObj[name];
  };
}

function headerNOOP() {}
