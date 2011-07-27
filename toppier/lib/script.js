var jCollage = null;
$(document).ready(function() {
	jCollage = new Collage("#collage");
	jCollage.setBackgroundColor("#fff");
	
	$(".search img").live("click", function() {
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
	
	$(".remove").click(function() {
		if (getSelectedLayer() != null) {
			jCollage.removeLayer($(".layers .selected").attr("id").substr(6));
			updateLayers(jCollage.getLayers());
		}
	});
	
	$(".up").click(function() {
		if (getSelectedLayer() != null) {
			var selectedLayer = $(".layers .selected").attr("id").substr(6);
			if (jCollage.moveLayerUp(selectedLayer)) {
				updateLayers(jCollage.getLayers());
				$("#layer_" + (parseInt(selectedLayer) + 1)).addClass("selected");
			}
		}
	});
	
	$(".down").click(function() {
		if (getSelectedLayer() != null) {
			var selectedLayer = $(".layers .selected").attr("id").substr(6);
			if (jCollage.moveLayerDown(selectedLayer)) {
				updateLayers(jCollage.getLayers());
				$("#layer_" + (parseInt(selectedLayer) - 1)).addClass("selected");
			}	
		}
	});
	
	$(".search form").submit(function(){
		$(".search li").remove();
		$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags="+$(".search input[name=q]").val()+"&tagmode=any&format=json&jsoncallback=?",
			function(data) {
			$.each(data.items, function(i,item) {
				var img = $("<img/>").attr("src", item.media.m);
				img.attr("title", item.title);
				$("<li></li>").append(img).appendTo(".search ul");
				if ( i == 8 ) return false;
			});
		});
		return false;
	});
});

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