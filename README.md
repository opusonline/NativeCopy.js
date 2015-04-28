NativeCopy.js
=============

Javascript plugin to copy some text to the clipboard.

This plugin supports:
- callback for text generation
- beforeCopy/afterCopy callback
- fallback callback if not supported by browser

#Install

Native Javascript

```html
<script src="NativeCopy.js"></script>
```

jQuery

```html
<script src="jquery.js"></script>
<script src="nativeCopy.jquery.js"></script>
```

#Usage

###Example

```javascript
// native
new NativeCopy('copyButton', { // copyButton is id of button element
    copy: 'This is great!',
    beforeCopy: function (text) {
        console.log(text);
    },
    afterCopy: function (status, text) {
        console.log(status, text);
    },
    fallback: function () {
        var button = this;
        useDifferentPlugin(button);
    }
});

// jQuery
$('#copyButton').nativeCopy({
    copy: 'This is great!',
    beforeCopy: function (text) {
        console.log(text);
    },
    afterCopy: function (status, text) {
        console.log(status, text);
    },
    fallback: function () {
        var button = this;
        useDifferentPlugin(button);
    }
});
```
