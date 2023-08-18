# openHAB Rules Tools
A collection of library functions, classes, rule templates, MainUI widgets (eventually), and examples to reuse in the development of new openHAB capabilities.

# Installation

## Libraries
Previously this library supported Jython libraries that only work with OH 2.x.
Those are still available in the `before-npm` branch but have been removed and are no longer maintained in `main` going forward.

Similarly, ECMAScript 5.1 versions of these libraries exist in the `before-npm` branch.
These too are removed from the `main` branch and are no longer maintained.

The libraries that will continue to be developed going forward will be JS Scripting, Blockly (eventually), and rule templates.

The JS Scripting library depends on the `openhab-js` library.
This library comes with the add-on but you may need to upgrade the library independently.
It can be installed using `openhabian-config` menu option `46 | Install openhab-js` or by running `npm install openhab` from the `$OH_CONF/automation/js` folder.

### openHABian
`openhab_rules_tools` is now supported by openHABian.
It should be installed by default.
Look to see if `$OH_CONF/automation/js/node_modules/openhab_rules_tools` exists.
If so you already have this library.
If not, it can be installed using `openhabian-config` menu option `47 | Install openhab_rules_tools`.

### Manual Installation
From the `$OH_CONF/automation/js` folder run `npm install openhab_rules_tools`.

## Rule Templates
Rule templates are written in various languages.
Sometimes they will have dependencies that must be separately installed (other templates, libraries, add-ons).
See the readme and the docs for each template for more details.

Installation of a template can be done from MainUI under Settings -> Automation.

1. In MainUI go to Settings.
2. Open "Automation".
3. Browse for the rule template to install; you might need to click on "show all".
4. Read the description and instructions for how to use the template and make sure you understand it. Some tempaltes require you to first write another rule which the template rule will call or require tyhe creation of Items or addition of Item metadata, for example.
5. In the rule template and click "Add".
6. Now go to Settings -> Rules.
7. Click the + and enter the UID, label and description.
8. Choose the rule template from the list of installed templates.
9. Fill out the parameters and click Save.

# Prerequisites
As time passes and more new features are added to the openhab-js library and openHAB itself, the prerequisites for this library and the rule templates will change.
Review the release notes to see which versions of these and the addition of new prerequisites are required for that release.

# Tests
Many of the library capabilities also have "unit tests" located in the `test` folder.
Because of the dependency on the openHAB environment to run, these can be copied into a script rule and run manually.
Always watch the logs for errors or success.
This should only be required for those modifying the scripts and modules.

However, they are a good place to look at for examples for using various capabilities.

# Usage
For rule templates, see the README.md file bundled with each rule template and the entry in the [Marketplace postings](https://community.openhab.org/c/marketplace/rule-templates/74).

The following sections describe the purpose of each library capability.
Be sure to look at the comments, the code, and the tests for further details on usage and details.

Name | Purpose
-|-
`CountdownTimer` | Implements a timer that updates a `Number` or `Number:Timer` Item once a second with the amount of time remaining on that timer. This works great to see in the UI how much time is left on a timer.
`Deferred` | Allows one to easily schedule an update or command to be send to an Item in the future. It can be cancelled. This makes creating a timer for simple actions easier.
`Gatekeeper` | Schedules a sequence of actions with a time between one to the next. It can be used to limit how quickly commands are sent to a device or create a schedule of tasks (e.g. irrigation).
`LoopingTimer` | Creates a timer that loops until a condition is met. Pass in a function that returns how much time to schedule the next loop iteration or `null` when the timer should exit.
`RateLimit` | Implements a check that ignores an action if it occurs too soon after the previous action. This is good to limit how often one receives alerts or how often to process events like from a motion snesor.
`timeUtils` | A collection of functions that convert and manipulate times and durations. Almost all the other library capabilities depend on this. `toDateTime` will convert almost any duration or date time to a `time.ZonedDateTime`.
`TimerMgr` | A class that provides book keeping and management of multiple timers (e.g. one timer per Item for a rule that handled multiple Items). It supports rescheduling, flapping detection, etc.
`testUtils` | A collection of functions useful for testing.
`groupUtils` | A collection of functions to simplify mapping and reducing members or descendents of a Group.
`rulesUtils` | A collection of function to simplify the creation of a rule triggered by Items with a given tag or given Item metadata. These do not work well in UI rules.
`helpers` | These are some helper functions to centralize some stuff commonly done by several of the other parts of the library and rule templates (e.g. centralize creation of timer Objects)

## How to Save an Instance Between Runs?
Most of the library capabilities above are classes that one instantiates and reuses over multiple executions of a given rule.
So how does one save that instance so it doesn't get overwritten each time a rule runs?
There are three options.

### Shared Cache
New to OH 3.4 release, a system wide cache has been added where variables can be stored and accessed across multiple runs of a rule or between script actions or conditions across multiple rules.
On can pull, and if it doesn't exist instantiate a Object in one line inside your rule.

```
var timers = cache.shared.get('timers', () TimerMgr());
```

It is important to use unique keys across all your rules to avoid collisions.

### Private Cache
New to OH 3.4 release, a privatre cache has been added where variables can be stored and accessed from multiple runs of a given script action or condition.
Just like with the shared cache, one can pull, and if the Object doesn't exist instantiate it and save it to the private cache in one line inside your rule.

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

# TODOs

- generate docs from comments
