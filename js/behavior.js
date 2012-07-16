
//create the behavior object to hold all behaviors
var behavior = {};

/**
 * Creates a new Draggable object
 */
behavior.Draggable = function( oSettings ){
	
	// set up the defaults settings
	
	this.oElement = null;
	
	jQuery.extend( this, oSettings );
	
	this.oHandleData= null;
	
	this.bindEventListeners();
}; 

behavior.Draggable.prototype.bindEventListeners = function(){
	
	var oDraggable = this;
	
	// add table handle pointers based on location
	this.oElement.mousemove( function( event ){
		var sCursorStyle = 'default';

		if( oDraggable.oHandleData ){
			//if the tableHandle is in the process 
			//	of moving, don't bother changing the cursor
			return; 
		}
		
		//returns one of ( n, ne, e, se, s, sw, w, nw )
		sBoundaryLocation = behavior.MouseLocator.getCoveredBoundaries(event, this);
		
		//only allowing resizing from east and/or south borders to start with
		if( sBoundaryLocation == 'n' ){
			sCursorStyle = 'move';
		}
		
		if( sCursorStyle != 'default'){
			jQuery('body').css('cursor', sCursorStyle );
		};
	});
	
	// remove the column handle pointer
	this.oElement.mouseout( function( event ){
		if( oDraggable.oHandleData == null ){
			jQuery('body').css('cursor', 'default');
		}
	});
	
	// store the x,y coordinates
	this.oElement.mousedown( function( event ){	
		sBoundaries = behavior.MouseLocator.getCoveredBoundaries(event, this);
		
		if( sBoundaries != null && sBoundaries == 'n' ){
			event.preventDefault();
			oDraggable.oHandleData = {
					oStartCoordinate:	{
						x: event.pageX,
						y: event.pageY
					},
					oStartOffset:	oDraggable.oElement.offset()
			};
		}
	});
	
	//adjust the width and height of the table if the handle has been pressed
	jQuery(document).mousemove( function( event ) {
        if(oDraggable.oHandleData != null ) {
        	var iXChange = event.pageX - oDraggable.oHandleData.oStartCoordinate.x;
        	var iYChange = event.pageY - oDraggable.oHandleData.oStartCoordinate.y;

        	oDraggable.oElement.offset({
        		left: oDraggable.oHandleData.oStartOffset.left + iXChange,
        		top: oDraggable.oHandleData.oStartOffset.top + iYChange,
        	});
        }
    });
	
	jQuery(document).mouseup(function(event){
		if( oDraggable.oHandleData != null ){
			oDraggable.oHandleData = null;
		}
	});
};


/**
 * Creates a new Resizeable object
 */
behavior.Resizeable = function( oSettings ){
	
	// set up the defaults settings
	
	this.oElement = null;
	
	jQuery.extend( this, oSettings );
	
	this.oHandleData= null;
	
	this.bindEventListeners();
}; 

