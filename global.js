(function() {
  "use strict";
  // TODO collapse newlines for selections
  function savePage(tab) {
    saveToNv({url : tab.url, title: tab.title});
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
