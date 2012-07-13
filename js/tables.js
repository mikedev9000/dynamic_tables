
/**
 * Create a new DynamicTable
 * @param oTableElement
 * @param sUrl
 * @param iWidth
 * @param iHeight
 * @param bPaging
 * @param bDraggable
 * @param bTableResizeable
 * @param bColumnsResizable
 * @param bSearchable
 * @returns {DynamicTable}
 */
function DynamicTable( oTableElement, sUrl, iWidth, iHeight, bPaging, bDraggable, bTableResizeable, bColumnsResizeable, bSearchable ){
	
	this.oTableElement = oTableElement;
	
	this.sUrl = sUrl;
	
	this.iWidth = iWidth;
	this.iHeight = iHeight;
	
	this.bPaging = bPaging;
	this.bDraggable = bDraggable;
	this.bTableResizeable = bTableResizeable;
	this.bColumnsResizeable = bColumnsResizeable;
	this.bSearchable = true; //bSearchable;
	
	//an array of column names
	this.aColumns = [];
	
	//holds 2 dimensional array. pages with rows
	this.aaPages = [];
	
	//holds the total records retrieved from data source
	this.iTotalRecords = 0;
	
	//holds the number of records filtered after search
	this.iFilteredRecords = 0;
	
	//user input values
	
	//the search term entered in the search box, if enabled
	this.sSearchTerm = null;	
	
	//the number of records to display on a page
	this.iPageRowCount = null;
	
	//the page to render
	this.iCurrentPage = 0;
	
	this.addEventListeners();
}

DynamicTable.prototype.addEventListeners = function(){
	
	var oDynamicTable = this;
	
	this.oTableElement.find('input.refresh').click( function(){
		oDynamicTable.render();
	});
	
	if( this.bPaging ){
		this.oTableElement.find('input.paging').blur( function(){
			oDynamicTable.iPageRowCount = this.val();
		});
	}
	
	if( this.bSearchable ){
		this.oTableElement.find('input.search').blur( function(){
			oDynamicTable.sSearchTerm = this.val();
		});
	}
	
	if( this.bDraggable ){
		//TODO @see http://docs.jquery.com/UI/Draggable
		// ask if using jquery ui is acceptable or not
	}
	
	if( this.bTableResizable ){
		//TODO @see http://robau.wordpress.com/2011/06/09/unobtrusive-table-column-resize-with-jquery/
	}
	
	if( this.bColumnsResizeable ){
		//TODO @see http://robau.wordpress.com/2011/06/09/unobtrusive-table-column-resize-with-jquery/
	}
}

/**
 * Performs an ajax request to retrieve the json data,
 * then transforms that data and renders is in the table
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
	var aRows = [];	
	
	if( this.bSearchable && typeof( this.sSearchTerm ) != 'undefined' && this.sSearchTerm != '' && this.searchTerm != null ){
		
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
				aRows.push( data.rows[iRow] );
			}
		}
		
	}
	else{
		aRows = data.rows;		
	}
	
	this.aaPages = [];
	
	if( !this.bPaging ){
		this.iPageRowCount = data.rows.length;
	}
	
	//paginate the data
	for ( i = 0; i < data.rows.length; i += this.iPageRowCount ) {
		var aPageRows = aRows.slice( i, i + this.iPageRowCount );
		
	    this.aaPages.push( aPageRows );
	}
}

/**
 * Renders the data that has been set up on the DynamicTable
 * by iterating over all rows and columns to build valid html
 */
DynamicTable.prototype._fillTable = function(){	
	console.log( this.aaPages );

	var aPageRows = this.aaPages[this.iCurrentPage];
	
	var aRows = [];
	
	if( typeof( aPageRows ) == 'undefined' || aPageRows.length == 0 ){
		aRows.push( '<tr><td colspan="' + this.aColumns.length + '">No data to display</td></tr>')
	}
	else{
		for (var i = 0; i < aPageRows.length; i++) {
			aRows.push( '<tr><td>' + aPageRows[i].join('</td><td>') + '</td></tr>' );
		}
	}
	
	var sHeader = '<thead><tr><th>' + this.aColumns.join('</th><th>') + '</th></tr></thead>';
	
	var sBody = '<tbody>' + aRows.join('') + '</tbody>';

	this.oTableElement.html( sHeader + sBody );
}
