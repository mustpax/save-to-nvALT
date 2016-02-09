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

  function savePage(tab) {
    getHtml(tab, function(html) {
      read(html[0], function(err, article, meta) {
        if (! err) {
          saveToNv({
            title: article.title,
            txt: tab.url + '\n\n' + toMarkdown(article.content)
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
    "title": "Save note with selected link",
    "contexts": ["link"],
    "onclick": function(info, tab) {
      saveToNv({
        title: info.selectionText,
        url: info.linkUrl
      });
    }
  });

  chrome.contextMenus.create({
    "title": "Save note with selected text",
    "contexts": ["selection"],
    "onclick": function(info, tab) {
      saveToNv({
        title: tab.title,
        txt: info.pageUrl + '\n\n' + info.selectionText
      });
    }
  });
})();
