
/**
 * Creates a new Resizeable object
 */
function Resizeable( oSettings ){
	
	// set up the defaults settings
	
	this.oElement = null;
	
	jQuery.extend( this, oSettings );
	
	this.oHandleData= null;
	
	this.bindEventListeners();
}; 

Resizeable.prototype.bindEventListeners = function(){
	
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
		sBoundaryLocation = MouseLocator.getCoveredBoundaries(event, this);
		
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
		sBoundaries = MouseLocator.getCoveredBoundaries(event, this);
		
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