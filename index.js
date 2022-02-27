;(function () {
  let count = 0
  function isObject(v) {
    return Object.prototype.toString.call(v) === '[object Object]'
  }
  function JSONP(config) {
    let timeoutPromise
    const p = new Promise((resolve, reject) => {
      let { url, data, timeout = 5000, callbackKey = 'callback' } = config || {}
      let funcName = `${callbackKey}${++count}`
      window[funcName] = function (res) {
        resolve(res)
        clear()
      }

      let params = ''
      if (data || isObject(data)) {
        const keys = Object.keys(data)
        for (let i = 0; i < keys.length; i++) {
          params += `&${keys[i]}=${encodeURIComponent(data[keys[i]])}`
        }
        params = params.substr(1)
      }

      url =
        url + '?' + params + `${params ? '&' : ''}${callbackKey}=${funcName}`

      function clear() {
        script.parentNode.removeChild(script)
        script = null
        window[funcName] = null
      }

      let script = document.createElement('script')
      script.src = url
      script.onerror = function () {
        reject('error')
        clear()
      }
      document.body.appendChild(script)

      timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject('timeout')
          clear()
        }, timeout)
      })
    })

    return Promise.race([p, timeoutPromise])
  }

  window.JSONP = JSONP
})()
