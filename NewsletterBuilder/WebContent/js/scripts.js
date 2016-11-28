var app = {};
app.colorPicker = {padding: 10, borderWidth: 2, hash: true, position: 'top'};
//app.imagePath = "http://builders.capgemini.com/upload/user_images/B054124E-4E44-1435-AD10-B4256348503D/";
app.previewFlag = true;
var urlRoot = location.protocol+"//"+location.host+"/sap/opu/odata/sap/";
var currentTemplateId = "";
var currentTemplateName = "";

/**
 * Function to generate newsletter preview
 */
function generatePreview(){
	
	var tempDiv = $("<div>");
	
	_.each(app.sections, function(section, index){
		
		var sectionContent = $(".section_content",section.sectionHTML);
		sectionContent.html("");
		$(".back_to_top_row",section.sectionHTML).html("");
		
		_.each(section.columns, function(column, index){
			
			var columnContent = $(".column_contnet", column.columnHTML);
			columnContent.html("");
			
			_.each(column.content, function(content,index){
				
				var contentTable = $("<table width='100%' cellpadding='0'>");
				contentTable.append($("<tr>").append($("<td valign='top' align='center'>").append(content.getContentHTML().html())));
				//columnContent.append(content.getContentHTML().html());
				columnContent.append(contentTable);
			});
			
			if(column.properties.padding){
				switch(column.properties.padding){
				case "5":
					$(".column_contnet", column.columnHTML).addClass("content_padding1");
					break;
				case "10":
					$(".column_contnet", column.columnHTML).addClass("content_padding2");
					break;
				case "15":
					$(".column_contnet", column.columnHTML).addClass("content_padding3");
					break;
				}
			}
			
			sectionContent.append($("<td style='width:"+column.properties.width+"%;' class='deviceWidth' valign='top' align='left'>").append(column.columnHTML.html()));
			
			//sectionContent.append(column.columnHTML.html());
		});
		
		if(section.properties.backToTopLink){
			var backToTopLink = $("<tr class='back_to_top_row'>");
			for(var i=0; i<section.columns.length-1; i++){
				backToTopLink.append($("<td>"));
			}
			backToTopLink.append($("<td align='right'>").append($("<a href='#topsection' class='back_to_top_link font1'>").html("Back to Top")));
			sectionContent.after(backToTopLink);
		}
		
		if(section.properties.padding){
			switch(section.properties.padding){
			case "5":
				$(".section_content > td",section.sectionHTML).addClass("content_padding1");
				break;
			case "10":
				$(".section_content > td",section.sectionHTML).addClass("content_padding2");
				break;
			case "15":
				$(".section_content > td",section.sectionHTML).addClass("content_padding3");
				break;
			}
		}
		
		tempDiv.append(section.sectionHTML.html());
		
		$("a",tempDiv).attr("style","color: #FFFFF6;");
	});
	
	var iframe = document.getElementById('nl_iframe'),
    iframedoc = iframe.contentDocument || iframe.contentWindow.document;
	
	var htmlContent = app.nlTemplate({newsLetterContent:tempDiv.html()});
	iframedoc.body.innerHTML = htmlContent;

	return htmlContent;
}

/**
 * Function to load existing configuration 
 */
function loadConfiguration() {
	
	$("#image_location_input").val(app.config.imageLocation);
	_.each(app.config.sections, function(record, index){
		var section = new Section(record);
	});
}

/**
 * Function to load required templates for the application
 */
function loadTemplates(){

	app.templates = $("<div>").html($("#app_templates").html());
	//app.nlTemplate = $("<div>").html($("#nl_template").text());
	app.nlTemplate = _.template($("#nl_template").text());
	app.sectionTemplate = $("<div>").html($("#section_template").html());
	
	/*$.ajax({
		url: "templates/builder/newsletter_template.html",
		type: "GET",
		success: function(data){
			app.nlTemplate = $("<div>").html(data);
		}
	});
	
	$.ajax({
		url: "templates/builder/section_template.html",
		type: "GET",
		success: function(data){
			app.sectionTemplate = $("<div>").html(data);
		}
	});*/
}


