/* automatically generated from prototype/prototype.js, do not edit ! */
@"/*  Prototype JavaScript framework, version 1.3.1\n"
@" *  (c) 2005 Sam Stephenson <sam@conio.net>\n"
@" *\n"
@" *  THIS FILE IS AUTOMATICALLY GENERATED. When sending patches, please diff\n"
@" *  against the source tree, available from the Prototype darcs repository. \n"
@" *\n"
@" *  Prototype is freely distributable under the terms of an MIT-style license.\n"
@" *\n"
@" *  For details, see the Prototype web site: http://prototype.conio.net/\n"
@" *\n"
@"/*--------------------------------------------------------------------------*/\n"
@"var Prototype = {\n"
@"  Version: '1.3.1',\n"
@"  emptyFunction: function() {}\n"
@"}\n"
@"var Class = {\n"
@"  create: function() {\n"
@"    return function() { \n"
@"      this.initialize.apply(this, arguments);\n"
@"    }\n"
@"  }\n"
@"}\n"
@"var Abstract = new Object();\n"
@"Object.extend = function(destination, source) {\n"
@"  for (property in source) {\n"
@"    destination[property] = source[property];\n"
@"  }\n"
@"  return destination;\n"
@"}\n"
@"Object.prototype.extend = function(object) {\n"
@"  return Object.extend.apply(this, [this, object]);\n"
@"}\n"
@"Function.prototype.bind = function(object) {\n"
@"  var __method = this;\n"
@"  return function() {\n"
@"    __method.apply(object, arguments);\n"
@"  }\n"
@"}\n"
@"Function.prototype.bindAsEventListener = function(object) {\n"
@"  var __method = this;\n"
@"  return function(event) {\n"
@"    __method.call(object, event || window.event);\n"
@"  }\n"
@"}\n"
@"Number.prototype.toColorPart = function() {\n"
@"  var digits = this.toString(16);\n"
@"  if (this < 16) return '0' + digits;\n"
@"  return digits;\n"
@"}\n"
@"var Try = {\n"
@"  these: function() {\n"
@"    var returnValue;\n"
@"    for (var i = 0; i < arguments.length; i++) {\n"
@"      var lambda = arguments[i];\n"
@"      try {\n"
@"        returnValue = lambda();\n"
@"        break;\n"
@"      } catch (e) {}\n"
@"    }\n"
@"    return returnValue;\n"
@"  }\n"
@"}\n"
@"/*--------------------------------------------------------------------------*/\n"
@"var PeriodicalExecuter = Class.create();\n"
@"PeriodicalExecuter.prototype = {\n"
@"  initialize: function(callback, frequency) {\n"
@"    this.callback = callback;\n"
@"    this.frequency = frequency;\n"
@"    this.currentlyExecuting = false;\n"
@"    this.registerCallback();\n"
@"  },\n"
@"  registerCallback: function() {\n"
@"    setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);\n"
@"  },\n"
@"  onTimerEvent: function() {\n"
@"    if (!this.currentlyExecuting) {\n"
@"      try { \n"
@"        this.currentlyExecuting = true;\n"
@"        this.callback(); \n"
@"      } finally { \n"
@"        this.currentlyExecuting = false;\n"
@"      }\n"
@"    }\n"
@"  }\n"
@"}\n"
@"/*--------------------------------------------------------------------------*/\n"
@"function $() {\n"
@"  var elements = new Array();\n"
@"  for (var i = 0; i < arguments.length; i++) {\n"
@"    var element = arguments[i];\n"
@"    if (typeof element == 'string')\n"
@"      element = document.getElementById(element);\n"
@"    if (arguments.length == 1) \n"
@"      return element;\n"
@"    elements.push(element);\n"
@"  }\n"
@"  return elements;\n"
@"}\n"
@"if (!Array.prototype.push) {\n"
@"  Array.prototype.push = function() {\n"
@"		var startLength = this.length;\n"
@"		for (var i = 0; i < arguments.length; i++)\n"
@"      this[startLength + i] = arguments[i];\n"
@"	  return this.length;\n"
@"  }\n"
@"}\n"
@"if (!Function.prototype.apply) {\n"
@"  // Based on code from http://www.youngpup.net/\n"
@"  Function.prototype.apply = function(object, parameters) {\n"
@"    var parameterStrings = new Array();\n"
@"    if (!object)     object = window;\n"
@"    if (!parameters) parameters = new Array();\n"
@"    \n"
@"    for (var i = 0; i < parameters.length; i++)\n"
@"      parameterStrings[i] = 'parameters[' + i + ']';\n"
@"    \n"
@"    object.__apply__ = this;\n"
@"    var result = eval('object.__apply__(' + \n"
@"      parameterStrings[i].join(', ') + ')');\n"
@"    object.__apply__ = null;\n"
@"    \n"
@"    return result;\n"
@"  }\n"
@"}\n"
@"String.prototype.extend({\n"
@"  stripTags: function() {\n"
@"    return this.replace(/<\\/?[^>]+>/gi, '');\n"
@"  },\n"
@"  escapeHTML: function() {\n"
@"    var div = document.createElement('div');\n"
@"    var text = document.createTextNode(this);\n"
@"    div.appendChild(text);\n"
@"    return div.innerHTML;\n"
@"  },\n"
@"  unescapeHTML: function() {\n"
@"    var div = document.createElement('div');\n"
@"    div.innerHTML = this.stripTags();\n"
@"    return div.childNodes[0].nodeValue;\n"
@"  }\n"
@"});\n"
@"var Ajax = {\n"
@"  getTransport: function() {\n"
@"    return Try.these(\n"
@"      function() {return new ActiveXObject('Msxml2.XMLHTTP')},\n"
@"      function() {return new ActiveXObject('Microsoft.XMLHTTP')},\n"
@"      function() {return new XMLHttpRequest()}\n"
@"    ) || false;\n"
@"  }\n"
@"}\n"
@"Ajax.Base = function() {};\n"
@"Ajax.Base.prototype = {\n"
@"  setOptions: function(options) {\n"
@"    this.options = {\n"
@"      method:       'post',\n"
@"      asynchronous: true,\n"
@"      parameters:   ''\n"
@"    }.extend(options || {});\n"
@"  },\n"
@"  responseIsSuccess: function() {\n"
@"    return this.transport.status == undefined\n"
@"        || this.transport.status == 0 \n"
@"        || (this.transport.status >= 200 && this.transport.status < 300);\n"
@"  },\n"
@"  responseIsFailure: function() {\n"
@"    return !this.responseIsSuccess();\n"
@"  }\n"
@"}\n"
@"Ajax.Request = Class.create();\n"
@"Ajax.Request.Events = \n"
@"  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];\n"
@"Ajax.Request.prototype = (new Ajax.Base()).extend({\n"
@"  initialize: function(url, options) {\n"
@"    this.transport = Ajax.getTransport();\n"
@"    this.setOptions(options);\n"
@"    this.request(url);\n"
@"  },\n"
@"  request: function(url) {\n"
@"    var parameters = this.options.parameters || '';\n"
@"    if (parameters.length > 0) parameters += '&_=';\n"
@"    try {\n"
@"      if (this.options.method == 'get')\n"
@"        url += '?' + parameters;\n"
@"      this.transport.open(this.options.method, url,\n"
@"        this.options.asynchronous);\n"
@"      if (this.options.asynchronous) {\n"
@"        this.transport.onreadystatechange = this.onStateChange.bind(this);\n"
@"        setTimeout((function() {this.respondToReadyState(1)}).bind(this), 10);\n"
@"      }\n"
@"      this.setRequestHeaders();\n"
@"      var body = this.options.postBody ? this.options.postBody : parameters;\n"
@"      this.transport.send(this.options.method == 'post' ? body : null);\n"
@"    } catch (e) {\n"
@"    }\n"
@"  },\n"
@"  setRequestHeaders: function() {\n"
@"    var requestHeaders = \n"
@"      ['X-Requested-With', 'XMLHttpRequest',\n"
@"       'X-Prototype-Version', Prototype.Version];\n"
@"    if (this.options.method == 'post') {\n"
@"      requestHeaders.push('Content-type', \n"
@"        'application/x-www-form-urlencoded');\n"
@"      /* Force \"Connection: close\" for Mozilla browsers to work around\n"
@"       * a bug where XMLHttpReqeuest sends an incorrect Content-length\n"
@"       * header. See Mozilla Bugzilla #246651. \n"
@"       */\n"
@"      if (this.transport.overrideMimeType)\n"
@"        requestHeaders.push('Connection', 'close');\n"
@"    }\n"
@"    if (this.options.requestHeaders)\n"
@"      requestHeaders.push.apply(requestHeaders, this.options.requestHeaders);\n"
@"    for (var i = 0; i < requestHeaders.length; i += 2)\n"
@"      this.transport.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);\n"
@"  },\n"
@"  onStateChange: function() {\n"
@"    var readyState = this.transport.readyState;\n"
@"    if (readyState != 1)\n"
@"      this.respondToReadyState(this.transport.readyState);\n"
@"  },\n"
@"  respondToReadyState: function(readyState) {\n"
@"    var event = Ajax.Request.Events[readyState];\n"
@"    if (event == 'Complete')\n"
@"      (this.options['on' + this.transport.status]\n"
@"       || this.options['on' + this.responseIsSuccess() ? 'Success' : 'Failure']\n"
@"       || Prototype.emptyFunction)(this.transport);\n"
@"    (this.options['on' + event] || Prototype.emptyFunction)(this.transport);\n"
@"    /* Avoid memory leak in MSIE: clean up the oncomplete event handler */\n"
@"    if (event == 'Complete')\n"
@"      this.transport.onreadystatechange = Prototype.emptyFunction;\n"
@"  }\n"
@"});\n"
@"Ajax.Updater = Class.create();\n"
@"Ajax.Updater.ScriptFragment = '(?:<script.*?>)((\\n|.)*?)(?:<\\/script>)';\n"
@"Ajax.Updater.prototype.extend(Ajax.Request.prototype).extend({\n"
@"  initialize: function(container, url, options) {\n"
@"    this.containers = {\n"
@"      success: container.success ? $(container.success) : $(container),\n"
@"      failure: container.failure ? $(container.failure) :\n"
@"        (container.success ? null : $(container))\n"
@"    }\n"
@"    this.transport = Ajax.getTransport();\n"
@"    this.setOptions(options);\n"
@"    var onComplete = this.options.onComplete || Prototype.emptyFunction;\n"
@"    this.options.onComplete = (function() {\n"
@"      this.updateContent();\n"
@"      onComplete(this.transport);\n"
@"    }).bind(this);\n"
@"    this.request(url);\n"
@"  },\n"
@"  updateContent: function() {\n"
@"    var receiver = this.responseIsSuccess() ?\n"
@"      this.containers.success : this.containers.failure;\n"
@"    var match    = new RegExp(Ajax.Updater.ScriptFragment, 'img');\n"
@"    var response = this.transport.responseText.replace(match, '');\n"
@"    var scripts  = this.transport.responseText.match(match);\n"
@"    if (receiver) {\n"
@"      if (this.options.insertion) {\n"
@"        new this.options.insertion(receiver, response);\n"
@"      } else {\n"
@"        receiver.innerHTML = response;\n"
@"      }\n"
@"    }\n"
@"    if (this.responseIsSuccess()) {\n"
@"      if (this.onComplete)\n"
@"        setTimeout((function() {this.onComplete(\n"
@"          this.transport)}).bind(this), 10);\n"
@"    }\n"
@"    if (this.options.evalScripts && scripts) {\n"
@"      match = new RegExp(Ajax.Updater.ScriptFragment, 'im');\n"
@"      setTimeout((function() {\n"
@"        for (var i = 0; i < scripts.length; i++)\n"
@"          eval(scripts[i].match(match)[1]);\n"
@"      }).bind(this), 10);\n"
@"    }\n"
@"  }\n"
@"});\n"
@"Ajax.PeriodicalUpdater = Class.create();\n"
@"Ajax.PeriodicalUpdater.prototype = (new Ajax.Base()).extend({\n"
@"  initialize: function(container, url, options) {\n"
@"    this.setOptions(options);\n"
@"    this.onComplete = this.options.onComplete;\n"
@"    this.frequency = (this.options.frequency || 2);\n"
@"    this.decay = 1;\n"
@"    this.updater = {};\n"
@"    this.container = container;\n"
@"    this.url = url;\n"
@"    this.start();\n"
@"  },\n"
@"  start: function() {\n"
@"    this.options.onComplete = this.updateComplete.bind(this);\n"
@"    this.onTimerEvent();\n"
@"  },\n"
@"  stop: function() {\n"
@"    this.updater.onComplete = undefined;\n"
@"    clearTimeout(this.timer);\n"
@"    (this.onComplete || Ajax.emptyFunction).apply(this, arguments);\n"
@"  },\n"
@"  updateComplete: function(request) {\n"
@"    if (this.options.decay) {\n"
@"      this.decay = (request.responseText == this.lastText ? \n"
@"        this.decay * this.options.decay : 1);\n"
@"      this.lastText = request.responseText;\n"
@"    }\n"
@"    this.timer = setTimeout(this.onTimerEvent.bind(this), \n"
@"      this.decay * this.frequency * 1000);\n"
@"  },\n"
@"  onTimerEvent: function() {\n"
@"    this.updater = new Ajax.Updater(this.container, this.url, this.options);\n"
@"  }\n"
@"});\n"
@"document.getElementsByClassName = function(className) {\n"
@"  var children = document.getElementsByTagName('*') || document.all;\n"
@"  var elements = new Array();\n"
@"  \n"
@"  for (var i = 0; i < children.length; i++) {\n"
@"    var child = children[i];\n"
@"    var classNames = child.className.split(' ');\n"
@"    for (var j = 0; j < classNames.length; j++) {\n"
@"      if (classNames[j] == className) {\n"
@"        elements.push(child);\n"
@"        break;\n"
@"      }\n"
@"    }\n"
@"  }\n"
@"  \n"
@"  return elements;\n"
@"}\n"
@"/*--------------------------------------------------------------------------*/\n"
@"if (!window.Element) {\n"
@"  var Element = new Object();\n"
@"}\n"
@"Object.extend(Element, {\n"
@"  toggle: function() {\n"
@"    for (var i = 0; i < arguments.length; i++) {\n"
@"      var element = $(arguments[i]);\n"
@"      element.style.display = \n"
@"        (element.style.display == 'none' ? '' : 'none');\n"
@"    }\n"
@"  },\n"
@"  hide: function() {\n"
@"    for (var i = 0; i < arguments.length; i++) {\n"
@"      var element = $(arguments[i]);\n"
@"      element.style.display = 'none';\n"
@"    }\n"
@"  },\n"
@"  show: function() {\n"
@"    for (var i = 0; i < arguments.length; i++) {\n"
@"      var element = $(arguments[i]);\n"
@"      element.style.display = '';\n"
@"    }\n"
@"  },\n"
@"  remove: function(element) {\n"
@"    element = $(element);\n"
@"    element.parentNode.removeChild(element);\n"
@"  },\n"
@"   \n"
@"  getHeight: function(element) {\n"
@"    element = $(element);\n"
@"    return element.offsetHeight; \n"
@"  },\n"
@"  hasClassName: function(element, className) {\n"
@"    element = $(element);\n"
@"    if (!element)\n"
@"      return;\n"
@"    var a = element.className.split(' ');\n"
@"    for (var i = 0; i < a.length; i++) {\n"
@"      if (a[i] == className)\n"
@"        return true;\n"
@"    }\n"
@"    return false;\n"
@"  },\n"
@"  addClassName: function(element, className) {\n"
@"    element = $(element);\n"
@"    Element.removeClassName(element, className);\n"
@"    element.className += ' ' + className;\n"
@"  },\n"
@"  removeClassName: function(element, className) {\n"
@"    element = $(element);\n"
@"    if (!element)\n"
@"      return;\n"
@"    var newClassName = '';\n"
@"    var a = element.className.split(' ');\n"
@"    for (var i = 0; i < a.length; i++) {\n"
@"      if (a[i] != className) {\n"
@"        if (i > 0)\n"
@"          newClassName += ' ';\n"
@"        newClassName += a[i];\n"
@"      }\n"
@"    }\n"
@"    element.className = newClassName;\n"
@"  },\n"
@"  \n"
@"  // removes whitespace-only text node children\n"
@"  cleanWhitespace: function(element) {\n"
@"    var element = $(element);\n"
@"    for (var i = 0; i < element.childNodes.length; i++) {\n"
@"      var node = element.childNodes[i];\n"
@"      if (node.nodeType == 3 && !/\\S/.test(node.nodeValue)) \n"
@"        Element.remove(node);\n"
@"    }\n"
@"  }\n"
@"});\n"
@"var Toggle = new Object();\n"
@"Toggle.display = Element.toggle;\n"
@"/*--------------------------------------------------------------------------*/\n"
@"Abstract.Insertion = function(adjacency) {\n"
@"  this.adjacency = adjacency;\n"
@"}\n"
@"Abstract.Insertion.prototype = {\n"
@"  initialize: function(element, content) {\n"
@"    this.element = $(element);\n"
@"    this.content = content;\n"
@"    \n"
@"    if (this.adjacency && this.element.insertAdjacentHTML) {\n"
@"      this.element.insertAdjacentHTML(this.adjacency, this.content);\n"
@"    } else {\n"
@"      this.range = this.element.ownerDocument.createRange();\n"
@"      if (this.initializeRange) this.initializeRange();\n"
@"      this.fragment = this.range.createContextualFragment(this.content);\n"
@"      this.insertContent();\n"
@"    }\n"
@"  }\n"
@"}\n"
@"var Insertion = new Object();\n"
@"Insertion.Before = Class.create();\n"
@"Insertion.Before.prototype = (new Abstract.Insertion('beforeBegin')).extend({\n"
@"  initializeRange: function() {\n"
@"    this.range.setStartBefore(this.element);\n"
@"  },\n"
@"  \n"
@"  insertContent: function() {\n"
@"    this.element.parentNode.insertBefore(this.fragment, this.element);\n"
@"  }\n"
@"});\n"
@"Insertion.Top = Class.create();\n"
@"Insertion.Top.prototype = (new Abstract.Insertion('afterBegin')).extend({\n"
@"  initializeRange: function() {\n"
@"    this.range.selectNodeContents(this.element);\n"
@"    this.range.collapse(true);\n"
@"  },\n"
@"  \n"
@"  insertContent: function() {  \n"
@"    this.element.insertBefore(this.fragment, this.element.firstChild);\n"
@"  }\n"
@"});\n"
@"Insertion.Bottom = Class.create();\n"
@"Insertion.Bottom.prototype = (new Abstract.Insertion('beforeEnd')).extend({\n"
@"  initializeRange: function() {\n"
@"    this.range.selectNodeContents(this.element);\n"
@"    this.range.collapse(this.element);\n"
@"  },\n"
@"  \n"
@"  insertContent: function() {\n"
@"    this.element.appendChild(this.fragment);\n"
@"  }\n"
@"});\n"
@"Insertion.After = Class.create();\n"
@"Insertion.After.prototype = (new Abstract.Insertion('afterEnd')).extend({\n"
@"  initializeRange: function() {\n"
@"    this.range.setStartAfter(this.element);\n"
@"  },\n"
@"  \n"
@"  insertContent: function() {\n"
@"    this.element.parentNode.insertBefore(this.fragment, \n"
@"      this.element.nextSibling);\n"
@"  }\n"
@"});\n"
@"var Field = {\n"
@"  clear: function() {\n"
@"    for (var i = 0; i < arguments.length; i++)\n"
@"      $(arguments[i]).value = '';\n"
@"  },\n"
@"  focus: function(element) {\n"
@"    $(element).focus();\n"
@"  },\n"
@"  \n"
@"  present: function() {\n"
@"    for (var i = 0; i < arguments.length; i++)\n"
@"      if ($(arguments[i]).value == '') return false;\n"
@"    return true;\n"
@"  },\n"
@"  \n"
@"  select: function(element) {\n"
@"    $(element).select();\n"
@"  },\n"
@"   \n"
@"  activate: function(element) {\n"
@"    $(element).focus();\n"
@"    $(element).select();\n"
@"  }\n"
@"}\n"
@"/*--------------------------------------------------------------------------*/\n"
@"var Form = {\n"
@"  serialize: function(form) {\n"
@"    var elements = Form.getElements($(form));\n"
@"    var queryComponents = new Array();\n"
@"    \n"
@"    for (var i = 0; i < elements.length; i++) {\n"
@"      var queryComponent = Form.Element.serialize(elements[i]);\n"
@"      if (queryComponent)\n"
@"        queryComponents.push(queryComponent);\n"
@"    }\n"
@"    \n"
@"    return queryComponents.join('&');\n"
@"  },\n"
@"  \n"
@"  getElements: function(form) {\n"
@"    var form = $(form);\n"
@"    var elements = new Array();\n"
@"    for (tagName in Form.Element.Serializers) {\n"
@"      var tagElements = form.getElementsByTagName(tagName);\n"
@"      for (var j = 0; j < tagElements.length; j++)\n"
@"        elements.push(tagElements[j]);\n"
@"    }\n"
@"    return elements;\n"
@"  },\n"
@"  \n"
@"  getInputs: function(form, typeName, name) {\n"
@"    var form = $(form);\n"
@"    var inputs = form.getElementsByTagName('input');\n"
@"    \n"
@"    if (!typeName && !name)\n"
@"      return inputs;\n"
@"      \n"
@"    var matchingInputs = new Array();\n"
@"    for (var i = 0; i < inputs.length; i++) {\n"
@"      var input = inputs[i];\n"
@"      if ((typeName && input.type != typeName) ||\n"
@"          (name && input.name != name)) \n"
@"        continue;\n"
@"      matchingInputs.push(input);\n"
@"    }\n"
@"    return matchingInputs;\n"
@"  },\n"
@"  disable: function(form) {\n"
@"    var elements = Form.getElements(form);\n"
@"    for (var i = 0; i < elements.length; i++) {\n"
@"      var element = elements[i];\n"
@"      element.blur();\n"
@"      element.disabled = 'true';\n"
@"    }\n"
@"  },\n"
@"  enable: function(form) {\n"
@"    var elements = Form.getElements(form);\n"
@"    for (var i = 0; i < elements.length; i++) {\n"
@"      var element = elements[i];\n"
@"      element.disabled = '';\n"
@"    }\n"
@"  },\n"
@"  focusFirstElement: function(form) {\n"
@"    var form = $(form);\n"
@"    var elements = Form.getElements(form);\n"
@"    for (var i = 0; i < elements.length; i++) {\n"
@"      var element = elements[i];\n"
@"      if (element.type != 'hidden' && !element.disabled) {\n"
@"        Field.activate(element);\n"
@"        break;\n"
@"      }\n"
@"    }\n"
@"  },\n"
@"  reset: function(form) {\n"
@"    $(form).reset();\n"
@"  }\n"
@"}\n"
@"Form.Element = {\n"
@"  serialize: function(element) {\n"
@"    var element = $(element);\n"
@"    var method = element.tagName.toLowerCase();\n"
@"    var parameter = Form.Element.Serializers[method](element);\n"
@"    \n"
@"    if (parameter)\n"
@"      return encodeURIComponent(parameter[0]) + '=' + \n"
@"        encodeURIComponent(parameter[1]);                   \n"
@"  },\n"
@"  \n"
@"  getValue: function(element) {\n"
@"    var element = $(element);\n"
@"    var method = element.tagName.toLowerCase();\n"
@"    var parameter = Form.Element.Serializers[method](element);\n"
@"    \n"
@"    if (parameter) \n"
@"      return parameter[1];\n"
@"  }\n"
@"}\n"
@"Form.Element.Serializers = {\n"
@"  input: function(element) {\n"
@"    switch (element.type.toLowerCase()) {\n"
@"      case 'submit':\n"
@"      case 'hidden':\n"
@"      case 'password':\n"
@"      case 'text':\n"
@"        return Form.Element.Serializers.textarea(element);\n"
@"      case 'checkbox':  \n"
@"      case 'radio':\n"
@"        return Form.Element.Serializers.inputSelector(element);\n"
@"    }\n"
@"    return false;\n"
@"  },\n"
@"  inputSelector: function(element) {\n"
@"    if (element.checked)\n"
@"      return [element.name, element.value];\n"
@"  },\n"
@"  textarea: function(element) {\n"
@"    return [element.name, element.value];\n"
@"  },\n"
@"  select: function(element) {\n"
@"    var value = '';\n"
@"    if (element.type == 'select-one') {\n"
@"      var index = element.selectedIndex;\n"
@"      if (index >= 0)\n"
@"        value = element.options[index].value || element.options[index].text;\n"
@"    } else {\n"
@"      value = new Array();\n"
@"      for (var i = 0; i < element.length; i++) {\n"
@"        var opt = element.options[i];\n"
@"        if (opt.selected)\n"
@"          value.push(opt.value || opt.text);\n"
@"      }\n"
@"    }\n"
@"    return [element.name, value];\n"
@"  }\n"
@"}\n"
@"/*--------------------------------------------------------------------------*/\n"
@"var $F = Form.Element.getValue;\n"
@"/*--------------------------------------------------------------------------*/\n"
@"Abstract.TimedObserver = function() {}\n"
@"Abstract.TimedObserver.prototype = {\n"
@"  initialize: function(element, frequency, callback) {\n"
@"    this.frequency = frequency;\n"
@"    this.element   = $(element);\n"
@"    this.callback  = callback;\n"
@"    \n"
@"    this.lastValue = this.getValue();\n"
@"    this.registerCallback();\n"
@"  },\n"
@"  \n"
@"  registerCallback: function() {\n"
@"    setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);\n"
@"  },\n"
@"  \n"
@"  onTimerEvent: function() {\n"
@"    var value = this.getValue();\n"
@"    if (this.lastValue != value) {\n"
@"      this.callback(this.element, value);\n"
@"      this.lastValue = value;\n"
@"    }\n"
@"  }\n"
@"}\n"
@"Form.Element.Observer = Class.create();\n"
@"Form.Element.Observer.prototype = (new Abstract.TimedObserver()).extend({\n"
@"  getValue: function() {\n"
@"    return Form.Element.getValue(this.element);\n"
@"  }\n"
@"});\n"
@"Form.Observer = Class.create();\n"
@"Form.Observer.prototype = (new Abstract.TimedObserver()).extend({\n"
@"  getValue: function() {\n"
@"    return Form.serialize(this.element);\n"
@"  }\n"
@"});\n"
@"/*--------------------------------------------------------------------------*/\n"
@"Abstract.EventObserver = function() {}\n"
@"Abstract.EventObserver.prototype = {\n"
@"  initialize: function(element, callback) {\n"
@"    this.element  = $(element);\n"
@"    this.callback = callback;\n"
@"    \n"
@"    this.lastValue = this.getValue();\n"
@"    if (this.element.tagName.toLowerCase() == 'form')\n"
@"      this.registerFormCallbacks();\n"
@"    else\n"
@"      this.registerCallback(this.element);\n"
@"  },\n"
@"  \n"
@"  onElementEvent: function() {\n"
@"    var value = this.getValue();\n"
@"    if (this.lastValue != value) {\n"
@"      this.callback(this.element, value);\n"
@"      this.lastValue = value;\n"
@"    }\n"
@"  },\n"
@"  \n"
@"  registerFormCallbacks: function() {\n"
@"    var elements = Form.getElements(this.element);\n"
@"    for (var i = 0; i < elements.length; i++)\n"
@"      this.registerCallback(elements[i]);\n"
@"  },\n"
@"  \n"
@"  registerCallback: function(element) {\n"
@"    if (element.type) {\n"
@"      switch (element.type.toLowerCase()) {\n"
@"        case 'checkbox':  \n"
@"        case 'radio':\n"
@"          element.target = this;\n"
@"          element.prev_onclick = element.onclick || Prototype.emptyFunction;\n"
@"          element.onclick = function() {\n"
@"            this.prev_onclick(); \n"
@"            this.target.onElementEvent();\n"
@"          }\n"
@"          break;\n"
@"        case 'password':\n"
@"        case 'text':\n"
@"        case 'textarea':\n"
@"        case 'select-one':\n"
@"        case 'select-multiple':\n"
@"          element.target = this;\n"
@"          element.prev_onchange = element.onchange || Prototype.emptyFunction;\n"
@"          element.onchange = function() {\n"
@"            this.prev_onchange(); \n"
@"            this.target.onElementEvent();\n"
@"          }\n"
@"          break;\n"
@"      }\n"
@"    }    \n"
@"  }\n"
@"}\n"
@"Form.Element.EventObserver = Class.create();\n"
@"Form.Element.EventObserver.prototype = (new Abstract.EventObserver()).extend({\n"
@"  getValue: function() {\n"
@"    return Form.Element.getValue(this.element);\n"
@"  }\n"
@"});\n"
@"Form.EventObserver = Class.create();\n"
@"Form.EventObserver.prototype = (new Abstract.EventObserver()).extend({\n"
@"  getValue: function() {\n"
@"    return Form.serialize(this.element);\n"
@"  }\n"
@"});\n"
@"if (!window.Event) {\n"
@"  var Event = new Object();\n"
@"}\n"
@"Object.extend(Event, {\n"
@"  KEY_BACKSPACE: 8,\n"
@"  KEY_TAB:       9,\n"
@"  KEY_RETURN:   13,\n"
@"  KEY_ESC:      27,\n"
@"  KEY_LEFT:     37,\n"
@"  KEY_UP:       38,\n"
@"  KEY_RIGHT:    39,\n"
@"  KEY_DOWN:     40,\n"
@"  KEY_DELETE:   46,\n"
@"  element: function(event) {\n"
@"    return event.target || event.srcElement;\n"
@"  },\n"
@"  isLeftClick: function(event) {\n"
@"    return (((event.which) && (event.which == 1)) ||\n"
@"            ((event.button) && (event.button == 1)));\n"
@"  },\n"
@"  pointerX: function(event) {\n"
@"    return event.pageX || (event.clientX + \n"
@"      (document.documentElement.scrollLeft || document.body.scrollLeft));\n"
@"  },\n"
@"  pointerY: function(event) {\n"
@"    return event.pageY || (event.clientY + \n"
@"      (document.documentElement.scrollTop || document.body.scrollTop));\n"
@"  },\n"
@"  stop: function(event) {\n"
@"    if (event.preventDefault) { \n"
@"      event.preventDefault(); \n"
@"      event.stopPropagation(); \n"
@"    } else {\n"
@"      event.returnValue = false;\n"
@"    }\n"
@"  },\n"
@"  // find the first node with the given tagName, starting from the\n"
@"  // node the event was triggered on; traverses the DOM upwards\n"
@"  findElement: function(event, tagName) {\n"
@"    var element = Event.element(event);\n"
@"    while (element.parentNode && (!element.tagName ||\n"
@"        (element.tagName.toUpperCase() != tagName.toUpperCase())))\n"
@"      element = element.parentNode;\n"
@"    return element;\n"
@"  },\n"
@"  observers: false,\n"
@"  \n"
@"  _observeAndCache: function(element, name, observer, useCapture) {\n"
@"    if (!this.observers) this.observers = [];\n"
@"    if (element.addEventListener) {\n"
@"      this.observers.push([element, name, observer, useCapture]);\n"
@"      element.addEventListener(name, observer, useCapture);\n"
@"    } else if (element.attachEvent) {\n"
@"      this.observers.push([element, name, observer, useCapture]);\n"
@"      element.attachEvent('on' + name, observer);\n"
@"    }\n"
@"  },\n"
@"  \n"
@"  unloadCache: function() {\n"
@"    if (!Event.observers) return;\n"
@"    for (var i = 0; i < Event.observers.length; i++) {\n"
@"      Event.stopObserving.apply(this, Event.observers[i]);\n"
@"      Event.observers[i][0] = null;\n"
@"    }\n"
@"    Event.observers = false;\n"
@"  },\n"
@"  observe: function(element, name, observer, useCapture) {\n"
@"    var element = $(element);\n"
@"    useCapture = useCapture || false;\n"
@"    \n"
@"    if (name == 'keypress' &&\n"
@"        ((navigator.appVersion.indexOf('AppleWebKit') > 0) \n"
@"        || element.attachEvent))\n"
@"      name = 'keydown';\n"
@"    \n"
@"    this._observeAndCache(element, name, observer, useCapture);\n"
@"  },\n"
@"  stopObserving: function(element, name, observer, useCapture) {\n"
@"    var element = $(element);\n"
@"    useCapture = useCapture || false;\n"
@"    \n"
@"    if (name == 'keypress' &&\n"
@"        ((navigator.appVersion.indexOf('AppleWebKit') > 0) \n"
@"        || element.detachEvent))\n"
@"      name = 'keydown';\n"
@"    \n"
@"    if (element.removeEventListener) {\n"
@"      element.removeEventListener(name, observer, useCapture);\n"
@"    } else if (element.detachEvent) {\n"
@"      element.detachEvent('on' + name, observer);\n"
@"    }\n"
@"  }\n"
@"});\n"
@"/* prevent memory leaks in IE */\n"
@"Event.observe(window, 'unload', Event.unloadCache, false);\n"
@"var Position = {\n"
@"  // set to true if needed, warning: firefox performance problems\n"
@"  // NOT neeeded for page scrolling, only if draggable contained in\n"
@"  // scrollable elements\n"
@"  includeScrollOffsets: false, \n"
@"  // must be called before calling withinIncludingScrolloffset, every time the\n"
@"  // page is scrolled\n"
@"  prepare: function() {\n"
@"    this.deltaX =  window.pageXOffset \n"
@"                || document.documentElement.scrollLeft \n"
@"                || document.body.scrollLeft \n"
@"                || 0;\n"
@"    this.deltaY =  window.pageYOffset \n"
@"                || document.documentElement.scrollTop \n"
@"                || document.body.scrollTop \n"
@"                || 0;\n"
@"  },\n"
@"  realOffset: function(element) {\n"
@"    var valueT = 0, valueL = 0;\n"
@"    do {\n"
@"      valueT += element.scrollTop  || 0;\n"
@"      valueL += element.scrollLeft || 0; \n"
@"      element = element.parentNode;\n"
@"    } while (element);\n"
@"    return [valueL, valueT];\n"
@"  },\n"
@"  cumulativeOffset: function(element) {\n"
@"    var valueT = 0, valueL = 0;\n"
@"    do {\n"
@"      valueT += element.offsetTop  || 0;\n"
@"      valueL += element.offsetLeft || 0;\n"
@"      element = element.offsetParent;\n"
@"    } while (element);\n"
@"    return [valueL, valueT];\n"
@"  },\n"
@"  // caches x/y coordinate pair to use with overlap\n"
@"  within: function(element, x, y) {\n"
@"    if (this.includeScrollOffsets)\n"
@"      return this.withinIncludingScrolloffsets(element, x, y);\n"
@"    this.xcomp = x;\n"
@"    this.ycomp = y;\n"
@"    this.offset = this.cumulativeOffset(element);\n"
@"    return (y >= this.offset[1] &&\n"
@"            y <  this.offset[1] + element.offsetHeight &&\n"
@"            x >= this.offset[0] && \n"
@"            x <  this.offset[0] + element.offsetWidth);\n"
@"  },\n"
@"  withinIncludingScrolloffsets: function(element, x, y) {\n"
@"    var offsetcache = this.realOffset(element);\n"
@"    this.xcomp = x + offsetcache[0] - this.deltaX;\n"
@"    this.ycomp = y + offsetcache[1] - this.deltaY;\n"
@"    this.offset = this.cumulativeOffset(element);\n"
@"    return (this.ycomp >= this.offset[1] &&\n"
@"            this.ycomp <  this.offset[1] + element.offsetHeight &&\n"
@"            this.xcomp >= this.offset[0] && \n"
@"            this.xcomp <  this.offset[0] + element.offsetWidth);\n"
@"  },\n"
@"  // within must be called directly before\n"
@"  overlap: function(mode, element) {  \n"
@"    if (!mode) return 0;  \n"
@"    if (mode == 'vertical') \n"
@"      return ((this.offset[1] + element.offsetHeight) - this.ycomp) / \n"
@"        element.offsetHeight;\n"
@"    if (mode == 'horizontal')\n"
@"      return ((this.offset[0] + element.offsetWidth) - this.xcomp) / \n"
@"        element.offsetWidth;\n"
@"  },\n"
@"  clone: function(source, target) {\n"
@"    source = $(source);\n"
@"    target = $(target);\n"
@"    target.style.position = 'absolute';\n"
@"    var offsets = this.cumulativeOffset(source);\n"
@"    target.style.top    = offsets[1] + 'px';\n"
@"    target.style.left   = offsets[0] + 'px';\n"
@"    target.style.width  = source.offsetWidth + 'px';\n"
@"    target.style.height = source.offsetHeight + 'px';\n"
@"  }\n"
@"}\n"