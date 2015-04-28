/*!
 * NativeCopy
 * native copy to clipboard
 *
 * author: Stefan Benicke <stefan.benicke@gmail.com>
 */
(function (global, undefined) {
    // http://updates.html5rocks.com/2015/04/cut-and-copy-commands

    var _copyTextField;

    var initCopyField, onClickCopy, cleanup;

    var _defaults = {
        copy: '',
        beforeCopy: noop,
        afterCopy: noop,
        fallback: noop
    };

    function NativeCopy(elementID, options) {
        this.options = extend({}, _defaults, options);
        this.button = document.getElementById(elementID);
        this.handler = onClickCopy.bind(this);
        this.button.addEventListener('click', this.handler);
    }

    NativeCopy.supported = undefined;

    if ('clipboardData' in window && objectIs(window.clipboardData, 'DataTransfer')) {
        // using IE clipboardData because document.execCommand('copy') always returns true
        // even if user denies clipboard access! setData however is trust-able.

        NativeCopy.supported = true;

        onClickCopy = function onClickCopy() {
            var status, value = '';
            if (objectIs(this.options.copy, 'String')) {
                value = this.options.copy;
            } else if (objectIs(this.options.copy, 'Function')) {
                value = this.options.copy();
            }
            this.options.beforeCopy.call(this, value);
            status = window.clipboardData.setData('Text', value);
            this.options.afterCopy.call(this, status, value);
        };

    } else {

        initCopyField = function initCopyField() {
            if (typeof _copyTextField !== 'undefined') {
                return;
            }
            _copyTextField = document.createElement('textarea');
            document.body.appendChild(_copyTextField);
            _copyTextField.style.position = 'absolute';
            _copyTextField.style.top = '0';
            _copyTextField.style.left = '-9999px';

            NativeCopy.supported = document.queryCommandSupported('copy');
            if (NativeCopy.supported === false) {
                throw new Error('not supported');
            }
        };

        onClickCopy = function onClickCopy() {
            var enabled, status, value = '';
            try {
                initCopyField.call(this);
                if (objectIs(this.options.copy, 'String')) {
                    value = this.options.copy;
                } else if (objectIs(this.options.copy, 'Function')) {
                    value = this.options.copy();
                }
                this.options.beforeCopy.call(this, value);
                _copyTextField.value = value;
                _copyTextField.select();
                enabled = document.queryCommandEnabled('copy');
                if (enabled === false) {
                    this.options.afterCopy.call(this, false, value);
                    return;
                }
                status = document.execCommand('copy');
                this.options.afterCopy.call(this, status, value);
            } catch (exception) {
                cleanup.call(this);
                this.options.fallback.call(this.button);
            }
        };

        cleanup = function cleanup() {
            if (typeof _copyTextField !== 'undefined') {
                _copyTextField = null;
            }
            this.button.removeEventListener('click', this.handler);
        };

        // https://code.google.com/p/chromium/issues/detail?id=476508
        if (document.queryCommandSupported('copy') === true) {
            NativeCopy.supported = true;
        }
    }

    global['NativeCopy'] = NativeCopy;

    function objectIs(myObject, type) {
        return Object.prototype.toString.call(myObject) === '[object ' + type + ']';
    }

    function extend(destination) {
        var i, n, k;
        var sources = Array.prototype.slice.call(arguments, 1);
        for (i = 0, n = sources.length; i < n; ++i) {
            if (typeof sources[i] !== 'object' || sources[i] === null) {
                continue;
            }
            for (k in sources[i]) {
                if (sources[i].hasOwnProperty(k)) {
                    destination[k] = sources[i][k];
                }
            }
        }
        return destination;
    }

    function noop() {
    }

})(this);
