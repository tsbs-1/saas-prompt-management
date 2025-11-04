chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'open-palette') return;
  try {
    await chrome.action.openPopup();
  } catch (e) {
    // ignore
  }
});


