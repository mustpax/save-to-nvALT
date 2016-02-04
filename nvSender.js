document.addEventListener('contextmenu', getContextMenuEvent);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.lynx) {
		var theLink = request.lynx.url,
			theTitle = '';
		for (i = 0; i < document.links.length; i++) {
			if (document.links[i].href == theLink) {
				var linkNode = document.links[i];
				linkNode.style.color = "#F40C0C !important;";
				theTitle = linkNode.text;
				break;
			}
		}
		sendResponse({
			ttl: theTitle
		});
	} else {
		sendResponse({});
	}
});



function getContextMenuEvent(event) {
	var sel = window.getSelection().toString();
	if (sel.length) {
		chrome.extension.sendRequest({'message': 'setText','data': sel},function(response) {});
	}
}
