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
	 
	 /**
	 * Holds information about the columns to be resized and 
	 * the original x-coordinate when the mouse was clicked
	 */
	this.oColumnHandleData = null;
	
	/**
	 * Holds information about the handle grabbed,
	 * including the last mouse location and which
	 * handle is active ( bottom, right, etc )
	 */
	this.oTableResizeHandleData = null;
	
	/**
	 * Holds information about the last mouse
	 * location when dragging the table
	 */
	this.oTableDragHandleData = null;
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
		this._initEventListenersPaging();
	}
	
	if( this.bSearchable ){
		this.oTableElement.find('form.search').submit( function(event){
			event.preventDefault();
			
			oDynamicTable.sSearchTerm = this.term.value;
			oDynamicTable.render();
		});
	}
	
	if( this.bDraggable ){
		this._initEventListenersDraggable();
	}
	
	if( this.bTableResizeable ){
		this._initEventListenersTableResizeable();
	}
	
	if( this.bColumnsResizeable ){
		this._initEventListenersColumnsResizeable();
	}
}

/**
 * Binds event listeners for the paging feature
 */
DynamicTable.prototype._initEventListenersPaging = function(){

	var oDynamicTable = this;
	
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

/**
 * Bind event listeners for the columns resizeable feature
 */
DynamicTable.prototype._initEventListenersColumnsResizeable = function(){
	
	var oDynamicTable = this;
	
	jQuery(document).mousemove(function(event) {
        if(oDynamicTable.oColumnHandleData != null ) {
        	var iXChange = event.pageX - oDynamicTable.oColumnHandleData.iStartXCoordinate;

        	var oElement = oDynamicTable.oColumnHandleData.oElement;

    		jQuery(oElement).width( oDynamicTable.oColumnHandleData.iStartWidth + iXChange );
        }
    });
	
	jQuery(document).mouseup(function(event){
		if( oDynamicTable.oColumnHandleData != null ){
			oDynamicTable.oColumnHandleData = null;
		}
	});
}

/**
 * Bind event listeners for the table resizeable feature
 */
DynamicTable.prototype._initEventListenersTableResizeable = function(){
	
	var oDynamicTable = this;
	
	// add table handle pointers based on location
	this.oTableElement.mousemove( function( event ){
		var sCursorStyle = 'default';

		if( oDynamicTable.oTableResizeHandleData ){
			//if the tableHandle is in the process 
			//	of moving, don't bother changing the cursor
			return; 
		}
		
		//returns one of ( n, ne, e, se, s, sw, w, nw )
		sBoundaryLocation = MouseLocationDetector.getCoveredBoundaries(event, this);
		
		//only allowing resizing from east and/or south borders to start with
		if( sBoundaryLocation == 's' || sBoundaryLocation == 'se' || sBoundaryLocation == 'e' ){
			sCursorStyle = sBoundaryLocation + '-resize';
		}
		
		if( sCursorStyle != 'default'){
			jQuery('body').css('cursor', sCursorStyle );
		}
	});
	
	// remove the column handle pointer
	this.oTableElement.mouseout( function( event ){
		if( oDynamicTable.oTableResizeHandleData == null ){
			jQuery('body').css('cursor', 'default');
		}
	});
	
	// store some data about boundary that was clicked and the x,y coordinates
	this.oTableElement.mousedown( function( event ){	
		sBoundaries = MouseLocationDetector.getCoveredBoundaries(event, this);
		
		if( sBoundaries != null ){
			event.preventDefault();
			oDynamicTable.oTableResizeHandleData = {
					sBoundaries: sBoundaries,
					oStartCoordinate:	{
						x: event.pageX,
						y: event.pageY
					},
					oStartSize:	{
						iWidth: oDynamicTable.oTableElement.width(),
						iHeight: oDynamicTable.oTableElement.height() 
					}
			};
		}
	});
	
	//adjust the width and height of the table if the handle has been pressed
	jQuery(document).mousemove( function( event ) {
        if(oDynamicTable.oTableResizeHandleData != null ) {
        	var iXChange = event.pageX - oDynamicTable.oTableResizeHandleData.oStartCoordinate.x;
        	var iYChange = event.pageY - oDynamicTable.oTableResizeHandleData.oStartCoordinate.y;
        	
        	var sBoundaries = oDynamicTable.oTableResizeHandleData.sBoundaries;
        	
        	if( iXChange != 0 ){
	        	if( sBoundaries.indexOf('e') != -1 ){
	        		oDynamicTable.oTableElement.width( oDynamicTable.oTableResizeHandleData.oStartSize.iWidth + iXChange );
	        	}
        	}
        	
        	if( iYChange != 0 ){
        		if( sBoundaries.indexOf('s') != -1 ){
	        		oDynamicTable.oTableElement.height( oDynamicTable.oTableResizeHandleData.oStartSize.iHeight + iYChange );
        		}
        	}
        }
    });
	
	jQuery(document).mouseup(function(event){
		if( oDynamicTable.oTableResizeHandleData != null ){
			oDynamicTable.oTableResizeHandleData = null;
		}
	});
}

/**
 * Bind event listeners for the draggable feature
 */
DynamicTable.prototype._initEventListenersDraggable = function(){
	
	var oDynamicTable = this;
	
	// add table handle pointers based on location
	this.oTableElement.mousemove( function( event ){
		var sCursorStyle = 'default';

		if( oDynamicTable.oTableDragHandleData ){
			//if the tableHandle is in the process 
			//	of moving, don't bother changing the cursor
			return; 
		}
		
		//returns one of ( n, ne, e, se, s, sw, w, nw )
		sBoundaryLocation = MouseLocationDetector.getCoveredBoundaries(event, this);
		
		//only allowing resizing from east and/or south borders to start with
		if( sBoundaryLocation == 'n' ){
			sCursorStyle = 'move';
		}
		
		if( sCursorStyle != 'default'){
			jQuery('body').css('cursor', sCursorStyle );
		};
	});
	
	// remove the column handle pointer
	this.oTableElement.mouseout( function( event ){
		if( oDynamicTable.oTableDragHandleData == null ){
			jQuery('body').css('cursor', 'default');
		}
	});
	
	// store the x,y coordinates
	this.oTableElement.mousedown( function( event ){	
		sBoundaries = MouseLocationDetector.getCoveredBoundaries(event, this);
		
		if( sBoundaries != null && sBoundaries == 'n' ){
			event.preventDefault();
			oDynamicTable.oTableDragHandleData = {
					oStartCoordinate:	{
						x: event.pageX,
						y: event.pageY
					},
					oStartOffset:	oDynamicTable.oTableElement.offset()
			};
		}
	});
	
	//adjust the width and height of the table if the handle has been pressed
	jQuery(document).mousemove( function( event ) {
        if(oDynamicTable.oTableDragHandleData != null ) {
        	var iXChange = event.pageX - oDynamicTable.oTableDragHandleData.oStartCoordinate.x;
        	var iYChange = event.pageY - oDynamicTable.oTableDragHandleData.oStartCoordinate.y;

        	oDynamicTable.oTableElement.offset({
        		left: oDynamicTable.oTableDragHandleData.oStartOffset.left + iXChange,
        		top: oDynamicTable.oTableDragHandleData.oStartOffset.top + iYChange,
        	});
        }
    });
	
	jQuery(document).mouseup(function(event){
		if( oDynamicTable.oTableDragHandleData != null ){
			oDynamicTable.oTableDragHandleData = null;
		}
	});
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
	
	//bind any event handlers that rely on data existing in the table
	this._bindDataDrivenEventHandlers();
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

/**
 * Any event handlers that rely on data being populated in the table should be added here.
 * This function is called after filling the table and column headers with data.
 */
DynamicTable.prototype._bindDataDrivenEventHandlers = function(){
	if( this.bColumnsResizeable ){
		this._bindColumnsResizeableEventHandlers();
	}
}

DynamicTable.prototype._bindColumnsResizeableEventHandlers = function(){
	var oDynamicTable = this;
	
	// add the column handle pointers if on the left or right boundary of a th cell in the columnHeaders row
	this.oTableElement.find('tr.columnHeaders th').mousemove( function( event ){
		var sCursorStyle;
		
		if( oDynamicTable.oColumnHandleData ){
			//if the columnHandle is in the process 
			//	of moving, don't bother changing the cursor
			return; 
		}
		if( MouseLocationDetector.onRightBoundary( event, this ) ){
			sCursorStyle = 'e-resize';
		}
		else{
			sCursorStyle = 'default';
		}
		
		jQuery('body').css('cursor', sCursorStyle );
	});
	
	// remove the column handle pointer
	this.oTableElement.find('tr.columnHeaders th').mouseout( function( event ){
		jQuery('body').css('cursor', 'default');
	});
	
	// store some data about the column being resized
	this.oTableElement.find('tr.columnHeaders th').mousedown( function( event ){			
		if( MouseLocationDetector.onRightBoundary( event, this ) ){
			event.preventDefault();
			oDynamicTable.oColumnHandleData = {
					oElement: 			this,
					iStartXCoordinate:	event.pageX,
					iStartWidth:		$(this).width()
			};
		}
	});
}

/**
 * Extend jquery with a function to create and render a new DynamicTable
 */
jQuery.extend( jQuery, {
	createDynamicTable: function( oSettings ){
		var oDynamicTable = new DynamicTable( oSettings );
		
		oDynamicTable.render();
	}
});

/**
 * The MouseLocationDetector object contains function for determining teh mouse's
 * location relative to an element. It assists in resizing of columns and the table itself.
 */
var MouseLocationDetector = {
		
	/**
	 * holds the size a boundary in pixels
	 */
	iBoundarySize: 10,
	
	/**
	 * Returns true if the mouse is inside of the right boundary, false otherwise
	 */
	onRightBoundary: function( event, element ){
		var iRightEdgeXCoordinate = jQuery(element).offset().left + jQuery(element).outerWidth();
	
		var iLeftEdgeXCoordinate = iRightEdgeXCoordinate - MouseLocationDetector.iBoundarySize;
		
		return ( event.pageX > iLeftEdgeXCoordinate && event.pageX < iRightEdgeXCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the left boundary, false otherwise
	 */
	onLeftBoundary: function( event, element ){
		var iLeftEdgeXCoordinate = jQuery(element).offset().left;
		
		var iRightEdgeXCoordinate = iLeftEdgeXCoordinate + MouseLocationDetector.iBoundarySize;
		
		return ( event.pageX > iLeftEdgeXCoordinate && event.pageX < iRightEdgeXCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the top boundary, false otherwise
	 */
	onTopBoundary: function( event, element ){
		var iTopEdgeYCoordinate = jQuery(element).offset().top;
	
		var iBottomEdgeYCoordinate = iTopEdgeYCoordinate + MouseLocationDetector.iBoundarySize;

		return ( event.pageY < iBottomEdgeYCoordinate && event.pageY > iTopEdgeYCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the bottom boundary, false otherwise
	 */
	onBottomBoundary: function( event, element ){
		var iBottomEdgeYCoordinate = jQuery(element).offset().top + jQuery(element).outerHeight();
	
		var iTopEdgeYCoordinate = iBottomEdgeYCoordinate - MouseLocationDetector.iBoundarySize;

		return ( event.pageY < iBottomEdgeYCoordinate && event.pageY > iTopEdgeYCoordinate );
	},
	
	/**
	 * Returns a string containing one of the following:
	 * 	[n, ne, e, se, s, sw, nw]
	 * based on the location of the mouse within the element.
	 * 
	 * If the mouse is not over any border, null is returned.
	 */
	getCoveredBoundaries: function( event, element ){
		var sLocation = '';
		
		if( MouseLocationDetector.onRightBoundary( event, element ) ){
			sLocation = 'e' + sLocation;
		}
		else if ( MouseLocationDetector.onLeftBoundary( event, element ) ){
			sLocation = 'w' + sLocation;
		}
		
		if ( MouseLocationDetector.onBottomBoundary( event, element ) ){
			sLocation = 's' + sLocation;
		}
		else if ( MouseLocationDetector.onTopBoundary( event, element ) ){
			sLocation = 'n' + sLocation;
		}
		
		return sLocation != '' ? sLocation : null;
	}
}