function resetConfig(){
	app.sections = [];
	app.config = { imageLocation: "", sections : [] };
	$("#image_location_input").val("");
	$(".section_panel_group").html("");
	$(".column_container").html("");
	$(".right_content .page_header").hide();
	$("#new_config_modal").modal("hide");
}

function openConfig(guid){
	$.ajax({
		url: urlRoot + "ZNEWSLETTER_SRV/TemplateDataSet(Guid=guid'"+guid+"')",
		type: "GET",
		headers: {     
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/atom+xml",
                    "Accept": "application/json",
                    "DataServiceVersion": "2.0",       
				},
		success: function(data, textStatus, request){
			resetConfig();
			app.config = JSON.parse(data.d.Template);
			currentTemplateId = data.d.Guid;
			currentTemplateName = data.d.Title;
			$("#open_config_modal").modal("hide");
			loadConfiguration();
		},
		
		error: function(error){
			alert("Error in service while fetching list of available templates.");
		}
	});
}


function saveConfig(){
	var csrfToken = "";
	$.ajax({
		url: urlRoot + "ZNEWSLETTER_SRV/$metadata",
		type: "GET",
		headers: {     
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/atom+xml",
                    "DataServiceVersion": "2.0",       
                    "X-CSRF-Token":"Fetch"   
				},
		success: function(data, textStatus, request){
			csrfToken = request.getResponseHeader('x-csrf-token');
			var payload = {
					Title:  currentTemplateName,
					Template: JSON.stringify(app.config)
				};
				
				$.ajax({
					url: urlRoot + "ZNEWSLETTER_SRV/TemplateDataSet(Guid=guid'"+currentTemplateId+"')",
					type: "PUT",
					data: JSON.stringify(payload),
					headers: {     
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "DataServiceVersion": "2.0",       
                        "X-CSRF-Token": csrfToken   
					},
					success: function(response){
						
					},
					error: function(error){
						alert("Error in service while saving the newsletter template.");
					}
				});
		},
		error: function(error){
			alert("Error in service while getting CSRF token.");
		}
	});
}
/**
 * Start of the application
 */
