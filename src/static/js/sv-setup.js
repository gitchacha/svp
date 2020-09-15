$(window).on('message', function(event) {
	var data = event.originalEvent.data;
	if(data.from === 'child') {
		if(data.type === 'showProgress') {
			View.showProgress();
		}
		if(data.type === 'hideProgress') {
			View.hideProgress();
		}
		if(data.type === 'autoDestroyAlert') {
			if($sv.isNotEmpty(data.arg2)) {
				data.arg2 += '/';
				data.arg2 += data.iframeName;
			}
			$sv.autoDestroyAlert(data.arg1, data.arg2);
		}
		if(data.type === 'confirm') {
			if($sv.isNotEmpty(data.arg2)) {
				data.arg2 += '/';
				data.arg2 += data.iframeName;
			}
			$sv.confirm(data.arg1, data.arg2);
		}
		if(data.type === 'confirmFile') {
			if($sv.isNotEmpty(data.arg4)) {
				data.arg4 += '/';
				data.arg4 += data.iframeName;
			}
			$sv.confirmFile(data.arg1, data.arg2, data.arg3, data.arg4);
		}
		if(data.type === 'alert') {
			if($sv.isNotEmpty(data.arg2)) {
				data.arg2 += '/';
				data.arg2 += data.iframeName;
			}
			$sv.alert(data.arg1, data.arg2);
		}
		if(data.type === 'optionAlert') {
			if($sv.isNotEmpty(data.arg3)) {
				data.arg3 += '/';
				data.arg3 += data.iframeName;
			}
			$sv.optionAlert(data.arg1, data.arg2, data.arg3);
		}
	}
});


/** Alopex Page Load Setup  **/
var View = $a.page(function() {
	this.id;
	this.param;
	this.bizCodes;
	this.groupStandardCodes;
	this.groupStandardValues;
	this.searchCondition;
	this.preset;
	this.fileLoader = {};
	this.uiInitialize;

	/* Alopex UI Page Initialize */
	this.init = function(id, param) {
		this.id = id;
		this.param = param;

		// UI 공통 
		_ui = new UI_initialize();

		// Scroll interaction : Sticky, Grid header fixed, Grid x-scroll floating.. 등 스크롤 인터랙션 처리 객체
		_sc = new ScrollInteraction();
	};

	/* SVMS Business Code */
	this.setBizCodes = function(bizCodeIds) {
		this.bizCodes = $sv.getBizCodes(bizCodeIds);
	}

	this.setGroupStandardCodes = function(groupStandardCodes) {
		this.groupStandardCodes = groupStandardCodes;
	}

	this.setGroupStandardValues = function(groupStandardValues) {
		var values = {};
		$.each(groupStandardValues, function(index, item) {
			values[item.stdItmId] = item.stdItmVal;
		});
		this.groupStandardValues = values;
	}

	/* Alopex UI Custom Progress */
	var progressCount = 0;

	this.createCircleProgress = function() {
		this.progress = document.createElement('div');
		this.progress.className = 'progressImageWrap';
		var dur = this.option.durationOff ? this.option.durationOff : this.duration;
		$(this.progress).fadeIn(dur).insertAfter(this.overlay);
	};

	this.removeCircleProgress = function() {
		var that = this;
		var dur = this.option.durationOff ? this.option.durationOff : this.duration;
		$(this.progress).fadeOut(dur, function() {
			if(that.ptimer) {
				clearInterval(that.ptimer);
				that.ptimer = null;
			}
			$(that.progress).remove();
			that.progress = null;
		});
	};
	
	this.showProgress = function() {
		if(self !== top) {
			//팝업이므로 parent에서 실행 되도록한다.
			$sv.callParentWindow('showProgress');
			return;
		}

		this.progress = $('body').progress({
			duration : 300,
			durationOff : 500,
			appendIn : true
		});
		++progressCount;
	};

	this.hideProgress = function(callChild) {
		if(self !== top) {
			//팝업이므로 parent에서 실행 되도록한다.
			$sv.callParentWindow('hideProgress');
			return;
		}

		if(this.hasOwnProperty('progress')) {
			--progressCount;
			if(progressCount < 1) {
				this.progress.remove();
			}
		}
	};
	
	var progressBarTot = 0;
	var progressBarShow = false;
	var progressBarCallbackFunc = null;
	
	this.showProgressBar = function(totCnt, callback) {
		if (totCnt) {
			progressBarTot = totCnt;
		}

		this.progress = $('body').progress({
			createProgress: this.createProgressBar,
			removeProgress: this.removeProgressBar
		});

		// 콜백 추가
		if (callback && typeof(callback) === "function") {
			progressBarCallbackFunc = callback;
		}

		progressBarShow = true;
	};
	
	this.hideProgressBar = function(callback) {
		if (this.progress) {
			if(this.ptimer) {
				clearInterval(this.ptimer);
				this.ptimer = null;
			}
			
			this.progress.remove();
			progressBarShow = false;

			if (callback) { // callback 호출
				progressBarCallbackFunc.apply();
			}
		}
	};
	
	this.createProgressBar = function() {
		// progress wrapper
		this.progress = document.createElement('div');
		this.progress.className = 'progress__count';

		// progress count
		this.progressMsg = document.createElement('div');
		this.progressMsg.className = 'article';
		this.progressMsg.innerHTML = '<b class="per"><i></i></b><span class="count"><i class="due">0</i><i class="seperator">/</i><i class="max">'+ progressBarTot +'</i></span>';

		$(this.progress).html(this.progressMsg); // count html append
		$('body').append(this.progress);
		var _this = this;
		var $prg = $(_this.progressMsg);
	};
	
	this.increaseProgressBarCount = function() {
		var that = this;
		var _this = this.progress;
		var $prg = $(_this.progressMsg);
		var nextCount = Number($prg.find('.due').text()) + 1;
		var $prgDue = $prg.find('.due').text(nextCount);
		$prgDue.text(nextCount); // 진행 건수
		$prg.find('.per i').css('width', Math.ceil((nextCount / progressBarTot)*100) + '%' ); // 진행 Bar
		
		if(nextCount === progressBarTot) {
			this.ptimer = setInterval(function() {
				that.hideProgressBar(true);
			}, 1200);
		}
	}
	
	this.removeProgressBar = function() {
		$(this.progress).remove();
		this.progress = null;
		progressShowBar = false;
	};
	
	AlopexOverlay.defaultOption.createProgress = this.createCircleProgress;
	AlopexOverlay.defaultOption.removeProgress = this.removeCircleProgress;
});

