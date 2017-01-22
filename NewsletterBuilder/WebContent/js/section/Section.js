/**
 * Define the generic constructor for Section
 * properties = { name: "<name of the section>", bgColor: "<background color of the section>" }
 */
var Section = function(properties){
	this.properties = properties;
	this.columns = [];
	this.addSectionPanel();
	this.sectionHTML = this.getSectionHTML();
}

/**
 * Function to add section panel on the screen.
 */
Section.prototype.addSectionPanel = function(){
	
	var $this = this;
	var panelTemplate = _.template(_.unescape($(".section_panel_template",app.templates).html()));
	var panel = $("<div class='panel panel-default section_panel'>");
	
	panel.append(panelTemplate({
		sectionName: $this.properties.name,
		bgColor: $this.properties.bgColor.toUpperCase(),
		sectionId : _.uniqueId("Section_"),
	}));
	
	if($this.properties.backToTopLink){
		$(".section_back_to_top",panel).prop("checked",true);
	}
	
	if($this.properties.padding){
		$(".section_padding",panel).val($this.properties.padding);
	}
	
	this.panel = panel;
	app.sections.push(this);
	new jscolor($(".jscolor",panel)[0],app.colorPicker);
	
	$(".section_panel_group").append(panel);
	
	//read columns from section properties, create column objects and add to the current section object
	_.each(this.properties.columns, function(columnProps, index){
		var column = new Column(columnProps, $this);
		$this.columns.push(column);
	});
	
	//Change in section name
	$(".section_name",panel).change(function(){
		
		var name = $(this).val();
		if(name == ""){
			alert("Section name cannot be blank");
			$(this).val($this.properties.name);
		}
		else{
			$this.properties.name = name;
			$(".panel-title a",panel).html(name);
			$this.sectionHTML = $this.getSectionHTML();
		}
		
	});
	
	//Change in color
	$(".jscolor",panel).change(function(){
		
		var color = $(this).val();
		if(color == ""){
			alert("Background color cannot be blank");
			$(this).val($this.properties.bgColor.toUpperCase());
		}
		else{
			$this.properties.bgColor = color;
			$this.sectionHTML = $this.getSectionHTML();
		}
		
	});
	
	//Change in section padding
	$(".section_padding",panel).change(function(){
		var padding = $(this).val();
		$this.properties.padding = padding;
		$this.sectionHTML = $this.getSectionHTML();
	});
	
	//back to top link selection
	$(".section_back_to_top",panel).click(function(){
		var checked = $(this).prop("checked");
		$this.properties.backToTopLink = checked;
		$this.sectionHTML = $this.getSectionHTML();
	});
	
	//Click event for config section button.
	$(".section_config",panel).click(function(){
		$this.addColumnToPanel();
	});
	
	//Click event for delete section button.
	$(".section_delete",panel).click(function(){
		var secIndex = $(".section_panel").index(panel);
		var sec = app.sections[secIndex];
		app.sections = _.without(app.sections, sec);
		
		if(app.currentSection && app.currentSection.properties.name == sec.properties.name){
			$(".column_container").html("");
			$(".right_content .page_header").hide();
			app.currentSection = null;
		}
		
		panel.remove();
		app.config.sections.splice(secIndex,1);
	});
}

/**
 * Function to add columns to the section panel on the screen
 */
Section.prototype.addColumnToPanel = function(){
	
	var $this = this;
	var panel = this.panel;
	$(".column_container").html("");
	app.currentSection = $this;
	var template = _.template(_.unescape($(".column_config_template",app.templates).html()));
	$(".section_config_header_text").html("Configuration - "+$this.properties.name);
	$(".right_content .page_header").show();
	
	_.each($this.columns, function(column, index, columns){
		
		var div = $("<div class='column_panel'>");
		var columnName = "Column "+(index+1);
		
		var colWidth = parseInt((100/columns.length));
		div.css("width",colWidth+"%");
		$(".column_container").append(div);
		
		column.properties.width = Math.round(colWidth)-1;
		
		/*if(!column.properties.width){
			column.properties.width = parseInt(colWidth)-1;
		} */
				
		div.html(template({
			sectionName: $this.properties.name,
			columnName: columnName,
			columnWidth: column.properties.width,
		}));
		
		if(column.properties.padding){
			$(".column_padding",div).val(column.properties.padding);
		}

		column.columnPanel = div;
		column.columnHTML =  column.getColumnHTML();
		
		//click event for column delete button
		$(".column_delete",div).click(function(e){
			var colIndex = $(".column_panel").index(div);
			var col = $this.columns[colIndex];
			$this.columns = _.without($this.columns, col);
			div.remove();
			$this.properties.columns.splice(colIndex,1);
			$this.addColumnToPanel();
			column.refreshColumnContentProperties();
		});
		
		//Sortable event for content panel group to drag and drop content to change its position
		var startIndex;
		$(".content_panel_group",div).sortable({
			handle: ".content_panel_header",
			start: function(event, ui){
				startIndex = $(".content_panel",div).index(ui.item);
				console.log("Before Index: "+ startIndex);
			},			
			stop: function(event, ui){
				var index = $(".content_panel",div).index(ui.item);
				console.log("After Index: "+ index);
				
				if(index != startIndex){
					var content = column.content[startIndex];
					column.content = _.without(column.content, content);
					column.content.splice(index, 0, content);
					
					column.refreshColumnContentProperties();
				}
			}
		});
		
		column.bindAddContentEvents(div);
		column.addContentPanels(div);
	});
	
	//sortable event for column container to drag and drop columns
	var colStartIndex;
	$(".column_container").sortable({
		handle: ".column_config_header",
		start: function(event, ui){
			colStartIndex = $(".column_panel").index(ui.item);
		},
		
		stop: function(event, ui){
			var index = $(".column_panel").index(ui.item);
			if(index != colStartIndex){
				var col = $this.columns[colStartIndex];
				$this.columns = _.without($this.columns, col);
				$this.columns.splice(index,0,col);
				$this.refreshSectionColumnProperties();
			}
		}
	});
	
}

/**
 * Function to generate HTML content for section
 * @returns section - jQuery object containing section HTML
 */
Section.prototype.getSectionHTML = function(){
	
	var $this = this;
	var sectionTemplate = _.template(_.unescape($(".section_template",app.sectionTemplate).html()));
	var section = $("<div>").html(sectionTemplate({sectionName: $this.properties.name.replace(/\s/g,''), bgColor:$this.properties.bgColor}));
	
	return section;	
}

/**
 * Function to refresh section column properties
 */
Section.prototype.refreshSectionColumnProperties = function(){
	var columns = [];
	_.each(this.columns, function(column){
		columns.push(column.properties);
	});
	
	this.properties.columns = columns;
}