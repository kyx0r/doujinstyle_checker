// ==UserScript==
// @name        doujinstyle_checker
// @match       *://*/*
// @version     1
// @grant       none
// @description doujinstyle_checker
// ==/UserScript==

/*
fetch("https://doujinstyle.com/", {
    "headers": {
        "content-type": "application/x-www-form-urlencoded"
    },
    "body": "type=1&id=" + String(c) + "&source=0&download_link=",
    "method": "POST",
    "mode": "no-cors",
    "credentials": "include",
    "redirect": "manual"
}).then(response => {

})
*/

var err;
var observer;
var timer;

function match_rule(rule) {
    return document.URL.match(rule);
}

function match_chrule(rule) {
    return document.URL.match(rule) && window.opener;
}

if (match_rule("doujinstyle.*p=home")) {
    var timeout = 1000;
    var wintimeout = 500;
    var wintimeoutmax = 15000;
    var c = 3950;
    var maxidx = 3951;
    var textFileUrl = null;
    var strs = "<pre>";
    var win = null;
    var started = 0;
    var fhtml = [];

    window.addEventListener("message", function(event){
        if (win == event.source) {
            strs += event.data;
        }
    });

    window.chk = function ()
    {
        var twintimeout = 0;
        var str = "https://doujinstyle.com/?p=page&type=1&id=" + String(c);
        strs += "<a href=" + str + " target=\"_blank\">" + String(c) + "</a> ";
        win = window.open(str, "_blank");
        const timer = setInterval(() => {
            twintimeout += wintimeout;
            if (twintimeout > wintimeoutmax) {
                win.close();
                strs += "dead or unhandled url ";
            }
            if (win.closed || twintimeout > wintimeoutmax) {
                clearInterval(timer);
                strs += "\n";
                if (c < maxidx) {
                    setTimeout(window.chk, timeout);
                } else {
                    strs += "</pre>";
                    document.documentElement.innerHTML = strs;
                }
                c++;
            }
        }, wintimeout);
    }

    window.finalize = function()
    {
        var joined = "";
        for (var i = 0; i <= maxidx; i++)
            joined += fhtml[i];
        document.documentElement.innerHTML = '<input type="button" value="finalize" onclick="window.finalize()">' + joined;
    }

    window.rec = function (time, iframe, c, maxidx, fhtml, str)
    {
        var frame = document.getElementsByTagName("iframe");
        if (frame && frame.length > 5){
            time += frame.length * 500;
            setTimeout(window.rec, time, time, iframe, c, maxidx, fhtml, str);
        } else {
            iframe[c].src = str;
            document.body.appendChild(iframe[c]);
        }
    }

    window.scrape = function (arr)
    {
        var html = strs.split("\n");
        for (c = 0; c <= maxidx; c++) {
            fhtml[c] = [];
        }
        var iframe = new Array(maxidx+1);
        var time = 0;
        for (c = 0; c <= maxidx; c++) {
            iframe[c] = document.createElement("iframe");
            var subarr = arr[c].split(' ');
            var str = "https://doujinstyle.com/?p=page&type=1&id=" + String(parseInt(subarr[0]));
            iframe[c].addEventListener("load", function(evt) {
                var spl = html[evt.currentTarget.c].split("</a>");
                var realurl = "<a href=" + evt.currentTarget.subarr[1] + " target=\"_blank\">" + spl[1] + "</a> ";
                var title = evt.currentTarget.contentWindow.document.getElementsByTagName("h2");
                title = title && title.length > 0 ? title[0].innerHTML : "";
                fhtml[evt.currentTarget.c] = spl[0] + "</a>  " + realurl + "  " + title + "  ";
                var metadata = evt.currentTarget.contentWindow.document.getElementsByClassName("pageWrap");
                if (metadata && metadata.length > 0) {
                    fhtml[evt.currentTarget.c] += '\n';
                    fhtml[evt.currentTarget.c] += metadata[0].innerHTML.replace(/<br>/g, '');
                }
                fhtml[evt.currentTarget.c] += '\n';
                evt.currentTarget.remove();
            });
            iframe[c].frameBorder = "0";
            iframe[c].width = "100%";
            iframe[c].height = "100%";
            iframe[c].name = "_tmpframe";
            iframe[c].c = c;
            iframe[c].subarr = subarr;
            window.rec(time, iframe, c, maxidx, fhtml, str);
            time += 500;
        }
    }

    window.fchk = function (arr)
    {
        var twintimeout = 0;
        var subarr = arr[c].split(' ');
        var str = "https://doujinstyle.com/?p=page&type=1&id=" + String(parseInt(subarr[0]));
        strs += "<a href=" + str + " target=\"_blank\">" + String(parseInt(subarr[0])) + "</a> ";
        win = window.open(subarr[1], "_blank");
        const timer = setInterval(() => {
            twintimeout += wintimeout;
            if (twintimeout > wintimeoutmax) {
                win.close();
                strs += "dead or unhandled url ";
            }
            if (win.closed || twintimeout > wintimeoutmax) {
                clearInterval(timer);
                strs += "\n";
                if (c < maxidx) {
                    setTimeout(function() {
                        window.fchk(arr);
                    }, timeout);
                } else {
                    strs += "</pre>";
                    document.documentElement.innerHTML = strs;
                }
                c++;
            }
        }, wintimeout);
    }

    window.start_chk = function ()
    {
        started = !started;
        if (!started) {
            c = maxidx;
            return;
        }
        setTimeout(window.chk, timeout);
    }

    var td = document.getElementById('menu');
    if (td) {
        var element = document.createElement("input");
        element.setAttribute("type", "button");
        element.setAttribute("value", "start|stop checker");
        element.setAttribute("name", "button3");
        element.setAttribute("onclick", "window.start_chk()");
        td.appendChild(element);
        var fi1 = document.createElement('input');
        fi1.type = 'file';
        fi1.id = 'fi1';
        fi1.name = 'links file';
        fi1.setAttribute("style", "position: relative; display: block;");
        fi1.onchange = e => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => {
                var content = readerEvent.target.result;
                var arr = content.split("\n");
                maxidx = arr.length - 2;
                c = 0;
                if (maxidx >= 0) {
                    if (strs.length > 5) {
                        document.documentElement.innerHTML = '<input type="button" value="finalize" onclick="window.finalize()">' + strs;
                        window.scrape(arr);
                    } else
                        window.fchk(arr);
                }
            }
        }
        var fi2 = document.createElement('input');
        fi2.type = 'file';
        fi2.id = 'fi2';
        fi2.name = '<pre> file';
        fi2.setAttribute("style", "position: relative; display: block;");
        fi2.onchange = e => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => {
                var regExp = /<pre>(.*?)<\/pre>/gs;
                var match = regExp.exec(readerEvent.target.result);
                if (match) {
                    strs = match[0];
                } else {
                    console.log("bad filetype!");
                }
            }
        }
        td.appendChild(fi1);
        td.appendChild(fi2);
    } else {
        console.log("failed to find menu!");
    }
} else if (match_chrule("doujinstyle.*p=page&type=.*&id=.*")) {

    function eatpopup() {
        window.opener.postMessage("No redirect ", "https://doujinstyle.com/?p=home");
        window.close();
    }
    err = /Insufficient information to display content./;
    if (!document.documentElement.innerHTML.match(err)) {
        var form = document.getElementsByTagName("form");
        var dlbtn = document.getElementById("downloadForm");
        var title = document.getElementsByTagName("h2");
        if (title && title.length > 0) {
            window.opener.postMessage(title[0].innerHTML.padEnd(55, ' '), "https://doujinstyle.com/?p=home");
        }
        if (form && dlbtn) {
            for (var i = 0; i < form.length; i++) {
                form[i].target = "_self";
            }
            dlbtn.click();
            setTimeout(eatpopup, 5000);
        }
    } else {
        window.opener.postMessage("Deleted db index ", "https://doujinstyle.com/?p=home");
        window.close();
    }
} else if (match_chrule("dropbox")) {
    function action() {
        window.opener.postMessage("dropbox ", "https://doujinstyle.com/?p=home");
        var err = /This item was deleted/;
        if (document.documentElement.innerHTML.match(err)) {
            window.opener.postMessage("deleted ", "https://doujinstyle.com/?p=home");
        }
        window.close();
    }
    setTimeout(action, 2000);
} else if (match_chrule("onedrive")) {
    observer = new MutationObserver(resetTimer);
    timer = setTimeout(action, 4000, observer); // wait for the page to stay still for 1 seconds
    observer.observe(document, {childList: true, subtree: true});

    // reset timer every time something changes
    function resetTimer(changes, observer) {
        clearTimeout(timer);
        timer = setTimeout(action, 4000, observer);
    }

    function action(observer) {
        observer.disconnect();
        window.opener.postMessage("onedrive ", "https://doujinstyle.com/?p=home");
        var btn = document.querySelector('.ms-Button-label.label-104');
        if (!btn || btn.length < 1) {
            window.opener.postMessage("missing dl button ", "https://doujinstyle.com/?p=home");
        } else if (!btn[0].innerHTML.match("Download")) {
            window.opener.postMessage("missing Download? ", "https://doujinstyle.com/?p=home");
        }
        window.close();
    }
} else if (match_chrule("anonfiles")) {
    window.opener.postMessage("anonfiles ", "https://doujinstyle.com/?p=home");
    err = /The file you are looking for does not exist!/;
    if (document.documentElement.innerHTML.match(err)) {
        window.opener.postMessage("file not found ", "https://doujinstyle.com/?p=home");
    }
    window.close();
} else if (match_chrule("mega.*\.nz")) {
    observer = new MutationObserver(resetTimer);
    timer = setTimeout(action, 2000, observer); // wait for the page to stay still for 1 seconds
    observer.observe(document, {childList: true, subtree: true});

    // reset timer every time something changes
    function resetTimer(changes, observer) {
        clearTimeout(timer);
        timer = setTimeout(action, 2000, observer);
    }

    function action(observer) {
        var i;
        observer.disconnect();

        //console.log(document.documentElement.innerHTML);
        let err = /class=\"download error-text main-transfer-error left\"/;
        window.opener.postMessage("Mega ", "https://doujinstyle.com/?p=home");
        if (document.documentElement.innerHTML.match(err))
            window.opener.postMessage("link is broken ", "https://doujinstyle.com/?p=home");
        err = document.getElementsByClassName("fm-empty-section fm-empty-folder-link");
        for (i = 0; i < err.length; i++) {
            if (!err[i].classList.contains("hidden")) {
                window.opener.postMessage("folder is empty ", "https://doujinstyle.com/?p=home");
                break;
            }
        }
        err = document.getElementsByClassName("fm-empty-section fm-empty-folder");
        for (i = 0; i < err.length; i++) {
            if (!err[i].classList.contains("hidden")) {
                window.opener.postMessage("folder is empty ", "https://doujinstyle.com/?p=home");
                break;
            }
        }
        err = document.getElementsByClassName("size");
        for (i = 0; i < err.length; i++) {
            console.log(err[i].innerHTML);
            if (err[i].innerHTML.localeCompare("0 B") == 0 ||
                err[i].innerHTML.localeCompare("0&nbsp;B") == 0) {
                window.opener.postMessage("suspicious size of 0B ", "https://doujinstyle.com/?p=home");
                break;
            }
        }
        window.close();
    }
} else if (match_chrule("drive\.google\.com")) {
    window.opener.postMessage("gdrive ", "https://doujinstyle.com/?p=home");
    var abtn = document.getElementById("request-access-button");
    if (abtn)
        window.opener.postMessage("bad perms ", "https://doujinstyle.com/?p=home");
    err = /403./;
    if (document.documentElement.innerHTML.match(err))
        window.opener.postMessage("403. ", "https://doujinstyle.com/?p=home");
    window.close();
} else if (match_chrule("mediafire")) {
    window.opener.postMessage("Mediafire ", "https://doujinstyle.com/?p=home");
    dlbtn = document.getElementById("downloadButton");
    err = /Download \([0-9]+\.?[0-9]+.+\)/;
    if (!dlbtn) {
        if (document.getElementById("myfilesCurrentFolderName")) {
            window.opener.postMessage("folder ", "https://doujinstyle.com/?p=home");
        } else
            window.opener.postMessage("no dl button", "https://doujinstyle.com/?p=home");
    } else if (!dlbtn.innerHTML.match(err))
        window.opener.postMessage("bad file", "https://doujinstyle.com/?p=home");
    window.close();
} else if (match_chrule("yandex")) {
    window.opener.postMessage("Yandex ", "https://doujinstyle.com/?p=home");
    err = /Button2 Button2_view_raised Button2_size_m download-button action-buttons__button action-buttons__button_download/;
    if (!document.documentElement.innerHTML.match(err))
        window.opener.postMessage("no dl button ", "https://doujinstyle.com/?p=home");
    window.close();
} else if (match_chrule("bandicamp")) {
    window.opener.postMessage("Bandicamp ", "https://doujinstyle.com/?p=home");
    window.close();
} else {
    if (window.opener) {
        window.opener.postMessage("unknown " + document.URL, "https://doujinstyle.com/?p=home");
        window.close();
    }
}