/* Alopex UI Request Setup */
$a.request.setup({
	useServiceId: false,
	method: 'get',
	withCredentials: true,
	timeout: 30000,
	url: function(id, param) {
		if(id.indexOf($sv.BASE_PATH) > -1 || id.indexOf(SERVER_FILE_SERVICE_URL) > -1
				|| id.indexOf(SERVER_BATCH_SERVICE_URL) > -1) {
			return id;
		} else {
			return $sv.getRestApiAddr() + '/v1/api/' + id;
		}
	},
	before: function(id, option) {
		this.requestHeaders["Content-Type"] ="application/json; charset=UTF-8";
		if(this.progress) {
			View.showProgress();
		}
	},
	after: function(res) {
		if(res.hasOwnProperty('status')) {
			if(res.status !== 200) {
				this.isSuccess = false;
			}
		}
	},
	fail: function(res) {
		//Business Exception
		return;
		try {
			if(this.alertFailMessage) {
				$sv.alert(res.message.replace(/\\n/g, '\n'));
			}

			if(res.errorCode === 'LOGIN.00000009') {
				//세션만료
				$sv.alert(res.message);
				location.reload();
			}
		} catch (e) {
			$sv.alert(JSON.stringify(res));
		} finally {
			console.log("Business Exception!!\n\nres :: \n\n" + JSON.stringify(res));
		}
	},
	error: function(errObject) {
		//통신이 실패한 경우 호출되는 콜백함수
		return;
		try {
			if(this.alertErrorMessage) {
				var res = JSON.parse(errObject.response);
				var msg = res.message.replace(/\\n/g, '\n');
				msg += '\n';
				msg += 'status: ';
				msg += res.status;
				msg += '\n';
				msg += 'Business Login Error인 경우 서버에서 RuntimeException으로 처리하세요.';
				$sv.alert(msg);
			}
		} catch (e) {
			$sv.alert(JSON.stringify(errObject));
		} finally {
			console.log("error!! : Biz Error인 경우 서버에서 RuntimeException으로 처리하세요.\n\nres :: \n\n" + JSON.stringify(errObject));
		}
	},
	last: function(res, status, httpstatus) {
		// 통신성공,실패여부와 관계없이 맨 마지막에 호출되는 콜백함수
		if(this.progress) {
			View.hideProgress();
		}
		
		inputSearchEmpty();

		/** GridInit
		 * @desc Grid내부 커스텀 AlopexUI Component 초기화 등 Grid render 이후 작업 정의
		 * @selector $('.gridInitClass') : Grid 공통 클래스(custom)
		 */

		var $targetGrid;
		if (document.querySelector('.Tabs')) { // Tab 있을 경우
			$targetGrid = $('.Tabs .af-tabs-content .gridInitClass');
		} else {
			$targetGrid =  $('.gridInitClass:visible');
		}

		$targetGrid.each(function(i, target){
			const id = target.getAttribute('id');
			$('#'+id).on({
				'gridRefresh' : function(e){
					gridLastCellDesign($(this));
				}
			});
		});
	}
});

/** Alopex Grid 공통 Setup */
var alosetup = AlopexGrid.setup({
	height: 'content',					//현재 표시하고 있는 행의 개수에 맞추어 높이가 늘어나거나 줄어듬
	width: 'parent',					//최대 폭으로 생성됨
	autoColumnIndex: true,				//칼럼 순서에 따라 0부터 1씩 증가하여 인덱스 값이 설정
	fitTableWidth: true,				//테이블의 너비를 그리드 너비에 맞춰 확장
	mergeEditingImmediately: true,		//편집 활성화 상태를 유지하면서 바로 변경된 값을 저장하도록 설정
	endInlineEditByOuterClick: true,	//편집 종료 동작을 외부 영역 클릭으로도 가능하게 설정
	rowInlineEditOption: {
		endEditByEnter: false,			//편집중 엔터키를 누를 경우 해당 행의 편집이 종료되지 않도록 설정
//		disableEvent: true				//rowInlineEditStart, rowInlineEditEnd 이벤트를 사용하지 않도록 설정
	},
	message: {
		nodata :'조회 가능한 데이터가 없습니다.'
	},
	rowOption: {
		nodataRowHeight:157
	},
	rowSelectOption: {
		/* 행 선택 관련 옵션 */
		clickSelect: false,
		allowSingleUnselect: true,		//행 클릭하여 선택 해제 제어
		singleSelect: true,				//다건/단건 행 선택 여부를 제어(단건 선택으로 세팅)
		disableSelectByKey: true		//shift, ctrl로 다중행 선택 제어(다중 선택 불가로 세팅)
	},
	defaultColumnMapping: {
		/* 컬럼 기본 설정 */
		resizing: false,					//컬럼 width Resize 허용으로 세팅 -> 김태혁 수석님 요청으로 변경(2019-08-06)
		headerDragDrop: false,			//컬럼 헤더 드래그앤 드랍 허용 여부(불가로 세팅)
		sorting: false					//sorting 허용으로 세팅
	},
	enableDefaultContextMenu: false,		//기본으로 제공되는 컨텍스트 메뉴를 사용하지 않도록 세팅
	ellipsisText: true,						//텍스트 형태의 셀에 표현된 값이 셀의 너비를 넘어갔을 때 초과분을 ...으로 표시
	rowInlineEdit: false,					//double click으로 행을 편집모드로 변경(불가하도록 세팅)
	cellSelectable: false,					//그리드의 셀 하나만 선택 가능하게 하는 옵션(불가하도록 세팅)
	clientSortingOnDynamicDataSet: false,	//client sort 불허, 서버 sorting을 우선 적용
	useClassHovering: true,
	pager: true,						//그리드의 페이징 위젯을 사용
	paging: {
		hidePageList: 'auto',				//데이터가 없을 경우 페이지 숫자 목록과 화살표를 그리지 않음
		pagerTotal: true,
		pagerCount:5,
		perPage:30,
		pagerSelect: function(param) {
			if ( param.pageDataLength === 0 )  {
				// Data가 0건일때는 만들지 않음
				return;
			}
			var option = {
				id : 'GridSelectorCustom-temp', // pagerSelect ID - Temp 로 지정함.
				type: 'pager',
				placeholder: 10,
				position: 'top',
			};
			var pagerSelectTemp = new CustomSelect(option);
			return pagerSelectTemp.initDom;
		},
		pagerTotal: function(paging) {
			return '총 건수' + '<span class="cnt">'+ paging.dataLength +'</span>';
		}
	},
	renderMapping: {
		'use': {
			renderer: function(value, data, render, mapping) {
				var gubun = render.data.split('|');

				if(String(value) === String(gubun[0])) {
					if(data._state.deleted) {
						return '사용';
					}
					return '<span class="status type6">사용</span>';
				} else {
					if(data._state.deleted) {
						return '미사용';
					}
					return '<span class="status type7">미사용</span>';
				}
			}
		},
		'yesNo': {
			renderer: function(value, data, render, mapping) {
				var gubun = render.data.split('|');

				if(String(value) === String(gubun[0])) {
					if(data._state.deleted) {
						return '예';
					}
					return '<span class="status type6">예</span>';
				} else {
					if(data._state.deleted) {
						return '아니오';
					}
					return '<span class="status type7">아니오</span>';
				}
			}
		},
		'timeStamp': {
			renderer: function(value, data, render, mapping) {
				if($sv.isEmpty(value)) {
					return '';
				}

				var val = value.split('.')[0];
				val += 'Z';

				var dt = new Date(val);
				if(isNaN(Date.parse(dt))) {
					return value;
				}
				if(!render.hasOwnProperty('format')) {
					render.format = 'yyyy.MM.dd hh:mm:ss';
				}
				return dt.format(render.format);
			}
		},
		'fileSize': {
			renderer: function(value, data, render, mapping, grid) {
				var units = ['Byte', 'KB', 'MB', 'GB'];
				var size = value;
				for (var i = 0; i < units.length; i++) {
					unit = units[i];
					if (size < 1000) {
						break;
					}
					size = size / 1024;
				}
				size = size.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				return size + " " + unit;
			}
		},
		'bigDecimal': {
			renderer: function(value, data, render, mapping) {
				if($sv.isEmpty(value)) {
					return '0';
				}
				return AlopexGrid.renderUtil.addCommas(String(Number(value)).round(2));
			}
		}
	}
});

