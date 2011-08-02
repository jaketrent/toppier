require(["jquery", "jquery-ui-1.8.14.custom.min", "jcollage", "canvas2image", "base64"], function ($) {

  var jCollage = null;

  function getSelectedLayer() {
    if ($(".layers .selected").length == 0) {
      return null;
    }
    return jCollage.getLayer($(".layers .selected").attr("id").substr(6))
  }

  function setSettings(id) {
    var layer = jCollage.getLayer(id);
    $(".options select[name=blending]").removeAttr("selected");
    $(".options select[name=blending] option[value="+layer.getCompositeOperation()+"]").attr("selected", "selected");

    $(".options select[name=opacity]").removeAttr("selected");
    $(".options select[name=opacity] option[value="+layer.getOpacity()+"]").attr("selected", "selected");

    $(".options select[name=shadow]").removeAttr("selected");
    $(".options select[name=shadow] option[value="+layer.hasShadow()+"]").attr("selected", "selected");
  }

  function updateLayers(layers) {
    $(".layers li.layer").remove();
    for (i in layers) {
      $(".layers > ul").prepend(createLayerRow(i, layers[i]));
    }
  }

  function createLayerRow(id, layer) {
    var row = $("<li></li>").addClass("layer").attr("id", "layer_" + id);
    var icon = $("<img/>").attr("src", layer.getImage().src);
    var heading = $("<h3></h3>").text(layer.getTitle().substr(0,14));
    var visible = $("<div></div>").addClass("visible");
    if (layer.isVisible()) {
      visible.html("&radic;");
    }

    row.append(icon).append(heading).append(visible);

    return row;
  }

  require.ready(function() {
    jCollage = new Collage("#card");
    jCollage.setBackgroundColor("#fff");

    $(".toolkit img").live("click", function() {
      jCollage.addLayer($(this).context).setTitle($(this).attr("title"));
      updateLayers(jCollage.getLayers());
      $("#layer_" + (jCollage.getLayers().length - 1)).addClass("selected");
    });

    $(".layers .layer").live("click", function() {
      $(".layers .layer").removeClass("selected");
      $(this).addClass("selected");
      setSettings($(this).attr("id").substr(6));
    });

    $(".layers .background .visible").click(function() {
      if ($(this).html() == "") {
        jCollage.setBackgroundImage($(".layers .background img")[0]);
        $(this).html("&radic;");
      } else {
        jCollage.setBackgroundImage(null);
        $(this).html("");
      }
    });

    $(".layers .layer .visible").live("click", function() {
      if ($(this).html() == "") {
        $(this).html("&radic;");
      } else {
        $(this).html("");
      }
      jCollage.getLayer($(this).parent().attr("id").substr(6)).toggleVisible();
      jCollage.redraw();
    });

    $(".options select[name=shadow]").change(function() {
      if (getSelectedLayer() != null) {
        if ($(".options select[name=shadow]").val() == "true") {
          getSelectedLayer().setShadow(true);
        } else {
          getSelectedLayer().setShadow(false);
        }
        jCollage.redraw();
      }
    });

    $(".options select[name=opacity]").change(function() {
      if (getSelectedLayer() != null) {
        getSelectedLayer().setOpacity($(".options select[name=opacity]").val());
        jCollage.redraw();
      }
    });

    $(".options select[name=blending]").change(function() {
      if (getSelectedLayer() != null) {
        getSelectedLayer().setCompositeOperation($(".options select[name=blending]").val());
        jCollage.redraw();
      }
    });

    function showLayerCtrls() {
      $(this).append(
        '<ul class="layer-ctrls">' +
          '<li class="remove"><a>X</a></li>' +
          '<li class="arrow-alt up"><a>Up</a></li>' +
          '<li class="down"><a>Down</a></li>' +
        '</ul>')
    }

    function rmLayerCtrls() {
      $(this).find(".layer-ctrls").remove();
    }

    $(".layers .layer").live("mouseenter", showLayerCtrls);
    $(".layers .layer").live("mouseleave", rmLayerCtrls);

    $(".remove a").live("click", function() {
      var id = $(this).parent().parent().parent().attr("id").substr(6);
      jCollage.removeLayer(id);
      updateLayers(jCollage.getLayers());
    });

    $(".up a").live("click", function() {
      var id = $(this).parent().parent().parent().attr("id").substr(6);
      if (jCollage.moveLayerUp(id)) {
        updateLayers(jCollage.getLayers());
        $("#layer_" + (parseInt(id) + 1)).click();
      }
    });

    $(".down a").live("click", function() {
      var id = $(this).parent().parent().parent().attr("id").substr(6);
      if (jCollage.moveLayerDown(id)) {
        updateLayers(jCollage.getLayers());
        $("#layer_" + (parseInt(id) - 1)).click();
      }
    });

    $(".clear a").click(function () {
      jCollage.clearLayers();
      updateLayers(jCollage.getLayers());
    });

    $(".search form").submit(function(){
      $(".search li").remove();
      $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags="+$(".search input[name=q]").val()+"&tagmode=any&format=json&jsoncallback=?",
        function(data) {
        $.each(data.items, function(i,item) {
          var img = $("<img/>").attr("src", item.media.m);
          img.attr("title", item.title);
          $("<li></li>").append(img).appendTo(".search");
          if ( i == 8 ) return false;
        });
      });
      return false;
    });

    $(".toolkit h3").click(function () {
      $(".toolkit ul").slideUp("fast");
      $(this).next("ul").slideDown("fast");
    });

    $(".fight").click(function () {
      var hero = Canvas2Image.saveAsPNG(jCollage.getCanvas(), true);
      localStorage['hero-src'] = hero.src;
      localStorage['hero-name'] = $(".name input").val();
      localStorage['hero-health'] = $(".health span").html();
      localStorage['hero-attack'] = $(".attack span").html();
      window.location = "/octagon/";
    });

    $(".ability").slider({
			range: "max",
			min: -10,
			max: 10,
			value: 0,
			slide: function(event, ui) {
        var $health = $(".health span");
        var $attack = $(".attack span");
        var health = 10;
        var attack = 10;
        if (ui.value === 0) {
          $health.html(health);
          $attack.html(attack);
        } else {
          var healthDiff = ui.value <  0 ? Math.abs(ui.value) : ui.value * -1;
          health = 10 + healthDiff;
          $health.html(health);
          var attackDiff = ui.value;
          attack = 10 + attackDiff;
          $attack.html(attack);
        }
        jCollage.setAbilities(health, attack);
			}
		});

    $(".name input").focusout(function () {
      jCollage.setTitle($(this).val());
    });

  });

});