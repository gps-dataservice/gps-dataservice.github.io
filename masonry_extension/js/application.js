'use strict';

(function () {
	
	//const defaultIntervalInMin = '5';
	
	let unregisterSettingsEventListener = null;
	let unregisterFilterEventListener = null;
	let unregisterMarkSelectionEventListener = null;
	let unregisterParameterEventListener = null;
	
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      drawChartJS();
	  
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
	  
	if ($('.grid').data('masonry')) {
		$('.grid').masonry('destroy');
		$('.grid').removeData('masonry'); 
		$('.grid-item').remove();  		
	}
    
	$('.grid').addClass('are-images-unloaded');	

	const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    // Finds a worksheet called pictureData
    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === "pictureData";
    });

    	
	if (unregisterFilterEventListener != null) {
      unregisterFilterEventListener();
    }
    if (unregisterMarkSelectionEventListener != null) {
      unregisterMarkSelectionEventListener();
    }	
	
    worksheet.getSummaryDataAsync().then(function (sumdata) {      
      var worksheetData = sumdata.data;
	  var pictureColumn = sumdata.columns.find(column => column.fieldName === "picture");  
	  var likesColumn = sumdata.columns.find(column => column.fieldName.includes("likes"));  
	  var commentsColumn = sumdata.columns.find(column => column.fieldName.includes("comments")); 
	  var engagementColumn = sumdata.columns.find(column => column.fieldName.includes("engagement_rate"));       
      
	  console.log(sumdata.data)
	  console.log(sumdata.columns)
	  
      var elems = getItems(worksheetData, pictureColumn.index, likesColumn.index, commentsColumn.index, engagementColumn.index);
      $('.grid').append( $(elems) );

    	  
	  var $grid = $('.grid').imagesLoaded( function() {		
		$grid.masonry({
			itemSelector: '.grid-item', // select none at first
			columnWidth: '.grid__col-sizer',
			gutter: '.grid__gutter-sizer',
			percentPosition: true,
			stagger: 30,
			// nicer reveal transition
			visibleStyle: { transform: 'translateY(0)', opacity: 1 },
			hiddenStyle: { transform: 'translateY(100px)', opacity: 0 }
			});
		$grid.removeClass('are-images-unloaded');
	  });

		  
	  $grid.find('figcaption').click(function(event) {		  
		  event.preventDefault();		  
		  $( this ).closest('.grid-item').toggleClass('grid-item--gigante');		  
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
  
  function getItems(dataArray, img_col, likes_col, comments_col, engagement_col) {
		var items = [];
		for ( var i = 0; i < dataArray.length; i++ ) {
			items.push(getImageItem(dataArray[i][img_col].value,dataArray[i][likes_col].value,dataArray[i][comments_col].value,dataArray[i][engagement_col].value));
			}
		return items;
	}
	
  function getImageItem(img_src, likes_src, comments_src, engagement_src) {
		//create grid item
		var item = document.createElement('div');		
		item.className = 'grid-item'
		
		//create image element
		var img = document.createElement('img'); 
		img.src = img_src		 
		
		//create information overlay element
		var figcaption = document.createElement('figcaption');		
		
		var list = document.createElement('ul');
		list.className = 'metric';		
    
        var likes = document.createElement('li');
		likes.className = 'likes';		
		likes.innerHTML = '<span>' + likes_src + '</span> <span class="glyphicon glyphicon-thumbs-up"></span>';
		list.appendChild(likes);
		
		var comments = document.createElement('li');
		comments.className = 'comments';		
		comments.innerHTML = '<span>' + comments_src + '</span> <span class="glyphicon glyphicon-comment"></span>';
		list.appendChild(comments);
		
		var engagement = document.createElement('li');
		engagement.className = 'engagement';		
		engagement.innerHTML = '<span>' + engagement_src + '%' + '</span> <span class="glyphicon glyphicon-star"></span>';
		list.appendChild(engagement);

        figcaption.appendChild(list);
        
		//append image and overlay
		item.appendChild(img); 
		item.appendChild(figcaption);        
    	
		return item;  
	}

})();