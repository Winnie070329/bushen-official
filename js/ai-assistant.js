(function () {
  var STORAGE_KEY = "bushen_deepseek_key";
  var SYSTEM_PROMPT =
    "你是「布神小助手」，佛山市顺德区布神家居用品有限公司（布神纺织 BUSHEN WEAVING）的可爱客服。" +
    "公司成立于2012年，位于佛山顺德龙江，主营窗帘布艺、床垫面料、纺织家纺。" +
    "视频号：布神织造。回答要简洁友好，可适当用表情，优先介绍产品与联系方式。" +
    "若不确定具体报价/起订量，请引导用户通过在线咨询或视频号联系。不要编造虚假认证。";

  function getConfig() {
    var cfg = window.BUSHEN_AI_CONFIG || {};
    var key = (cfg.apiKey || "").trim();
    if (!key || key.indexOf("your-deepseek") !== -1) {
      key = (localStorage.getItem(STORAGE_KEY) || "").trim();
    }
    return {
      apiKey: key,
      apiBase: (cfg.apiBase || "https://api.deepseek.com").replace(/\/$/, ""),
      model: cfg.model || "deepseek-v4-flash"
    };
  }

  function createWidget() {
    var root = document.createElement("div");
    root.className = "ai-assist";
    root.innerHTML =
      '<button class="ai-fab" type="button" aria-label="打开布神小助手">' +
      '  <span class="ai-fab-face" aria-hidden="true">' +
      '    <span class="ai-fab-ear ai-fab-ear-l"></span>' +
      '    <span class="ai-fab-ear ai-fab-ear-r"></span>' +
      '    <span class="ai-fab-eye ai-fab-eye-l"></span>' +
      '    <span class="ai-fab-eye ai-fab-eye-r"></span>' +
      '    <span class="ai-fab-blush ai-fab-blush-l"></span>' +
      '    <span class="ai-fab-blush ai-fab-blush-r"></span>' +
      '    <span class="ai-fab-mouth"></span>' +
      "  </span>" +
      '  <span class="ai-fab-badge">AI</span>' +
      "</button>" +
      '<div class="ai-panel" hidden>' +
      '  <div class="ai-panel-head">' +
      '    <div class="ai-panel-title">' +
      '      <span class="ai-mini-face" aria-hidden="true"></span>' +
      "      <div><strong>布神小助手</strong><p>DeepSeek 智能客服</p></div>" +
      "    </div>" +
      '    <div class="ai-panel-actions">' +
      '      <button type="button" class="ai-icon-btn" data-action="settings" title="设置 API Key">⚙</button>' +
      '      <button type="button" class="ai-icon-btn" data-action="close" title="关闭">×</button>' +
      "    </div>" +
      "  </div>" +
      '  <div class="ai-messages" role="log" aria-live="polite"></div>' +
      '  <div class="ai-quick">' +
      '    <button type="button" data-q="你们公司主要做什么？">公司介绍</button>' +
      '    <button type="button" data-q="有哪些产品？">产品推荐</button>' +
      '    <button type="button" data-q="怎么联系你们？">联系方式</button>' +
      "  </div>" +
      '  <form class="ai-form">' +
      '    <input type="text" class="ai-input" placeholder="问问布神小助手…" maxlength="500" autocomplete="off">' +
      '    <button type="submit" class="ai-send" aria-label="发送">➤</button>' +
      "  </form>" +
      "</div>";
    document.body.appendChild(root);
    return root;
  }

  var root = createWidget();
  var fab = root.querySelector(".ai-fab");
  var panel = root.querySelector(".ai-panel");
  var messages = root.querySelector(".ai-messages");
  var form = root.querySelector(".ai-form");
  var input = root.querySelector(".ai-input");
  var history = [{ role: "system", content: SYSTEM_PROMPT }];
  var busy = false;

  function addBubble(role, text) {
    var div = document.createElement("div");
    div.className = "ai-bubble ai-bubble-" + role;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function addTyping() {
    var div = document.createElement("div");
    div.className = "ai-bubble ai-bubble-assistant ai-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function openPanel() {
    panel.hidden = false;
    fab.classList.add("is-open");
    if (!messages.childElementCount) {
      addBubble(
        "assistant",
        "嗨～我是布神小助手 🧶 可以问我产品、公司介绍或联系方式哦～"
      );
    }
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    fab.classList.remove("is-open");
  }

  function ensureApiKey() {
    var cfg = getConfig();
    if (cfg.apiKey) return cfg.apiKey;
    var entered = window.prompt(
      "请输入 DeepSeek API Key（仅保存在本机浏览器，不会上传到网页代码）：",
      ""
    );
    if (entered && entered.trim()) {
      localStorage.setItem(STORAGE_KEY, entered.trim());
      return entered.trim();
    }
    return "";
  }

  async function askDeepSeek(userText) {
    var cfg = getConfig();
    var apiKey = cfg.apiKey || ensureApiKey();
    if (!apiKey) {
      throw new Error("未配置 API Key，请点击 ⚙ 设置");
    }

    history.push({ role: "user", content: userText });

    var models = [cfg.model, "deepseek-chat", "deepseek-v4-flash"];
    var lastError = null;

    for (var m = 0; m < models.length; m++) {
      try {
        var res = await fetch(cfg.apiBase + "/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apiKey
          },
          body: JSON.stringify({
            model: models[m],
            messages: history,
            stream: false,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        var data = await res.json().catch(function () {
          return {};
        });

        if (!res.ok) {
          var msg =
            (data.error && (data.error.message || data.error.code)) ||
            "请求失败 (" + res.status + ")";
          // try next model if model not found
          if (res.status === 400 || res.status === 404) {
            lastError = new Error(msg);
            continue;
          }
          throw new Error(msg);
        }

        var reply =
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content;
        if (!reply) throw new Error("没有收到有效回复");
        history.push({ role: "assistant", content: reply });
        // keep history short
        if (history.length > 13) {
          history = [history[0]].concat(history.slice(-12));
        }
        return reply;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("调用失败");
  }

  async function handleSend(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    addBubble("user", text);
    input.value = "";
    var typing = addTyping();
    try {
      var reply = await askDeepSeek(text);
      typing.remove();
      addBubble("assistant", reply);
    } catch (err) {
      typing.remove();
      addBubble("assistant", "呜…暂时连不上： " + (err.message || "请稍后重试"));
    } finally {
      busy = false;
    }
  }

  fab.addEventListener("click", function () {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  root.querySelector('[data-action="close"]').addEventListener("click", closePanel);
  root.querySelector('[data-action="settings"]').addEventListener("click", function () {
    var current = localStorage.getItem(STORAGE_KEY) || "";
    var entered = window.prompt("设置 DeepSeek API Key（保存在本机）：", current);
    if (entered === null) return;
    if (entered.trim()) {
      localStorage.setItem(STORAGE_KEY, entered.trim());
      addBubble("assistant", "API Key 已保存到本机，可以开始聊天啦～");
    } else {
      localStorage.removeItem(STORAGE_KEY);
      addBubble("assistant", "已清除本机 API Key。");
    }
  });

  root.querySelectorAll(".ai-quick button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      handleSend(btn.dataset.q);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleSend(input.value);
  });
})();
