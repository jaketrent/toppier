define(['Contender'], function (contender) {

  function commence(h, e) {
    var hero = contender.Contender(h);
    var enemy = contender.Contender(e);

    var winner = round(enemy, hero);
  }

  function round(offender, defender) {
    if (offender.isDefeated()) {
      return defender;
    } else if (defender.isDefeated()) {
      return offender;
    } else {
      defender.defend(offender.attack());
      return round(defender, offender);
    }
  }

  return {
    commence: commence
  }
})