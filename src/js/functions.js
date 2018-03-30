$(function(){

	// select默认选中项颜色
	var unSelected = "#999";
	var selected = "#333";
	$("select").css("color", unSelected);
	$("option").css("color", selected);
	$("select").change(function () {
		var selItem = $(this).val();
		if (selItem == $(this).find('option:first').val()) {
			$(this).css("color", unSelected);
		} else {
			$(this).css("color", selected);
		}
	});



});