/* Alopex UI Popup Setup */
$a.popup.setup({
	center: true,
	modal: true,
	movable: true
});

/* Alopex UI 컴포넌트 셋업 : dateinput, daterange */
$a.setup('dateinput', {
	format: 'yyyy.MM.dd', // 달력팝업에서 기선택일자 마킹 -> ie 에서 안되서 제거
//	selectyear: true, selectmonth: true, // 년도 동적 생성 버그로 인하여 , 옵션 제거
	blockkey: true,
	defaultdate: false,
	startweekday:'mon',
});

$a.setup('daterange', {
	format: 'yyyy.MM.dd', // 달력팝업에서 기선택일자 마킹 -> ie 에서 안되서 제거
//	selectyear:true, selectmonth:true,
});

/* Alopex UI 컴포넌트 셋업 : multiSelect */
$a.setup('multiSelect', {
	multiple : true,
	noneSelectedText : '검색 및 선택해주세요',
	header : true,
	minWidth : 300,
	buttonWidth:'auto',
	menuWidth :null, // 기본값 null 로 적용되어야함.(깨짐.) 300 에서 null 로 변경-퍼블
	selectedList : 3,
	checkAllText : '전체선택',
	uncheckAllText : '전체해제',
	selectedText : '#개 선택',
	filter : false,
	label : '필터',
	placeholder : '검색 및 선택',
	checkedheader : true,
	htmlBind: false, // 선택된 value - 엠퍼센드 HTML 엔티티로 표현되어서( &amp; ) false 처리함.
	position: 'bottom',
	height: 'auto'
});

/* Alopex UI 컴포넌트 셋업 : fileupload */
$a.setup('fileupload', {
	url : 'http://localhost/upload', //실제 사용할 url을 설정하세요.
	dragDrop : true, dragDropStr: '<p class="file__placeholder"><i class="icon i-upload"></i>여러개의 파일을 마우스로 끌어 놓으세요.</p>',
	uploadStr: "파일첨부",
	multiple:true,
	showAddFile: true,
	showDelete:true,
	showFileSize:true,
});


/* Alopex UI 컴포넌트 셋업 : Autocomplete */
$a.setup('autocomplete', {
	selecttext:true,
	noresultstr : '검색 결과가 없습니다',

});
/* Alopex UI 컴포넌트 셋업 : Dropdownbutton */
$a.setup('dropdownbutton', {
	placeholder : '선택',
	closetrigger : 'click',
});




/** Document raedy - 알로펙스 UI / Grid 디자인 Custom 관련 함수 */

/* sc - scroll interaction 전역 객체 */
var sc;
/* CustomSelect - 커스텀 Dropdown , Grid pageSelect 생성 */
var customSelectWrapper = {};
var customSelectInit = [];

var CustomSelect = (function(){
	function CustomSelect(option) {
		this.init(option);
	}

	// Select Dom initialize
	CustomSelect.prototype.init = function(option){
		this.id = option.id;
		this.data = option.data;
		this.position = option.position;
		this.type = option.type;
		this.placeholder = option.placeholder;
		this.convertData = [];


		var _item = this.data,
			_type = this.type === 'pager' ? 'PageCustomSelector' : '', // 그리드 Pager용 Class
			_position = this.position ? option.position : 'bottom';

		if ( Array.isArray(_item) ) {
			for ( var i = 0, len = _item.length; i < len; i++ ) {
				this.convertData.push({ id: _item[i], text:_item[i] }); // 배열일 경우 id / text 동일
			}
		} else {
			for ( props in _item ) {
				this.convertData.push({ id: props, text:_item[props] }); // Object 일 경우 id-key/ text-value 로 생성
			}
		}

		var selectDom = '<div class="select__form '+ _type +' small selectCustom '+ _position +'">'
		+'<button id="'+ this.id +'" class="Dropdownbutton button">'+ this.placeholder +'</button>'
		+'<ul class="option" data-open-trigger="mouseover" data-close-trigger="mouseleave" data-position="'+ _position +'"></ul>'
		+'</div>';

		this.initDom = selectDom;

		// pager가 아닌경우 즉시 Convert
		// [TODO]
		if ( this.type !== 'pager' ) {
			this.convert();
		}
	};

	// Alopex Component convert + 옵션 Item setting
	CustomSelect.prototype.convert = function(id){
		$a.convert('#'+this.id);
		$('#'+this.id).setDataSource(this.convertData);

		if ( this.type === 'pager' ) { // 그리드 pager일 경우 Method chaining
			this.gridPager(id);
		}
	};

	// Grid PagerSelect Convert
	CustomSelect.prototype.gridPager = function(id){
		var convertId = id + '-GridCustomSelector'; // Temp ID -> 그리드 연동 ID로 값 치환
		var $grid = $('#'+id);
		var data = [
			{ id:10 , text:10 },
			{ id:20 , text:20 },
			{ id:30 , text:30 },
			{ id:50 , text:50 },
			{ id:100 , text:100 }
		];

		var $pageSelect = $grid.find('.PageCustomSelector .Dropdownbutton');

		if($pageSelect.length < 1) {
			return;
		}

		$pageSelect.attr('id',convertId);

		// 버튼 Convert , Data setting
		$a.convert($pageSelect);
		$($pageSelect).setDataSource(data);
		this.gridSelectClick($grid.find('.PageCustomSelector'), $grid);
	};


	// Option click
	CustomSelect.prototype.gridSelectClick = function(select, grid){
		var $selectBtn = select.find('.Dropdownbutton'),
			$pageList = select.find('.option li'),
			_perPage = grid.alopexGrid('pageInfo').perPage;

		$selectBtn.setText(_perPage); // Select(DropdownButton) 그리드 perPage Setting

		$pageList.on('click',function(e){
			var _preValue = grid.alopexGrid('pageInfo').perPage;
			var _value = Number($(this).text());

			if(Number(_preValue) === Number(_value)) {
				return;
			}

			grid.alopexGrid('updateOption',{ paging : {perPage: _value } });
			grid.alopexGrid('pageInfo').perPage = _value;
			grid.trigger('perPageChangeEnd');
		});
	};

	return CustomSelect;
})();



