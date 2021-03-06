describe('game/actions', function() {
	'use strict';

	var Board = require('../../multi/game/board');
	var actions = require('../../../shared/actions');
	var factions = require('../../../shared/factions');
	var board, player1, player2, player3, weakCard, strongCard, target;


	beforeEach(function() {

		player1 = {
			_id: 1,
			team: 1,
			hand: [],
			graveyard: [],
			cards: [],
			pride: 0
		};


		player2 = {
			_id: 2,
			team: 2,
			hand: [],
			graveyard: [],
			cards: [],
			pride: 0
		};


		player3 = {
			_id: 3,
			team: 2,
			hand: [],
			graveyard: [],
			cards: [],
			pride: 0
		};


		weakCard = {
			_id: 'cssf',
			attack: 1,
			health: 1,
			abilities: ['abom', 'tree'],
			moves: 1,
			shield: 0,
			pride: 1,
			hero: 0,
			attackBuf: 0
		};


		strongCard = {
			_id: 'bloop',
			attack: 9,
			health: 9,
			abilities: ['prci'],
			moves: 1,
			shield: 0,
			pride: 9,
			hero: 0,
			attackBuf: 0
		};


		board = new Board([player1, player2, player3], 4, 3);

		target = board.target;
	});





	//////////////////////////////////////////////////////////////////////////////////
	// global
	//////////////////////////////////////////////////////////////////////////////////

	it('attack should trade blows with another card', function() {
		target(1,0,0).card = strongCard;
		target(2,0,0).card = weakCard;
		actions.attk.use(target(1,0,0), target(2,0,0));
		expect(target(1,0,0).card.health).toBe(8);
		expect(target(2,0,0).card.health).toBe(-8);
	});


	it('move should move a card to an empty owned target', function() {
		target(1,0,0).card = strongCard;
		actions.move.use(target(1,0,0), target(1,1,1));
		expect(target(1,0,0).card).toBeFalsy();
		expect(target(1,1,1).card).toBe(strongCard);
	});


	it('rally should generate pride fot that cards owner', function() {
		target(1,0,0).card = strongCard;
		actions.rlly.use(target(1,0,0), player1);
		expect(player1.pride).toBe(1);
	});


	/*it('entr should put a card into play', function() {
		var handTarget = {
			card: strongCard,
			player: player1
		};
		player1.pride = 9;
		actions.entr.use(handTarget, target(1,0,0));
		expect(player1.pride).toBe(0);
	});*/


	describe('smmn', function() {

		it('should be able to play itself from a hand', function() {
			var commanderTarget = {
				card: {commander: true, abilities: ['smmn']},
				player: player1
			};
			var handTarget = {
				card: strongCard,
				player: player1
			};
			player1.pride = 9;
			actions.smmn.use(commanderTarget, handTarget, target(1,0,0));
			expect(player1.pride).toBe(0);
			expect(target(1,0,0).card).toBe(strongCard);
		});

		it('should be able to play a card from your hand', function() {
			var handTarget = {
				card: strongCard,
				player: player1
			};
			player1.pride = 9;
			target(1,1,0).card = {commander: true, abilities: ['smmn']}
			actions.smmn.use(target(1,1,0), handTarget, target(1,0,0));
			expect(player1.pride).toBe(0);
			expect(target(1,0,0).card).toBe(strongCard);
		});
	});


	//////////////////////////////////////////////////////////////////////////////////
	// ent
	//////////////////////////////////////////////////////////////////////////////////

	it('heal should increase health', function() {
		target(1,0,0).card = strongCard;
		target(1,1,0).card = weakCard;
		actions.heal.use(target(1,0,0), target(1,1,0));
		expect(target(1,1,0).card.health).toBe(2);
	});


	it('tree should grow a tree', function() {
		actions.tree.use(target(1,0,0), target(1,1,0));
		expect(target(1,1,0).card.title).toBe('TREE');
	});


	it('abom should join two cards together', function() {
		target(1,0,0).card = strongCard;
		target(1,3,0).card = weakCard;
		actions.abom.use(target(1,0,0), target(1,3,0));
		expect(target(1,3,0).card).toBeFalsy();
		expect(target(1,0,0).card.health).toBe(10);
		expect(target(1,0,0).card.attack).toBe(10);
		expect(target(1,0,0).card.abilities).toContain('abom', 'tree', 'prci')
	});


	it('secr should mark a card as tired', function() {
		strongCard.moves = 1;
		target(1,0,0).card = weakCard;
		target(2,0,0).card = strongCard;
		actions.secr.use(target(1,0,0), target(2,0,0));
		expect(target(2,0,0).card.moves).toBe(0);
	});


	it('clne should clone another card', function() {
		target(1,0,0).card = weakCard;
		target(1,1,0).card = strongCard;
		actions.clne.use(target(1,0,0), target(1,1,0));
		expect(target(1,0,0).card.abilities).toEqual(strongCard.abilities);
		expect(target(1,0,0).card.attack).toEqual(strongCard.health);
		expect(target(1,0,0).card.health).toEqual(1);
	});


	describe('bees', function() {
		it('should hurt all targets passed in', function() {
			target(1,0,0).card = weakCard;
			target(1,0,2).card = strongCard;
			actions.bees.use(target(2,0,0), target(1,0,2), board);
			expect(target(1,0,0).card.health).toBe(0);
			expect(target(1,0,2).card.health).toBe(8);
		});
	});



	////////////////////////////////////////////////////////////////////////////////////////////
	// machine
	////////////////////////////////////////////////////////////////////////////////////////////

	it('rbld should return a dead card to play with 1 health', function() {
		var machine = {
			name: 'Ratched',
			faction: factions.machine.id,
			health: 0
		}
		player1.graveyard.push(machine);

		target(1,1,0).card = strongCard;

		actions.rbld.use(target(1,1,0), target(1,0,0));

		expect(player1.graveyard.length).toBe(0);
		expect(target(1,0,0).card).toBe(machine);
		expect(target(1,0,0).card.health).toBe(1);
	});


	it('shld should protect a card for a turn', function() {
		target(1,0,0).card = weakCard;
		actions.shld.use(target(1,0,0));
		expect(target(1,0,0).card.shield).toEqual(1);
	});


	it('prci should decrease health', function() {
		target(1,0,0).card = weakCard;
		target(2,0,0).card = strongCard;
		actions.prci.use(target(1,0,0), target(2,0,0));
		expect(target(2,0,0).card.health).toBe(8);
		expect(target(1,0,0).card.health).toBe(-8);
	});


	it('strt should give a card another turn', function() {
		target(1,1,0).card = strongCard;
		target(1,0,0).card = weakCard;
		actions.strt.use(target(1,1,0), target(1,0,0));
		expect(target(1,0,0).card.moves).toBe(2);
	});


	it('netw should copy another targets abilities', function() {
		target(1,0,0).card = weakCard;
		target(1,1,0).card = strongCard;
		actions.netw.use(target(1,0,0), target(1,1,0));
		expect(target(1,0,0).card.abilities).toEqual(['abom', 'tree', 'prci']);
	});


	it('tran should switch health and attack', function() {
		var transCard = {
			attack: 5,
			health: 1
		};
		target(1,0,0).card = transCard;
		actions.tran.use(target(1,0,0));
		expect(target(1,0,0).card.attack).toBe(1);
		expect(target(1,0,0).card.health).toBe(5);
	});


	///////////////////////////////////////////////////////////////////////////////////////////
	// elite
	///////////////////////////////////////////////////////////////////////////////////////////

	describe('sduc', function() {

		it('should pull a card into your control', function() {
			target(1,1,0).card = strongCard;
			target(2,0,0).card = weakCard;
			actions.sduc.use(target(1,1,0), target(2,0,0), target(1,0,0));
			expect(target(2,0,0).card).toBeFalsy();
			expect(target(1,0,0).card).toBe(weakCard);
		});
	});


	it('assn should attack a card without reprocussions', function() {
		target(1,0,0).card = weakCard;
		target(2,0,0).card = strongCard;
		actions.assn.use(target(1,0,0), target(2,0,0));
		expect(target(1,0,0).card.health).toBe(1);
		expect(target(2,0,0).card.health).toBe(8);
	});


	it('delg should return a card to your hand and reimburse its pride cost', function() {
		target(1,0,0).card = weakCard;
		actions.delg.use(target(1,0,0), player1);
		expect(player1.hand[0]).toBe(weakCard);
		expect(player1.pride).toBe(1);
		expect(target(1,0,0).card).toBeFalsy();
	});


	it('posn should damage a card every turn', function() {
		var card = {
			poison: 0
		};
		target(1,0,0).card = strongCard;
		target(2,0,0).card = card;
		actions.posn.use(target(1,0,0), target(2,0,0));
		expect(card.poison).toBe(1);
		actions.posn.use(target(1,0,0), target(2,0,0));
		expect(card.poison).toBe(2);
	});


	it('bagm should return a card to its owners hand', function() {
		target(1,1,0).card = weakCard;
		target(1,0,0).card = strongCard;
		actions.bagm.use(target(1,1,0), target(1,0,0));
		expect(player1.hand[0]).toBe(strongCard);
		expect(target(1,0,0).card).toBeFalsy();
	});


	it('siph should suck health from one card and give it to another', function() {
		target(1,0,0).card = strongCard;
		target(2,0,0).card = weakCard;
		actions.siph.use(target(1,0,0), target(2,0,0));
		expect(target(1,0,0).card.health).toBe(10);
		expect(target(2,0,0).card.health).toBe(0);
	});


	/////////////////////////////////////////////////////////////////////////////////////////
	// zealot
	/////////////////////////////////////////////////////////////////////////////////////////

	it('male should hit up the ladies', function() {
		target(1,0,0).card = strongCard;
		target(1,1,0).card = weakCard;
		actions.male.use(target(1,0,0), target(1,1,0), target(1,0,1));
		expect(target(1,0,1).card.name).toBe('GROW TUBE');
	});


	it('feml should hit up the manlies', function() {
		target(1,0,0).card = strongCard;
		target(1,1,0).card = weakCard;
		actions.feml.use(target(1,0,0), target(1,1,0), target(1,0,1));
		expect(target(1,0,1).card.name).toBe('GROW TUBE');
	});


	it('grow should bring a baby to adulthood', function() {
		target(1,0,0).card = {
			parent: strongCard
		};
		actions.grow.use(target(1,0,0));
		expect(target(1,0,0).card).toEqual(strongCard);
	});


	it('btle should buff a cards attack', function() {
		var card = {
			attackBuf: 0
		};
		target(1,0,0).card = card;
		actions.btle.use(target(1,0,0));
		expect(card.attackBuf).toBe(2);
	});


	it('detr should take out any enemy while assuring defeat', function() {
		target(1,0,0).card = weakCard;
		target(2,0,0).card = strongCard;
		actions.detr.use(target(1,0,0), target(2,0,0));
		expect(target(1,0,0).card.health).toBe(0);
		expect(target(2,0,0).card.health).toBe(0);
	});


	it('hero should mark a card as the only available target', function() {
		var card = {
			hero: 0
		};
		target(1,0,0).card = card;
		actions.hero.use(target(1,0,0));
		expect(card.hero).toBe(1);
	});


	it('serm should turn 1 health into 2 attack', function() {
		target(1,0,0).card = strongCard;
		actions.serm.use(target(1,0,0));
		expect(strongCard.attack).toBe(11);
		expect(strongCard.health).toBe(8);
	});

});