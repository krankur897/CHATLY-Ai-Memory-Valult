chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "extractChat") {
    sendResponse({ chat: grabChatHistory() });
  } else if (req.action === "injectChat") {
    sendResponse({ success: dropTextAndSubmitSilently(req.text) });
  }
  return true;
});

function grabChatHistory() {
  const host = window.location.hostname;
  let logs = [];

  try {
    if (host.includes("chatgpt.com")) {
      document.querySelectorAll('[data-message-author-role]').forEach(el => {
        const role = el.getAttribute('data-message-author-role') || "chat";
        logs.push(`[${role.toUpperCase()}]:\n${el.innerText.trim()}`);
      });
    } else if (host.includes("gemini.google.com")) {
      document.querySelectorAll('user-query, model-response, .message-content').forEach(el => {
        logs.push(el.innerText.trim());
      });
    } else if (host.includes("claude.ai")) {
      document.querySelectorAll('.font-user-message, .font-claude-message').forEach(el => {
        logs.push(el.innerText.trim());
      });
    }
  } catch (err) {
    console.log("Extraction error:", err);
  }

  if (logs.length === 0) {
    logs.push(document.body.innerText.trim());
  }

  return logs.join("\n\n-------------------------------------\n\n");
}

function dropTextAndSubmitSilently(text) {
  const boxes = Array.from(document.querySelectorAll(
    'textarea, [contenteditable="true"], [role="textbox"]'
  )).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && !el.disabled && !el.readOnly;
  });

  if (boxes.length === 0) return false;
  const target = boxes[0];

  target.focus();
  if (target instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    setter.call(target, text);
  } else {
    target.innerText = text;
  }

  target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));

  setTimeout(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
    target.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
    target.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
  }, 400);

  return true;
}