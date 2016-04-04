# svg-triangle-generator
Simple demo of generating an equilateral triangle in SVG using JS.

**[View the working demo](http://htmlpreview.github.io/?https://github.com/carloscabo/svg-triangle-generator/blob/master/index.html)**

## About inline SVG and browser support
If you want to give support for inlined SVGs to IE9 / IE10 the SVG used must be **encoded in with URLEncode, Base64, or escaped**, after some tests I decided to choose `escape()` as is a native JS function, the resulting string is slightly smaller and is quite readeable (that allows to meke some changes by hand, for instance changing a color).

During the development of this demos I found another _funny_ bug on Firefox that has problems with data-urls that include the **hash character** ( `#` ) so even in modern browsers it's recomended to _escape_ the SVG string to avoid this problem.

Some simple test can be found at:  
https://jsfiddle.net/carloscabo/vwexaxwn/

<img src="screenshot-down.png" alt="">
