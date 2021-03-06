describe('loadup', function() {

	var mongoose = require('mongoose');
	var mockgoose = require('mockgoose');
	mockgoose(mongoose);

	var DeckGoose = require('../../../models/deck');
	var CardGoose = require('../../../models/card');
	var Loadup = require('../../../multi/game/loadup');
	var Player = require('../../../multi/game/player');

	var player1;
	var player2;
	var players;
	var rules;


	beforeEach(function(done) {
		player1 = new Player({_id:mongoose.Types.ObjectId()});
		player2 = new Player({_id:mongoose.Types.ObjectId()});
		rules = {pride: 10};
		players = [player1, player2];

		DeckGoose.create({_id:'1-deck', userId:player1._id, name:'lotr', cards:['1-card','2-card']}, function(err1, deck){
			DeckGoose.create({_id:'2-deck', userId:player2._id, name:'puppies', cards:['1-card', '1-card', '2-card', '2-card']}, function(err2, deck){
				CardGoose.create({_id:'1-card', userId:player1._id, name:'Gandalf', attack:1, health:2, abilities:[]}, function(err3, deck){
					CardGoose.create({_id:'2-card', userId:player2._id, name:'Frodo', attack:1, health:1, abilities:[]}, function(err4, deck){
						done(err1 || err2 || err3 || err4);
					});
				});
			});
		});
	});


	afterEach(function() {
		mockgoose.reset();
	});


	it("should not to be able to load someone else's deck", function(done) {
		var loadup = new Loadup(players, rules, function(err, loadedplayers) {});

		var deckId = '2-deck';
		loadup.selectDeck(player1, deckId, function(err, deck) {
			expect(err).toBe('you do not own this deck');
			done();
		});
	});


	it('should not to be able to load more than one deck', function(done) {
		var loadup = new Loadup(players, rules, function(err, loadedplayers) {});

		var deckId = '1-deck';
		loadup.selectDeck(player1, deckId, function(err, deck) {
			expect(err).toBe(null);
			expect(deck).toBeTruthy();

			loadup.selectDeck(player1, deckId, function(err, deck) {
				expect(err).toBe('a deck was already loaded for you');
				done();
			});
		});
	});


	it('should not be able to load a deck with more pride than is allowed by the rules', function(done) {
		rules.pride = -5;
		var loadup = new Loadup( players, rules, function(err, loadedplayers) {});

		var deckId = '1-deck';
		loadup.selectDeck(player1, deckId, function(err, deck) {
			expect(err).toBe('this deck is too prideful');
			done();
		});
	});


	it('everyone loading their deck to trigger the callback', function(done) {
		var loadup = new Loadup(players, rules, function(err, loadedplayers) {
			expect(err).toBeNull();
			expect(loadedplayers.length).toBe(2);
			expect(player1.cards).not.toBeNull();
			done();
		});

		loadup.selectDeck(player1, '1-deck', function(err, deck) {
			expect(err).toBeNull();
		});
		loadup.selectDeck(player2, '2-deck', function(err, deck) {
			expect(err).toBeNull();
		});
	});


	it('deck loading to timeout', function(done) {
		rules.prepTime = .1;
		var loadup = new Loadup(players, rules, function(err, loadedplayers) {
			expect(err).toBeNull();
			expect(loadedplayers.length).toBe(2);
			done();
		});
	});
});