var THROTTLE_TIMER = '',
	THROTTLE_CANCEL = null,
	DEBOUNCE_TIMER = '';

// Scroll - Event
var ScrollInteraction = (function(){
	function ScrollInteraction() {
		this.initDom = false;
		this.isOnScroll = false; // 최초 Scroll event bind 여부
		this.initTop = false;

		this.scrollLast = 0; // 마지막 Scroll 위치. $('scroll-wrap)의 스크롤 이벤트에서 받아와야 함.
		// this.direction = 'down';		
		this.initScroll();
	}

	ScrollInteraction.prototype.initElem = function(rebind){
		// 기본 요소 초기화 (고정이므로 전달받지 않음, 추후 변경될 여지 있을경우에 option 으로 확장.)
		this.E_scroll = _ui.GLOBAL_DOM_TARGET.E_scrollWrap;
		this.E_sticky = $('[id="divisionSticky"]:visible');
		this.E_floatScroll = $('.scroll-float:visible');
		this.E_floatHeader = $('.gridInitClass.header-float:visible');
		this.E_tooltip = $('.Tooltip');
		this.E_lazy = $('.lazylist');


		/* @desc Member variables
		 * shouldSticky : 사용자가 컨텐츠를 한눈에 파악하기 어려운 높이인지의 여부 (true = gridHeaderFixed, Button sticky 수행)
		 * hasTooltip : Tooltip 유무
		 * hasXscrollFloat : 가로 스크롤 floating 클래스를 가진 Grid 로 판단 - 여러개일경우(탭) Object 반환
		 *  */
		this.shouldSticky = false;
		this.hasTooltip = this.E_tooltip.length ? true:false;
		this.hasXscrollFloat = {};
		this.hasHeaderFloat = this.E_floatHeader.length ? true:false;
		this.hasTree = false;
		
		this.isSticky = false;
		this.isHeaderFloat = false;
		this.isScrollFloat = false;
		this.isTooltipVisible = false;

		// LazyScroll
		this.shouldLazy = false;
		this.E_lazyTarget = this.E_lazyTarget ? this.E_lazyTarget : null;
		this.lazyType = this.lazyType ? this.lazyType : null;
		this.lazyData = this.lazyData ? this.lazyData : null;
		
		this.topSticky = 0;

		this.scrollHeight = 0;
		this.clientHeight = 0;


		


		// sticky 여부
		if ( 
			(this.scrollHeight - this.clientHeight > 200) 
			&& this.E_sticky.length > 0
		) {
			this.shouldSticky = true;
		}

		// lazy  여부
		if ( this.E_lazy.length > 0 ) {
			this.shouldLazy = true;
		}

		// grid hasTree 여부 설정
		var _gridColumn = $('.gridInitClass:visible').alopexGrid('readOption').columnMapping;
		if ( _gridColumn ) {
			for ( var i = 0, len = _gridColumn.length; i < len; i++) {
				if ( _gridColumn[i].treeColumn ) this.hasTree = true; // Grid Tree grid
				break;
			}
		}
		this.initDom = true;
		this.initTop = false;

		this.height();
		this.eventBind();
	}

	/** init
	 * @desc 스크롤 Event 대상 - 유무에 따른 초기화
	*/
	ScrollInteraction.prototype.initScroll = function(){
		if (document !== top.document) return; // popup return

		this.isOnScroll = true; // 최초 한번만 Event bind
		
		$(_ui.GLOBAL_DOM_TARGET.E_scrollWrap).on('scroll', function(e) {

			if (!_sc.initDom) {
				_sc.initElem();
			}

			if ( _sc.shouldSticky ) { // 스티키일때만 동작
				if ( !_sc.initTop ) { // 최초 Offset top 설정
					_sc.initTop = true;

					// 케이스별 offset top 설정
					if ( _sc.shouldSticky ) {
						if ( $('.stickyFakeDom').length === 0 ) _sc.E_sticky.after('<span class="stickyFakeDom" />');
						_sc.topSticky = $('.stickyFakeDom').offset().top - $(_sc.E_scroll).offset().top;					
					}
				} else if( _sc.initTop && _sc.hasTree){ //(Tree grid 있는 경우 Scroll이벤트때마다 topSticky 초기화.)

					var contentsDiff = _sc.clientHeight;

					if ( _sc.shouldSticky && contentsDiff !== 0 ) {
						_sc.topSticky =  _sc.topSticky + contentsDiff ;					
					}
				}
			}


			if (DEBOUNCE_TIMER) {
				clearTimeout(DEBOUNCE_TIMER);
			}

			DEBOUNCE_TIMER = setTimeout(function() {
				_sc.scrollLast = _sc.E_scroll.scrollTop;
			}, 150);


			let _scroll_dir = _sc.E_scroll.scrollTop > _ui.GLOBAL_INIT.LAST_SCROLL_TOP ? 'scroll-down' : 'scroll-up';
			if ( _scroll_dir === 'scroll-down' ) { // 스크롤 방향 - down

			} else { // 스크롤 방향 - up

			}

			_ui.GLOBAL_INIT.LAST_SCROLL_TOP = $(_sc.E_scroll).scrollTop();  // last scroll 포지션 갱신
		});
	};



	/** height
	 * @desc 객체에 따른 clientHeight, scrollHeight 갱신
	*/
	ScrollInteraction.prototype.height = function(){

		// 스크롤객체가 window 일 경우 
		if ( this.E_scroll === window ) {
			this.scrollHeight = document.documentElement.scrollHeight;
			this.clientHeight = document.documentElement.clientHeight;
		} else {
			this.scrollHeight = this.E_scroll.scrollHeight;
			this.clientHeight = this.E_scroll.clientHeight;
		}
	}
	

	/** eventBind
	 * @desc 스크롤 Event Bind - init 객체에 따른 분류
	*/
	ScrollInteraction.prototype.eventBind = function(){
		if ( this.shouldSticky || this.shouldLazy) {
			$(this.E_scroll).on('scroll.eventThrottle', this.eventThrottle);
		} else {
			this.eventUnbind('sticky');
		}
	}


	/** eventUnbind
	 *  @desc 스크롤 Event Unbind
	 */
	ScrollInteraction.prototype.eventUnbind = function(type){
		switch (type) {
			case 'sticky':
			case 'grid-header-fixed':
			$(this.E_scroll).off('scroll.eventThrottle'); // Throttling 이벤트는 한벌로 처리.
			break;
		}
	}


	/** eventThrottle
	 *  @desc Throttling event function
	 */
	ScrollInteraction.prototype.eventThrottle = function(e){
		if (!THROTTLE_TIMER) {
			THROTTLE_TIMER = setTimeout(function(){
				
				if ( _sc.shouldSticky ) { // 스티키					
					// 1. _sc.E_sticky.offset().top < _sc.E_sticky.offset().top : 사용자 눈에 버튼 보이는 좌표 = sticky 해제
					var _view = _sc.topSticky < _sc.E_scroll.scrollTop + _sc.clientHeight ? true : false;
					if ( _sc.E_scroll.scrollTop < 10 || (_view && _sc.isSticky) ) {
						$('body').removeClass('sticky');
						_sc.isSticky = false;
					}
					else if ( !_sc.isSticky && !_view && _sc.E_scroll.scrollTop > 10 ) { // Button sticky
						$('body').addClass('sticky');
						_sc.isSticky = true;
					}

				} else if ( _sc.shouldLazy ) { // lazy scroll
					// 스크롤 끝점 도달
					_sc.height();
					if ((_sc.scrollHeight - _sc.clientHeight) - $(_sc.E_scroll).scrollTop() < 50) {
						setTimeout(function(){
							_sc.lazySkeleton();
						},500);
					}
				}

				THROTTLE_TIMER = null;
			}, 100);
		}
	}


	// sticky (button)
	ScrollInteraction.prototype.stickyAction = function(){
		var _scrollBottom = this.E_scroll.prop('scrollHeight') - this.E_scroll.outerHeight(),
			_stickyHeight = this.E_sticky.outerHeight();

		if( this.scrollY === 0 ){
			this.E_sticky.removeClass('sticky'); return;
		}
		if( _scrollBottom - (_stickyHeight*2) > this.scrollY ){
			this.E_sticky.addClass('sticky');
		}else{
			this.E_sticky.removeClass('sticky');
		}
	}

	// lazyscroll - data request
	ScrollInteraction.prototype.lazy = function(o){
		if ( !o ) return; // param 없을 경우 아무처리 안함

		const data = o.option;
		$a.request(data.mapping, {
			data: data.param,
			method: data.method,
			success: data.callback.success,
			progress: data.progress ? data.progress : false
		});		
	}
	
	// lazyscroll - data request
	ScrollInteraction.prototype.lazyInit = function(o){		
		this.E_lazyTarget = document.getElementById(o.id);
		this.lazyType = o.type;		
		this.lazyData = o.data;		
	}

	// 레이지 로드 스켈레톤 (타입에 따라 나뉨)
	ScrollInteraction.prototype.lazySkeleton = function(){		
		var scroll = 0;
		var count = 0;
		switch (this.lazyType) {
			case 'bm': // BM 목록
				count = 9;
				if ( $(this.E_lazyTarget).find('.skeleton').length >= count ) {
					return false
				};

				for ( var i =0; i < count; i++) { // 9 개의 스켈레톤 생성
					const item = document.createElement('li');					
					item.className = "skeleton";					
					this.E_lazyTarget.appendChild(item);
				}
				scroll = 250;
				break;
		
			default:
				break;
		}


		// clientHeight, scrollHeight 갱신
		this.height();
		const $scrollSmooth = _sc.E_scroll === window ? $('html') : $(_sc.E_scroll);

		$scrollSmooth.animate({
			scrollTop:  $(_sc.E_scroll).scrollTop() + scroll
		}, 300);

		// request 연계 
		const data = this.lazyData;
		$a.request(data.mapping, {
			data: data.param,
			method: data.method ? data.method : 'get',
			progress: data.progress ? data.progress : false,
			success: data.callback.success,
		});		
	}


	return ScrollInteraction;
})();

