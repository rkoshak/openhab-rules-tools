# openhab-rules-helper
Library functions, classes, and examples to reuse in the development of new Rules.

To start, this library will primarily contain Jython libraries but over time I expect to include other languages.

# Prerequisites
- openHAB 2.5 or later
- the Next-Gen Rules Engine add-on installed
- for Jython libraries, the Jython add-on installed and configured: https://community.openhab.org/t/beta-testers-wanted-jython-addon-w-helper-libraries-requires-oh-2-5-x/86633
- the Helper Libraries clones and copied to the right folder: https://openhab-scripters.github.io/openhab-helper-libraries/index.html

# Installation
Clone the repository to your local system.

Copy the contents of `automation/lib/<language>/rlktools` to `$OH_CONF/automation/lib/<language>/rlktools` where `<language>` is the language (e.g. Python).
This will add all the libraries to openHAB.
Many of the rules depend on these libraries.
If there are rules desired, copy the `/automation/jsr223/<langauge>/rlktools/<folder>` where `<folder>` is the folder containing the desired rules.

# Usage
Each rule and libary class and function has the usage information documented in the source code and the README.md file in each folder.

Most library capabilities and sets of rules will have a test which is another good source for examples.

# Future Plans
To start this repo will contain Python and Rules DSL rules.
Over time JavaScript versions of the same rules will be added.
The ultimate goal is to develop rule templates usable from the OH UI Rules Editor or through the REST API.