behavior.Resizeable.prototype.bindEventListeners = function(){
	
	var oResizeable = this;
	
	// add handle pointers based on location
	this.oElement.mousemove( function( event ){
		var sCursorStyle = 'default';

		if( oResizeable.oHandleData ){
			//if the tableHandle is in the process 
			//	of moving, don't bother changing the cursor
			return; 
		}
		
		//returns one of ( n, ne, e, se, s, sw, w, nw )
		sBoundaryLocation = behavior.MouseLocator.getCoveredBoundaries(event, this);
		
		//only allowing resizing from east and/or south borders to start with
		if( sBoundaryLocation == 's' || sBoundaryLocation == 'se' || sBoundaryLocation == 'e' ){
			sCursorStyle = sBoundaryLocation + '-resize';
		}
		
		if( sCursorStyle != 'default'){
			jQuery('body').css('cursor', sCursorStyle );
		}
	});
	
	
	// remove the handle pointer
	this.oElement.mouseout( function( event ){
		if( oResizeable.oHandleData == null ){
			jQuery('body').css('cursor', 'default');
		}
	});
	
	// store some data about boundary that was clicked and the x,y coordinates
	this.oElement.mousedown( function( event ){	
		sBoundaries = behavior.MouseLocator.getCoveredBoundaries(event, this);
		
		if( sBoundaries != null ){
			event.preventDefault();
			oResizeable.oHandleData = {
					sBoundaries: sBoundaries,
					oStartCoordinate:	{
						x: event.pageX,
						y: event.pageY
					},
					oStartSize:	{
						iWidth: oResizeable.oElement.width(),
						iHeight: oResizeable.oElement.height() 
					}
			};
		}
	});
	
	//adjust the width and height of the element if the handle has been pressed
	jQuery(document).mousemove( function( event ) {
        if(oResizeable.oHandleData != null ) {
        	var iXChange = event.pageX - oResizeable.oHandleData.oStartCoordinate.x;
        	var iYChange = event.pageY - oResizeable.oHandleData.oStartCoordinate.y;
        	
        	var sBoundaries = oResizeable.oHandleData.sBoundaries;
        	
        	if( iXChange != 0 ){
	        	if( sBoundaries.indexOf('e') != -1 ){
	        		oResizeable.oElement.width( oResizeable.oHandleData.oStartSize.iWidth + iXChange );
	        	}
        	}
        	
        	if( iYChange != 0 ){
        		if( sBoundaries.indexOf('s') != -1 ){
	        		oResizeable.oElement.height( oResizeable.oHandleData.oStartSize.iHeight + iYChange );
        		}
        	}
        }
    });
	
	jQuery(document).mouseup(function(event){
		if( oResizeable.oHandleData != null ){
			oResizeable.oHandleData = null;
		}
	});
};



/**
 * The behavior.MouseLocator object contains function for determining teh mouse's
 * location relative to an element. It assists in resizing of columns and the table itself.
 */
behavior.MouseLocator = {
		
	/**
	 * holds the size a boundary in pixels
	 */
	iBoundarySize: 10,
	
	/**
	 * Returns true if the mouse is inside of the right boundary, false otherwise
	 */
	onRightBoundary: function( event, element ){
		var iRightEdgeXCoordinate = jQuery(element).offset().left + jQuery(element).outerWidth();
	
		var iLeftEdgeXCoordinate = iRightEdgeXCoordinate - behavior.MouseLocator.iBoundarySize;
		
		return ( event.pageX > iLeftEdgeXCoordinate && event.pageX < iRightEdgeXCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the left boundary, false otherwise
	 */
	onLeftBoundary: function( event, element ){
		var iLeftEdgeXCoordinate = jQuery(element).offset().left;
		
		var iRightEdgeXCoordinate = iLeftEdgeXCoordinate + behavior.MouseLocator.iBoundarySize;
		
		return ( event.pageX > iLeftEdgeXCoordinate && event.pageX < iRightEdgeXCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the top boundary, false otherwise
	 */
	onTopBoundary: function( event, element ){
		var iTopEdgeYCoordinate = jQuery(element).offset().top;
	
		var iBottomEdgeYCoordinate = iTopEdgeYCoordinate + behavior.MouseLocator.iBoundarySize;

		return ( event.pageY < iBottomEdgeYCoordinate && event.pageY > iTopEdgeYCoordinate );
	},
	
	/**
	 * Returns true if the mouse is inside of the bottom boundary, false otherwise
	 */
	onBottomBoundary: function( event, element ){
		var iBottomEdgeYCoordinate = jQuery(element).offset().top + jQuery(element).outerHeight();
	
		var iTopEdgeYCoordinate = iBottomEdgeYCoordinate - behavior.MouseLocator.iBoundarySize;

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
		
		if( behavior.MouseLocator.onRightBoundary( event, element ) ){
			sLocation = 'e' + sLocation;
		}
		else if ( behavior.MouseLocator.onLeftBoundary( event, element ) ){
			sLocation = 'w' + sLocation;
		}
		
		if ( behavior.MouseLocator.onBottomBoundary( event, element ) ){
			sLocation = 's' + sLocation;
		}
		else if ( behavior.MouseLocator.onTopBoundary( event, element ) ){
			sLocation = 'n' + sLocation;
		}
		
		return sLocation != '' ? sLocation : null;
	}
};