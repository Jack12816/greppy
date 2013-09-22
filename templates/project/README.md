# ACME Application

## Dependencies

* Node.js (pacman -S nodejs)
* Bower (npm install -g bower)
* [Ruby] (pacman -S ruby)

### Development

**Note:** These steps are optional.

To enjoy the live reloading features just install the awesome
Guard ruby gem:

    $ gem install guard guard-livereload guard-shell

After installing the dependencies you need to install the livereload
browser extension. Just follow the Installation steps on
[livereload.com](http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-).

## Installation

Just run these commands to setup all dependencies:

    $ npm install
    $ bower install
    $ greppy --assets install

## Usage

To start the demo application you only need to run:

    $ greppy --start acme --debug

### Development

**Note:** These steps are optional.

Get get livereload to work just start the Guard daemon.

    $ guard