$(document).ready(function(){
	
	app.sections = [];
	app.config = { imageLocation: "", sections : [] };
	
	$("#background_color_input").attr("data-jscolor",JSON.stringify(app.colorPicker));
	loadTemplates();	
	
	loadConfiguration();
	
	//expand collapse sections
	$(".section_expand_collapse").click(function(){
		
		if($(this).hasClass("section_expand")){
			$(this).removeClass("section_expand");
			$(".section_panel_header a ",$(".section_panel_group")).removeClass("collapsed");
			$(".section_panel .panel-collapse ",$(".section_panel_group")).addClass("in");
			$(this).addClass("section_collapse");
			
		} else {
			$(this).removeClass("section_collapse");
			$(".section_panel_header a ",$(".section_panel_group")).addClass("collapsed");
			$(".section_panel .panel-collapse ",$(".section_panel_group")).removeClass("in");
			$(this).addClass("section_expand");
		}
		
	});
	
	//sortable event for section panel to drag and drop sections
	var secStartIndex;
	$(".section_panel_group").sortable({
		handle: ".section_panel_header",
		start: function(event, ui){
			secStartIndex = $(".section_panel_group").children().index(ui.item);
			console.log("Section Before Index - "+secStartIndex);
		},
		
		stop: function(event, ui){
			var index = $(".section_panel_group").children().index(ui.item);
			console.log("Section After Index - "+index);
			
			if(index != secStartIndex){
				var section = app.sections[secStartIndex];
				app.sections = _.without(app.sections, section);
				app.sections.splice(index, 0, section);
				
				var properties = app.config.sections[secStartIndex];
				app.config.sections = _.without(app.config.sections, properties);
				app.config.sections.splice(index, 0, properties);
			}
			
		}
	});
	
	$("#create_section_btn").click(function(){
		var name = $("#section_name_input").val();
		var bgColor = $("#background_color_input").val();
		var padding = $("#section_padding_input").val();
		var backToTopLink = $("#back_to_top_cb").prop("checked");
		if(name != "" && bgColor != ""){
			
			if( _.filter(app.config.sections, function(item){ return item.name.toUpperCase() == name.toUpperCase() }).length <= 0 ){
				var properties = {
						name: name,
						bgColor: bgColor,
						backToTopLink: backToTopLink,
						padding: padding,
						columns: []
				};
				
				app.config.sections.push(properties);
				var section = new Section(properties);
				
				$("#section_name_input").val("");
				$("#background_color_input").val("#FFFFFF").css("background-color","#FFFFFF");
				$("#add_section_modal").modal("hide");
				
			}
			else{
				alert("Section with this name is already present. Please enter a different name.");
			}
		}
		else{
			alert("Name and Background color are mandatory fields.");
		}
	});
	
	
	//click event for add column button
	$("#add_column_btn").click(function(){
		
		var $this = app.currentSection;
		
		if($this.columns.length >= 4){
			alert("More than 4 columns cannot be added to the section.");
		}
		else{
			var width = "100";
			if($this.columns.length == 1){
				width = "50";
			}
			else if($this.columns.length == 2){
				width = "33";
			}
			else if($this.columns.length == 3){
				width = "25"
			}
			
			//update new width in all column objects
			_.each($this.columns, function(column, index){
				column.properties.width = width-1;
				column.columnHTML =  column.getColumnHTML();
			});
			
			var properties = {
					width: width-1,
					padding: "",
					content: []
			};
			
			$this.properties.columns.push(properties);
			
			//create new column object and add to current sections column list
			var column = new Column(properties, app.currentSection);
			app.currentSection.columns.push(column);
			
			app.currentSection.addColumnToPanel();

		}
		
	});
	
	$("#editor_btn").click(function(){
		$(this).hide();
		$(".nl_preview_container").hide();
		$(".main_container").show();
		$("#preview_btn").show();
	});
	
	$("#preview_btn").click(function(){
		generatePreview();
		$(this).hide();
		$(".main_container").hide();
		$(".nl_preview_container").show();
		$("#editor_btn").show();
	});
	
	/*$("#open_config_btn").change(function(){
		
		var files = $(this)[0].files;
		var fileInput = $(this);
		
		if(files && files[0]){
			
			var reader = new FileReader();
			reader.onload = function(e){
				app.config = JSON.parse(e.target.result);
				loadConfiguration();
				fileInput.val("");
			};
			reader.readAsText(files[0]);
		}
	});*/
	
	$("#open_config_btn").click(function(){
				
		$.ajax({
			url: urlRoot + "ZNEWSLETTER_SRV/TemplateDataSet",
			type: "GET",
			headers: {     
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/atom+xml",
                        "Accept": "application/json",
                        "DataServiceVersion": "2.0",       
					},
			success: function(data, textStatus, request){
				var table = $("#open_config_table");
				table.html("");
				
				var headerRow = $("<tr>");
				headerRow.append($("<th>").html("Template Name"));
				headerRow.append($("<th>").html("Created On"));
				headerRow.append($("<th>").html("Last Changed"));
				headerRow.append($("<th>").html(""));
				
				table.append(headerRow)
				
				_.each(data.d.results, function(record){
					var row = $("<tr class='config_table_record' data-guid='"+record.Guid+"' data-templatename = '"+record.Title+"'>")
					
					var column1 = $("<td>").html($("<span class='config_table_title'>").html(record.Title));
					row.append(column1);
										
					var createdDate = "-";
					if(record.CreatedOn){
						createdDate = moment(record.CreatedOn).format("DD/MM/YYYY hh:mm");
					}
					var column2 = $("<td>").html(createdDate);
					row.append(column2);
					
					var lastChangedDate = "-";
					if(record.UpdatedOn){
						lastChangedDate = moment(record.UpdatedOn).format("DD/MM/YYYY hh:mm");
					}
					var column3 = $("<td>").html(lastChangedDate);
					row.append(column3);
					
					var column4 = $("<td>").html($("<span class='config_table_delete'>").html("Delete"));
					row.append(column4);
					
					table.append(row);
					
				});
				
				$(".config_table_title").click(function(){
					var guid = $(this).parent().parent().attr("data-guid");
					
					if(currentTemplateId == ""){
						openConfig(guid);
					} else {
						$("#open_config_confirm_btn").attr("data-guid",guid);
						$("#open_config_modal").modal("hide");
						$("#open_config_confirm_modal").modal("show");
						
					}
					
				});
				
				$(".config_table_delete").click(function(){
					var guid = $(this).parent().parent().attr("data-guid");
					alert("TO DO - Delete Service " + guid);
				});
				
				$("#open_config_modal").modal("show");
				
			},
			
			error: function(error){
				alert("Error in service while fetching list of available templates.");
			}
		});
		
	});
	
	$("#open_config_confirm_btn").click(function(){
		var guid = $(this).attr("data-guid");
		$("#open_config_confirm_modal").modal("hide");
		openConfig(guid);
	});
	
	$("#export_html_btn").click(function(){
		
		if(app.config.imageLocation == ""){
			alert("Image location is not available. Please maintain image location in Global Settings.");
		} else {
			app.previewFlag = false;
			var htmlContent = generatePreview();
			app.previewFlag = true;
			
			var anchor = $(".download_link")[0];
			var file = new Blob([htmlContent], {type: "text/html"});
			anchor.href = URL.createObjectURL(file);
			anchor.download = "Newsletter_"+moment().format("YYYYMMDD_HHmmSS")+".html";
			
			$(".download_link")[0].click();
		}
		
	});
	
	$("#config_download_btn").click(function(){
		
		if(app.config.imageLocation == ""){
			alert("Image location is not available. Please maintain image location in Global Settings.");
		} else {
			
			if( !_.isEmpty(app.config.sections)){
				
				/*var anchor = $(".download_link")[0];
				var file = new Blob([JSON.stringify(app.config)], {type: "text/plain"});
				anchor.href = URL.createObjectURL(file);
				anchor.download = "Newsletter_Config_"+moment().format("YYYYMMDD_HHmmSS")+".json";
				
				$(".download_link")[0].click();*/
				if(currentTemplateId == ""){
					$("#template_name_modal").modal("show");
				}
				else {
					saveConfig();
				}
			}
			else{
				//alert("There is no configuration to download.");
				alert("There is no configuration to save.");
			}
			
		}
	});
	
	$("#config_save_as_btn").click(function(){
		$("#template_name_input").val("");
		$("#template_name_modal").modal("show");
	});
	
	$("#save_template_name_btn").click(function(){
		
		currentTemplateName = $("#template_name_input").val();
		
		if(currentTemplateName != ""){
			$("#template_name_modal").modal("hide");
			var csrfToken = "";
			$.ajax({
				url: urlRoot + "ZNEWSLETTER_SRV/$metadata",
				type: "GET",
				headers: {     
                            "X-Requested-With": "XMLHttpRequest",
                            "Content-Type": "application/atom+xml",
                            "DataServiceVersion": "2.0",       
                            "X-CSRF-Token":"Fetch"   
						},
				success: function(data, textStatus, request){
					csrfToken = request.getResponseHeader('x-csrf-token');
					var payload = {
							Title: currentTemplateName,
							Template: JSON.stringify(app.config)
						};
						
						$.ajax({
							url: urlRoot + "ZNEWSLETTER_SRV/TemplateDataSet",
							type: "POST",
							data: JSON.stringify(payload),
							headers: {     
                                "X-Requested-With": "XMLHttpRequest",
                                "Content-Type": "application/json",
                                "Accept": "application/json",
                                "DataServiceVersion": "2.0",       
                                "X-CSRF-Token": csrfToken   
							},
							success: function(response){
								currentTemplateId = response.d.Guid;
							},
							error: function(error){
								alert("Error in service while saving the newsletter template.");
							}
						});
				},
				error: function(error){
					alert("Error in service while getting CSRF token.");
				}
			});
			
		} else {
			
			alert("Please enter template name.");
			
		}
		
	});
	
	$("#new_config_modal_btn").click(function(e){
		resetConfig();
	});
	
	$("#save_global_option_btn").click(function(e){
		var image_location = $("#image_location_input").val();
		app.config.imageLocation = image_location;
		$("#global_options_modal").modal("hide");
	});
});