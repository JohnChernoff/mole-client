(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OAuth2AuthCodePKCE = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/**
 * An implementation of rfc6749#section-4.1 and rfc7636.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
;
;
;
/**
 * A list of OAuth2AuthCodePKCE errors.
 */
// To "namespace" all errors.
var ErrorOAuth2 = /** @class */ (function () {
    function ErrorOAuth2() {
    }
    ErrorOAuth2.prototype.toString = function () { return 'ErrorOAuth2'; };
    return ErrorOAuth2;
}());
exports.ErrorOAuth2 = ErrorOAuth2;
// For really unknown errors.
var ErrorUnknown = /** @class */ (function (_super) {
    __extends(ErrorUnknown, _super);
    function ErrorUnknown() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorUnknown.prototype.toString = function () { return 'ErrorUnknown'; };
    return ErrorUnknown;
}(ErrorOAuth2));
exports.ErrorUnknown = ErrorUnknown;
// Some generic, internal errors that can happen.
var ErrorNoAuthCode = /** @class */ (function (_super) {
    __extends(ErrorNoAuthCode, _super);
    function ErrorNoAuthCode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorNoAuthCode.prototype.toString = function () { return 'ErrorNoAuthCode'; };
    return ErrorNoAuthCode;
}(ErrorOAuth2));
exports.ErrorNoAuthCode = ErrorNoAuthCode;
var ErrorInvalidReturnedStateParam = /** @class */ (function (_super) {
    __extends(ErrorInvalidReturnedStateParam, _super);
    function ErrorInvalidReturnedStateParam() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorInvalidReturnedStateParam.prototype.toString = function () { return 'ErrorInvalidReturnedStateParam'; };
    return ErrorInvalidReturnedStateParam;
}(ErrorOAuth2));
exports.ErrorInvalidReturnedStateParam = ErrorInvalidReturnedStateParam;
var ErrorInvalidJson = /** @class */ (function (_super) {
    __extends(ErrorInvalidJson, _super);
    function ErrorInvalidJson() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorInvalidJson.prototype.toString = function () { return 'ErrorInvalidJson'; };
    return ErrorInvalidJson;
}(ErrorOAuth2));
exports.ErrorInvalidJson = ErrorInvalidJson;
// Errors that occur across many endpoints
var ErrorInvalidScope = /** @class */ (function (_super) {
    __extends(ErrorInvalidScope, _super);
    function ErrorInvalidScope() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorInvalidScope.prototype.toString = function () { return 'ErrorInvalidScope'; };
    return ErrorInvalidScope;
}(ErrorOAuth2));
exports.ErrorInvalidScope = ErrorInvalidScope;
var ErrorInvalidRequest = /** @class */ (function (_super) {
    __extends(ErrorInvalidRequest, _super);
    function ErrorInvalidRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorInvalidRequest.prototype.toString = function () { return 'ErrorInvalidRequest'; };
    return ErrorInvalidRequest;
}(ErrorOAuth2));
exports.ErrorInvalidRequest = ErrorInvalidRequest;
var ErrorInvalidToken = /** @class */ (function (_super) {
    __extends(ErrorInvalidToken, _super);
    function ErrorInvalidToken() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorInvalidToken.prototype.toString = function () { return 'ErrorInvalidToken'; };
    return ErrorInvalidToken;
}(ErrorOAuth2));
exports.ErrorInvalidToken = ErrorInvalidToken;
/**
 * Possible authorization grant errors given by the redirection from the
 * authorization server.
 */
var ErrorAuthenticationGrant = /** @class */ (function (_super) {
    __extends(ErrorAuthenticationGrant, _super);
    function ErrorAuthenticationGrant() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorAuthenticationGrant.prototype.toString = function () { return 'ErrorAuthenticationGrant'; };
    return ErrorAuthenticationGrant;
}(ErrorOAuth2));
exports.ErrorAuthenticationGrant = ErrorAuthenticationGrant;
var ErrorUnauthorizedClient = /** @class */ (function (_super) {
    __extends(ErrorUnauthorizedClient, _super);
    function ErrorUnauthorizedClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorUnauthorizedClient.prototype.toString = function () { return 'ErrorUnauthorizedClient'; };
    return ErrorUnauthorizedClient;
}(ErrorAuthenticationGrant));
exports.ErrorUnauthorizedClient = ErrorUnauthorizedClient;
var ErrorAccessDenied = /** @class */ (function (_super) {
    __extends(ErrorAccessDenied, _super);
    function ErrorAccessDenied() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorAccessDenied.prototype.toString = function () { return 'ErrorAccessDenied'; };
    return ErrorAccessDenied;
}(ErrorAuthenticationGrant));
exports.ErrorAccessDenied = ErrorAccessDenied;
var ErrorUnsupportedResponseType = /** @class */ (function (_super) {
    __extends(ErrorUnsupportedResponseType, _super);
    function ErrorUnsupportedResponseType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorUnsupportedResponseType.prototype.toString = function () { return 'ErrorUnsupportedResponseType'; };
    return ErrorUnsupportedResponseType;
}(ErrorAuthenticationGrant));
exports.ErrorUnsupportedResponseType = ErrorUnsupportedResponseType;
var ErrorServerError = /** @class */ (function (_super) {
    __extends(ErrorServerError, _super);
    function ErrorServerError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorServerError.prototype.toString = function () { return 'ErrorServerError'; };
    return ErrorServerError;
}(ErrorAuthenticationGrant));
exports.ErrorServerError = ErrorServerError;
var ErrorTemporarilyUnavailable = /** @class */ (function (_super) {
    __extends(ErrorTemporarilyUnavailable, _super);
    function ErrorTemporarilyUnavailable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorTemporarilyUnavailable.prototype.toString = function () { return 'ErrorTemporarilyUnavailable'; };
    return ErrorTemporarilyUnavailable;
}(ErrorAuthenticationGrant));
exports.ErrorTemporarilyUnavailable = ErrorTemporarilyUnavailable;
/**
 * A list of possible access token response errors.
 */
var ErrorAccessTokenResponse = /** @class */ (function (_super) {
    __extends(ErrorAccessTokenResponse, _super);
    function ErrorAccessTokenResponse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorAccessTokenResponse.prototype.toString = function () { return 'ErrorAccessTokenResponse'; };
    return ErrorAccessTokenResponse;
}(ErrorOAuth2));
exports.ErrorAccessTokenResponse = ErrorAccessTokenResponse;
var ErrorInvalidClient = /** @class */ (function (_super) {
    __extends(ErrorInvalidClient, _super);
    function ErrorInvalidClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorInvalidClient.prototype.toString = function () { return 'ErrorInvalidClient'; };
    return ErrorInvalidClient;
}(ErrorAccessTokenResponse));
exports.ErrorInvalidClient = ErrorInvalidClient;
var ErrorInvalidGrant = /** @class */ (function (_super) {
    __extends(ErrorInvalidGrant, _super);
    function ErrorInvalidGrant() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorInvalidGrant.prototype.toString = function () { return 'ErrorInvalidGrant'; };
    return ErrorInvalidGrant;
}(ErrorAccessTokenResponse));
exports.ErrorInvalidGrant = ErrorInvalidGrant;
var ErrorUnsupportedGrantType = /** @class */ (function (_super) {
    __extends(ErrorUnsupportedGrantType, _super);
    function ErrorUnsupportedGrantType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorUnsupportedGrantType.prototype.toString = function () { return 'ErrorUnsupportedGrantType'; };
    return ErrorUnsupportedGrantType;
}(ErrorAccessTokenResponse));
exports.ErrorUnsupportedGrantType = ErrorUnsupportedGrantType;
/**
 * WWW-Authenticate error object structure for less error prone handling.
 */
var ErrorWWWAuthenticate = /** @class */ (function () {
    function ErrorWWWAuthenticate() {
        this.realm = "";
        this.error = "";
    }
    return ErrorWWWAuthenticate;
}());
exports.ErrorWWWAuthenticate = ErrorWWWAuthenticate;
exports.RawErrorToErrorClassMap = {
    invalid_request: ErrorInvalidRequest,
    invalid_grant: ErrorInvalidGrant,
    unauthorized_client: ErrorUnauthorizedClient,
    access_denied: ErrorAccessDenied,
    unsupported_response_type: ErrorUnsupportedResponseType,
    invalid_scope: ErrorInvalidScope,
    server_error: ErrorServerError,
    temporarily_unavailable: ErrorTemporarilyUnavailable,
    invalid_client: ErrorInvalidClient,
    unsupported_grant_type: ErrorUnsupportedGrantType,
    invalid_json: ErrorInvalidJson,
    invalid_token: ErrorInvalidToken,
};
/**
 * Translate the raw error strings returned from the server into error classes.
 */
function toErrorClass(rawError) {
    return new (exports.RawErrorToErrorClassMap[rawError] || ErrorUnknown)();
}
exports.toErrorClass = toErrorClass;
/**
 * A convience function to turn, for example, `Bearer realm="bity.com",
 * error="invalid_client"` into `{ realm: "bity.com", error: "invalid_client"
 * }`.
 */
function fromWWWAuthenticateHeaderStringToObject(a) {
    var obj = a
        .slice("Bearer ".length)
        .replace(/"/g, '')
        .split(', ')
        .map(function (tokens) {
        var _a;
        var _b = tokens.split('='), k = _b[0], v = _b[1];
        return _a = {}, _a[k] = v, _a;
    })
        .reduce(function (a, c) { return (__assign(__assign({}, a), c)); }, {});
    return { realm: obj.realm, error: obj.error };
}
exports.fromWWWAuthenticateHeaderStringToObject = fromWWWAuthenticateHeaderStringToObject;
/**
 * HTTP headers that we need to access.
 */
var HEADER_AUTHORIZATION = "Authorization";
var HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";
/**
 * To store the OAuth client's data between websites due to redirection.
 */
exports.LOCALSTORAGE_ID = "oauth2authcodepkce";
exports.LOCALSTORAGE_STATE = exports.LOCALSTORAGE_ID + "-state";
/**
 * The maximum length for a code verifier for the best security we can offer.
 * Please note the NOTE section of RFC 7636 § 4.1 - the length must be >= 43,
 * but <= 128, **after** base64 url encoding. This means 32 code verifier bytes
 * encoded will be 43 bytes, or 96 bytes encoded will be 128 bytes. So 96 bytes
 * is the highest valid value that can be used.
 */
exports.RECOMMENDED_CODE_VERIFIER_LENGTH = 96;
/**
 * A sensible length for the state's length, for anti-csrf.
 */
exports.RECOMMENDED_STATE_LENGTH = 32;
/**
 * Character set to generate code verifier defined in rfc7636.
 */
var PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
/**
 * OAuth 2.0 client that ONLY supports authorization code flow, with PKCE.
 *
 * Many applications structure their OAuth usage in different ways. This class
 * aims to provide both flexible and easy ways to use this configuration of
 * OAuth.
 *
 * See `example.ts` for how you'd typically use this.
 *
 * For others, review this class's methods.
 */
var OAuth2AuthCodePKCE = /** @class */ (function () {
    function OAuth2AuthCodePKCE(config) {
        this.state = {};
        this.config = config;
        this.recoverState();
        return this;
    }
    /**
     * Attach the OAuth logic to all fetch requests and translate errors (either
     * returned as json or through the WWW-Authenticate header) into nice error
     * classes.
     */
    OAuth2AuthCodePKCE.prototype.decorateFetchHTTPClient = function (fetch) {
        var _this = this;
        return function (url, config) {
            var rest = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                rest[_i - 2] = arguments[_i];
            }
            if (!_this.state.isHTTPDecoratorActive) {
                return fetch.apply(void 0, __spreadArrays([url, config], rest));
            }
            return _this
                .getAccessToken()
                .then(function (_a) {
                var token = _a.token;
                var configNew = Object.assign({}, config);
                if (!configNew.headers) {
                    configNew.headers = {};
                }
                configNew.headers[HEADER_AUTHORIZATION] = "Bearer " + token.value;
                return fetch.apply(void 0, __spreadArrays([url, configNew], rest));
            })
                .then(function (res) {
                if (res.ok) {
                    return res;
                }
                if (!res.headers.has(HEADER_WWW_AUTHENTICATE.toLowerCase())) {
                    return res;
                }
                var error = toErrorClass(fromWWWAuthenticateHeaderStringToObject(res.headers.get(HEADER_WWW_AUTHENTICATE.toLowerCase())).error);
                if (error instanceof ErrorInvalidToken) {
                    _this.config
                        .onAccessTokenExpiry(function () { return _this.exchangeRefreshTokenForAccessToken(); });
                }
                return Promise.reject(error);
            });
        };
    };
    /**
     * If there is an error, it will be passed back as a rejected Promise.
     * If there is no code, the user should be redirected via
     * [fetchAuthorizationCode].
     */
    OAuth2AuthCodePKCE.prototype.isReturningFromAuthServer = function () {
        var error = OAuth2AuthCodePKCE.extractParamFromUrl(location.href, 'error');
        if (error) {
            return Promise.reject(toErrorClass(error));
        }
        var code = OAuth2AuthCodePKCE.extractParamFromUrl(location.href, 'code');
        if (!code) {
            return Promise.resolve(false);
        }
        var state = JSON.parse(localStorage.getItem(exports.LOCALSTORAGE_STATE) || '{}');
        var stateQueryParam = OAuth2AuthCodePKCE.extractParamFromUrl(location.href, 'state');
        if (stateQueryParam !== state.stateQueryParam) {
            console.warn("state query string parameter doesn't match the one sent! Possible malicious activity somewhere.");
            return Promise.reject(new ErrorInvalidReturnedStateParam());
        }
        state.authorizationCode = code;
        state.hasAuthCodeBeenExchangedForAccessToken = false;
        localStorage.setItem(exports.LOCALSTORAGE_STATE, JSON.stringify(state));
        this.setState(state);
        return Promise.resolve(true);
    };
    /**
     * Fetch an authorization grant via redirection. In a sense this function
     * doesn't return because of the redirect behavior (uses `location.replace`).
     *
     * @param oneTimeParams A way to specify "one time" used query string
     * parameters during the authorization code fetching process, usually for
     * values which need to change at run-time.
     */
    OAuth2AuthCodePKCE.prototype.fetchAuthorizationCode = function (oneTimeParams) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, clientId, extraAuthorizationParams, redirectUrl, scopes, _b, codeChallenge, codeVerifier, stateQueryParam, url, extraParameters;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.assertStateAndConfigArePresent();
                        _a = this.config, clientId = _a.clientId, extraAuthorizationParams = _a.extraAuthorizationParams, redirectUrl = _a.redirectUrl, scopes = _a.scopes;
                        return [4 /*yield*/, OAuth2AuthCodePKCE
                                .generatePKCECodes()];
                    case 1:
                        _b = _c.sent(), codeChallenge = _b.codeChallenge, codeVerifier = _b.codeVerifier;
                        stateQueryParam = OAuth2AuthCodePKCE
                            .generateRandomState(exports.RECOMMENDED_STATE_LENGTH);
                        this.state = __assign(__assign({}, this.state), { codeChallenge: codeChallenge,
                            codeVerifier: codeVerifier,
                            stateQueryParam: stateQueryParam, isHTTPDecoratorActive: true });
                        localStorage.setItem(exports.LOCALSTORAGE_STATE, JSON.stringify(this.state));
                        url = this.config.authorizationUrl
                            + "?response_type=code&"
                            + ("client_id=" + encodeURIComponent(clientId) + "&")
                            + ("redirect_uri=" + encodeURIComponent(redirectUrl) + "&")
                            + ("scope=" + encodeURIComponent(scopes.join(' ')) + "&")
                            + ("state=" + stateQueryParam + "&")
                            + ("code_challenge=" + encodeURIComponent(codeChallenge) + "&")
                            + "code_challenge_method=S256";
                        if (extraAuthorizationParams || oneTimeParams) {
                            extraParameters = __assign(__assign({}, extraAuthorizationParams), oneTimeParams);
                            url = url + "&" + OAuth2AuthCodePKCE.objectToQueryString(extraParameters);
                        }
                        location.replace(url);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tries to get the current access token. If there is none
     * it will fetch another one. If it is expired, it will fire
     * [onAccessTokenExpiry] but it's up to the user to call the refresh token
     * function. This is because sometimes not using the refresh token facilities
     * is easier.
     */
    OAuth2AuthCodePKCE.prototype.getAccessToken = function () {
        var _this = this;
        this.assertStateAndConfigArePresent();
        var onAccessTokenExpiry = this.config.onAccessTokenExpiry;
        var _a = this.state, accessToken = _a.accessToken, authorizationCode = _a.authorizationCode, explicitlyExposedTokens = _a.explicitlyExposedTokens, hasAuthCodeBeenExchangedForAccessToken = _a.hasAuthCodeBeenExchangedForAccessToken, refreshToken = _a.refreshToken, scopes = _a.scopes;
        if (!authorizationCode) {
            return Promise.reject(new ErrorNoAuthCode());
        }
        if (this.authCodeForAccessTokenRequest) {
            return this.authCodeForAccessTokenRequest;
        }
        if (!this.isAuthorized() || !hasAuthCodeBeenExchangedForAccessToken) {
            this.authCodeForAccessTokenRequest = this.exchangeAuthCodeForAccessToken();
            return this.authCodeForAccessTokenRequest;
        }
        // Depending on the server (and config), refreshToken may not be available.
        if (refreshToken && this.isAccessTokenExpired()) {
            return onAccessTokenExpiry(function () { return _this.exchangeRefreshTokenForAccessToken(); });
        }
        return Promise.resolve({
            token: accessToken,
            explicitlyExposedTokens: explicitlyExposedTokens,
            scopes: scopes,
            refreshToken: refreshToken
        });
    };
    /**
     * Refresh an access token from the remote service.
     */
    OAuth2AuthCodePKCE.prototype.exchangeRefreshTokenForAccessToken = function () {
        var _this = this;
        var _a;
        this.assertStateAndConfigArePresent();
        var _b = this.config, extraRefreshParams = _b.extraRefreshParams, clientId = _b.clientId, tokenUrl = _b.tokenUrl;
        var refreshToken = this.state.refreshToken;
        if (!refreshToken) {
            console.warn('No refresh token is present.');
        }
        var url = tokenUrl;
        var body = "grant_type=refresh_token&"
            + ("refresh_token=" + ((_a = refreshToken) === null || _a === void 0 ? void 0 : _a.value) + "&")
            + ("client_id=" + clientId);
        if (extraRefreshParams) {
            body = url + "&" + OAuth2AuthCodePKCE.objectToQueryString(extraRefreshParams);
        }
        return fetch(url, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(function (res) { return res.status >= 400 ? res.json().then(function (data) { return Promise.reject(data); }) : res.json(); })
            .then(function (json) {
            var access_token = json.access_token, expires_in = json.expires_in, refresh_token = json.refresh_token, scope = json.scope;
            var explicitlyExposedTokens = _this.config.explicitlyExposedTokens;
            var scopes = [];
            var tokensToExpose = {};
            var accessToken = {
                value: access_token,
                expiry: (new Date(Date.now() + (parseInt(expires_in) * 1000))).toString()
            };
            _this.state.accessToken = accessToken;
            if (refresh_token) {
                var refreshToken_1 = {
                    value: refresh_token
                };
                _this.state.refreshToken = refreshToken_1;
            }
            if (explicitlyExposedTokens) {
                tokensToExpose = Object.fromEntries(explicitlyExposedTokens
                    .map(function (tokenName) { return [tokenName, json[tokenName]]; })
                    .filter(function (_a) {
                    var _ = _a[0], tokenValue = _a[1];
                    return tokenValue !== undefined;
                }));
                _this.state.explicitlyExposedTokens = tokensToExpose;
            }
            if (scope) {
                // Multiple scopes are passed and delimited by spaces,
                // despite using the singular name "scope".
                scopes = scope.split(' ');
                _this.state.scopes = scopes;
            }
            localStorage.setItem(exports.LOCALSTORAGE_STATE, JSON.stringify(_this.state));
            var accessContext = { token: accessToken, scopes: scopes };
            if (explicitlyExposedTokens) {
                accessContext.explicitlyExposedTokens = tokensToExpose;
            }
            return accessContext;
        })
            .catch(function (data) {
            var onInvalidGrant = _this.config.onInvalidGrant;
            var error = data.error || 'There was a network error.';
            switch (error) {
                case 'invalid_grant':
                    onInvalidGrant(function () { return _this.fetchAuthorizationCode(); });
                    break;
                default:
                    break;
            }
            return Promise.reject(toErrorClass(error));
        });
    };
    /**
     * Get the scopes that were granted by the authorization server.
     */
    OAuth2AuthCodePKCE.prototype.getGrantedScopes = function () {
        return this.state.scopes;
    };
    /**
     * Signals if OAuth HTTP decorating should be active or not.
     */
    OAuth2AuthCodePKCE.prototype.isHTTPDecoratorActive = function (isActive) {
        this.state.isHTTPDecoratorActive = isActive;
        localStorage.setItem(exports.LOCALSTORAGE_STATE, JSON.stringify(this.state));
    };
    /**
     * Tells if the client is authorized or not. This means the client has at
     * least once successfully fetched an access token. The access token could be
     * expired.
     */
    OAuth2AuthCodePKCE.prototype.isAuthorized = function () {
        return !!this.state.accessToken;
    };
    /**
     * Checks to see if the access token has expired.
     */
    OAuth2AuthCodePKCE.prototype.isAccessTokenExpired = function () {
        var accessToken = this.state.accessToken;
        return Boolean(accessToken && (new Date()) >= (new Date(accessToken.expiry)));
    };
    /**
     * Resets the state of the client. Equivalent to "logging out" the user.
     */
    OAuth2AuthCodePKCE.prototype.reset = function () {
        this.setState({});
        this.authCodeForAccessTokenRequest = undefined;
    };
    /**
     * If the state or config are missing, it means the client is in a bad state.
     * This should never happen, but the check is there just in case.
     */
    OAuth2AuthCodePKCE.prototype.assertStateAndConfigArePresent = function () {
        if (!this.state || !this.config) {
            console.error('state:', this.state, 'config:', this.config);
            throw new Error('state or config is not set.');
        }
    };
    /**
     * Fetch an access token from the remote service. You may pass a custom
     * authorization grant code for any reason, but this is non-standard usage.
     */
    OAuth2AuthCodePKCE.prototype.exchangeAuthCodeForAccessToken = function (codeOverride) {
        var _this = this;
        this.assertStateAndConfigArePresent();
        var _a = this.state, _b = _a.authorizationCode, authorizationCode = _b === void 0 ? codeOverride : _b, _c = _a.codeVerifier, codeVerifier = _c === void 0 ? '' : _c;
        var _d = this.config, clientId = _d.clientId, onInvalidGrant = _d.onInvalidGrant, redirectUrl = _d.redirectUrl;
        if (!codeVerifier) {
            console.warn('No code verifier is being sent.');
        }
        else if (!authorizationCode) {
            console.warn('No authorization grant code is being passed.');
        }
        var url = this.config.tokenUrl;
        var body = "grant_type=authorization_code&"
            + ("code=" + encodeURIComponent(authorizationCode || '') + "&")
            + ("redirect_uri=" + encodeURIComponent(redirectUrl) + "&")
            + ("client_id=" + encodeURIComponent(clientId) + "&")
            + ("code_verifier=" + codeVerifier);
        return fetch(url, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(function (res) {
            var jsonPromise = res.json()
                .catch(function (_) { return ({ error: 'invalid_json' }); });
            if (!res.ok) {
                return jsonPromise.then(function (_a) {
                    var error = _a.error;
                    switch (error) {
                        case 'invalid_grant':
                            onInvalidGrant(function () { return _this.fetchAuthorizationCode(); });
                            break;
                        default:
                            break;
                    }
                    return Promise.reject(toErrorClass(error));
                });
            }
            return jsonPromise.then(function (json) {
                var access_token = json.access_token, expires_in = json.expires_in, refresh_token = json.refresh_token, scope = json.scope;
                var explicitlyExposedTokens = _this.config.explicitlyExposedTokens;
                var scopes = [];
                var tokensToExpose = {};
                _this.state.hasAuthCodeBeenExchangedForAccessToken = true;
                _this.authCodeForAccessTokenRequest = undefined;
                var accessToken = {
                    value: access_token,
                    expiry: (new Date(Date.now() + (parseInt(expires_in) * 1000))).toString()
                };
                _this.state.accessToken = accessToken;
                if (refresh_token) {
                    var refreshToken = {
                        value: refresh_token
                    };
                    _this.state.refreshToken = refreshToken;
                }
                if (explicitlyExposedTokens) {
                    tokensToExpose = Object.fromEntries(explicitlyExposedTokens
                        .map(function (tokenName) { return [tokenName, json[tokenName]]; })
                        .filter(function (_a) {
                        var _ = _a[0], tokenValue = _a[1];
                        return tokenValue !== undefined;
                    }));
                    _this.state.explicitlyExposedTokens = tokensToExpose;
                }
                if (scope) {
                    // Multiple scopes are passed and delimited by spaces,
                    // despite using the singular name "scope".
                    scopes = scope.split(' ');
                    _this.state.scopes = scopes;
                }
                localStorage.setItem(exports.LOCALSTORAGE_STATE, JSON.stringify(_this.state));
                var accessContext = { token: accessToken, scopes: scopes };
                if (explicitlyExposedTokens) {
                    accessContext.explicitlyExposedTokens = tokensToExpose;
                }
                return accessContext;
            });
        });
    };
    OAuth2AuthCodePKCE.prototype.recoverState = function () {
        this.state = JSON.parse(localStorage.getItem(exports.LOCALSTORAGE_STATE) || '{}');
        return this;
    };
    OAuth2AuthCodePKCE.prototype.setState = function (state) {
        this.state = state;
        localStorage.setItem(exports.LOCALSTORAGE_STATE, JSON.stringify(state));
        return this;
    };
    /**
     * Implements *base64url-encode* (RFC 4648 § 5) without padding, which is NOT
     * the same as regular base64 encoding.
     */
    OAuth2AuthCodePKCE.base64urlEncode = function (value) {
        var base64 = btoa(value);
        base64 = base64.replace(/\+/g, '-');
        base64 = base64.replace(/\//g, '_');
        base64 = base64.replace(/=/g, '');
        return base64;
    };
    /**
     * Extracts a query string parameter.
     */
    OAuth2AuthCodePKCE.extractParamFromUrl = function (url, param) {
        var queryString = url.split('?');
        if (queryString.length < 2) {
            return '';
        }
        // Account for hash URLs that SPAs usually use.
        queryString = queryString[1].split('#');
        var parts = queryString[0]
            .split('&')
            .reduce(function (a, s) { return a.concat(s.split('=')); }, []);
        if (parts.length < 2) {
            return '';
        }
        var paramIdx = parts.indexOf(param);
        return decodeURIComponent(paramIdx >= 0 ? parts[paramIdx + 1] : '');
    };
    /**
     * Converts the keys and values of an object to a url query string
     */
    OAuth2AuthCodePKCE.objectToQueryString = function (dict) {
        return Object.entries(dict).map(function (_a) {
            var key = _a[0], val = _a[1];
            return key + "=" + encodeURIComponent(val);
        }).join('&');
    };
    /**
     * Generates a code_verifier and code_challenge, as specified in rfc7636.
     */
    OAuth2AuthCodePKCE.generatePKCECodes = function () {
        var output = new Uint32Array(exports.RECOMMENDED_CODE_VERIFIER_LENGTH);
        crypto.getRandomValues(output);
        var codeVerifier = OAuth2AuthCodePKCE.base64urlEncode(Array
            .from(output)
            .map(function (num) { return PKCE_CHARSET[num % PKCE_CHARSET.length]; })
            .join(''));
        return crypto
            .subtle
            .digest('SHA-256', (new TextEncoder()).encode(codeVerifier))
            .then(function (buffer) {
            var hash = new Uint8Array(buffer);
            var binary = '';
            var hashLength = hash.byteLength;
            for (var i = 0; i < hashLength; i++) {
                binary += String.fromCharCode(hash[i]);
            }
            return binary;
        })
            .then(OAuth2AuthCodePKCE.base64urlEncode)
            .then(function (codeChallenge) { return ({ codeChallenge: codeChallenge, codeVerifier: codeVerifier }); });
    };
    /**
     * Generates random state to be passed for anti-csrf.
     */
    OAuth2AuthCodePKCE.generateRandomState = function (lengthOfState) {
        var output = new Uint32Array(lengthOfState);
        crypto.getRandomValues(output);
        return Array
            .from(output)
            .map(function (num) { return PKCE_CHARSET[num % PKCE_CHARSET.length]; })
            .join('');
    };
    return OAuth2AuthCodePKCE;
}());
exports.OAuth2AuthCodePKCE = OAuth2AuthCodePKCE;

},{}]},{},[1])(1)
});
