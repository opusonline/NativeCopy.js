/*!
 * NativeCopy
 * native copy to clipboard
 *
 * author: Stefan Benicke <stefan.benicke@gmail.com>
 * version: 2.1.0
 */
(function (global, window, document, undefined) {
    // http://updates.html5rocks.com/2015/04/cut-and-copy-commands

    var _copyTextField;

    var _defaults = {
        'text': '',
        'beforeCopy': noop,
        'onSuccess': noop,
        'onError': noop
    };

    var _isIE = ('clipboardData' in window && objectIs(window.clipboardData, 'DataTransfer'));
    var _asyncClipboard = ('clipboard' in navigator && objectIs(navigator.clipboard, 'Clipboard') && typeof navigator.clipboard.writeText === 'function');

    function NativeCopy(selector, options) {
        var clickHandler;
        var self = this;
        var button = document.querySelector(selector);
        if (button === null) {
            throw new TypeError('Invalid trigger element: ' + selector);
        }
        clickHandler = getHandler(self);
        button.addEventListener('click', clickHandler, false);
        self.options = extend({}, _defaults, options);
        self.button = button;
        self.clickHandler = clickHandler;
    }

    NativeCopy.prototype.clearSelection = function () {
        removeCopyTextField();
        return this;
    };

    NativeCopy.prototype.destroy = function () {
        var self = this;
        removeCopyTextField();
        if (self.button && self.clickHandler) {
            self.button.removeEventListener('click', self.clickHandler, false);
            self.button = undefined;
            self.clickHandler = undefined;
        }
        return self;
    };

    global['NativeCopy'] = NativeCopy;

    function getHandler(instance) {
        return function () {
            (_isIE ? onClickCopyIE : onClickCopy).call(instance);   
        }
    }

    function initCopyField() {
        var isRTL, style;
        if (_copyTextField) {
            _copyTextField.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
            return;
        }
        isRTL = document.documentElement.getAttribute('dir') === 'rtl';
        _copyTextField = document.createElement('textarea');
        _copyTextField.setAttribute('readonly', '');
        style = _copyTextField.style;
        // Prevent zooming on iOS (seen on https://github.com/zenorocha/clipboard.js/blob/master/dist/clipboard.js#L456)
        style.fontSize = '12pt';
        style.border = '0';
        style.padding = '0';
        style.margin = '0';
        style.position = 'fixed';
        style[isRTL ? 'right' : 'left'] = '-9999px';
        style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
        document.body.appendChild(_copyTextField);
    }

    function removeCopyTextField() {
        if (_copyTextField) {
            _copyTextField.blur();
            document.body.removeChild(_copyTextField);
            _copyTextField = undefined;
        }
    }

    function onClickCopy() {
        var status;
        var self = this;
        var value = getText(self);
        var options = self.options;
        if (options.beforeCopy.call(self, value) === false) {
            return;
        }
        if (_asyncClipboard) {
            return navigator.clipboard.writeText(value)
                .then(function() {
                    options.onSuccess.call(self, value);
                }, function() {
                    setTextToField(value);
                    options.onError.call(self, value);
                });
        }
        setTextToField(value);
        try {
            status = document.execCommand('copy');
        } catch (exception) {
            status = false;
        }
        options[status ? 'onSuccess' : 'onError'].call(self, value);
    }

    function onClickCopyIE() {
        // if ('clipboardData' in window && objectIs(window.clipboardData, 'DataTransfer'))
        // using IE clipboardData because document.execCommand('copy') always returns true
        // even if user denies clipboard access! setData however is trust-able.
        var status;
        var self = this;
        var value = getText(self);
        var options = self.options;
        if (options.beforeCopy.call(self, value) === false) {
            return;
        }
        status = window.clipboardData.setData('Text', value);
        if (status === false) {
            // fallback to init textarea, show message "press ctrl-C"
            setTextToField(value);
        }
        options[status ? 'onSuccess' : 'onError'].call(self, value);
    }

    function setTextToField(value) {
        initCopyField();
        _copyTextField.value = value;
        _copyTextField.focus();
        _copyTextField.select();
    }

    function getText(instance) {
        var text = instance.options.text;
        if (objectIs(text, 'String')) {
            return text;
        } else if (objectIs(text, 'Function')) {
            return text.call(this);
        }
        return '';
    }

    function objectIs(myObject, type) {
        return Object.prototype.toString.call(myObject) === '[object ' + type + ']';
    }

    function extend(destination) {
        var i, n, source, k;
        var target = Object(destination);
        for (i = 1, n = arguments.length; i < n; ++i) {
            source = arguments[i];
            if (typeof source !== 'object' || source === null) {
                continue;
            }
            for (k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }
        return target;
    }

    function noop() {
    }

})(this, window, document);
