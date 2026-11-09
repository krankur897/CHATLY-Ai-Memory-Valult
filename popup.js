let savedChats = {};

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("aiSearchInput");
  const list = document.getElementById("aiSuggestionsList");

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    list.innerHTML = "";
    
    if (!query) {
      list.hidden = true;
      return;
    }

    const matches = CHATLYAIList.filter(ai => ai.name.toLowerCase().includes(query));
    
    if (matches.length === 0) {
      list.hidden = true;
      return;
    }

    matches.forEach(ai => {
      const row = document.createElement("div");
      row.className = "dd-item";
      row.textContent = ai.name;
      row.onmousedown = (e) => {
        e.preventDefault();
        input.value = ai.name;
        list.hidden = true;
      };
      list.appendChild(row);
    });

    list.hidden = false;
  });

  input.addEventListener("blur", () => {
    setTimeout(() => { list.hidden = true; }, 200);
  });

  fetchChats();

  document.getElementById("saveBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) return;

      const saveAction = (res) => {
        if (res && res.chat) {
          chrome.runtime.sendMessage({
            action: "saveChat",
            chatData: res.chat,
            platform: tab.url
          }, (response) => {
            if (response && response.success) {
              buildChatList(response.chats);
              alert("Chat saved successfully!");
            }
          });
        } else {
          alert("No chat data found.");
        }
      };

      chrome.tabs.sendMessage(tab.id, { action: "extractChat" }, (res) => {
        if (!chrome.runtime.lastError && res) {
          saveAction(res);
        } else {
          chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] }, () => {
            chrome.tabs.sendMessage(tab.id, { action: "extractChat" }, saveAction);
          });
        }
      });
    });
  });

  document.getElementById("clearAllBtn").addEventListener("click", () => {
    if (confirm("Delete all saved history?")) {
      chrome.runtime.sendMessage({ action: "clearAll" }, (res) => {
        if (res && res.success) buildChatList(res.chats);
      });
    }
  });

  document.getElementById("transferBtn").addEventListener("click", () => {
    const queryVal = input.value.trim();
    const selectedChat = getSelectedChat();

    if (!queryVal) {
      alert("Please type an AI name or URL.");
      return;
    }
    if (!selectedChat) {
      alert("Please select a saved chat first.");
      return;
    }

    let targetUrl = resolveTargetUrl(queryVal);

    chrome.runtime.sendMessage({
      action: "transferChat",
      targetUrl,
      chatText: selectedChat.fullText
    });
  });

  document.getElementById("downloadBtn").addEventListener("click", () => {
    const chat = getSelectedChat();
    if (!chat) {
      alert("Select a saved chat to export.");
      return;
    }

    const format = document.getElementById("formatSelect").value;
    let fileContent = chat.fullText;
    let mimeType = "text/plain;charset=utf-8";
    let extension = "txt";

    if (format === "json") {
      fileContent = JSON.stringify(chat, null, 2);
      mimeType = "application/json;charset=utf-8";
      extension = "json";
    } else if (format === "md") {
      fileContent = `# CHATLY Export\n- **Date:** ${chat.date}\n- **Platform:** ${chat.platform}\n\n---\n\n${chat.fullText}`;
      mimeType = "text/markdown;charset=utf-8";
      extension = "md";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CHATLY-${chat.id}.${extension}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
});

function resolveTargetUrl(input) {
  const found = CHATLYAIList.find(ai => ai.name.toLowerCase() === input.toLowerCase());
  if (found) return found.url;

  if (input.includes(".") && !input.includes(" ")) {
    return input.startsWith("http") ? input : `https://${input}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(input + " AI chat")}`;
}

function fetchChats() {
  chrome.storage.local.get(["savedCHATLYChats"], (res) => {
    buildChatList(res.savedCHATLYChats || {});
  });
}

function buildChatList(chats) {
  savedChats = chats;
  const select = document.getElementById("savedChatSelect");
  select.innerHTML = "";

  const keys = Object.keys(chats).sort((a, b) => Number(b) - Number(a));
  keys.forEach((id) => {
    const chat = chats[id];
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${chat.date} (${chat.snippet.substring(0, 15)}...)`;
    select.appendChild(option);
  });

  let container = document.getElementById("savedList");
  container.innerHTML = "";

  if (keys.length === 0) {
    select.disabled = true;
    container.innerHTML = `<i style="color: var(--text-muted); font-size: 10px;">No saved chats yet.</i>`;
    return;
  }
  select.disabled = false;

  keys.forEach((id) => {
    let chat = chats[id];
    let row = document.createElement("div");
    row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 3px 0; border-bottom: 1px solid var(--border-color); font-size: 10px;";

    let textSpan = document.createElement("span");
    textSpan.innerText = `${chat.date}: ${chat.snippet}`;
    textSpan.style.cssText = "white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; color: var(--text-pearl);";

    let delBtn = document.createElement("button");
    delBtn.innerText = "✕";
    delBtn.className = "btn-danger";
    delBtn.style.cssText = "width: auto; padding: 1px 4px; font-size: 9px; margin: 0; cursor: pointer;";
    delBtn.onclick = () => {
      chrome.runtime.sendMessage({ action: "deleteChat", timestamp: id }, (res) => {
        if (res && res.success) buildChatList(res.chats);
      });
    };

    row.appendChild(textSpan);
    row.appendChild(delBtn);
    container.appendChild(row);
  });
}

function getSelectedChat() {
  const id = document.getElementById("savedChatSelect").value;
  return id ? savedChats[id] || null : null;
}