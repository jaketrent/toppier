define(function () {

  var health = null;
  var attack = null;

  function Contender($contenderEl) {
    health = $contenderEl.attr("data-health");
    attack = $contenderEl.attr("data-attack");
  }

  function offend() {
    return attack;
  }

  function defend(opponentAttack) {
    health = health - opponentAttack;
  }

  function isDefeated() {
    health <= 0;
  }

  return this;
})