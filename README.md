# openHAB Rules Tools (OHRT)
A collection of library functions, classes, rule templates, MainUI widgets (eventually), and examples to reuse in the development of new openHAB capabilities.
 
# Sponsorship

If you want to send a tip my way or sponsor my work you can through [Sponsor @rkoshak on GitHub](https://github.com/sponsors/rkoshak) or [PayPal](https://paypal.me/rlkoshak?country.x=US&locale.x=en_US). 
It won't change what I contribute to OH but it might keep me in coffee or let me buy hardware to test out new things.

# Installation

## Libraries
Previously this library supported Jython libraries that only work with OH 2.x.
Those are still available in the `before-npm` branch but have been removed and are no longer maintained in `main` going forward.

Similarly, ECMAScript 5.1 versions of these libraries exist in the `before-npm` branch.
These too are removed from the `main` branch and are no longer maintained.

The libraries that will continue to be developed going forward will be JS Scripting, Blockly, UI Widgets, and rule templates.

The JS Scripting library depends on the `openhab-js` library.
`openhab-js` comes with the add-on but you may need to upgrade the library independently.
It can be installed using `openhabian-config` menu option `46 | Install openhab-js` or by running `npm install openhab` from the `$OH_CONF/automation/js` folder.

### openHABian
`openhab_rules_tools` is now supported by openHABian.
It should be installed by default.
Look to see if `$OH_CONF/automation/js/node_modules/openhab_rules_tools` exists.
If so you already have this library.
If not, it can be installed using `openhabian-config` menu option `47 | Install openhab_rules_tools`.

### Manual Installation
From the `$OH_CONF/automation/js` folder run `npm install openhab_rules_tools`.

### Rule Template Installation
The template requires `wget` in the path of the user running OH and the ability to run a shell script.
It therefore it likely to only work on a POSIX type system.
It has been tested and does work with Docker instances of OH.

1. From MainUI -> Add-on Store -> Automation add the "Install openHAB Rules Tools" template.
2. Instantiate a rule based on this template.
3. Maunally run the rule, watching openhab.log for progress and errors. If there are errors, you likely need to install the library manually.

## Rule Templates
Rule templates are written primarily GraalVM JS (i.e. JS Scripting).
Sometimes they will have dependencies that must be separately installed (other templates, libraries, add-ons).
See the readme and the docs for each template for more details.

Installation of a template can be done from MainUI under Settings -> Automation.

1. In MainUI go to Settings.
2. Open "Automation".
3. Browse for the rule template to install; you might need to click on "show all".
4. Read the description and instructions for how to use the template and make sure you understand it. Some tempaltes require you to first write another rule which the template rule will call or require the creation of Items or addition of Item metadata, for example.
5. In the rule template and click "Add".
6. Now go to Settings -> Rules.
7. Click the + and enter the UID, label and description.
8. Choose the rule template from the list of installed templates.
9. Fill out the parameters and click Save.

# Prerequisites
As time passes and more new features are added to the openhab-js library and openHAB itself, the prerequisites for this library and the rule templates will change.
Review the release notes to see which versions of these and the addition of new prerequisites are required for that release.

# Tests

This library uses **Jest** and a custom **mock openHAB environment**. The mock environment simulates the global variables (`items`, `actions`, `osgi`, `cache`, `time`, `utils`, `Java`) and OSGi automation registries so you can run the entire test suite locally in standard Node.js without a running openHAB instance.

### Running the Unit Tests

1. **Install Dependencies**:
   Ensure you have installed node modules in the root of the project:
   ```bash
   npm install
   ```

2. **Execute Tests**:
   To run all unit tests in the suite:
   ```bash
   npm test
   ```

3. **Check Test Coverage**:
   To run tests and output a full visual code-coverage report in the terminal:
   ```bash
   npm test -- --coverage
   ```

# Usage
For rule templates, see the README.md file in the marketplace-templates folder and the entry in the [Marketplace postings](https://community.openhab.org/c/marketplace/rule-templates) for the detailed instructions for each individual tempalte.

The following sections describe the purpose and detailed usage examples of each library capability.

Name | Purpose
|-|-
`CountdownTimer` | Implements a timer that updates a `Number` or `Number:Timer` Item once a second with the amount of time remaining on that timer.
`Deferred` | Allows one to easily schedule an update or command to be sent to an Item in the future.
`Gatekeeper` | Schedules a sequence of actions with a time between one to the next (e.g., to prevent rate limits or schedule sequential tasks).
`LoopingTimer` | Creates a timer that loops until a condition is met.
`RateLimit` | Implements a check that ignores an action if it occurs too soon after the previous action.
`timeUtils` | A collection of functions that convert and manipulate times and durations.
`TimerMgr` | A class that provides bookkeeping and management of multiple timers.
`testUtils` | A collection of functions useful for testing.
`groupUtils` | A collection of functions to simplify mapping and reducing members or descendants of a Group.
`rulesUtils` | A collection of functions to simplify the creation of a rule triggered by Items with a given tag or given Item metadata.
`helpers` | Helper functions to centralize common operations (like centralizing named timer creation).

---

## Class and Function Reference with Examples

### 1. TimerMgr
Manages multiple timers identified by a unique key (such as an Item name). It supports rescheduling, custom flapping actions, and automatic cleanup.

```javascript
const { TimerMgr } = require('openhab_rules_tools');

// Instantiate or retrieve from Cache
const tm = cache.private.get('myTimers', () => TimerMgr());

// Check/create a timer for Item "LivingRoom_Motion" to turn off light in 5 minutes
tm.check('LivingRoom_Motion', 'PT5m', () => {
  items.getItem('LivingRoom_Light').sendCommand('OFF');
});
```

### 2. Gatekeeper
Queues up commands ensuring a designated pause interval passes between the execution of subsequent commands.

```javascript
const { Gatekeeper } = require('openhab_rules_tools');

const gk = cache.private.get('myGatekeeper', () => Gatekeeper('irrigation-gk'));

// Schedule sequential zone irrigations with pauses
gk.addCommand('PT10m', () => items.getItem('Zone1_Valve').sendCommand('ON'));
gk.addCommand('PT15m', () => {
  items.getItem('Zone1_Valve').sendCommand('OFF');
  items.getItem('Zone2_Valve').sendCommand('ON');
});
gk.addCommand('PT0s', () => items.getItem('Zone2_Valve').sendCommand('OFF'));
```

### 3. CountdownTimer
Schedules a function to run at a specific time and updates a backing `Number` Item with the remaining seconds once a second.

```javascript
const { CountdownTimer } = require('openhab_rules_tools');

// Start a 1-minute countdown, updating the 'Timer_Remaining' Item
const timer = CountdownTimer('PT1m', () => {
  console.info('Timer finished!');
}, 'Timer_Remaining');
```

### 4. Deferred
Allows you to postpone sending a command or update to an Item to a future date or duration.

```javascript
const { Deferred } = require('openhab_rules_tools');

const def = cache.private.get('myDeferred', () => Deferred());

// Turn ON the exhaust fan in 30 minutes as a command
def.defer('Exhaust_Fan', 'ON', 'PT30m', true);
```

### 5. LoopingTimer
Creates a self-rescheduling timer that continues to loop as long as the generator function returns a valid duration.

```javascript
const { LoopingTimer } = require('openhab_rules_tools');

const lt = LoopingTimer();
let count = 0;

lt.loop(() => {
  count++;
  console.info(`Loop iteration ${count}`);
  return (count < 5) ? 'PT2s' : null; // Loop 5 times every 2s
}, 'PT2s');
```

### 6. RateLimit
Rate-limits executions, ignoring any action that occurs before a specified duration has elapsed since the last successful execution.

```javascript
const { RateLimit } = require('openhab_rules_tools');

const limit = cache.private.get('myRateLimit', () => RateLimit());

// Ignore motion updates if we already logged one in the last 10 seconds
limit.run(() => {
  console.info('Motion detected - processing event!');
}, 'PT10s');
```

### 7. timeUtils
Utility functions to parse and compare times, check clock styles, and determine time boundaries.

```javascript
const timeUtils = require('openhab_rules_tools').timeUtils;

// Parse a custom human-readable duration
const duration = timeUtils.parseDuration('1h 30m'); // returns a js-joda Duration

// Check if now is between two times
const isDayTime = timeUtils.betweenTimes('08:00', '18:00'); // returns boolean
```

### 8. groupUtils
Provides functional mapping, reducing, and calculating utilities for members and descendants of a Group.

```javascript
const groupUtils = require('openhab_rules_tools').groupUtils;

// Sum up all temperatures in a Group, ignoring non-numeric values
const totalTemp = groupUtils.sumList(items.getItem('gTemperatures').members);

// Join all member names with a comma
const nameList = groupUtils.membersToString('gSmartBulbs', ', ', item => item.name);
```

### 9. rulesUtils
Utilities to dynamically generate rules based on metadata, tags, and automation triggers.

```javascript
const rulesUtils = require('openhab_rules_tools').rulesUtils;

// Check if a specific rule exists in the automation registry
const exists = rulesUtils.ruleExists('my-custom-rule-uid');
```

### 10. helpers
Under-the-hood helpers to manage named timers, check compatibility standards, and validate library dependencies.

```javascript
const helpers = require('openhab_rules_tools').helpers;

// Check if libraries meet minimum version requirements
helpers.validateLibraries('4.0.0', '2.0.0');
```

## How to Save an Instance Between Runs?
Most of the library capabilities above are classes that one instantiates and reuses over multiple executions of a given rule.
So how does one save that instance so it doesn't get overwritten each time a rule runs?
There are three options.

### Shared Cache
New to OH 3.4 release, a system wide cache has been added where variables can be stored and accessed across multiple runs of a rule or between script actions or conditions across multiple rules.
One can pull, and if it doesn't exist, instantiate an Object in one line inside your rule.

```
var timers = cache.shared.get('timers', () TimerMgr());
```

It is important to use unique keys across all your rules to avoid collisions.

### Private Cache
New to OH 3.4 release, a privatre cache has been added where variables can be stored and accessed from multiple runs of a given script action or condition.
Just like with the shared cache, one can pull, and if the Object doesn't exist instantiate it and save it to the private cache in one line inside your rule.
The private cache is limited to one Script.

### Global Variable
If writing your rules in .js files, you can define a variable outside of your rules and that variable will be "global" to all the rules in that file.
That variable will also be preserved from one run of the rules to the next.

```
var tm = new timerMgr.TimerMgr();

...
    // inside a rule
    tm.check(key, '5m', runme);
```

NOTE: This approach is not possible in UI rules.

## Function Generators
Many of these capabilities accept a function as an argument passed to them which get called under certain circumstances (e.g. called at a given time).
When creating those functions one has a number of options.

One can create an anonymous function inline.

```javascript
this.timers.check(event.itemName, 1000, function() {
  // do some stuff
}
```

Another way to define an anonymous funciton.

```javascript
this.timers.check(event.itemName, 1000, () => {
  // do stuff
}
```

Or one can define a named function.

```javascript
var runme = function() {
  // do stuff
}
this.timers.check(event.itemName, 1000, runme);
```

With all of the approaches above, one could run into problems with varibles and their scope, particularly in the UI scripts.
If the function passed refers to variables not defined in the function itself, when the function is finally called (e.g. from a timer) those variables may have changed because of a subsequent run of the script.
There needs to be a way to "fix" the values of the variables in the function so no matter what happens to them outside the function, the values remain the same in the funciton.

This can be achieved through a function generator.
A function generator is mainly just a function that returns a function.
But we can pass as arguments to the generator those values the returned function needs which will fix their values.

```javascript
var runmeGenerator = function(foo, bar, baz) {
  return () => {
    // do stuff with foo, bar, and baz
  }
}
var foo = 'foo';
var bar = 123;
var baz = null;
this.timers.check(event.itemName, 1000, runmeGenerator(foo, bar, baz));
```