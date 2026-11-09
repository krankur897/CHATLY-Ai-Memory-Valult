importScripts("providers.js");

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "saveChat") {
    storeChat(req.chatData, req.platform, sendResponse);
    return true;
  } 
  else if (req.action === "deleteChat") {
    removeChat(req.timestamp, sendResponse);
    return true;
  }
  else if (req.action === "clearAll") {
    clearAll(sendResponse);
    return true;
  }
  else if (req.action === "transferChat") {
    launchAndInject(req.targetUrl, req.chatText, sendResponse);
    return true;
  }
});

function storeChat(text, platform, sendResponse) {
  chrome.storage.local.get(["savedCHATLYChats"], (res) => {
    let chats = res.savedCHATLYChats || {};
    let id = Date.now();
    let snippet = text.trim().substring(0, 50).replace(/\n/g, " ") + "...";

    chats[id] = {
      id: id,
      platform: platform || "AI Chat",
      snippet: snippet,
      fullText: text.trim(),
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chrome.storage.local.set({ savedCHATLYChats: chats }, () => {
      sendResponse({ success: true, chats: chats });
    });
  });
}

function removeChat(id, sendResponse) {
  chrome.storage.local.get(["savedCHATLYChats"], (res) => {
    let chats = res.savedCHATLYChats || {};
    if (chats[id]) {
      delete chats[id];
      chrome.storage.local.set({ savedCHATLYChats: chats }, () => {
        sendResponse({ success: true, chats: chats });
      });
    } else {
      sendResponse({ success: false });
    }
  });
}

function clearAll(sendResponse) {
  chrome.storage.local.set({ savedCHATLYChats: {} }, () => {
    sendResponse({ success: true, chats: {} });
  });
}

function launchAndInject(targetUrl, text, sendResponse) {
  let destination;
  try {
    destination = new URL(targetUrl);
  } catch (error) {
    sendResponse({ success: false, error: "Invalid URL." });
    return;
  }

  chrome.tabs.create({ url: destination.href }, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      sendResponse({ success: false });
      return;
    }
    const tabId = tab.id;
    const listener = (updatedTabId, info) => {
      if (updatedTabId === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(() => {
          chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }, () => {
            
            // 🔥 here we added strictly system instruction so that AI doesn't produce output after getting the history code
            const formattedPayload = 
              "[SYSTEM NOTE: The following is a past chat history imported for context only. " +
              "Do NOT generate a conversational reply, do NOT summarize it, and do NOT greet. " +
              "Acknowledge receipt silently and wait for my next prompt.]\n\n" +
              "-------------------------------------\n" +
              text + 
              "\n-------------------------------------\n\n" +
              "[End of Context. Await next instruction.]";

            chrome.tabs.sendMessage(tabId, {
              action: "injectChat",
              text: formattedPayload
            }, (res) => {
              sendResponse({ success: res && res.success });
            });
          });
        }, 1500);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}