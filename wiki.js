// ==UserScript==
// @name         IsleWard - Wiki Command
// @namespace    IsleWard.Addon
// @version      1.0.0
// @description  Introduces a command for opening articles on the IsleWard wiki from inside the game.
// @author       Carnagion
// @match        https://play.isleward.com/
// @grant        none
// ==/UserScript==

retry(addon, () => window.jQuery, 50);

function retry(method, condition, interval)
{
    if (condition())
    {
        method();
    }
    else
    {
        let handler = function()
        {
            retry(method, condition, interval);
        }
        setTimeout(handler, interval);
    }
}

function addon()
{
    let content =
        {
            lastUsedCommand: null,
            init: function(events)
            {
                events.on("onBeforeChat", this.onBeforeChat.bind(this));
                events.on("onGetMessages", this.onGetMessages.bind(this));
            },
            onBeforeChat: function(chat)
            {
                if (chat?.message?.startsWith("/"))
                {
                    this.lastUsedCommand = chat.message;
                }
            },
            onGetMessages: async function(chat)
            {
                let entry = chat?.messages[0];
                if (!entry || !entry.message)
                {
                    return;
                }

                if (!this.lastUsedCommand)
                {
                    return;
                }
                await this.handleCommand(entry);
                this.lastUsedCommand = null;
            },
            handleCommand: async function(entry)
            {
                if (this.lastUsedCommand.match(/^\/wiki$/gi))
                {
                    window.open("https://wiki.isleward.com/", "");
                    entry.message = "Opening wiki homepage";
                    entry.class = "color-blueB";
                }
                else if (this.lastUsedCommand.match(/\/wiki .+/gi))
                {
                    let article = this.lastUsedCommand.substring(6);
                    let url = `https://wiki.isleward.com/index.php?search=${convertToUrlSafeString(article)}`;
                    window.open(url, "");
                    entry.message = `Searching wiki for "${article}"`;
                    entry.class = "color-blueB";
                }
            },
        };
    window.addons.register(content);
}

function convertToUrlSafeString(string)
{
    return string.replace(/\+/gi, "%2B").replace(/\s/gi, "+");
}