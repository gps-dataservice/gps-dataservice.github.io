'use strict';

(function () {
	
	//const defaultIntervalInMin = '5';
	
	let unregisterSettingsEventListener = null;
	let unregisterFilterEventListener = null;
	let unregisterMarkSelectionEventListener = null;
	let unregisterParameterEventListener = null;
	
  $(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
      drawChartJS();
	  
      unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        drawChartJS();
      });
	  tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        parameters.forEach(function (p) {
          p.addEventListener(tableau.TableauEventType.ParameterChanged, (parameterEvent) => {
            drawChartJS();
          });
        });
      });
	  
    }, function () { console.log('Error while Initializing: ' + err.toString()); });
  });
  

  function drawChartJS() {	
    //$('.grid').masonry('destroy');
    //$('.grid').removeData('masonry');
	$('.grid').addClass('are-images-unloaded');
	$('.grid-item').remove();  

    var worksheetName = tableau.extensions.settings.get("worksheet");
    //var categoryColumnNumber = tableau.extensions.settings.get("categoryColumnNumber");
    var valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");

    const worksheets=tableau.extensions.dashboardContent.dashboard.worksheets;
	
	if (unregisterFilterEventListener != null) {
      unregisterFilterEventListener();
    }
    if (unregisterMarkSelectionEventListener != null) {
      unregisterMarkSelectionEventListener();
    }
	
    var worksheet=worksheets.find(function (sheet) {
      return sheet.name===worksheetName;
    });	
	
    worksheet.getSummaryDataAsync().then(function (sumdata) {
      //var labels = [];
      var data = [];
      var worksheetData = sumdata.data;
      
      for (var i=0; i<worksheetData.length; i++) {
        //labels.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
        data.push(worksheetData[i][valueColumnNumber-1].value);
      }
	  
	  //var parsed = JSON.stringify(data)
	  //$("#elements").html(parsed);
      var $elems = getItems(data);

      $('.grid').append( $elems );

      var $grid = $('.grid').masonry({
		itemSelector: 'none', // select none at first
		columnWidth: '.grid__col-sizer',
		gutter: '.grid__gutter-sizer',
		percentPosition: true,
		stagger: 30,
		// nicer reveal transition
		visibleStyle: { transform: 'translateY(0)', opacity: 1 },
		hiddenStyle: { transform: 'translateY(100px)', opacity: 0 },
	  });
	  
	  $grid.imagesLoaded( function() {
		$grid.removeClass('are-images-unloaded');
		$grid.masonry( 'option', { itemSelector: '.grid-item' });
		var $items = $grid.find('.grid-item');
		$grid.masonry( 'appended', $items );
	  });

	//  var $grid = $('.grid').masonry({
	//	  itemSelector: '.grid-item',    
	//	  columnWidth: 300,
	//	  isFitWidth: true
	//	});
	//  	  
	//  $grid.imagesLoaded().progress( function() {
	//	  $grid.masonry();
	//	});	  
	
	  $grid.on( 'click', '.grid-item', function() {		
		  $( this ).toggleClass('grid-item--gigante');		
		  $grid.masonry();
	  });	  
	

    });
	
	unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (filterEvent) => {	  	
      drawChartJS();
    });
    unregisterMarkSelectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (markSelectionEvent) => {
      drawChartJS();
    });
	
  }
  
  function getItems(dataArray) {
		var items = [];
		for ( var i = 0; i < dataArray.length; i++ ) {
			items.push(getImageItem(dataArray[i]));
			}
		return $( items );
	}
	
  function getImageItem(img_src) {
		var item = document.createElement('div');
		var wRand = Math.random();
		var hRand = Math.random();
		var widthClass = wRand > 0.8 ? 'grid-item--width3' : wRand > 0.6 ? 'grid-item--width2' : '';  
		item.className = 'grid-item ' + widthClass;
		var img = document.createElement('img'); 
		img.src = img_src
		item.appendChild(img);  
		return item;  
	}

  function configure() {
    const popupUrl=`https://gps-dataservice.github.io/masonry_extension/dialog.html`;
    let defaultPayload="";
    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { width: 500, height: 500 }).then((closePayload) => {
	//tableau.extensions.ui.displayDialogAsync(popupUrl, defaultIntervalInMin, { width: 500, height: 500 }).then((closePayload) => {
      drawChartJS();
    }).catch((error) => {
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user");
          break;
        default:
          console.error(error.message);
      }
    });
  }
})();