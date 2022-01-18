module.exports = {
    get timeUtils() { return require('./timeUtils.js') },
    get timerMgr() { return require('./timerMgr.js') },
    get loopingTimer() { return require('./loopingTimer.js') },
    get rateLimit() { return require('./rateLimit.js') },
    get testUtils() { return require('./testUtils.js') },
    get gatekeeper() { return require('./gatekeeper.js') },
    get deferred() { return require('./deferred.js')},
    get countdownTimer() { return require('./countdownTimer.js')},
    get groupUtils() { return require('./groupUtils.js')}
  }