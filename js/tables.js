/**
 * Create a new DynamicTable with the provided settings
 * 
 * Relies on having jQuery loaded
 * 
 * @param oSettings
 */
 function DynamicTable( oSettings ){
	 
	 //set up the default configuration
	 
	 /**
	  * jQuery object containing the <table/> to work with
	  */
	 this.oTableElement = null;
	 
	 /**
	  * url from which to fetch data
	  */
	 this.sUrl = null;
	 
	 /**
	  * configured width for the table, with a unit of measurement
	  * must be valid for passing jQuery's .css() setter function
	  * 
	  * If null or 0, then the table will be rendered without the width set
	  */
	 this.iWidth = null;

	 /**
	  * configured height for the table, with a unit of measurement
	  * must be valid for passing jQuery's .css() setter function
	  * 
	  * If null or 0, then the table will be rendered without the height set
	  */
	 this.iHeight = null;
	 
	 /**
	  * boolean options to enable or disable certain features
	  */
	 this.bPaging = false;
	 this.bDraggable = false;
	 this.bDraggable = false;
	 this.bTableResizeable = false;
	 this.bColumnsResizeable = false;
	 this.bSearchable = false;
		
	 //the search term entered in the search box, if enabled
	 this.sSearchTerm = '';	
	
	 //the number of records to display on a page
	 this.iPageRowCount = 3;
	
	 //the page to render
	 this.iCurrentPage = 0;
	 
	 //merge the settings into the DymanicTable object
	 jQuery.extend( this, oSettings );
	
	 //an array of column names
	 this.aColumns = [];
	
	 //holds 2 dimensional array. pages with rows
	 this.aaaPages = [];
	
	 //holds the total records retrieved from data source
	 this.iTotalRecords = 0;
	
	 //holds the number of records filtered after search
	 this.iFilteredRecords = 0;
	
	 this._initTable();
	 
	 this._initEventListeners();
}

 /**
  * Called on new DynamicTable(oSettings) object in instantiated to render 
  * the the intial(static) markup needed before we can load data into the table.
  * 
  * creates thead, tbody, tfoot, and the input elements
  * based on what features are enabled
  */
 DynamicTable.prototype._initTable = function(){	
 	var aInputs = [];
 	
 	if( this.bPaging ){
 		
 		aOptions = [ 3, 4, 10, 15, 20, 50, 100 ];
 		
 		aOptionStrings = [];
 	
 		aInputs.push( '<input type="submit" class="refresh" value="Refresh Data"></input>' );
 		
 		for( i = 0; i < aOptions.length; i++ ){			
 			var sSelected = aOptions[i] == this.iPageRowCount ? ' selected="selected"' : '';
 			
 			aOptionStrings.push( '<option value="' + aOptions[i] +'"' + sSelected + '>' + 
 									aOptions[i] + '</option>');
 		}
 				
 		aInputs.push( 	'<label for="paging">Records Per Page</label>' + 
 						'<select class="paging"> ' + 
 						aOptionStrings.join('') + '</select>' );
 	}
 	
 	if( this.bSearchable ){
 		aInputs.push( 	'<form class="search">' +
 							'<input type="text" name="term" ' + 
 								'value="' + this.sSearchTerm + '"></input>' +
 								'<input type="submit" value="Search"></input>' +
 						'</form>');
 	}
 	
 	var sHead = 	'<thead>' +
 						'<tr class="inputs"><th>' + 
 								aInputs.join('') + '</th></tr>' +
 						'<tr class="columnHeaders"></tr>' + 
 					'</thead>';
 	
 	var aPagingElements = [];
 	
 	if( this.bPaging ){
 		
 		aPagingElements.push( 'Page <span class="paging-current-page"></span> ' +
 									'of <span class="paging-total-pages"></span>' );

 		aButtonNames = ['first', 'previous', 'next', 'last'];
 		
 		for( i = 0; i < aButtonNames.length; i++ ){
 			var sName = aButtonNames[i];
 			
 			aPagingElements.push( '<a class="paging-btn paging-btn-' + sName + '">' + sName.charAt(0).toUpperCase() + sName.slice(1) + '</a>' );
 		}
 	}
 	
 	var sFoot = '<tfoot>' + 
 					'<tr class="paging"><td>' + 
 					aPagingElements.join('') + '</td></tr>' + 
 				'</tfoot>';	
 	
 	var sBody = '<tbody></tbody>';
 	
 	
 	this.oTableElement.html( sHead + sFoot + sBody );
 	
 	if( this.iWidth ){
 		this.oTableElement.css( 'width', this.iWidth );
 	}
 	
 	if( this.iHeight ){
 		this.oTableElement.css( 'height', this.iHeight );
 	}
 }

 /**
  * Bind jQuery events for different features, based on the configuration
  */