$(function(){
	// 동적 생성 DOM Event bind
	$(document)
	.on('mouseover','.selectCustom .button',function(e){
		/**
		 * Select - Dropdown Customize :Dropdown 컴포넌트로 대체하여 셀렉트 디자인 적용
		 */
		var $this = $(e.currentTarget).parents('.selectCustom');

		if ( !$(e.currentTarget).hasClass('Disabled') && !$this.hasClass('on') ) {
			$('.selectCustom').not($this).removeClass('on').children('ul').close();
			$this.addClass('on');
		}
	})
	.on('mouseleave','.selectCustom .option',function(e){
		/**
		 * Select option event
		 */
		var $target = $(e.relatedTarget),
			$select = $(this).closest('.selectCustom');

		if ($target.closest('.selectCustom').length > 0) {
			return;
		} else if ( $select.hasClass('on') ) {
			$select.removeClass('on').children('ul').close();
		}
	})
	.on('mouseleave','.selectCustom',function(e){
		if($(e.relatedTarget).hasClass('selectCustom .option')) { return; }

		var $relTarget = $(e.relatedTarget);

		if ($relTarget.hasClass('selectCustom') || $relTarget.closest('.selectCustom').length === 0 ) {
			var $this = $(this);
			setTimeout(function(){
				$this.closest('.selectCustom').removeClass('on'); //AlopexUI Dropdown 버튼 delay sync
			},200);
		}
	})
	.on('mouseleave','.ui-multiselect-menu',function(e){ // 멀티셀렉트 Option leave - open,close 연계
		if ( $(e.currentTarget).find('input:eq(0)').length === 0 || $(e.currentTarget).find('input:eq(0)') === undefined) {return;}
		var _targetId = $(e.currentTarget).find('input:eq(0)').attr('id').split('-')[2];

		if ( $(e.relatedTarget).closest('.ui-multiselect-menu').length === 0 ) {
			$('#'+_targetId).close();
		}
	})
	.on('click','.list__step .option a',function(e){ // list__step initialize (분류체계 조회)
		e.preventDefault();
		var $this = $(this),
			$parentList = $this.closest('.option');

		if ( $this.hasClass('disabled') || $this.hasClass('on') ) { return; }

		$parentList.find('.on').removeClass('on');
		$this.addClass('on');
	})
	.on('click','.func__input-search .inputEmpty',function(e){ // 담당자 삭제
		var $this = $(this),
			$funcWrap = $this.closest('.func__input-search'),
			$valInput = $funcWrap.find('.Textinput');

		if (e.preventDefault) e.preventDefault();
		if (e.stopPropagation) e.stopPropagation();

		if ( $valInput.val() !== '' ) {
			$valInput.val('');
		}

		readonlyInputEmpty(e.target);
	});


	// 멀티셀렉트
	$('.ui-multiselect').on({
		'mouseenter': function(){
			var _id = $(this).closest('.multiselect__primary').data().multiselect;
			$('#'+_id).open();
		},
	});


	// 멀티셀렉트 init
	$('select.Multiselect').each(function(idx){
		var $this = $(this),
			_id = $(this).attr('id');

		$('#'+_id).multiselect({
			beforeopen: function(e) {
				var $this = $(this);
				var $options = $this.multiselect('widget'),
					_chkLen = $options.find('input').length,
					_checkedLen = $this.multiselect('getChecked').length;

				$this.multiselect('refresh'); // 열리기 전 refresh(width 수정)

				if ( _checkedLen < _chkLen && _checkedLen > 0 ) { // 부분 체크 디자인적용
					$options.attr('data-allchkstatus','part');
					return;
				} else if ( _checkedLen === _chkLen ) { // 전체 체크 디자인 적용
					$options.attr('data-allchkstatus','true');
					return;
				}
			},
			checkAll: function(e){
				$(this).multiselect('widget').attr('data-allchkstatus','true');
				// $($('.ui-multiselect-menu:eq('+ e.target.getAttribute('data-idx') +')'));
			},
			uncheckAll: function(e){
				$(this).multiselect('widget').attr('data-allchkstatus','false');
				// $($('.ui-multiselect-menu:eq('+ e.target.getAttribute('data-idx') +')')).attr('data-allchkstatus','false');
			},
			click: function(e){
				var $options = $(this).multiselect('widget'),
					_chkLen = $options.find('input').length,
					_checkedLen = $this.multiselect('getChecked').length;

				if ( _checkedLen < _chkLen && _checkedLen > 0 ) { // 부분 체크 디자인적용
					$options.attr('data-allchkstatus','part');
					return;
				}

				if( _checkedLen < _chkLen && ($options.attr('data-allchkstatus') === 'true' || $options.attr('data-allchkstatus') === 'part') ) {
					$options.attr('data-allchkstatus','false');
				} else if ( _checkedLen === _chkLen ) {
					$options.attr('data-allchkstatus','true');
				}
			}
		}).attr('data-idx', idx).parent('.multiselect__primary').data('multiselect',_id); // mouseenter open 기능 연동 data-multiselect
	});


	// CustomSelect - key adding
	$('.selectCustom').each(function(idx){
		$(this).attr('data-selectcustomkey',idx);
	});
});



