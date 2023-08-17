module.exports = {
  get timeUtils() { return require('./timeUtils.js') },
  get timerMgr() {
    console.warn('require TimerMgr instead of timerMgr and use TimerMgr() instead of new timerMgr.TimerMgr().');
    return require('./timerMgr.js')
  },
  get TimerMgr() { return require('./timerMgr.js').getTimerMgr; },
  get loopingTimer() { return require('./loopingTimer.js') },
  get rateLimit() {
    console.warn('require RateLimit instead of rateLimit and use RateLimit() instead of new rateLimit.RateLimit().');
    return require('./rateLimit.js')
  },
  get RateLimit() { return require('./rateLimit.js').getRateLimit; },
  get testUtils() { return require('./testUtils.js') },
  get gatekeeper() { return require('./gatekeeper.js') },
  get deferred() { return require('./deferred.js') },
  get countdownTimer() { return require('./countdownTimer.js') },
  get groupUtils() { return require('./groupUtils.js') },
  get rulesUtils() { return require('./rulesUtils.js') },
  get helpers() { return require('./helpers.js') }
}