DynamicTable.prototype._initEventListeners = function(){
	
	var oDynamicTable = this;
	
	this.oTableElement.find('.refresh').click( function(){
		oDynamicTable.render();
	});

	if( this.bPaging ){
		this.oTableElement.find('select.paging').change( function(){
			oDynamicTable.iPageRowCount = jQuery(this).find('option:selected').val();
			oDynamicTable.iCurrentPage = 0;
			oDynamicTable.render();
		});
		
		this.oTableElement.find('a.paging-btn').click(function(event){
			event.preventDefault();
		});
			
		this.oTableElement.find('a.paging-btn-first').click(function(){
			oDynamicTable.iCurrentPage = 0;
			oDynamicTable.render();
		});
		
		this.oTableElement.find('a.paging-btn-previous').click(function(){
			oDynamicTable.iCurrentPage = oDynamicTable.iCurrentPage - 1;
			oDynamicTable.render();
		});
			
		this.oTableElement.find('a.paging-btn-next').click(function(){
			oDynamicTable.iCurrentPage = oDynamicTable.iCurrentPage + 1;
			oDynamicTable.render();
		});
	
		this.oTableElement.find('a.paging-btn-last').click(function(){
			oDynamicTable.iCurrentPage = oDynamicTable.aaaPages.length - 1;
			oDynamicTable.render();
		});
	}
	
	if( this.bSearchable ){
		this.oTableElement.find('form.search').submit( function(event){
			event.preventDefault();
			
			oDynamicTable.sSearchTerm = this.term.value;
			oDynamicTable.render();
		});
	}
	
	if( this.bDraggable ){
		//TODO @see http://docs.jQuery.com/UI/Draggable
		// ask if using jquery ui is acceptable or not
	}
	
	if( this.bTableResizable ){
		//TODO @see http://robau.wordpress.com/2011/06/09/unobtrusive-table-column-resize-with-jquery/
	}
	
	if( this.bColumnsResizeable ){
		//TODO @see http://robau.wordpress.com/2011/06/09/unobtrusive-table-column-resize-with-jquery/
		
		this.oColumnHandleData = null;

		//add some helper functions to jQuery
		jQuery.fn.getColumnPrevious = function() {
			console.log(jQuery(this));
		};
		jQuery.fn.getColumnNext = function() {
			console.log(jQuery(this));
		};
		
		// add the column handle pointer
		this.oTableElement.find('th, td').mouseover( function( event ){
			//TODO if the mouse is close to the column border, change the poiner image
		});
		
		//FIXME: unable to locate the th elements
		console.log( this.oTableElement.find('tr.columnHeaders th') );
		// store some data about the column being resized
		this.oTableElement.find('tr.columnHeaders th').mousedown( function( event ){
			
			var oElementLeft, oElementRight;
			
			var bThisIsLeft = ( event.pageX > jQuery(this).offset().left() + 3 );
			
			var oElementLeft = bThisIsLeft ? jQuery(this) : jQuery(this).getColumnNext(); // get element to the right
			
			var oElementRight = bThisIsLeft ? jQuery(this).getColumnPrevious() : jQuery(this); // get element to the left
			
			oDynamicTable.oColumnHandleData = {
					iColumnIndex: 	jQuery(this).parent().children().index(jQuery(this)),
					oElementLeft: 	bThisIsLeft ? jQuery(this) : jQuery(this).getColumnNext(),
					oElementRight: 	bThisIsLeft ? jQuery(this).getColumnPrevious() : jQuery(this),
					iStartX: 		event.pageX
			};
			
			console.log( oDynamicTable.oColumnHandleData );
		});
		
		jQuery(document).mousemove(function(e) {
	        if(oDynamicTable.oColumnHandleData != null ) {
	            jQuery(oDynamicTable.columnHandlePressed).width(startWidth+(e.pageX-startX));
	        }
	    });
		
		jQuery(document).mouseup(function(event){
			if( oDynamicTable.oColumnHandleData != null ){
				oDynamicTable.oColumnHandleData = null;
			}
		});
	}
}

/**
 * Performs an ajax request to retrieve the json data,
 * then transforms that data and renders it in the table
 */