// 팝업의 팝업 - Masking
function popupMasking(open) {
	if (top.document == parent.document && top.document == document) {
		return;
	}
	var $parentPopup = $(top.document.body).find('.af-dialog');
	if ( open ) { // open == true
		if ( document !== top.document ) {
			// 부모 Popup - Masking (Dim) 처리
			if (  parent.document == top.document ) return;
			$parentPopup.addClass('parent-popup-masking');
		}
	} else { // open == false
		// 부모 Popup - Masking (Dim) 제거
		$parentPopup.removeClass('parent-popup-masking');
	}
}


// Popup input value
function readonlyInputEmpty(target){

	inputSearchEmpty($(target).closest('.func__input-search'));

	if ( $(target).data().callback === undefined) return;
	$(target).data().callback();
}


// 커스텀 셀렉트(Dropdownbutton) - getValue
function getCustomSelectValue(target){
	var $this = $(target),
		_value = $this.getText(),
		_data = $this.getDataSource(),
		returnValue = '';

	// Text 를 Key 로 data 순회
	for ( var i = 0, len = _data.length; i < len; i++ ) {
		if ( _data[i].text === _value ) {
			returnValue = _data[i];
			break;
		}
	}

	return returnValue;
}


// Readonly 검색 필드 - 값이 있고 없는 경우에 따른 X 버튼 Show / hide 처리
function inputSearchEmpty(target){
	var $target = !target ? $('.func__input-search') : target;
	$target.each(function(){
		var $this = $(this),
			val = $this.children('.Textinput').val();

		if ( val === '' || !val ) {
			$this.addClass('emptyValue').removeClass('hasValue');
		} else {
			$this.addClass('hasValue').removeClass('emptyValue');
		}
	});
}


