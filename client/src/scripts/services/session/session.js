angular.module('futurism')
	.factory('session', function($location, websites, me, SessionResource, memory, _) {
		'use strict';

		var self = this;
		var active = false;
		var sitesToTry = ['j'];
		var tempCredentials;


		self.makeNew = _.throttle(function(callback) {
			if(!callback) {
				callback = function() {};
			}

			checkLogins(function(err) {
				if(err) {
					tempCredentials = {site: 'g'};
				}

				authorizeLogin(function(err, data) {
					if(err) {
						return callback(err);
					}

					active = true;
					setToken(data.token);
					me.setUserId(data._id);
					return callback(null, data);
				});
			});
		}, 5000);


		self.destroy = function() {
			SessionResource.delete({token: self.getToken()});
			setToken(null);
			active = false;
			me.clear();
		};


		self.renew = _.throttle(function(callback) {
			var token = self.getToken();

			if(!callback) {
				callback = function() {};
			}
			if(!token) {
				return self.makeNew(callback);
			}

			return SessionResource.get(

				function(data) {
					if(data.error) {
						return self.makeNew(callback);
					}
					active = true;
					me.setUserId(data._id);
					return callback(null, data);
				},

				function() {
					return self.makeNew(callback);
				}
			);
		}, 5000, {leading: true, trailing: false});


		self.getToken = function() {
			var token = memory.short.get('token');
			return token;
		};


		var setToken = function(newToken) {
			memory.short.set('token', newToken);
		};


		var checkLogins = function(callback) {
			var i = 0;

			var checkNext = function() {
				if(i >= sitesToTry.length) {
					return callback('not logged into these sites: '+sitesToTry.join(','));
				}

				var site = sitesToTry[i];
				i++;

				var lookupFn = websites.lookup[site].loginFn;
				return lookupFn(checkResult);
			};

			var checkResult = function(error, tempCred) {
				if(error) {
					return checkNext();
				}
				tempCredentials = tempCred;
				return callback(null);
			};

			checkNext();
		};


		var authorizeLogin = function(callback) {
			SessionResource.post(tempCredentials, function(data) {
				if(data.error) {
					return callback(data.error);
				}
				return callback(null, data);
			});
		};


		return self;
	});