var cmPage = chrome.contextMenus.create({"title": "Create note with page","contexts": ["page"],"onclick": clickstaPage});
var cmLink = chrome.contextMenus.create({"title": "Create note with selected link","contexts": ["link"],"onclick": clickstaLink});
var cmSel = chrome.contextMenus.create({"title": "Create note with selected text","contexts": ["selection"],"onclick": clickstaSelection});
var seltext = null;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch (request.message) {
	case 'setText':
		window.seltext = request.data
		break;

	default:
		sendResponse({
			data: 'Invalid arguments'
		});
		break;
	}
});

function prepareLinkUrl(aLink) {
	var mobIt = localStorage["mobilizeIt"];
	var theURL = aLink;
	if ((mobIt == "true") && (theURL.indexOf("instapaper") == -1)) {
		theURL = escape(theURL);
		theURL = "http://www.instapaper.com/m?u=" + theURL;
	}
	theURL = encodeURIComponent(theURL);
	return theURL;
}

chrome.browserAction.onClicked.addListener(function(theTab) {
	var theLink = new Object();
	var theURL = prepareLinkUrl(theTab.url);
	theLink.url = "nvalt://make/?url=" + theURL + "&title=" + encodeURIComponent(theTab.title);
	theLink.tab = theTab.id;
	handle_message(theLink);
	sendResponse({});
});

function clickstaPage(info, tab) {
	var theLink = new Object();
	var theURL = prepareLinkUrl(info.pageUrl);
	theLink.url = "nvalt://make/?url=" + theURL + "&title=" + encodeURIComponent(tab.title);

	theLink.tab = tab.id;
	handle_message(theLink);

}

function clickstaSelection(info, tab) {
	var theLink = new Object();
	var title, theBody,
	theURL=info.pageUrl;
	if (seltext == null || seltext == '') {
		theBody = info.selectionText;
	} else {
		theBody = seltext;
	}
	seltext=null;
	theBody = theBody.replace(/(\r\n|\n|\n\n|\n\n\n|\r)/gm, "\n");
	theBody = theBody.replace(/\n/g, "\n");
	title = titleFromBody(theBody);
	theBody = encodeURIComponent(theBody);
	title = encodeURIComponent(title);
	theURL = encodeURIComponent(theURL);
	theBody = theURL + "%0D%0D" + theBody;
	theLink.url = "nvalt://make/?txt=" + theBody + "&title=" + title;
	theLink.tab = tab.id;
	handle_message(theLink);
}

function titleFromBody(intxt) {
	var title = intxt;
	if (title.indexOf('\n') != -1) {
		title = title.substring(0, title.indexOf('\n'));
	}
	if (title.length > 45) {
		title = title.substring(0, 44);
	}
	//	title = title.replace(/\s*$/, '');
	return title;
}

function clickstaLink(info, tab) {
	var theLink = new Object();
	var theURL = prepareLinkUrl(info.linkUrl);
	theLink.url = "nvalt://make/?url=" + theURL;
	theLink.tab = tab.id;

	chrome.tabs.sendRequest(tab.id, {
		lynx: theLink
	},
	function(response) {
		if (info.selectionText) {
			info.selectionText = info.selectionText.replace(/(\r\n|\n|\n\n|\n\n\n|\r)/gm, "\n");
			if (info.selectionText.indexOf('\n') != -1) {
				info.selectionText = info.selectionText.substring(0, info.selectionText.indexOf('\n'));
			}
			if (info.selectionText.length > 35) {
				info.selectionText = info.selectionText.substring(0, 34);
			};
			info.selectionText = info.selectionText.replace(/\s*$/, '');
			theLink.url = theLink.url + "&title=" + encodeURIComponent(info.selectionText);
		} else if (response.ttl) {
			theLink.url = theLink.url + "&title=" + encodeURIComponent(response.ttl);
		}
		handle_message(theLink);
	});
}

function handle_message(lnx) {
	var props = new Object();
	props.url = lnx.url;
	/*	alert(props.url);*/
	chrome.tabs.update(lnx.tab, props);
}
