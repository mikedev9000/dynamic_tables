
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
	this.oTableElement;
	this.sUrl = sUrl;
	this.iWidth = iWidth;
	this.iHeight = iHeight;
	this.bPaging = bPaging;
	this.bDraggable = bDraggable;
	this.bTableResizeable = bTableResizeable;
	this.bColumnsResizeable = bColumnsResizeable;
	this.bSearchable = bSearchable;
	
	this.addEventListeners();
}

DynamicTable.prototype.addEventListeners = function(){
	// add refresh listener
	
	// if bPaging, add paging listener to oTableElement
	
	// if bDraggable, add draggable listener to oTableElement
	
	// if bTableResizable, add tableResize listener and styles
	
	// if bColumnsResizeable, add columnResize listener and styles
	
	// if bSearchable, add search listener and html
	
	alert( this.sUrl );
}


DynamicTable.prototype.getData = function(){
	//return an array of data from the url
}


DynamicTable.prototype.render = function( iRowCount, sSearchTerm ){
	//TODO if iRowCount == 0 iterate over all rows, else only iterate over the number of rows
	
	//if a sSearchTerm is defined check that one of the columns contains the sSearchTerm before rendering
}
