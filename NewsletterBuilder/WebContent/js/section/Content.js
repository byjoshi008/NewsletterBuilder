/**
 * Define the constructor for Content
 */
var Content = function(properties, column){
	this.properties = properties;
	this.column = column;
	this.contentHTML =  this.getContentHTML();
}

Content.prototype.getContentHTML = function(){
	
	var properties = this.properties; 
	var content = $("<div>");
	switch(properties.type.toUpperCase()){
	
	case "TEXT":
		var style = properties.style || "";
		var text = properties.detail || "";
		
		if(style != ""){
			style = "style='"+style+"'";
		}
		
		//text = text.replace(new RegExp("div", 'g'), "p");
		content.append(text);
		$("p",content).addClass("font1 nl_text");
		$("div",content).addClass("font1 nl_text");
		break;
		
	case "IMAGE":
		
		var style = properties.style || "";
		var imageSrc = properties.imageData || "";
		var fileName = properties.detail || "";
		var classStr = properties.category || "";
		var isLink = properties.isLink || false;
		var link = properties.link || "";
		var isExtLink = properties.isExtLink || false;
		
		var imageAttr = "";
		properties.imageData = "";
		
		switch(classStr){
		case "Small":
			//classStr = "class='nl_img_small'";
			//classStr = "height: 50px; max-width: 100%; margin: 10px 0;";
			classStr = "height: 80px; max-width: 100%; display: block; border: 0;";
			//imageAttr = "height='50' width='75'";
			imageAttr = "height='80' width='80'";
			//imageAttr = "width='40%' vspace='10' align='center'";
			break;
		case "Medium":
			//classStr = "class='nl_img_medium'";
			//classStr = "height: 150px; max-width: 70%; margin: 10px 0;";
			classStr = "height: 150px; max-width: 70%; display: block; border: 0;";
			//imageAttr = "height='150' width='70%'";
			imageAttr = "height='150' width='150'";
			//imageAttr = "width='60%' vspace='10' align='center'";
			break;
		case "Large":
			//classStr = "class='nl_img_large'";
			//classStr = "height: 250px; max-width: 90%; margin: 10px 0;";
			classStr = "height: 250px; max-width: 90%; display: block; border: 0;";
			//imageAttr = "height='250' width='90%'";
			imageAttr = "height='250' width='250'";
			//imageAttr = "width='80%' vspace='10' align='center'";
			break;
		case "Full":
			//classStr = "class='nl_full_width'";
			//classStr = "width: 98%; height: auto; margin: 10px 0;";
			classStr = "width: 100%; height: auto; display: block; border: 0;";
			imageAttr = "";
			break;
		case "Other":
			classStr = "display: block; border: 0;";
			imageAttr = "";
			break;
		default:
			classStr = "";
			imageAttr = "";
		}
		
		if(imageWidth || imageHeight){
			imageAttr = "";
			imageAttr = imageAttr + (imageWidth ? 'width="'+imageWidth+'"' : "");
			imageAttr = imageAttr + (imageHeight ? 'height="'+imageHeight+'"' : "");
		}
		
		classStr = classStr + "mso-table-lspace:0pt;mso-table-rspace:0pt;";
		if(style != ""){
			style = "style='"+classStr+style+"'";
		} else {
			style = "style='"+classStr+"'";
		}
		
		/*if(!app.previewFlag){
			imageSrc = app.config.imageLocation + fileName;
		}*/
		imageSrc = app.config.imageLocation + fileName;
		
		var imageStr = "<img "+imageAttr+" src='"+imageSrc+"' "+style+">";
		if(isLink){
			var link = $("<a href='"+link+"'>");
			if(isExtLink){
				link.attr("target","_blank");
			}
			link.append(imageStr);
			content.append(link);
		}
		else{
			content.append(imageStr);
		}

		break;
	}	
	
	return content;
}

/**
 * Function to bind content properties change events to save changes 
 * in config and for immediate preview
 */
Content.prototype.bindChangeEvents = function(panel){
	
	var $this = this;
	
	$(".content_delete",panel).click(function(){
		
		var index = $(panel,$this.column.columnPanel).index();
		var content = $this.column.content[index];
		panel.remove();
		$this.column.content = _.without($this.column.content, content);
		$this.column.refreshColumnContentProperties();
	
	});
	
	switch(this.properties.type.toUpperCase()){
	
	case "TEXT":
		$('.text_editor',panel).on('summernote.change', function(we, content, $editable) {
		
			  $this.properties.detail = content;
			  $this.contentHTML = $this.getContentHTML();
		});
		break;
		
	case "IMAGE":
		
		$(".image_category",panel).change(function(){
			
			var value = $(this).val();
			$this.properties.category = value;
			$this.contentHTML = $this.getContentHTML();

		});
		
		$(".image_width",panel).change(function(){
			
			var value = $(this).val();
			$this.properties.imageWidth = value;
			$this.contentHTML = $this.getContentHTML();

		});

		$(".image_height",panel).change(function(){
	
			var value = $(this).val();
			$this.properties.imageHeight = value;
			$this.contentHTML = $this.getContentHTML();

		});
		
		$(".image_content_value",panel).change(function(){
			
			var files = $(this)[0].files;
			
			if(files && files[0]){
				
				var value = $(this).val();
				value = value.substring(_.lastIndexOf(value,"\\")+1);
				$(".image_file_name",panel).val(value);
				$this.properties.detail = value;
				
				var reader = new FileReader();
				reader.onload = function(e){
					//$this.properties.imageData = e.target.result;
					$this.properties.imageData = "";
					$this.contentHTML = $this.getContentHTML();
				};
				reader.readAsDataURL(files[0]);
			}

		});
		
		$(".image_content_style",panel).change(function(){
			
			var value = $(this).val();
			$this.properties.style = value;
			$this.contentHTML = $this.getContentHTML();

		});
		
		$(".image_link_cb input",panel).click(function(){
			
			var cb = $(this);
			if(cb.prop("checked")){
				$(".image_link_details",panel).show();
				$this.properties.isLink = true;
			}
			else{
				$(".image_link_details",panel).hide();
				$this.properties.isLink = false;
			}
			$this.contentHTML = $this.getContentHTML();
		});
		
		$(".image_link_text",panel).change(function(){
			var value = $(this).val();
			$this.properties.link = value;
			$this.contentHTML = $this.getContentHTML();
		});
		
		$(".image_extlink_cb input",panel).click(function(){
			
			var cb = $(this);
			if(cb.prop("checked")){
				$this.properties.isExtLink = true;
			}
			else{
				$this.properties.isExtLink = false;
			}
			$this.contentHTML = $this.getContentHTML();
			
		});
		
		break;
	}

}