/**
 * Define the constructor for Column
 */
var Column = function(properties, section){
	this.properties = properties;
	this.section = section;
	this.content = [];
	this.columnPanel = "";
	this.addColumnContents();
	this.columnHTML =  this.getColumnHTML();
};

Column.prototype.addColumnContents = function(){
	
	var $this = this;
	_.each(this.properties.content, function(contentProps, index){
		var content = new Content(contentProps, $this);
		$this.content.push(content);
	});
};

/**
 * Function to add column content panels to column configuration page
 */
Column.prototype.addContentPanels = function(columnPanel){
	
	var $this = this;
	_.each(this.content, function(content, index){
		$this.addContentPanel(content, columnPanel);
	});
};

/**
 * Function to add content panel to column configuration page
 */
Column.prototype.addContentPanel = function(content, columnPanel){ 
	
	var contentPanelGroup = $(".content_panel_group", columnPanel);
	
	var contentPanelTemplate = _.template(_.unescape($(".content_panel_template",app.templates).html()));
	
	var tempDiv = $("<div>");
	var type = content.properties.type;
	
	tempDiv.append(contentPanelTemplate({
		contentType: type, 
		contentId: _.uniqueId("Content_")
	}));
	
	var contentPanel = $(".content_panel",tempDiv);
	
	if(type.toUpperCase() == "TEXT"){
		var textContentTemplate = _.template(_.unescape($(".text_content_template",app.templates).html()));
		
		$(".content_panel_content",contentPanel).append(textContentTemplate());
		
		$(".text_editor",contentPanel).summernote({
			fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Helvetica'],
			toolbar: [
			          ['style', ['bold', 'italic', 'underline', 'clear']],
			          ['font', ['strikethrough', 'superscript', 'subscript']],
			          ['fontname',['fontname']],
			          ['fontsize', ['fontsize']],
			          ['color', ['color']],
			          ['para', ['ul', 'ol', 'paragraph']],
			          ['height', ['height']],
			          ['link',['link','unlink']],
			          ['picture',['picture']]
			        ],
			fontSizes: ['6', '8', '10', '11', '12', '13', '14', '15', '16', '18' , '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60']
		});
		
		$(".text_editor",contentPanel).summernote('code',content.properties.detail);
	}
	else if(type.toUpperCase() == "IMAGE"){
		
		var imageContentTemplate = _.template(_.unescape($(".image_content_template",app.templates).html()));
		
		var value = content.properties.detail.substring(_.lastIndexOf(content.properties.detail,"\\")+1);
		
		$(".content_panel_content",contentPanel).append(imageContentTemplate({
			imageContent: value,
			imageContentCSS: content.properties.style,
			linkText: content.properties.link || "",
			imageWidth: content.properties.imageWidth || "",
			imageHeight: content.properties.imageHeight || ""
		}));
		
		$(".image_category",contentPanel).val(content.properties.category);
		$(".image_link_cb input",contentPanel).prop("checked",content.properties.isLink ? content.properties.isLink : false);
		$(".image_extlink_cb input",contentPanel).prop("checked",content.properties.isExtLink ? content.properties.isExtLink : false);
		
		if(content.properties.isLink){
			$(".image_link_details",contentPanel).show();
		}
		
	}
	
	contentPanelGroup.append(contentPanel);
	content.bindChangeEvents(contentPanel);
};

/**
 * Function to bind events to add new content to column
 */
Column.prototype.bindAddContentEvents = function(columnPanel){
	
	var $this = this;
	
	$(".column_width", columnPanel).change(function(){
		var width = $(this).val();
		$this.properties.width = width;
		$this.columnHTML =  $this.getColumnHTML();
	});
	
	$(".column_padding", columnPanel).change(function(){
		var padding = $(this).val();
		$this.properties.padding = padding;
		$this.columnHTML =  $this.getColumnHTML();
	});
	
	$(".content_expand", columnPanel).click(function(){
		
		$(".content_collapse", columnPanel).show();
		$(".content_expand", columnPanel).hide();
		
		$(".content_panel_header a ",columnPanel).removeClass("collapsed");
		$(".panel-collapse ",columnPanel).addClass("in");
	});
	
	$(".content_collapse", columnPanel).click(function(){
		
		$(".content_collapse", columnPanel).hide();
		$(".content_expand", columnPanel).show();
		
		$(".content_panel_header a ",columnPanel).addClass("collapsed");
		$(".panel-collapse ",columnPanel).removeClass("in");
		
	});
	
	$(".add_text", columnPanel).click(function(){
		
		var properties = {
				type: "text",
				detail: ""
		};
		var content = new Content(properties, $this);
		$this.content.push(content);
		$this.addContentPanel(content, columnPanel);
		$this.properties.content.push(properties);
		generatePreview();
	});

	$(".add_image", columnPanel).click(function(){
		var properties = {
				type: "image",
				category: "Small",
				style: "",
				detail: "",
				imageData: "",
				isLink: false,
				link: "",
				isExtLink: false,
				imageWidth: "",
				imageHeight: ""
		};
		var content = new Content(properties, $this);
		$this.content.push(content);
		$this.addContentPanel(content, columnPanel);
		$this.properties.content.push(properties);
		generatePreview();
	});
};

/**
 * Function to generate HTML content for column
 * @returns column - jQuery object containing column HTML
 */
Column.prototype.getColumnHTML = function(){
	
	var $this = this;
	var columnTemplate = _.template(_.unescape($(".column_template",app.sectionTemplate).html()));
	var column = $("<div>").html(columnTemplate({columnWidth : $this.properties.width}));
	return column;	
};

/**
 * Function to refresh column content properties
 */
Column.prototype.refreshColumnContentProperties = function(){
	
	var colContent = [];
	_.each(this.content, function(content){
		colContent.push(content.properties);
	});
	
	this.properties.content = colContent;
};