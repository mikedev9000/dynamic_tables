

/**
 * The MouseLocator object contains function for determining teh mouse's
 * location relative to an element. It assists in resizing of columns and the table itself.
 */
var MouseLocator = {
		
	/**
	 * holds the size a boundary in pixels
	 */
	iBoundarySize: 10,
	
	/**
	 * Returns true if the mouse is inside of the right boundary, false otherwise
	 */
	onRightBoundary: function( event, element ){
		var iRightEdgeXCoordinate = jQuery(element).offset().left + jQuery(element).outerWidth();
	
		var iLeftEdgeXCoordinate = iRightEdgeXCoordinate - MouseLocator.iBoundarySize;
		
		return ( event.pageX > iLeftEdgeXCoordinate && event.pageX < iRightEdgeXCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the left boundary, false otherwise
	 */
	onLeftBoundary: function( event, element ){
		var iLeftEdgeXCoordinate = jQuery(element).offset().left;
		
		var iRightEdgeXCoordinate = iLeftEdgeXCoordinate + MouseLocator.iBoundarySize;
		
		return ( event.pageX > iLeftEdgeXCoordinate && event.pageX < iRightEdgeXCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the top boundary, false otherwise
	 */
	onTopBoundary: function( event, element ){
		var iTopEdgeYCoordinate = jQuery(element).offset().top;
	
		var iBottomEdgeYCoordinate = iTopEdgeYCoordinate + MouseLocator.iBoundarySize;

		return ( event.pageY < iBottomEdgeYCoordinate && event.pageY > iTopEdgeYCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the bottom boundary, false otherwise
	 */
	onBottomBoundary: function( event, element ){
		var iBottomEdgeYCoordinate = jQuery(element).offset().top + jQuery(element).outerHeight();
	
		var iTopEdgeYCoordinate = iBottomEdgeYCoordinate - MouseLocator.iBoundarySize;

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
		
		if( MouseLocator.onRightBoundary( event, element ) ){
			sLocation = 'e' + sLocation;
		}
		else if ( MouseLocator.onLeftBoundary( event, element ) ){
			sLocation = 'w' + sLocation;
		}
		
		if ( MouseLocator.onBottomBoundary( event, element ) ){
			sLocation = 's' + sLocation;
		}
		else if ( MouseLocator.onTopBoundary( event, element ) ){
			sLocation = 'n' + sLocation;
		}
		
		return sLocation != '' ? sLocation : null;
	}
};