const UI_initialize = (function(){
	function UI_initialize(){
		/**
		 * GLOBAL_[] : Front 핸들링 시 반복적으로 참조하는 Dom, props 등 객체 선언
		 * @ GLOBAL_DOM_TARGET : 전 페이지에서 다양한 이벤트로 반복참조하는 돔요소
		 * @ GLOBAL_INIT	   : 화면/모듈별 페이지 로드시 필요한 init 정보
		 * */
		this.GLOBAL_INIT = {
			LAST_SCROLL_TOP : window.scrollY,
			HOST_MODE : 'local',
			CALLBACK : {
				'indicatorToggle': null,
			}
		};

		this.GLOBAL_DOM_TARGET = {			
			E_popupContainer : document.querySelector('.popup__container'),
			E_rootContainerSvms : document.querySelector('.root__container'),
			E_rootContainerPortal : document.querySelector('.root__container-portal'),
			E_rootContainerAsmt : document.querySelector('.root__container-asmt'),
		};

		// DOM Root 타겟 판별  (UI/Portal/ASMT/Popup..)
		this.target = '';
		for ( var key in this.GLOBAL_DOM_TARGET ) {
			if (this.GLOBAL_DOM_TARGET[key] !== null) this.target = key;
		}		

		// Scroll 객체 
		switch (this.target) {
			case 'E_rootContainerPortal':
				this.GLOBAL_DOM_TARGET.E_scrollWrap = window;	
				break;
			case 'E_rootContainerAsmt':
				this.GLOBAL_DOM_TARGET.E_scrollWrap = document.querySelector('.contents__article');
				break;
		
			default:
				break;
		}
        
        this.init();
    }

    UI_initialize.prototype.init = function(){
		this.hostmode(); 

        switch (this.target) {
			case 'E_rootContainerAsmt': // 추진체계 Portal
				this.asmt();
                break;
			case 'E_rootContainerSvms': // SVMS				
				break;
				
			case 'E_popupContainer': // Popup			
				break;

			case 'E_rootContainerPortal': // 추진체계 Portal
				this.portal();
                break;
        
			default: // N/A				
                break;
		}
	}
	
	UI_initialize.prototype.hostmode = function(){
		// host mode - local / dev / prd
		var _hostMode = location.hostname.split('.')[0];
		
		switch(_hostMode) {
			case 'svms-loc' :
			case 'localhost' :
				_hostMode = 'hostMode-local'; 
				break;
			case 'svms-dev' :
				_hostMode = 'hostMode-dev'; 
				break;
			default : _hostMode = 'hostMode-prd';
		}
		this.GLOBAL_DOM_TARGET[this.target].classList.add(_hostMode);
	}


	// 콜백 함수 연계
	UI_initialize.prototype.callback = function(type, callback){
		this.GLOBAL_INIT.CALLBACK[type] = callback;
	}
	

    UI_initialize.prototype.portal = function(){
		// 추진체계 Portal 공통 UI 기능

		// 추진체계 - GNB Fold(S)
		const $header = $('.header__container');
		$header.on('mouseleave',function(e){
			const $this = $(this);
			if ( $this.hasClass('open')) {
				$this.removeClass('open');
			}
		});
		$('.header__wrap .depth1').on({
			'mouseenter': function(e){            
				if ( !$header.hasClass('open') ) {
					$header.addClass('open')
				}
			},
			'mouseleave': function(e){            
				if ( $(e.relatedTarget).closest('.header__container').length > 0 ) return;
				const $header = $('.header__container');
				if ( $header.hasClass('open') ) {
					$header.removeClass('open')
				}
			}
		});
		// 추진체계 - GNB Fold(E)
    }

	
    UI_initialize.prototype.asmt = function(){
		// 평가모델 공통 UI 기능
		
		$(".btn__gnb-folding").on('click',function(e){ // 평가모델 - GNB Fold(S)
			var $gnb = $('.gnb__wrap');
	
			if ( $gnb.hasClass('fold') ) {
				$gnb.removeClass('fold');
			} else {
				$gnb.addClass('fold');
			}    
		}); // 평가모델 - GNB Fold(E)

		// Case별 function call
		if ( document.querySelector('.pageToggleList') ) {
			this.indicator_toggle();
		}
		if ( document.querySelector('.indicator-add') ) {
			this.indicator_add();
		}


	}

	
	
	/**
	* indicator_toggle (지표 Toggle list)
	*/
	UI_initialize.prototype.indicator_toggle = function(){		
		$(document).on('click','.survey-form-grp .toggle', function(e){
		   e.preventDefault();

		   // callback 호출
		   if ( typeof(_ui.GLOBAL_INIT.CALLBACK['indicatorToggle']) === 'function' ) {
			   _ui.GLOBAL_INIT.CALLBACK['indicatorToggle']($(this));
		   }
		   
		   const $scrollE = $('.contents__article'); // 스크롤객체
		   const $parent = $(this).closest('.survey-form-grp');
		   const $target = $(e.target); // 지표 target
		   
		   // open class toggle
		   $parent.toggleClass('open');
		   
		   if ( $parent.hasClass('open') ) {
   
			   const _scT = $scrollE.scrollTop();
			   const _positionT = $target.position().top;
   
			   // 지표 최상단으로 이동
			   setTimeout(function() {
				   $scrollE.animate({
					   scrollTop:  (_scT + _positionT) - 40
				   }, 200);
			   }, 40);
		   }
	   });
   }  // indicator_toggle(E)


   /**
	* indicator_add (지표 추가 Slide)
	*/
	UI_initialize.prototype.indicator_add = function(o){
		// 슬라이드 height - 첫번째 Step 컨텐츠 높이로 설정
		const $slideWrap = $('.slide-wrap');
		const $slide1 = $('.section[data-order=1]');
	
		const $btnPrev = $('.btnPrev');
		const $btnNext = $('.btnNext');
		const $btnReg = $('.btnReg');
	
		switch (o) {
			case 'init':
				init(); break;
			default:
				init();
				buttonHandler();
		}
	
		function init(){
			$slideWrap.attr({ class:'slide-wrap', 'data-order' : 1 })
					  .height(  $slide1.outerHeight() );
				
			currentSlide();
		}
	
		
		// 이전/ 다음 버튼 Event
		function buttonHandler() {
			$btnPrev.on('click',function(e){
				var cur = $slideWrap.attr('data-order');
				if ( cur > 1 ) {
					$slideWrap.attr('data-order', --cur);
				}
				currentSlide();                    
			});
			
			$btnNext.on('click',function(e){
				var cur = $slideWrap.attr('data-order');
				if ( cur < 3 ) {
					$slideWrap.attr('data-order', ++cur);                        
				}
				currentSlide();
			});              
		}
	
		function currentSlide(){
			const cur = $slideWrap.attr('data-order');
			const $step1 = $('.indi-step li:eq(0)');
			const $step2 = $('.indi-step li:eq(1)');
			const $step3 = $('.indi-step li:eq(2)');
			$slideWrap.height( $('.slide-wrap .section[data-order="'+ cur +'"]') .outerHeight() );
	
			switch(cur) {
				case '1' :
					$btnNext.show();    
					$btnReg.hide();
					$btnPrev.hide();
					$step1.removeAttr('class');
					$step2.attr('class','next');
					$step3.attr('class','next');
					break;
				case '2' :
					$btnNext.show();
					$btnReg.hide();
					$btnPrev.show();
					$step1.attr('class','done');
					$step2.removeAttr('class');
					$step3.attr('class','next');
					break;
				default :
					$btnNext.hide();
					$btnNext.hide();
					$btnReg.show();
					$step1.attr('class','done');
					$step2.attr('class','done');
					$step3.removeAttr('class');
			}
		}
	} // (E) indicator_add


    return UI_initialize;
})();




