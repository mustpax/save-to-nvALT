(function() {
  // TODO collapse newlines for selections
  "use strict";

  var read = require("node-read");
  var toMarkdown = require('to-markdown');

  function getHtml(tab, cb) {
    chrome.tabs.executeScript(null, 
        {code: "document.documentElement.innerHTML"},
        cb);
  }

  // from http://stackoverflow.com/questions/2808368/decode-html-entities-in-javascript
  function htmlDecode(input){
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes[0].nodeValue;
  }
  

  function savePage(tab) {
    getHtml(tab, function(html) {
      read(html[0], function(err, article, meta) {
        if (! err) {
          var markdown = toMarkdown(article.content, {
            converters: [
            {
              filter: 'pre',
              replacement: function(c) {
                return '\n\n```\n' + c + '\n```\n\n';
              }
            },
            {
              filter: ['span', 'font', 'small'],
              replacement: function(c) {
                return c;
              }
            },
            {
              filter: ['div', 'figure', 'canvas'],
              replacement: function(c) {
                if (c.trim()) {
                  return '\n\n' + c + '\n\n';
                }
                return '\n\n';
              }
            },
            {
              filter: function (node) {
                return node.nodeName === 'A' && !node.getAttribute('href');
              },
              replacement: function(c) {
                return c;
              }
            }
            ]
          });
          saveToNv({
            title: htmlDecode(article.title),
            txt: 'Source: ' + tab.url + '\n\n' + markdown
          });
        }
      });
    });
  }

  function saveToNv(params) {
    var base = "nvalt://make/";
    var paramStr = Object.keys(params).map(function(k) {
      var v = params[k];
      return [encodeURIComponent(k), encodeURIComponent(v)].join('=');
    }).join("&");
    var url = [base, paramStr].join('?');
    chrome.tabs.update(null, {url: url});
  }

  // Save whole page when extension button in toolbar is clicked
  chrome.browserAction.onClicked.addListener(savePage);

  // Context menu options
  chrome.contextMenus.create({
    "title": "Save note with page",
    "contexts": ["page"],
    "onclick": function(info, tab) {
      savePage(tab);
    }
  });

  chrome.contextMenus.create({
    "title": "Save note with selected text",
    "contexts": ["selection"],
    "onclick": function(info, tab) {
      saveToNv({
        title: htmlDecode(tab.title),
        txt: 'Source: '  + info.pageUrl + '\n\n' + info.selectionText
      });
    }
  });
})();
