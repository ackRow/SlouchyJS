
class AccountManager {
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
	     	//console.log('/me', err, result);
	      if (!err) {
	      	this.account = result.account;
	      	this.hasLoggedIn = true;
	      }
	      

			}.bind(this));
		}
		callback(this);
		/* else {
			callback(this);
		}*/
	}

}