DynamicTable.prototype.render = function(){	
	var oDynamicTable = this;
	
	jQuery.ajax({
		url: this.sUrl,
		dataType: 'json',
		//data: data,
		success: function( data, textStatus, jqXHR ){	
			oDynamicTable._transformData(data);
			
			oDynamicTable._fillTable();
		} 
	});
}


/**
 * Converts received json data into a format that will make filling the table easier.
 * 
 * Performs the work of pagination and search filtering to build out the rows.
 */
DynamicTable.prototype._transformData = function( data ){
	
	this.aColumns = data.columns;
	
	//holds all of the data retrieved after filtering with search term
	var aaRows = [];	
	
	if( this.bSearchable && this.sSearchTerm ){
		
		var sLowerCaseTerm = this.sSearchTerm.toLowerCase();
		
		var aSearchTerms = sLowerCaseTerm.split( ' ' );
		
		var bRowMatch;
		
		for( iRow = 0; iRow < data.rows.length; iRow++ ){
			bRowMatch = false;
			
			for( iColumn = 0; iColumn < data.rows[iRow].length; iColumn++ ){				
				if( data.rows[iRow][iColumn].toLowerCase().indexOf( sLowerCaseTerm ) != -1 ){
					bRowMatch = true;
				}
			}
			
			if( bRowMatch ){
				aaRows.push( data.rows[iRow] );
			}
		}
		
	}
	else{
		aaRows = data.rows;		
	}
	
	this.aaaPages = [];
	
	if( !this.bPaging || this.iPageRowCount == 0 ){
		this.iPageRowCount = data.rows.length;
	}
	
	//paginate the data
	for ( i = 0; i < data.rows.length; i += this.iPageRowCount ) {
		var aaPageRows = aaRows.slice( i, i + this.iPageRowCount );
		
	    this.aaaPages.push( aaPageRows );
	}
}

/**
 * Renders the data that has been set up on the DynamicTable
 * by iterating over all rows and columns to build valid html
 */
DynamicTable.prototype._fillTable = function(){	

	var aaPageRows = this.aaaPages[this.iCurrentPage];
	
	var aaRows = [];
	
	if( typeof( aaPageRows ) == 'undefined' || aaPageRows.length == 0 ){
		aaRows.push( '<tr><td colspan="' + this.aColumns.length + '">No data to display</td></tr>')
	}
	else{
		for (var i = 0; i < aaPageRows.length; i++) {
			aaRows.push( '<tr><td>' + aaPageRows[i].join('</td><td>') + '</td></tr>' );
		}
	}

	//set up colspan for the inputs and paging elements in theadn and tfoot
	this.oTableElement.find('thead').find('tr.inputs th').attr( 'colspan', this.aColumns.length );	
	this.oTableElement.find('tfoot').find('tr.paging td').attr( 'colspan', this.aColumns.length );
	
	//set up the column headers
	this.oTableElement.find('thead').find('tr.columnHeaders').html( '<th>' + this.aColumns.join('</th><th>') + '</th>' );

	//fill tbody with all the generated rows
	this.oTableElement.find('tbody').html( aaRows.join('') );
	
	//make any changes to the base table structure that rely on the data being rendered
	this._updateTableStructure();
}

/**
 * Makes any changes needed after rendering data into the table.
 */
DynamicTable.prototype._updateTableStructure = function(){
	
	if( this.bPaging ){
		//if we are on the last page, don't render next or last links
		if( this.iCurrentPage == this.aaaPages.length - 1 ){
			this.oTableElement.find('a.paging-btn-next').css('display', 'none');
			this.oTableElement.find('a.paging-btn-last').css('display', 'none');
		}	
		else{
			this.oTableElement.find('a.paging-btn-next').css('display', 'inline');
			this.oTableElement.find('a.paging-btn-last').css('display', 'inline');
		}
		
		//if we are on the first page, don't render first or previous links
		if( this.iCurrentPage == 0 ){
			this.oTableElement.find('a.paging-btn-previous').css('display', 'none');
			this.oTableElement.find('a.paging-btn-first').css('display', 'none');
		}
		else{
			this.oTableElement.find('a.paging-btn-previous').css('display', 'inline');
			this.oTableElement.find('a.paging-btn-first').css('display', 'inline');
		}

		this.oTableElement.find('tfoot tr.paging span.paging-current-page').html( (this.iCurrentPage + 1) );
		this.oTableElement.find('tfoot tr.paging span.paging-total-pages').html( (this.aaaPages.length ) );
	}

}