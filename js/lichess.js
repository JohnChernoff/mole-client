//import { AccessContext, HttpClient, OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';

class LichessLogger {
    constructor(host,clientId,scopes) {
        this.clientUrl = (() => {
            const url = new URL(location.href);
            url.search = '';
            return url.href;
        })();
        this.oauth = new OAuth2AuthCodePKCE({
            authorizationUrl: `${host}/oauth`,
            tokenUrl: `${host}/api/token`,
            clientId,
            scopes: [scopes],
            redirectUrl: this.clientUrl, //"http:molechess.com", //
            onAccessTokenExpiry: refreshAccessToken => refreshAccessToken(),
            onInvalidGrant: _retry => {
            },
        });
        this.error;
        this.accessContext;
    }

    async login() { // Redirect to authentication prompt.
        await this.oauth.fetchAuthorizationCode();
    }

    async init() {
        try {
            const hasAuthCode = await this.oauth.isReturningFromAuthServer();
            if (hasAuthCode) {
                // Might want to persist accessContext.token until the user logs out.
                this.accessContext = await this.oauth.getAccessToken();
            }
        } catch (err) {
            this.error = err;
        }
    }

    async logout() {
        const token = this.accessContext?.token?.value;
        this.accessContext = undefined;
        this.error = undefined;
        // Example request using vanilla fetch: Revoke access token.
        await fetch(`${lichessHost}/api/token`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    setCookie(cname, cvalue, exdays) {
        let d = new Date(); if (exdays == undefined) exdays = 365;
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

}