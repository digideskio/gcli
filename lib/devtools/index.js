/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {


var l10n = require('gcli/l10n');
var gcli = require('gcli/index');
var types = require('gcli/types');
var Argument = require('gcli/argument').Argument;
var strings = require('i18n!devtools/nls/strings');

var Conversion = types.Conversion;
var Type = types.Type;
var SelectionType = types.SelectionType;
var Status = types.Status;

/**
 * Utility to create a link to a bug number
 */
function getBugLink(bugid) {
  return '<br/>To comment on this command, use <a target="_blank" ' +
      'href="https://bugzilla.mozilla.org/show_bug.cgi?id=' + bugid + '">' +
      'bug ' + bugid + '</a>.';
}

/**
 * A type for the resources in the current page
 */
function ResourceType(typeSpec) {
  if (typeSpec != null) {
    throw new Error('ResourceType can not be customized');
  }
}

ResourceType.prototype = Object.create(types.SelectionType.prototype);

ResourceType.prototype.lookup = function() {
  var reply = [];
  for (var i = 0; i < document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    reply.push({
      name: sheet.href || 'style#' + i,
      value: sheet
    });
  }
  reply.push({
    name: 'page',
    value: window.document
  });
  return reply;
};

ResourceType.prototype.name = 'resource';


/**
 * A CSS expression that refers to a single node
 */
function NodeType(typeSpec) {
  if (typeSpec != null) {
    throw new Error('NodeType can not be customized');
  }
}

NodeType.prototype = Object.create(Type.prototype);

NodeType.prototype.stringify = function(value) {
  return value.__gcliQuery || 'Error';
};

NodeType.prototype.parse = function(arg) {
  if (arg.text === '') {
    return new Conversion(null, arg, Status.INCOMPLETE, 'No matches');
  }

  var nodes;
  try {
    nodes = document.querySelectorAll(arg.text);
  }
  catch (ex) {
    return new Conversion(null, arg, Status.ERROR,
        l10n.lookup('node_parse_syntax', {}, strings));
  }

  if (nodes.length === 0) {
    return new Conversion(null, arg, Status.INCOMPLETE, 'No matches');
  }

  if (nodes.length === 1) {
    var node = nodes.item(0);
    node.__gcliQuery = arg.text;
    return new Conversion(node, arg, Status.VALID, '');
  }

  return new Conversion(null, arg, Status.ERROR, 'Multiple matches');
};

NodeType.prototype.name = 'node';

types.NodeType = NodeType;


/**
 * 'edit' command
 */
var editCommandSpec = {
  name: 'edit',
  description: { key: 'edit_desc', strings: strings },
  manual: { key: 'edit_manual', strings: strings },
  params: [
     {
       name: 'resource',
       type: 'resource',
       description: { key: 'edit_resource_desc', strings: strings }
     }
   ],
   returnType: 'html',
   exec: function(args, context) {
     var element = args.resource.documentElement || args.resource.ownerNode;
     return '<textarea rows=5 cols=80 style="font-family:monospace">' +
         l10n.lookup('edit_pretend', {}, strings) + ':\n' +
         element.innerHTML.substring(0, 500) + '...</textarea>' +
         getBugLink(683499);
   }
};


/**
 * 'stylizer' command
 */
var stylizerCommandSpec = {
  name: 'stylizer',
  description: { key: 'stylizer_desc', strings: strings },
  manual: { key: 'stylizer_manual', strings: strings },
  params: [
     {
       name: 'node',
       type: 'node',
       description: { key: 'stylizer_node_desc', strings: strings },
     }
   ],
   returnType: 'html',
   exec: function(args, context) {
     return l10n.lookup('stylizer_reply', { node: '' + args.node }, strings) +
         getBugLink(683502);
   }
};


var breakpoints = [];

/**
 * 'break' command
 */
var breakCommandSpec = {
  name: 'break',
  description: { key: 'break_desc', strings: strings },
  manual: { key: 'break_manual', strings: strings }
};

/**
 * 'break list' command
 */
var breakListCommandSpec = {
  name: 'break list',
  description: { key: 'breaklist_desc', strings: strings },
  returnType: 'html',
  exec: function(args, context) {
    if (breakpoints.length === 0) {
      return l10n.lookup('breaklist_none', {}, strings) + getBugLink(683503);
    }

    var reply = l10n.lookup('breaklist_intro', {}, strings);
    reply += '<ul>';
    breakpoints.forEach(function(breakpoint) {
      reply += '<li>' + JSON.stringify(breakpoint) + '</li>';
    });
    reply += '</ul>';
    return reply + getBugLink(683503);
  }
};

/**
 * 'break add' command
 */
var breakAddCommandSpec = {
  name: 'break add',
  description: { key: 'breakadd_desc', strings: strings },
  params: [
    {
      name: 'type',
      type: {
        name: 'selection',
        data: [ 'line', 'function', 'next', 'xhr', 'event', 'dom' ]
      },
      description: { key: 'breakadd_type_desc', strings: strings }
    },
    {
      group: 'Options',
      params: [
        {
         name: 'if',
         type: 'string',
         description: { key: 'breakadd_if_desc', strings: strings },
         defaultValue: null
        },
      ]
    }
  ],
  returnType: 'html',
  exec: function(args, context) {
    breakpoints.push(args);
    return l10n.lookup('breakadd_added', {}, strings) + getBugLink(683503);
  }
};

/**
 * 'break del' command
 */
var breakDelCommandSpec = {
  name: 'break del',
  description: { key: 'breakdell_desc', strings: strings },
  params: [
    {
      name: 'breakid',
      type: {
        name: 'number',
        min: 0,
        max: function() { return breakpoints.length - 1; }
      },
      description: { key: 'breakdel_breakid_desc', strings: strings }
    }
  ],
  returnType: 'html',
  exec: function(args, context) {
    breakpoints.splice(args.breakid, 1);
    return l10n.lookup('breakdel_removed', {}, strings) + getBugLink(683503);
  }
};

/**
 * 'step' command
 */
var stepCommandSpec = {
  name: 'step',
  description: { key: 'step_desc', strings: strings },
  manual: { key: 'step_manual', strings: strings }
};

/**
 * 'step up' command
 */
var stepUpCommandSpec = {
  name: 'step up',
  description: { key: 'stepup_desc', strings: strings },
  manual: { key: 'stepup_manual', strings: strings },
  returnType: 'html',
  exec: function(args, context) {
    return l10n.lookup('step_insult', {}, strings) + getBugLink(683505);
  }
};

/**
 * 'step in' command
 */
var stepInCommandSpec = {
  name: 'step in',
  description: { key: 'stepin_desc', strings: strings },
  manual: { key: 'stepin_manual', strings: strings },
  returnType: 'html',
  exec: function(args, context) {
    return l10n.lookup('step_insult', {}, strings) + getBugLink(683505);
  }
};

/**
 * 'step next' command
 */
var stepNextCommandSpec = {
  name: 'step next',
  description: { key: 'stepnext_desc', strings: strings },
  manual: { key: 'stepnext_manual', strings: strings },
  returnType: 'html',
  exec: function(args, context) {
    return l10n.lookup('step_insult', {}, strings) + getBugLink(683505);
  }
};

/**
 * 'step on' command
 */
var stepNextCommandSpec = {
  name: 'step on',
  description: { key: 'stepon_desc', strings: strings },
  manual: { key: 'stepon_manual', strings: strings },
  returnType: 'html',
  exec: function(args, context) {
    return l10n.lookup('step_insult', {}, strings) + getBugLink(683505);
  }
};

/**
 * 'step to' command
 */
var stepToCommandSpec = {
  name: 'step to',
  description: { key: 'stepto_desc', strings: strings },
  manual: { key: 'stepto_manual', strings: strings },
  params: [
    {
      name: 'line',
      type: { name: 'number', min: 0, step: 10 },
      description: { key: 'stepto_line_desc', strings: strings }
    }
  ],
  returnType: 'html',
  exec: function(args, context) {
    return l10n.lookup('step_insult', {}, strings) + getBugLink(683505);
  }
};

exports.startup = function() {
  types.registerType(ResourceType);
  types.registerType(NodeType);

  gcli.addCommand(editCommandSpec);
  gcli.addCommand(stylizerCommandSpec);
  gcli.addCommand(breakCommandSpec);
  gcli.addCommand(breakListCommandSpec);
  gcli.addCommand(breakAddCommandSpec);
  gcli.addCommand(breakDelCommandSpec);
  gcli.addCommand(stepCommandSpec);
  gcli.addCommand(stepUpCommandSpec);
  gcli.addCommand(stepInCommandSpec);
  gcli.addCommand(stepNextCommandSpec);
  gcli.addCommand(stepToCommandSpec);
};

exports.startup();

exports.shutdown = function() {
  gcli.removeCommand(stepToCommandSpec);
  gcli.removeCommand(stepNextCommandSpec);
  gcli.removeCommand(stepInCommandSpec);
  gcli.removeCommand(stepUpCommandSpec);
  gcli.removeCommand(stepCommandSpec);
  gcli.removeCommand(breakDelCommandSpec);
  gcli.removeCommand(breakAddCommandSpec);
  gcli.removeCommand(breakListCommandSpec);
  gcli.removeCommand(breakCommandSpec);
  gcli.removeCommand(stylizerCommandSpec);
  gcli.removeCommand(editCommandSpec);

  types.unregisterType(NodeType);
  types.unregisterType(ResourceType);
};


});