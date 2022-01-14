# openHAB Rules Tools
A collection of library functions, classes, rule templates, MainUI widgets, and examples to reuse in the development of new openHAB capabilities.

# Installation

## Libraries
Previously this library supported Jython libraries that only work with OH 2.x.
Those are still available in the `before-npm` branch but have been removed and are no longer maintained in main going forward.

Similarly, ECMAScript 5.1 versions of these libraries exist in the `before-npm` branch.
These too are removed from the main branch and are no longer maintained.

The libraries that will continue to be developed going forward will be JS Scripting and Blockly.
The JS Scripting libraries can be installed using npm.

## Rule Tempaltes
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

## Rule Templates
- openHAB 3.2 M2+
- additional requirements in the docs for each

## Libraries
- openHAB 3.2 Release or later

# Tests
Many of the library capabilities also have "unit tests" located in the `test` folder.
Because of the dependency on the openHAB environment to run, these can be copied into a script rule and run manually.
Always watch the logs for errors or success.
This should only be required for those modifying the scripts and modules.

However, they are a good place to look at for examples for using various capabilities.

# Usage
See the README.md file bundled with each rule template and the entry in the [Marketplace postings](https://community.openhab.org/c/marketplace/rule-templates/74).

The following sections describe the purpose and how each library capability works and how to use them.
Be sure to look at the comments and the code as well for further details.

Name | Purpose 
- | -
`CountdownTimer` | Implements a timer that updates a `Number` or `Number:Timer` Item once a seconds with the amount of time remaining on that timer.

