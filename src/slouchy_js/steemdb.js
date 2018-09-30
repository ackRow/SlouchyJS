/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

// Store Steem Account Information
class AccountManager {
	// Uses steemconnectv2 api
	constructor(api){
		this.api = api;
		this.account = {};
		this.hasLoggedIn = false;
	}

	getId() {
		if(this.hasLoggedIn)
			return this.account.id;
		return -1;
	}

	HasLoggedIn() {
		return this.hasLoggedIn;
	}

	loginUrl() {
		return this.api.getLoginURL();
	}

	logout(callback) {
		this.api.revokeToken(function (err, result) {
			this.account = {};
			this.hasLoggedIn = false;
			callback(this);
		}.bind(this));
	}

	retrieveUserInfo(params, callback){
		if(params.get("access_token") != null){

			this.api.setAccessToken(params.get("access_token"));
			this.api.me(function (err, result) {
	      if (!err) {
	      	this.account = result.account;
	      	this.hasLoggedIn = true;
	      	callback(this);
	      }
			}.bind(this));
		} else {
			callback(this);
		}
	}

}