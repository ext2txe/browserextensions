// Open sidebar when browser action is clicked
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.open();
});
