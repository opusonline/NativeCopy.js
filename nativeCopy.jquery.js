/*!
 * $.nativeCopy
 * native copy to clipboard
 *
 * author: Stefan Benicke <stefan.benicke@gmail.com>
 */
(function ($, undefined) {
    // http://updates.html5rocks.com/2015/04/cut-and-copy-commands

    var _copyTextField;

    var initCopyField, onClickCopy, cleanup;

    var _defaults = {
        copy: '',
        afterCopy: $.noop,
        fallback: $.noop
    };

    $.nativeCopy = {
        supported: undefined
    };

    $.fn.nativeCopy = function nativeCopy(options) {
        new NativeCopy(this, options);
        return this;
    };

    function NativeCopy(button, options) {
        this.button = button;
        this.options = $.extend({}, _defaults, options);
        this.handler = $.proxy(onClickCopy, this);
        this.button.click(this.handler);
    }

    if ('clipboardData' in window && Object.prototype.toString.call(window.clipboardData) === '[object DataTransfer]') {
        // using IE clipboardData because document.execCommand('copy') always returns true
        // even if user denies clipboard access! setData however is trust-able.

        $.nativeCopy.supported = true;

        onClickCopy = function onClickCopy() {
            var status, value = '';
            if ($.type(this.options.copy) === 'string') {
                value = this.options.copy;
            } else if ($.isFunction(this.options.copy)) {
                value = this.options.copy();
            }
            status = window.clipboardData.setData('Text', value);
            this.options.afterCopy.call(this, status, value);
        };

    } else {

        initCopyField = function initCopyField() {
            if (typeof _copyTextField !== 'undefined') {
                return;
            }
            _copyTextField = $('<textarea></textarea>').appendTo('body').css({
                position: 'absolute',
                top: '0px',
                left: '-9999px'
            });
            $.nativeCopy.supported = document.queryCommandSupported('copy');
            if ($.nativeCopy.supported === false) {
                throw new Error('not supported');
            }
        };

        onClickCopy = function onClickCopy() {
            var enabled, status, value = '';
            try {
                initCopyField.call(this);
                if ($.type(this.options.copy) === 'string') {
                    value = this.options.copy;
                } else if ($.isFunction(this.options.copy)) {
                    value = this.options.copy();
                }
                _copyTextField.val(value).select();
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
            this.button.off('click', this.handler);
        };

        // https://code.google.com/p/chromium/issues/detail?id=476508
        if (document.queryCommandSupported('copy') === true) {
            $.nativeCopy.supported = true;
        }
    }

})(jQuery);
