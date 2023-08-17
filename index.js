module.exports = {
  get timeUtils() { return require('./timeUtils.js') },
  get timerMgr() {
    console.warn('require TimerMgr instead of timerMgr and use TimerMgr() instead of new timerMgr.TimerMgr().');
    return require('./timerMgr.js')
  },
  get TimerMgr() { return require('./timerMgr.js').getTimerMgr; },
  get loopingTimer() {
    console.warn('require LoopingTimer instead of loopingTimer and use LoopingTimer() instead of new loopingTimer.LoopingTimer().');
    return require('./loopingTimer.js')
  },
  get LoopingTimer() { return require('./loopingTimer.js').getLoopingTimer; },
  get rateLimit() {
    console.warn('require RateLimit instead of rateLimit and use RateLimit() instead of new rateLimit.RateLimit().');
    return require('./rateLimit.js')
  },
  get RateLimit() { return require('./rateLimit.js').getRateLimit; },
  get testUtils() { return require('./testUtils.js') },
  get gatekeeper() {
    console.warn('require Gatekeeper instead of gatekeeper and use Gatekeeper() instead of new gatekeeper.Gatekeeper().');
    return require('./gatekeeper.js');
  },
  get Gatekeeper() { return require('./gatekeeper.js').getGatekeeper; },
  get deferred() {
    console.warn('require Deferred instead of deferred and use Deferred() instead of new deferred.Deferred().');
    return require('./deferred.js');
  },
  get Deferred() { return require('./deferred.js').getDeferred; },
  get countdownTimer() {
    console.warn('require CountdownTimer instead of countdownTimer and use CountdownTimer() instead of new countdownTimer.CountdownTimer().');
    return require('./countdownTimer.js');
  },
  get CountdownTimer() { return require('./countdownTimer.js').getCountdownTimer; },
  get groupUtils() { return require('./groupUtils.js') },
  get rulesUtils() { return require('./rulesUtils.js') },
  get helpers() { return require('./helpers.js') }
}