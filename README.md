# openHAB Rules Tools
Library functions, classes, and examples to reuse in the development of new Rules.
The primary focus is on building tools to solve commonly needed tasks instead of fully realized capabilities.
But some full capabilities will inevitably be added over time.

To start, this library will primarily contain Jython libraries but over time I expect to include other languages.

# Prerequisites
- openHAB 2.5 or later
- the Next-Gen Rules Engine add-on installed
- for Jython libraries, the Jython add-on installed and configured: https://community.openhab.org/t/beta-testers-wanted-jython-addon-w-helper-libraries-requires-oh-2-5-x/86633
- the Helper Libraries clones and copied to the right folder: https://openhab-scripters.github.io/openhab-helper-libraries/index.html

# Installation
Clone the repository to your local system.
Each library is made up of zero or more library modules and zero or more rule scripts.
To make installation of individual capabilities easier, each capability is located in it's own folder.
Copy the `automation` folder under a given capability's folder to `$OH_CONF`.

The README in each folder documents the purpose and usage of that library.
Pay attention as some libraries depend on others (e.g. `timer_mgr` depends upon `time_utils`).

Many capabilities also have unit tests located in the `test` folder.
To test the library, copy the contents of the `test` folder to `$OH_CONF/automation/jsr223/<language>/community`.
Watch the logs for errors or success.
Once the tests have run, remove the test files so they do not run on every restart of OH.

# Usage
Each rule and libary class and function has the usage information documented in the source code and the README.md file in each capability's folder.
The unit tests are also another good place to find usage examples.

# Future Plans
To start this repo will contain Python and Rules DSL rules.
Over time JavaScript versions of the same rules will be added.
The ultimate goal is to develop rule templates usable from the OH UI Rules Editor or through the REST API.
