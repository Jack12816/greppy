Version 0.5.1
=============

* [fbd9987](https://github.com/Jack12816/greppy/commit/fbd9987) **[Binary]** Improved functionality of the new project command, we are now much more error tolerant on missing binaries.
* [46a95b8](https://github.com/Jack12816/greppy/commit/46a95b8) **[Commons][Config]** Updates readme, updated dependecies. Added config file for Travis CI.
* [2d7e4c5](https://github.com/Jack12816/greppy/commit/2d7e4c5) **[Helpers]** Extended the view date helper, diffToNow accepts now an optional unit.
* [ba7819c](https://github.com/Jack12816/greppy/commit/ba7819c) **[Tests]** Cleaned up coding styles on the test suite. Enabled output of creating the test project.
* [ea3e0a9](https://github.com/Jack12816/greppy/commit/ea3e0a9) **[Worker][Logging]** Added resolved module::controller:action for every debug request log.

Version 0.5.0
=============

* [03657e2](https://github.com/Jack12816/greppy/commit/03657e2) **[Commons]** Add support for missing ES5/6 implementations.
* [2de1bc5](https://github.com/Jack12816/greppy/commit/2de1bc5) **[Extension][Datatype]** Fixed htmlencode and htmldecode for String.
* [7b4b392](https://github.com/Jack12816/greppy/commit/7b4b392) **[Extension][Datatype]** Shortened htmldecode of String, as there are no special characters in RegExp.
* [0eb5c47](https://github.com/Jack12816/greppy/commit/0eb5c47) **[Helpers][Data-Grid]** Added support for SQL joined counts.
* [a291d3b](https://github.com/Jack12816/greppy/commit/a291d3b) **[Helpers][Data-Grid]** Reworked support for SQL joined counts.
* [b38cf2e](https://github.com/Jack12816/greppy/commit/b38cf2e) **[LDAP]** Cleaned up LDAP client code.
* [3c3990c](https://github.com/Jack12816/greppy/commit/3c3990c) **[Store][Helper]** Added support for wildcard loading of helpers.

Version 0.4.5
=============

* [f5633e3](https://github.com/Jack12816/greppy/commit/f5633e3) **[Package]** Updated mongodb/mongoose dependency versions.

Version 0.4.4
=============

* [dc3745d](https://github.com/Jack12816/greppy/commit/dc3745d) **[Extension]** Added SI prefixes for Numbers with positive power.
* [0b35aff](https://github.com/Jack12816/greppy/commit/0b35aff) **[Package]** Downgraded to mongodb 1.3.19.

Version 0.4.3
=============

* [d09da76](https://github.com/Jack12816/greppy/commit/d09da76) **[Release]** Bumped version to 0.4.3. Cleaned up some dirty files.

Version 0.4.2
=============

* [0caf5c2](https://github.com/Jack12816/greppy/commit/0caf5c2) **[Issue #18][Binary][Release]** Fixed new project init bug. Bumped version to 0.4.2.

Version 0.4.1
=============

* [3336d58](https://github.com/Jack12816/greppy/commit/3336d58) **[Docs]** Polished the changelog.
* [213aede](https://github.com/Jack12816/greppy/commit/213aede) **[Issue #18]** Fixed new project init.
* [1abd596](https://github.com/Jack12816/greppy/commit/1abd596) **[Release]** Bumped version to 0.4.1.

Version 0.4.0
=============

* [5a47912](https://github.com/Jack12816/greppy/commit/5a47912) **[App]** Added version validator.
* [77d2b90](https://github.com/Jack12816/greppy/commit/77d2b90) **[Backend/MySQL]** Added ability to use the ORM and the models on migrations.
* [87d9bc3](https://github.com/Jack12816/greppy/commit/87d9bc3) **[Backend/MySQL]** Catched all events (success and error) of the sequelize migrator while migrating.
* [a440280](https://github.com/Jack12816/greppy/commit/a440280) **[Binary]** Added missing newline for list command on debug mode.
* [06376e2](https://github.com/Jack12816/greppy/commit/06376e2) **[Binary]** Added the ability to pass the debug flag to the list command, so you will receive debugging informations for the contexts (eg: routes). Further you are able to specify the contexts to this command.
* [3fda92f](https://github.com/Jack12816/greppy/commit/3fda92f) **[Binary]** Added the ability to use wildcard backend names for the --db namespace, so you could simply write greppy --db rebuild mysql to rebuild all your mysql connections.
* [2d280fe](https://github.com/Jack12816/greppy/commit/2d280fe) **[Binary][Backend/MySQL/MongoDB]** Optimized the db binary command and also improved all backend adapters to gracefully close all opened connections. Problems which caused non-endindig db-command run were fixed.
* [bff406e](https://github.com/Jack12816/greppy/commit/bff406e) **[Binary][Scaffolding][Docs]** Fixed no-name bug of the new project binary. Updated the acme project sources. Updated all docblocks, removed '@return void'.
* [6cc2596](https://github.com/Jack12816/greppy/commit/6cc2596) **[Binary][Version]** If no git binary is available skip the git information for greppy/project versions.
* [325e261](https://github.com/Jack12816/greppy/commit/325e261) **[Cleanup]** Optimized the whole project with jshint, cleaned the binary and the framework itself.
* [4abdfb1](https://github.com/Jack12816/greppy/commit/4abdfb1) **[Cluster][Helpers]** The user-defined post-configure of the master will be fired when all workers are online. Added an i18n helper.
* [f3135cc](https://github.com/Jack12816/greppy/commit/f3135cc) **[Cluster][Master/Worker][Logger][Scaffolding]** Implemented request-access-logger for single worker and cluster. Added GNU makefile for new projects.
* [58a17ab](https://github.com/Jack12816/greppy/commit/58a17ab) **[Common][Binary][Helpers]** Added an default winston-console logger to the Greppy base-class. Fixed an symlinking bug on non existing public/modules directory for greppy --assets install. Restructured the JSON-WSP service client helper.
* [a024344](https://github.com/Jack12816/greppy/commit/a024344) **[Common]** Fixed overall lineending to unix.
* [02a4823](https://github.com/Jack12816/greppy/commit/02a4823) **[Common][Worker][App]** Fixed deprecated warnings for connect 3.0 (removed bodyParser and added json and urlencoded instead). Restructured and optimized the worker configure method. Added route sorting for the MVC loader.
* [598b9ac](https://github.com/Jack12816/greppy/commit/598b9ac) **[Config]** Pushed moment.js to 2.4.0.
* [0a8e448](https://github.com/Jack12816/greppy/commit/0a8e448) **[Config]** Updated GNU makefile to use bash as default shell.
* [af6209a](https://github.com/Jack12816/greppy/commit/af6209a) **[Data-Grid]** Fixed a bug which caused an invalid SQL query on disabled soft-deletion.
* [0fd21a1](https://github.com/Jack12816/greppy/commit/0fd21a1) **[Default-App]** Fixed an controller names cache bug. The cache was built inside the constructor, but with the restructure of the worker configure method this is to early. Moved the cache routine to the configure method of the default app.
* [0144364](https://github.com/Jack12816/greppy/commit/0144364) **[Docs]** Moved the docs out into a seperate repository.
* [1070166](https://github.com/Jack12816/greppy/commit/1070166) **[Error-Handling][MVC]** Improved error handling on several places. Added the 'helpers' namespace for controllers for in-file helpers.
* [53edd63](https://github.com/Jack12816/greppy/commit/53edd63) **[Helper][JSON-WSP]** Added correct error handling of faulted requests.
* [1f8d9bf](https://github.com/Jack12816/greppy/commit/1f8d9bf) **[Helper][JSON-WSP]** Correct debugging outputs and timeout/error handling.
* [9c95fb1](https://github.com/Jack12816/greppy/commit/9c95fb1) **[Helpers]** Extended the form helper for better error handling within the logAndFlash method.
* [77377ae](https://github.com/Jack12816/greppy/commit/77377ae) **[Helpers][JSON-WSP]** Added debuging information for passed arguments of a method.
* [ca665c2](https://github.com/Jack12816/greppy/commit/ca665c2) **[Issue #17][Binary]** Implemented the purge operation for MongoDB and MySQL backend adapters.
* [9a160f8](https://github.com/Jack12816/greppy/commit/9a160f8) **[Lib]** Changed config constructor behavior to merge, if both default and values were passed.
* [3fffbc1](https://github.com/Jack12816/greppy/commit/3fffbc1) **[Lib]** Fixed some glitches in config.
* [f3b7f99](https://github.com/Jack12816/greppy/commit/f3b7f99) **[Middleware]** Added lodash to res.locals so we can use it in views by default.
* [bf20f75](https://github.com/Jack12816/greppy/commit/bf20f75) **[Misc]** Some improvements for greppy default middleware, scaffolding templates and the overall look and feel.
* [d5c23f3](https://github.com/Jack12816/greppy/commit/d5c23f3) **[Misc]** Some improvements for req.greppy, controller.error helper, and the scaffolding templates.
* [497f442](https://github.com/Jack12816/greppy/commit/497f442) **[Scaffolding]** Fixed CRUD controller generation for MongoDB schemas with inline sub-document definitions (bad type-guessing).
* [03ef1a1](https://github.com/Jack12816/greppy/commit/03ef1a1) **[Scaffolding]** Fixed some minor glitches for context template and reordered help for --generate namespace of the binary.
* [4e76f90](https://github.com/Jack12816/greppy/commit/4e76f90) **[Scaffolding][MVC-Loader]** Fixed some indentions on templates. Optimized sorting of routes (Added more detailed look at params to sort, how often a colon exists).
* [30981a2](https://github.com/Jack12816/greppy/commit/30981a2) **[Scaffolding]** Ported all templates to font-awesome 4.0.0 icons.
* [b064322](https://github.com/Jack12816/greppy/commit/b064322) **[Scaffolding]** Refreshed layout files for module scaffold.
* [fd9bfbe](https://github.com/Jack12816/greppy/commit/fd9bfbe) **[Scaffolding]** Upgraded package.json/jade version to ~0.35 for new projects.
* [656b547](https://github.com/Jack12816/greppy/commit/656b547) **[Tests]** Added first tests for ConfigStore.
* [0a3d30f](https://github.com/Jack12816/greppy/commit/0a3d30f) **[Tests]** Added new tests.
* [ae8eea6](https://github.com/Jack12816/greppy/commit/ae8eea6) **[Tests]** Added some tests, modified others.
* [7909ea6](https://github.com/Jack12816/greppy/commit/7909ea6) **[Tests]** Added test for data-grid.
* [8e98534](https://github.com/Jack12816/greppy/commit/8e98534) **[Tests]** Added tests.
* [bb6cc9f](https://github.com/Jack12816/greppy/commit/bb6cc9f) **[Tests]** Changed assigment of root-vars to be more reliable.
* [7dea438](https://github.com/Jack12816/greppy/commit/7dea438) **[Tests]** Changed some tests.
* [bebc53a](https://github.com/Jack12816/greppy/commit/bebc53a) **[Tests/data-grid]** Fixed/Extended tests. Made method- and var-names of data-grid more clear.
* [97cb14e](https://github.com/Jack12816/greppy/commit/97cb14e) **[Tests]** Extended tests.
* [0ce3aaa](https://github.com/Jack12816/greppy/commit/0ce3aaa) **[Tests]** Extended tests for ConfigStore.
* [86d265e](https://github.com/Jack12816/greppy/commit/86d265e) **[Tests]** Finished tests for lib/config.
* [d420b58](https://github.com/Jack12816/greppy/commit/d420b58) **[Tests]** Fixed default app configurator testcases.
* [04a04e0](https://github.com/Jack12816/greppy/commit/04a04e0) **[Tests]** Fixed old tests and began new ones.
* [cf79bbf](https://github.com/Jack12816/greppy/commit/cf79bbf) **[Tests]** Harmonized tests.
* [58d8f1d](https://github.com/Jack12816/greppy/commit/58d8f1d) **[Tests]** Made tests compatible with class changes. Fixed missing semicolon.
* [99abfa6](https://github.com/Jack12816/greppy/commit/99abfa6) **[Tests]** Optimizations; paths now stored centrally.

Version 0.3.1
=============

* [adc193d](https://github.com/Jack12816/greppy/commit/adc193d) **[Release]** Bumped version to 0.3.1.
* [a39ec8e](https://github.com/Jack12816/greppy/commit/a39ec8e) **[Tests/Helpers]** Moved test-helpers to tests-directory and fixed some path issues resulting from this change.

Version 0.3.0
=============

* [4465591](https://github.com/Jack12816/greppy/commit/4465591) **[Auth]** Added the functionality to pass an entity from an auth adapter into req.greppy.auth.entity.
* [5a931c1](https://github.com/Jack12816/greppy/commit/5a931c1) **[Auth]** Implemented the auth eco-system.
* [d74879c](https://github.com/Jack12816/greppy/commit/d74879c) **[Auth]** Implemented the LDAP adapter.
* [2bd22df](https://github.com/Jack12816/greppy/commit/2bd22df) **[Auth][LDAP]** Extended the LDAP auth adapter with an helper method which converts results into JSON readable objects.
* [b42ccb1](https://github.com/Jack12816/greppy/commit/b42ccb1) **[Auth]** - minor fixes (identifiers, comments); - adapted doc
* [e301c5d](https://github.com/Jack12816/greppy/commit/e301c5d) **[Backend]** Added controler date helper. Added auto loading of all controller helpers rather than loading them manually.
* [48e1213](https://github.com/Jack12816/greppy/commit/48e1213) **[Backend]** Added function to format a time string to whatever format you want.
* [70ff4f9](https://github.com/Jack12816/greppy/commit/70ff4f9) **[Backend]** Added various methods to sanitize lists.
* [6c0ff5a](https://github.com/Jack12816/greppy/commit/6c0ff5a) **[Backend][Connection]** Added better error handling in case of misconfigured connections.
* [f77f829](https://github.com/Jack12816/greppy/commit/f77f829) **[Backend][Connection]** Added mongodb dependency to the backend instance.
* [7db7c17](https://github.com/Jack12816/greppy/commit/7db7c17) **[Backend][Connection][DataGrid]** Added utils as third parameter to getORM if exists. Fixed security issues (SQL injection) of data-grid.
* [668ac61](https://github.com/Jack12816/greppy/commit/668ac61) **[Backend]** Fixed methods to sanitize lists. Added method to cast/combine array(s) to object.
* [3469f72](https://github.com/Jack12816/greppy/commit/3469f72) **[Backend]** Fixed mongodb adapter template to work propertly with management operations. Added SQL entities helper.
* [5f37aae](https://github.com/Jack12816/greppy/commit/5f37aae) **[Backend][MongoDB]** Implemented plain mongodb connection for the adapter. **[Docs]** Converted js example files to markdown and added an section in the generated docs for them.
* [f923d5e](https://github.com/Jack12816/greppy/commit/f923d5e) **[Backend][MySQL]** Added error handling for fixtures (fill).
* [3ef56a0](https://github.com/Jack12816/greppy/commit/3ef56a0) **[Backend][MySQL]** Fixed maintenance/management commands to work with multiple connections.
* [f51ab4a](https://github.com/Jack12816/greppy/commit/f51ab4a) **[Backend]** Updated moment.js, added function to compare dates utilizing the date helper.
* [670a3b0](https://github.com/Jack12816/greppy/commit/670a3b0) **[Binary]** Added fill and refill commands. Implemented new management function for MongoDB and MySQL adapter.
* [fe32960](https://github.com/Jack12816/greppy/commit/fe32960) **[Binary]** Addes list switch to greppy binary.
* [cacc0d8](https://github.com/Jack12816/greppy/commit/cacc0d8) **[Binary]** Fixed displaying of database connection configs.
* [9d34d81](https://github.com/Jack12816/greppy/commit/9d34d81) **[Binary]** Fixed the listing of mongodb connections for the --db namespace.
* [ba69b65](https://github.com/Jack12816/greppy/commit/ba69b65) **[Binary]** Implemented the missing binary commands of greppy.
* [c6f3190](https://github.com/Jack12816/greppy/commit/c6f3190) **[Binary]** The greppy binary now supports detection of non project paths and the master shuts down on errors if --debug switch was set.
* [612333c](https://github.com/Jack12816/greppy/commit/612333c) **[Binary]** The list and status commands now checks for a valid Greppy project in cwd.
* [4b814ab](https://github.com/Jack12816/greppy/commit/4b814ab) **[CLI][Logging][MVC-Loader]** Added the ability to customize the cli of master and worker implementations. Added file logging support out of the box for the given worker context. Fixed a bug in mvc loader which does not check if a module/controllers directory exists.
* [160b2bd](https://github.com/Jack12816/greppy/commit/160b2bd) **[(Cluster)Worker]** Splitted the constructor, added an configure method.
* [a6b34e3](https://github.com/Jack12816/greppy/commit/a6b34e3) **[Common][Scaffolding]** Bumped version of express to 3.4.0. Fixed nullable of created_at property of an generated migration (MySQL).
* [68ac527](https://github.com/Jack12816/greppy/commit/68ac527) **[DataGrid]** Added base-where condition as option to enable complex data-grid queries. (Useful for versioning)
* [676c3af](https://github.com/Jack12816/greppy/commit/676c3af) **[DataGrid]** Added where prefix to data-grid options.
* [9702a2c](https://github.com/Jack12816/greppy/commit/9702a2c) **[Db-Store]** Fixed connection handling with dots in connection names.
* [4d98814](https://github.com/Jack12816/greppy/commit/4d98814) **[DB-Store]** Implemented the DB-Store and also the mysql adapter (plain+ORM).
* [454e9a5](https://github.com/Jack12816/greppy/commit/454e9a5) **[Docs]** Added a note for our IRC channel to the readme. Added further examples for MySQL.
* [c11dc59](https://github.com/Jack12816/greppy/commit/c11dc59) **[Docs]** Fixed typo of examples.
* [b1b53d0](https://github.com/Jack12816/greppy/commit/b1b53d0) **[Docs]** Polished the documentation for release.
* [3e87bac](https://github.com/Jack12816/greppy/commit/3e87bac) **[Docs]** Readded examples which were accidentally deleted.
* [944235a](https://github.com/Jack12816/greppy/commit/944235a) **[Docs][Template/Worker]** Updated the docs. Ported template project worker module to the current version.
* [36ea89c](https://github.com/Jack12816/greppy/commit/36ea89c) **[Docs]** Updated the readme file - Added testing section.
* [b416089](https://github.com/Jack12816/greppy/commit/b416089) **[Documentation]** Added API docs template and enhanced the maintenance binary to generate it. (Issue #5)
* [f14ca21](https://github.com/Jack12816/greppy/commit/f14ca21) **[Documentation]** Cleaned many typos.
* [e747f95](https://github.com/Jack12816/greppy/commit/e747f95) **[Documentation]** Cleaned unneeded assets and reworked the style.
* [c6a6b30](https://github.com/Jack12816/greppy/commit/c6a6b30) **[Documentation]** Cleanup some unneeded styles and sample confs for API docs.
* [d8683da](https://github.com/Jack12816/greppy/commit/d8683da) **[Documentation]** Final cleanup for the stable 0.2.0 release.
* [4c24974](https://github.com/Jack12816/greppy/commit/4c24974) **[Documentation]** Translated MySql docs into english.
* [9fadf2b](https://github.com/Jack12816/greppy/commit/9fadf2b) **[Documentation]** Translated parts of the documentation into english.
* [a06e7c6](https://github.com/Jack12816/greppy/commit/a06e7c6) **[Documentation]** Translated parts of the documentation into english.
* [043c1ac](https://github.com/Jack12816/greppy/commit/043c1ac) **[Documentation]** Updated examples and reworked some parts. General formating cleanup.
* [c652523](https://github.com/Jack12816/greppy/commit/c652523) **[Extension]** Enhanced the number and string classes **[Binary]** Implemented the assets namespace **[Worker]** Added common greppy middleware stack (req.greppy) **[MVC-Loader]** Splittet the registration of routes and pull into              application to enable the common greppy middleware **[Helper]** Added helpers for controller forms, views dates
* [4b767e4](https://github.com/Jack12816/greppy/commit/4b767e4) **[Extension][Worker]** Moved uniq method from array protoype to array. Added request to the view by worker middleware.
* [7e95bf8](https://github.com/Jack12816/greppy/commit/7e95bf8) **[Frontend][Docs]** Changed background colours of pre-attributes to match the code tags colour.
* [5974b01](https://github.com/Jack12816/greppy/commit/5974b01) **[Frontend/Git]** Implemented popup fixes and smaller adjustments from greppy-demo; added NetBeans project folder to gitignore
* [b329e6b](https://github.com/Jack12816/greppy/commit/b329e6b) **[Helper]** Added helper for dependencies (currently untested).
* [cf87977](https://github.com/Jack12816/greppy/commit/cf87977) **[Helper]** Extended the db/fixture and view/date helper.
* [cc9c901](https://github.com/Jack12816/greppy/commit/cc9c901) **[Helper]** Extended the helper system to load helpers which are classes and static objects.
* [78ccdfd](https://github.com/Jack12816/greppy/commit/78ccdfd) **[Helper]** Implemented a controller helper for data-grids.
* [7f1becf](https://github.com/Jack12816/greppy/commit/7f1becf) **[Helper]** Implemented a JSON-WSP client.
* [496a955](https://github.com/Jack12816/greppy/commit/496a955) **[Helper/Tests]** Implemented new testing-api and fixed lots of bugs.
* [6a8c3b6](https://github.com/Jack12816/greppy/commit/6a8c3b6) **[Issue #11][Auth]** Implemented htpasswd adapter and extended the base handler to support multiple adapters.
* [d504081](https://github.com/Jack12816/greppy/commit/d504081) **[Issue #11][Auth]** Implemented the HTTP auth adapter.
* [e662b47](https://github.com/Jack12816/greppy/commit/e662b47) **[Issue #11][Auth]** Reworked the auth system and build a bridge for the mvc loader to the controller to support real auth handlers.
* [2fd9bff](https://github.com/Jack12816/greppy/commit/2fd9bff) **[Issue #11][Auth]** Reworked the documentation.
* [ff58cfe](https://github.com/Jack12816/greppy/commit/ff58cfe) **[Issue #12]** **[Binary]** Implemented the --db namespace for the greppy binary. **[DB-Store]** Extended the MySQL backend adapter for the management methods            which will be called by the greppy binary to perform the            operations.
* [0ebf4ce](https://github.com/Jack12816/greppy/commit/0ebf4ce) **[Issue #13]** Added the scaffolding documentation.
* [10b5340](https://github.com/Jack12816/greppy/commit/10b5340) **[Issue #13]** Extended scaffolding functionalities. Fixed a bug which swapped the flags of allowNull on models.
* [b8f6fac](https://github.com/Jack12816/greppy/commit/b8f6fac) **[Issue #13]** Implemented scaffolds for db equipment (model, migration, fixture). **[Console]** Extended the console app class for pre/post hooks. **[Scaffolding]** Implemented the "model" operation.
* [5652285](https://github.com/Jack12816/greppy/commit/5652285) **[Issue #13]** Implemented the scaffolding for backend equipment.
* [b561baa](https://github.com/Jack12816/greppy/commit/b561baa) **[Issue #13]** Implemented the scaffoling for contexts generation.
* [4dabab4](https://github.com/Jack12816/greppy/commit/4dabab4) **[Issue #13]** Implemented the scaffoling for CRUD controller generation.
* [8c363ad](https://github.com/Jack12816/greppy/commit/8c363ad) **[Issue #13]** Reworked the controller-view templates. Fixed some glitches on some datatypes for the forms. Separated everything SQL based to prepare the scaffolding for other backend adapters.
* [a73281e](https://github.com/Jack12816/greppy/commit/a73281e) **[Issue #13][Scaffolding]** Fixed model nullable flags.
* [68fe5f5](https://github.com/Jack12816/greppy/commit/68fe5f5) **[Issue #13]** Started implementation of the controller generation.
* [fddcc3f](https://github.com/Jack12816/greppy/commit/fddcc3f) **[Issue #13]** Started implementation of the scaffolding library. **[Console]** Added a app/console implementation with extended question           functionality.
* [40ee8ed](https://github.com/Jack12816/greppy/commit/40ee8ed) **[Issue #13]** Updated the CRUD controller view scaffolds. **[Backend/MySQL]** Ported the MySQL adapter to the alpha9 of mysql package.
* [f9dd0d7](https://github.com/Jack12816/greppy/commit/f9dd0d7) **[Issue #15]** Refactored the binary namespace.
* [6d16e57](https://github.com/Jack12816/greppy/commit/6d16e57) **[Issue #16]** Merged the recursive mvc loading functionality of nabil1337 and extended the controller configuration abilities.
* [9a15f7b](https://github.com/Jack12816/greppy/commit/9a15f7b) **[Issue #8 and #10]** The glitch was fixed by piping the stdin to the childs. Implemented PID creation for a single debugged context.
* [95b18da](https://github.com/Jack12816/greppy/commit/95b18da) **[Issue #9]** Added mongodb adapter skeleton.
* [de69935](https://github.com/Jack12816/greppy/commit/de69935) **[Issue #9][Backend/MongoDB]** Added an documentation for the mongodb adapter.
* [7666872](https://github.com/Jack12816/greppy/commit/7666872) **[Issue #9][Backend/MongoDB]** Added scaffolding templates for models, fixtures, migrations and CRUD controllers. Added missing functionality for NoSQL data-grids.
* [06f8692](https://github.com/Jack12816/greppy/commit/06f8692) **[Issue #9][Backend/MongoDB]** Completed migration (file-based) for mongodb. Implemented the fill functionality for mongodb fixtures.
* [afb57c5](https://github.com/Jack12816/greppy/commit/afb57c5) **[Issue #9][Backend/MongoDB]** Implemented migration (creating collections) for mongoose models.
* [aca93f0](https://github.com/Jack12816/greppy/commit/aca93f0) **[Issue #9][Backend/MongoDB]** Implemented mongoose setup, create and drop management functions. Also switched to the string-based URI configuration for a mongodb connection.
* [1fb2bea](https://github.com/Jack12816/greppy/commit/1fb2bea) **[Logger]** Added default request logger.
* [5e3bfb1](https://github.com/Jack12816/greppy/commit/5e3bfb1) Merge branch 'master' of github.com:Jack12816/greppy
* [22b4552](https://github.com/Jack12816/greppy/commit/22b4552) Merge branch 'testing'
* [0d28962](https://github.com/Jack12816/greppy/commit/0d28962) Merge remote-tracking branch 'origin/testingv2'
* [b0049c2](https://github.com/Jack12816/greppy/commit/b0049c2) **[MVC-Loader][Binary]** Fixed a route-building bug for index controller (//action). Improved and extended the greppy binary.
* [d8ca4e0](https://github.com/Jack12816/greppy/commit/d8ca4e0) **[MVC-Loader]** Log canonical controller path for the route debugging instead of the controller name only.
* [80b5023](https://github.com/Jack12816/greppy/commit/80b5023) **[Package]** Added all contributors.
* [0ae1ff4](https://github.com/Jack12816/greppy/commit/0ae1ff4) **[Pagination]** Added pagination to data grid.
* [56162c6](https://github.com/Jack12816/greppy/commit/56162c6) **[Readme]** Enhanced the readme file with links to greppy.org and the documentation.
* [a9a1f48](https://github.com/Jack12816/greppy/commit/a9a1f48) **[Refactoring]** Replaced all callback(undefined) with callback(null).
* [15efcdf](https://github.com/Jack12816/greppy/commit/15efcdf) **[Refactoring]** Switched from the maintenance script to GNU Make. Moved the contents from test/ to tests/. Reworked the test/project helper.
* [e6da021](https://github.com/Jack12816/greppy/commit/e6da021) **[Release]** Bumped version to 0.3.0.
* [759722a](https://github.com/Jack12816/greppy/commit/759722a) **[Scaffolding]** Added missing comma to CRUD form template.
* [d901c32](https://github.com/Jack12816/greppy/commit/d901c32) **[Scaffolding]** Fixed an minor indention bug of the CRUD controller template. Added a new empty-controller template. Skip Associations.js as model if present.
* [77d7815](https://github.com/Jack12816/greppy/commit/77d7815) **[Scaffolding]** Fixed a styling bug for the CRUD controller views.
* [c641628](https://github.com/Jack12816/greppy/commit/c641628) **[Scaffolding]** Implemented empty and CRUD controller seperation for generation. Implemented module scaffolding.
* [5f68278](https://github.com/Jack12816/greppy/commit/5f68278) **[Strings]** Fixed grammar errors.
* [732dd08](https://github.com/Jack12816/greppy/commit/732dd08) **[Template]** Added new project template.
* [ecd5c6f](https://github.com/Jack12816/greppy/commit/ecd5c6f) **[Templates][Project]** Updated the greppy frontend library.
* [43226ca](https://github.com/Jack12816/greppy/commit/43226ca) **[Tests]** Added new tests and extended an old one.
* [9361811](https://github.com/Jack12816/greppy/commit/9361811) **[Tests]** Added tests based on mocha and should.js. Renamed tests-folder to test, in order to match mochas defaults.
* [1ac17cb](https://github.com/Jack12816/greppy/commit/1ac17cb) **[Tests]** First worker tests.
* [9475fc7](https://github.com/Jack12816/greppy/commit/9475fc7) **[Tests/Helper]** Added tests and a helper for creating test-projects.
* [441074f](https://github.com/Jack12816/greppy/commit/441074f) **[Tests/Helper]** Implemented concept for a new testing api. Not working yet.
* [db3eecb](https://github.com/Jack12816/greppy/commit/db3eecb) **[Tests/Helper]** Implemented testing programmatically. Fixed bugs in test-helper.
* [0afe39c](https://github.com/Jack12816/greppy/commit/0afe39c) **[Tests/Lib]** Additional unit tests, some fixes for bugs and improvements.
* [bf0c436](https://github.com/Jack12816/greppy/commit/bf0c436) **[Tests]** Mainly small fixes/enhancements and some skipping of tests, which arent working properly by now.
* [cc73052](https://github.com/Jack12816/greppy/commit/cc73052) **[Tests/Makefile]** Added new tests and slightly changed some files to re-enable growl and allow setting the test-reporter via make.
* [9f88024](https://github.com/Jack12816/greppy/commit/9f88024) **[Texts]** Corrected some mistakes.
* [b28da40](https://github.com/Jack12816/greppy/commit/b28da40) **[TinyFixes]** Added missing semicolons; improved grammar of docs/examples.
* [4093018](https://github.com/Jack12816/greppy/commit/4093018) **[Worker]** Added the ability to push all view helpers to the application, so they can be accessed by the user.
* [c9e9e8e](https://github.com/Jack12816/greppy/commit/c9e9e8e) **[WorkerContext]** Added IPC class which handles annotation of worker context on the master. Refactored worker context class.

Version 0.2.0
=============

* [c53ab7b](https://github.com/Jack12816/greppy/commit/c53ab7b) Added readme file.
* [ecffcee](https://github.com/Jack12816/greppy/commit/ecffcee) **[Binary]** Addes list switch to greppy binary.
* [1f37f25](https://github.com/Jack12816/greppy/commit/1f37f25) **[Binary]** Implemented the missing binary commands of greppy.
* [924e301](https://github.com/Jack12816/greppy/commit/924e301) **[CLI][Logging][MVC-Loader]** Added the ability to customize the cli of master and worker implementations. Added file logging support out of the box for the given worker context. Fixed a bug in mvc loader which does not check if a module/controllers directory exists.
* [331ee8f](https://github.com/Jack12816/greppy/commit/331ee8f) **[Cluster][Docs]** Implemented the HA cluster parts and refined some existing stuff. Added german documentation.
* [2fff922](https://github.com/Jack12816/greppy/commit/2fff922) **[DB-Store]** Implemented the DB-Store and also the mysql adapter (plain+ORM).
* [3304a30](https://github.com/Jack12816/greppy/commit/3304a30) **[Documentation]** Added API docs template and enhanced the maintenance binary to generate it. (Issue #5)
* [8572abc](https://github.com/Jack12816/greppy/commit/8572abc) **[Documentation]** Cleaned unneeded assets and reworked the style.
* [2d4bead](https://github.com/Jack12816/greppy/commit/2d4bead) **[Documentation]** Cleanup some unneeded styles and sample confs for API docs.
* [aecc30c](https://github.com/Jack12816/greppy/commit/aecc30c) **[Documentation]** Final cleanup for the stable 0.2.0 release.
* [8a9f1ad](https://github.com/Jack12816/greppy/commit/8a9f1ad) **[Documentation]** Translated MySql docs into english.
* [152e34c](https://github.com/Jack12816/greppy/commit/152e34c) **[Documentation]** Translated parts of the documentation into english.
* [d3dbcb0](https://github.com/Jack12816/greppy/commit/d3dbcb0) **[Documentation]** Translated parts of the documentation into english.
* [a922018](https://github.com/Jack12816/greppy/commit/a922018) **[Documentation]** Updated examples and reworked some parts. General formating cleanup.
* [0144869](https://github.com/Jack12816/greppy/commit/0144869) Implemented the new-command for the greppy binary.
* [a09c63a](https://github.com/Jack12816/greppy/commit/a09c63a) **[MVC-Loader][Binary]** Fixed a route-building bug for index controller (//action). Improved and extended the greppy binary.
* [d9f05ff](https://github.com/Jack12816/greppy/commit/d9f05ff) **[Package]** Added all contributors.
* [3f8fe09](https://github.com/Jack12816/greppy/commit/3f8fe09) Split the greppy binary into seperate command modules.
* [629b588](https://github.com/Jack12816/greppy/commit/629b588) **[Stores][Helper][Config]** Implemented generic store class. Implemented helper and config concepts.
* [a8fccf4](https://github.com/Jack12816/greppy/commit/a8fccf4) **[Structure]** Added tests directory.
* [eba0af1](https://github.com/Jack12816/greppy/commit/eba0af1) **[Template]** Added new project template.
* [9679e87](https://github.com/Jack12816/greppy/commit/9679e87) **[Worker]** Added the ability to push all view helpers to the application, so they can be accessed by the user.
* [16512fd](https://github.com/Jack12816/greppy/commit/16512fd) **[WorkerContext]** Added IPC class which handles annotation of worker context on the master. Refactored worker context class.

