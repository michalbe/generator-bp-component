'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');

var ComponentGenerator = yeoman.generators.NamedBase.extend({

  detectCodeLanguage: function() {
    this.usesTypeScript = fs.existsSync('src/app/startup.ts');
    this.codeFileExtension = this.usesTypeScript ? '.ts' : '.js';
  },

  init: function () {
    var codeLanguage = this.usesTypeScript ? 'TypeScript' : 'JavaScript';
    console.log('Creating component \'' + this.name + '\' (' + codeLanguage + ')...');
    this.componentName = this.name;
    this.dirname = 'src/components/' + this._.dasherize(this.name) + '/';
    this.filename = this._.dasherize(this.name);
    this.viewModelClassName = this._.classify(this.name);
  },

  template: function () {
    this.copy('view.html', this.dirname + this.filename + '.html');
    this.copy('view.less', this.dirname + this.filename + '.less');
    this.copy('view-test.js', 'test/' + this.filename + '-test.js');
    this.copy('viewmodel' + this.codeFileExtension, this.dirname + this.filename + this.codeFileExtension);
  },

  addComponentRegistration: function() {
    var startupFile = 'src/app/startup' + this.codeFileExtension;
    readIfFileExists.call(this, startupFile, function(existingContents) {
        var existingRegistrationRegex = new RegExp('\\bko\\.components\\.register\\(\s*[\'"]' + this.filename + '[\'"]');
        if (existingRegistrationRegex.exec(existingContents)) {
            this.log(chalk.white(this.filename) + chalk.cyan(' is already registered in ') + chalk.white(startupFile));
            return;
        }

        var token = '// HEADER COMPONENTS',
            regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
            modulePath = 'components/' + this.filename + '/' + this.filename,
            lineToAdd = 'ko.components.register(\'' + this.filename + '\', { require: \'' + modulePath + '\' });',
            newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
        fs.writeFile(startupFile, newContents);
        this.log(chalk.green('   registered ') + chalk.white(this.filename) + chalk.green(' in ') + chalk.white(startupFile));
    });
  },

  addComponentLessRegistration: function() {
    var startupFile = 'src/main.less';
    readIfFileExists.call(this, startupFile, function(existingContents) {
        var token = '// [don\'t remove or edit this comment]',
            regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
            lineToAdd = '@import \'components/' + this.filename + '/' + this.filename + '.less\';',
            newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
        fs.writeFile(startupFile, newContents);
        this.log(chalk.green('   registered ') + chalk.white(this.filename) + chalk.green(' in ') + chalk.white(startupFile));
    });
  }

});

function readIfFileExists(path, callback) {
    if (fs.existsSync(path)) {
        callback.call(this, this.readFileAsString(path));
    }
}

module.exports = ComponentGenerator;
