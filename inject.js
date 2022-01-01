class TestFairyCopyLink {
    downloadLinkButtonElement;
    downloadLinkTextElement;
    downloadLinkButtonSelector = '.app-block-content .button';
    downloadLinkTextSelector = '.app-block-content .button div';
    copyLinkButtonClass = 'copy-link';
    copyLinkButtonCopiedClass = 'copied';
    copyUrl;

    constructor() {
        this.init();
    }

    getLink() {
        return new Promise((resolve, reject) => {
            let globalVariables;
            document.body.querySelectorAll('script').forEach(s => {
                if (s.innerHTML.includes('downloadUrl')) {
                    globalVariables = s.innerText
                }
            })


            const start = globalVariables.indexOf('\"downloadUrl\":\"') + 15;
            const end = globalVariables.indexOf('\",\"issue\":')
            const downloadUrl = globalVariables.substring(start, end);

            const isAndroid = downloadUrl.includes('testfairy.apk');
            if (isAndroid) {
                return resolve(downloadUrl);
            }
            // ios 
            const ios_start = downloadUrl.indexOf('&url=') + 5;
            let downloadUrIOS = downloadUrl.substring(ios_start, downloadUrl.length);


            downloadUrIOS = downloadUrIOS.replace('https://dl.', 'https://my.');

            const iframe = document.createElement('iframe');
            iframe.id = 'tf_iframe';
            iframe.src = downloadUrIOS;
            iframe.width = 0;
            iframe.height = 0;
            iframe.style = 'display:none;';
            document.body.appendChild(iframe);
            iframe.onload = () => {
                const installationLink = iframe.contentDocument.documentElement.querySelectorAll('string')[1].textContent;
                iframe.remove();
                return resolve(installationLink);
            }
        })
    }

    copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            return window.clipboardData.setData("Text", text);

        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            const textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy"); // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    appendStyle() {
        const styleNode = document.createElement("style");
        document.head.appendChild(styleNode);
        styleNode.innerHTML = `
            ${this.downloadLinkButtonSelector} { min-width: 150px; margin-bottom: 5px;}
            ${this.downloadLinkTextSelector} { float: none; }
            .${this.copyLinkButtonClass} { cursor: pointer; }
            .${this.copyLinkButtonClass}:not(.${this.copyLinkButtonCopiedClass}) .copied-state { display: none }
            .${this.copyLinkButtonCopiedClass} { cursor: default; }
            .${this.copyLinkButtonCopiedClass} .cta { display: none;}

        `
    }

    appendLink() {
        return new Promise((resolve, reject) => {
            // Get the reference element
            this.downloadLinkButtonElement = document.querySelector(this.downloadLinkButtonSelector);
            this.downloadLinkTextElement = document.querySelector(this.downloadLinkTextSelector);
            if (!this.downloadLinkButtonElement || !this.downloadLinkTextElement) {
                return reject();
            };

            // Create a new, plain <span> element
            const el = document.createElement("div")
            el.innerHTML = `
                <a class="${this.downloadLinkButtonElement.className} ${this.copyLinkButtonClass}">
                    <div class="${this.downloadLinkTextElement.className}">
                        <span class="cta">Copy Link</span>
                        <span class="copied-state">Copied!</span>
                    </div>
                </a>`;


            // Get the parent element
            const parentDiv = this.downloadLinkButtonElement.parentNode

            // Insert the new element into before sp2
            parentDiv.insertBefore(el, this.downloadLinkButtonElement);
            resolve();
        });
    }

    initListener() {
        const button = document.querySelector(`.${this.copyLinkButtonClass}`);
        button.addEventListener("click", () => {
            this.copyToClipboard(this.copyUrl);
            button.classList.add(this.copyLinkButtonCopiedClass);
            setTimeout(() => button.classList.remove(this.copyLinkButtonCopiedClass), 1500)
        });
    }

    init() {
        this.getLink()
            .then(downloadUrl => {
                this.copyUrl = downloadUrl;
                this.appendStyle();
                this.appendLink()
                    .then(() => this.initListener())
            })
    }
}

new TestFairyCopyLink();