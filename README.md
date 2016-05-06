NativeCopy.js
=============

Javascript plugin to copy some text to the clipboard.

This plugin supports:
- callback for text generation
- `beforeCopy`/`onSuccess`/`onError` callbacks
- `destroy()` method

#Install

```html
<script src="nativeCopy.js"></script>
```

#Usage

###Example

```javascript
var nativecopy = new NativeCopy('#copyButton', { // copyButton is id of button element, could be any selector for example '.cpBtn'
    text: function() { // or just text: 'This is great!',
        return 'This is great!';
    },
    beforeCopy: function (text) {
        console.log(text);
        // you can do return false; to prevent continuing
    },
    onSuccess: function (text) {
        console.log('success', text);
        this.clearSelection();
    },
    onError: function (text) {
        console.log('error', text);
        alert('Press Ctrl-C to copy');
    }
});

// later
nativecopy.destroy();
```
