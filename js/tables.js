
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
 function DynamicTable( oSettings ){
	 
	 //set up the default configuration
	 this.oTableElement = null;
	 this.sUrl = null;
	 this.iWidth = null;
	 this.iHeight = null;
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
	 $.extend( this, oSettings );
	
	 //an array of column names
	 this.aColumns = [];
	
	 //holds 2 dimensional array. pages with rows
	 this.aaaPages = [];
	
	 //holds the total records retrieved from data source
	 this.iTotalRecords = 0;
	
	 //holds the number of records filtered after search
	 this.iFilteredRecords = 0;
	
	 this._prepareTable();
}

 /**
  * Bind jQuery events for different features, based on the configuration
  */
DynamicTable.prototype._bindEventListeners = function(){
	
	var oDynamicTable = this;
	
	this.oTableElement.find('.refresh').click( function(){
		oDynamicTable.render();
	});

	if( this.bPaging ){
		this.oTableElement.find('select.paging').change( function(){
			oDynamicTable.iPageRowCount = $(this).find('option:selected').val();
			oDynamicTable.render();
		});
		
		this.oTableElement.find('a.paging-btn').click(function(event){
			event.preventDefault();
		});
		
		if( this.iCurrentPage == 0 ){
			this.oTableElement.find('a.paging-btn-previous').css('display', 'none');
			this.oTableElement.find('a.paging-btn-first').css('display', 'none');
		}
		else{
			this.oTableElement.find('a.paging-btn-previous').css('display', 'inline');
			this.oTableElement.find('a.paging-btn-first').css('display', 'inline');
			
			this.oTableElement.find('a.paging-btn-first').click(function(){
				oDynamicTable.iCurrentPage = 0;
				oDynamicTable.render();
			});
			
			this.oTableElement.find('a.paging-btn-previous').click(function(){
				oDynamicTable.iCurrentPage--;
				oDynamicTable.render();
			});
		}
		
		if( this.iCurrentPage == this.aaaPages.length - 1 ){
			this.oTableElement.find('a.paging-btn-next').css('display', 'none');
			this.oTableElement.find('a.paging-btn-last').css('display', 'none');
		}	
		else{
			this.oTableElement.find('a.paging-btn-next').css('display', 'inline');
			this.oTableElement.find('a.paging-btn-last').css('display', 'inline');
			
			this.oTableElement.find('a.paging-btn-next').click(function(){
				oDynamicTable.iCurrentPage++;
				oDynamicTable.render();
			});
		
			this.oTableElement.find('a.paging-btn-last').click(function(){
				oDynamicTable.iCurrentPage = oDynamicTable.aaaPages.length - 1;
				oDynamicTable.render();
			});
		}
	}
	
	if( this.bSearchable ){
		this.oTableElement.find('form.search').submit( function(event){
			event.preventDefault();
			
			oDynamicTable.sSearchTerm = this.term.value;
			oDynamicTable.render();
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
	
	this.oTableElement.find('tfoot').find('tr.paging td').attr( 'colspan', this.aColumns.length );
	
	this.oTableElement.find('thead').find('tr.columnHeaders').html( '<th>' + this.aColumns.join('</th><th>') + '</th>' );

	this.oTableElement.find('tbody').html( aaRows.join('') );

	this._bindEventListeners();
}

/**
 * Renders the the intial(static) markup needed before we 
 * can load data into the table
 * creates thead, tbody, tfoot, and the input elements
 * based on what features are enabled
 */
DynamicTable.prototype._prepareTable = function(){	
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
		
		aPagingElements.push( '	<label for="paging-current-page">Current Page</label>' + 
								'<input name="paging-current-page" value="' + 
									(this.iCurrentPage + 1) + '" readonly="readonly"></input>' );

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
	
	//TODO determine if ui is good for this or not
	//this.oTableElement.resizable();
	
}