// Bar graph - 성과 Report (reportResult.html)
const GraphReportResult = (function(){
    function GraphReportResult(o){ // o = option
        this.id = o.id;
        this.title = o.title;
        this.comment = isFalsy(o.comment) ? '코멘트 없음' : o.comment;
        this.scoreTotal = isFalsy(o.score.total) ? 0 : o.score.total;
        this.scoreGet = isFalsy(o.score.get) ? 0 : o.score.get;
        this.avgTotal = isFalsy(o.avg.total) ? null : o.avg.total;
        this.avgUpper = isFalsy(o.avg.upper) ? null : o.avg.upper;
        
        
        // 각 백분율 계산
        this.avgTotalPer = Math.floor(this.avgTotal / this.scoreTotal * 100); // 업평
        this.avgUpperPer = Math.floor(this.avgUpper / this.scoreTotal * 100); // 상평
        this.scorePer = Math.floor(this.scoreGet / this.scoreTotal * 100); // 획득점수
        

        /* 업평/ 상평 nullish일 경우 안그려냄
            1. 값이 없을 경우 (0 || null ...falsy)
            2. 평균치가 획득점수와 같은 경우
        */
        this.show = {
            total: this.avgTotalPer === 0 ? false : true,
            upper : this.avgUpperPer === 0 ? false : true
        }

        
        // left position
        this.left = {
            'total': this.avgTotalPer,
            'score': this.scorePer,
            'upper': this.avgUpperPer
        }
        

        this.init();

        function isFalsy(value) {
            if ( value === undefined || value === '' || value === null || value === 0) {
                return true;
            }
            return false;
        }
    }



    GraphReportResult.prototype.init = function(){
                   
        // 각 평균치가 서로 동일할때 View 처리
        var scoreText = '획득점수';
        var m = true;
        const totalSame = '<span>(업계평균과 동일)</span>';
        const upperSame = '<span>(상위평균과 동일)</span>';
        const same = '<span>(업계ㆍ상위평균과 동일)</span>';


        if ( this.scoreGet === this.avgTotal && this.scoreGet === this.avgUpper ) {  // 모두동일
            scoreText += same;
            this.show.total = false;   
            this.show.upper = false;
        } else if (this.scoreGet === this.avgTotal) { // 업평 == 획점 동일
            scoreText += totalSame;
            this.show.total = false;
        } else if (this.scoreGet === this.avgUpper) { // 업평 == 상평 동일
            scoreText += upperSame;
            this.show.upper = false;
        } else {
            m = false;
        }


        // Max score (근사치 left 좌표배치에 씀)
        this.maxPer = [
            {key:'score', value: this.scorePer}
        ];
        if ( this.show.total ) {
            this.maxPer.push({key:'total', value:this.avgTotalPer});
        }            
        if ( this.show.upper ) {
            this.maxPer.push({key:'upper', value:this.avgUpperPer});
        }            
        this.maxPer.sort(function(a,b){
            return b.value - a.value
        });

        for ( var i = 0, len = this.maxPer.length; i<(len-1); i++) {                
            const target = this.maxPer[i + 1];
            const current = this.maxPer[i];
            const position = current.value - target.value;                
            const overlap = (!this.show.total || !this.show.upper) ? 12 : 9;

            if ( position <= overlap) {                    
                if ( i === 0 ) {
                    this.left[target.key] = current.value - overlap;                        
                    continue;
                }                                         
                this.left[target.key] = this.left[current.key] - overlap;
            }                
        }
        



        // 각 평균 Dom 생성
        var scoreDom = '<span class="avg score'+ (m ? ' same':'') +'" id="'+ this.id +'-score">'
                        +'<i>'+ scoreText +'</i><b>'+ this.scoreGet +'</b></span>';
        var totalDom = '';
        var upperDom = '';

        if ( !this.scoreTotalSame ) {
            totalDom = '<span class="avg total" id="'+ this.id +'-total">업계평균<b>'+ this.avgTotal +'</b></span>';
        }
        if ( !this.scoreUpperSame ) {
            upperDom = '<span class="avg upper" id="'+ this.id +'-upper">상위평균<b>'+ this.avgUpper +'</b></span>';
        }

        // Wrap Dom 생성
        var symbol = 
            $('<span class="symbol">'
                +'<strong class="tit">'+ this.title +'</strong>'
                +'<i class="cnt"><b>'+ this.scoreGet +'</b>/'+ this.scoreTotal +'</strong>'
            +'</span>');

        var bargraph = 
            $('<div class="bargraph"><div class="wrap">'
                + totalDom
                + scoreDom
                + upperDom
                +'<div class="base"><i class="bar"><b class="per" id="'+ this.id +'-cur"></b></i></div>'
            +'</div><p class="copy">'+ this.comment +'</p></div>');
            
        $('#'+this.id).append(symbol, bargraph);
    }

    // Dom append 이후, animate 처리
    GraphReportResult.prototype.animate = function(){            
        const graph = $('#'+ this.id);
        const id =  this.id;

        // 각 point별 - 활성화 클래스 여부
        const isActive = {
            total : this.avgTotalPer < this.scorePer ? 'goal' : '',
            upper : this.avgUpperPer < this.scorePer ? 'goal' : '',                
        };
     
        graph.find('#'+ id + '-total').attr({
            style: 'left:'+ this.left.total +'%' ,
            class: 'avg total ' + (this.show.total ? 'show ' : '') +  isActive.total
        });
        graph.find('#'+ id + '-upper').attr({
            style: 'left:'+ this.left.upper +'%' ,
            class: 'avg upper ' + (this.show.upper ? 'show ' : '') + isActive.upper
        });

        graph.find('#'+ id + '-cur').attr('style', 'width:'+ this.left.score +'%');
        graph.find('#'+ id + '-score').attr({
            style: 'left:'+ this.left.score +'%' ,
        });
    }

    return GraphReportResult;
})();


//  Main, BM List - BM 목록 생성자
const DblBmList = (function(){
	function DblBmList(o) {
		this.list = document.getElementById(o.id);
		this.data = o.data;

		this.init();
	}

	DblBmList.prototype.init = function(){
		
		let items = this.data.map(function(v){
			const item      = document.createElement('li');
			const imgWrap   = document.createElement('span');
			const img       = document.createElement('img');
			const anchor    = document.createElement('a');
			const label     = document.createElement('i');
			const article   = document.createElement('p');


			// anchor 설정
			anchor.setAttribute('href', v.link);

			// img
			imgWrap.className = "img";
			img.setAttribute('src', v.img);
			img.setAttribute('alt', ""); // 표준상 필수 속성이라 빈값 선언
			imgWrap.appendChild(img);

			// Label (에너지, 통신/ICT.. 산업분류)
			label.className = 'label ' + v.label;
			switch (v.label) {
				case 'energy':
					label.textContent = '에너지';
					break;                
				case 'ict':
					label.textContent = '통신/ICT';
					break;                
				case 'smcd':
					label.textContent = '반도체';
					break;                
				case 'dist':
					label.textContent = '물류/서비스';
					break;                
				default:
					label.textContent = '-';                        
			}

			// 본문 설정
			article.className = 'article';
			article.textContent = v.article;

			[imgWrap,label,article].forEach(function(v){
				anchor.appendChild(v);
			});
			item.appendChild(anchor);

			return item;
		});

		$(this.list).children('.skeleton').remove();
		
		for ( let i = 0, len = items.length; i < len; i++) {
			this.list.appendChild(items[i]);
		}
	}

	// Data append
	DblBmList.prototype.append = function(data){
		this.data = data;
		this.init();
	}

	return DblBmList;
})();