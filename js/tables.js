
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
	
	this.oTableElement = $(oTableElement);
	
	this.sUrl = sUrl;
	
	this.iWidth = iWidth;
	this.iHeight = iHeight;
	
	this.bPaging = true;//bPaging;
	this.bDraggable = bDraggable;
	this.bTableResizeable = bTableResizeable;
	this.bColumnsResizeable = bColumnsResizeable;
	this.bSearchable = true; //bSearchable;
	
	//an array of column names
	this.aColumns = [];
	
	//holds 2 dimensional array. pages with rows
	this.aaaPages = [];
	
	//holds the total records retrieved from data source
	this.iTotalRecords = 0;
	
	//holds the number of records filtered after search
	this.iFilteredRecords = 0;
	
	//user input values
	
	//the search term entered in the search box, if enabled
	this.sSearchTerm = '';	
	
	//the number of records to display on a page
	this.iPageRowCount = 10;
	
	//the page to render
	this.iCurrentPage = 0;
	
	this._prepareTable();
}

DynamicTable.prototype._bindEventListeners = function(){
	
	var oDynamicTable = this;
	
	this.oTableElement.find('.refresh').click( function(){
		oDynamicTable.render();
	});
	
	if( this.bPaging ){
		this.oTableElement.find('select.paging').blur( function(){
			alert( this.val() );
			oDynamicTable.iPageRowCount = this.val();
		});
	}
	
	if( this.bSearchable ){
		this.oTableElement.find('input.search').blur( function(){
			oDynamicTable.sSearchTerm = this.value;
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

	this.oTableElement.find('thead').find('tr.inputs th').attr( 'colspan', this.aColumns.length );
	
	this.oTableElement.find('thead').find('tr.columnHeaders').html( '<th>' + this.aColumns.join('</th><th>') + '</th>' );

	this.oTableElement.find('tbody').html( aaRows.join('') );

	this._bindEventListeners();
}

/**
 * Renders the the intial(static) markup needed to load data into the table,
 * like thead and tbody and the input elements
 */
DynamicTable.prototype._prepareTable = function(){	
	var aInputs = [];
	
	if( this.bPaging ){
		
		aOptions = [ 3, 4, 10, 15, 20, 50, 100 ];
		
		aOptionStrings = [];
		
		for( i = 0; i < aOptions.length; i++ ){			
			var sSelected = aOptions[i] == this.iPageRowCount ? ' selected="selected"' : '';
			
			aOptionStrings.push( '<option value="' + aOptions[i] +'"' + sSelected + '>' + 
									aOptions[i] + '</option>');
		}
				
		aInputs.push( 	'<label for="paging">Paging</label>' + 
						'<select class="paging"> ' + 
						aOptionStrings.join('') + '</select>' );
	}
	
	if( this.bSearchable ){
		aInputs.push( 	'<label for="search">Search</label>' + 
						'<input type="text" class="search" ' + 
							'value="' + this.sSearchTerm + '"></input>' );
	}
	
	aInputs.push( '<input type="submit" class="refresh" value="Refresh"></input>' );
	
	var sHead = 	'<thead>' +
						'<tr class="inputs"><th>' + 
								aInputs.join('') + '</th></tr>' +
						'<tr class="columnHeaders"></tr>' + 
					'</thead>';
	
	
	
	var sBody = '<tbody></tbody>';
	
	this.oTableElement.html( sHead + sBody );
	
}
