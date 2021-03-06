angular.module('futurism')
	.directive('summonAnim', function(_, $, $timeout, animFns) {
		'use strict';


		return {
			restrict: 'A',
			link: function(scope, boardElement) {


				scope.$on('post:male', function(srcScope, update) {
					anim(update, 'summon-sex');
				});


				scope.$on('post:feml', function(srcScope, update) {
					anim(update, 'summon-sex');
				});


				scope.$on('post:smmn', function(srcScope, update) {
					anim(update, '');
				});



				var anim = function(update, cssClass) {


					_.delay(function() {


						// get positions
						var chain = animFns.chainedAnimTargets(update, update.data);
						var src = chain[0] || chain[2];
						var dest = chain[2];


						// hide the new card for a bit
						dest.elem.addClass('target-hidden');
						_.delay(function() {
							dest.elem.removeClass('target-hidden');
						}, 1000);


						// make the swirly animation
						var effect = $('<div class="summon-effect '+cssClass+'"><div class="effect"></div><div class="effect"></div></div>');
						effect.css({left: src.center.x, top: src.center.y});
						effect.animate({left: dest.center.x, top: dest.center.y});
						boardElement.append(effect);

						$timeout(function() {
							effect.remove();
						}, 2000);
					});


				};


			}
		};
	});