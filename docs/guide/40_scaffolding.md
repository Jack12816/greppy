# Scaffolding

The Greppy frameowork offers a quite powerful scaffolding solution, which
can be used to generate models with migrations and fixtures, application
contexts, and even CRUD (Create-Read-Update-Delete) controllers. This solution
is an important tool of the rapid prototyping system. With the
help of this toolset, you can build an application in less time, because
you just concentrate on the specific needs of the task. The generated
result often doesn't need any further editing, so all you have to do
would be a restart of the application and everything works out of the box.

The scaffolding solution of Greppy is a console based dialog, which will
ask as many questions as it takes to generate the requested part.
While answering the questions, you will always get hints and descriptions.
Many questions have default values, which appear in brackets ([]), so you just
have to press enter in case you don't want to change the value. Further you
can use auto-completion on selections with predefined values. Just press the
tab key.

## Generation of application modules

The generation of a new application module is an essential task while
developing a new software product. You should encapsulate your code into
modules, where the code which lies in it is dedicated to the module. With
this principle you can reuse the module with another application.

The only question to answer to the generator is the name of the new module.

## Generation of application contexts

The generation of an application context will result in a JavaScript file
located under ``app/context/``.

You will be asked for the name, the description, the module(s) and
the default TCP port of the new context.

## Generation of backend equipments

The generation of backend equipments includes the following parts:

* Model
* Migration
* Fixture

You will be asked for the connection, the module to put the model in,
the name of the model and how the deletion should be handled (Hard- and
soft-deletion).

Further a question set would be started to register all properties of the
model. This question set will be repeated until you break it with ``ctrl+c``.
You can even omit answering the properties questions, so your model will
have only the default properties. But in case you want to use the power and
comfort of the scaffolding, you will be asked for the name, the datatype,
and the ability to omit a value of a property.

## Generation of CRUD controllers

The generation of a CRUD controller is extremely easy. Will just have to
answer three questions with two predefined selections and one with an default
value. The dialog asks for the module in which to search the model for, the
name of the model, and the name of the controller which defaults to the name
of the model.

The controller itself and the needed views for it will be generated and
you will experience the following features out of the box:

* Actions for all operations
* Based on the model you will have hard/soft-deletion (Ability to delete/restore)
* The properties of the given model will be used to auto generate the forms
  for inserting/updating an entity
* The list/overview of the controller is a fully functional data grid
  which supports AJAX based sorting, pagination and searching

