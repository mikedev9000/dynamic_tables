
/**
 * Creates a new Draggable object
 */
function Draggable( oSettings ){
	
	// set up the defaults settings
	
	this.oElement = null;
	
	jQuery.extend( this, oSettings );
	
	this.oHandleData= null;
	
	this.bindEventListeners();
}; 

Draggable.prototype.bindEventListeners = function(){
	
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
		sBoundaryLocation = MouseLocator.getCoveredBoundaries(event, this);
		
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
		sBoundaries = MouseLocator.getCoveredBoundaries(event, this);
		
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