/**
 * report 공통 검색단을 위한 js
 */

var loginUser = $sv.getSsnUserInfo();
var uprYn = (loginUser.cmpCd == loginUser.rltnCmpCd) ? true:false;

var msmtStdMon = '';
var curParam ;
		//관계사 목록 조회
		function getCompanyId(param){
			var data = [];
			$a.request('biz/report/rptCommon/getUprCompanyList', {
				method: 'post',
			    async: false,
				success: function(res) {
					for(var i in res.data){

						if(param != undefined) {
							if(res.data[i].code == param ){
								data.push({value: res.data[i].code, text: res.data[i].codeNm});
							}
						}else{
							data.push({value: res.data[i].code, text: res.data[i].codeNm});
						}
					}
				}
			});
			return data;
		}

		//관계사 목록 조회 (총괄표- 이노베이션 관계사level 삭제)
		function getCompanyIdForSvTotal(pageType){
			var data = [];
			$a.request('biz/report/rptCommon/getUprCompanyList', {
				method: 'post',
			    async: false,
				success: function(res) {
					for(var i in res.data){
						//관계사 select list
						if(pageType=='Y'){
							data.push({value: res.data[i].code, text: (res.data[i].code=='SKI') ? res.data[i].codeNm+"계열" : res.data[i].codeNm});
						}else{
							data.push({value: res.data[i].code, text: res.data[i].codeNm});
						}
					}
				}
			});
			return data;
		}

		//관계사 목록 조회 (총괄표- 관계사level에 이노베이션계열 추가)
		function getCompanyIdForSvTotal_old(){
			var data = [];
			$a.request('biz/report/rptCommon/getUprCompanyForTotalList', {
				method: 'post',
			    async: false,
				success: function(res) {
					for(var i in res.data){
						//관계사 select list
						data.push({value: res.data[i].codeGroup+","+res.data[i].code+","+res.data[i].codeNm, text: res.data[i].codeNm});
						if(res.data[i].codeGroup=='SKI') {
							grpSkiList.push({value: res.data[i].code , text : res.data[i].codeNm});
						}
					}
				}
			});
			return data;
		}

		// 자회사 조회 (subSvManagerYn: 자회사 관리자)
		function getLwrCompanyList(uprMbrId, lwrCpbdId, subSvManagerYn){
			var data = [];
			$a.request('biz/report/rptCommon/getLwrCompanyList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : uprMbrId, lwrCpbdId : lwrCpbdId},
				success: function(res) {

					if(res.data.length>0){
						for(var i in res.data){
							if(subSvManagerYn == 'Y' && lwrCpbdId == res.data[i].code ) {
								data.push({value: res.data[i].code, text: res.data[i].codeNm});
							}else if(subSvManagerYn == 'N'){
								data.push({value: res.data[i].code, text: res.data[i].codeNm});
							}
						}
					}
				}
			});
			return data;
		}

		// 자회사 조회(사별총괄의 경우 자회사+관계사 setting을 위해 lwrCpbdId 필요)
		function getLwrCompanyListForSvResult(uprMbrId, lwrCpbdId, companyType){
			var data = [];
			$a.request('biz/report/rptCommon/getLwrCompanyList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : uprMbrId, lwrCpbdId : lwrCpbdId , companyType : companyType },
				success: function(res) {
					if(res.data.length>0){
						for(var i in res.data){
							data.push({value: res.data[i].code, text: res.data[i].codeNm});
						}
					}
				}
			});
			return data;
		}

		// '관계사'에 해당되는 기준연도조회
		function getMsMtPrcpNbList(msmtCpbdId, companyType ){
			var data =[];
			$a.request('biz/report/rptCommon/getMsMtPrcpNbList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdIdList : [msmtCpbdId] , companyType: companyType } ,
				success: function(res) {
					var $year = $('#year');
					var $yearCompare;

					if($('#yearCompare').length > 0) {
						$yearCompare = $('#yearCompare');
					}

					if (res.data.length > 0 ){
						var year = 0;
						for(var i in res.data){
							data.push({value: res.data[i].msmtPrcpNb, text: res.data[i].msmtPrcpNb});
							year = res.data[i].dlMsmtPrcpNb;
						}

						$year.setData({options: data});
						$year.setData({year: year});
						$year.setEnabled(true);

						if($yearCompare !== undefined) {
							$yearCompare.setData({options: $.extend(true, [], data)});
							$yearCompare.setData({yearCompare: '2019'});
							$yearCompare.setEnabled(true);
						}
					}else{
						$year.setData({options: data});
						$year.setEnabled(false);
						$('#msmtDgr').setEnabled(false);
						$('#monthCriterion').setEnabled(false);
						$('#monthCompare').setEnabled(false);
						$year.text("");
						$('#msmtDgr').text("");
						$('#monthCriterion').text("");
						$('#monthCompare').text("");

						if($yearCompare !== undefined) {
							$yearCompare.setData({options: $.extend(true, [], data)});
							$$yearCompare.setEnabled(false);
							$('#msmtDgrCompare').setEnabled(false);
							$$yearCompare.text("");
							$('#msmtDgrCompare').text("");
						}
					}
				}
			});
			//return data;
		}

		// '관계사들'에 해당되는 기준연도조회
		function getMsMtPrcpNbListForMulti(msmtCpbdIdList){
			var data =[];
			$a.request('biz/report/rptCommon/getMsMtPrcpNbList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdIdList : msmtCpbdIdList, companyType : 'GR' } ,
				success: function(res) {
					if (res.data.length > 0 ){
						var year = 0;
						for(var i in res.data){
							data.push({value: res.data[i].msmtPrcpNb, text: res.data[i].msmtPrcpNb});
							year = res.data[i].dlMsmtPrcpNb;
						}

						$('#year').setData({options: data});
						$('#year').setData({year: year});
						$('#year').setEnabled(true);
					}else{
						$('#year').setData({options: data});
						$('#year').setEnabled(false);
						$('#msmtDgr').setEnabled(false);
						$('#monthCriterion').setEnabled(false);
						$('#monthCompare').setEnabled(false);
						$('#year').text("");
						$('#msmtDgr').text("");
						$('#monthCriterion').text("");
						$('#monthCompare').text("");
					}
				}
			});
		}

		// 관계사에 해당되는 '제출'연도조회
		function getSbmMsmtPrcpNb(msmtCpbdId){
			var data =[];
			$a.request('biz/report/rptCommon/getSbmMsmtPrcpNb', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : msmtCpbdId} ,
				success: function(res) {
					if (res.data.length > 0 ){
						for(var i in res.data){
							data.push({value: res.data[i].code, text: res.data[i].code});
						}

					}
				}
			});
			return data;
		}

		// 측정연도/측정 차수
		function getMsmtDgrList(msmtCpbdId,companyType){
			var returnData =[];
			$a.request('biz/report/rptCommon/getMsmtDgrList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : msmtCpbdId, companyType: companyType },
				success: function(res) {
					$.each(res.data.msmtDgrByMsmtPrcpNbList, function (index, data) {
						var msmtDgrData = [];

						for(var i=0; i<data.length; i++){
							var dgrText = '';
							var _data = data[i];
							var _msmtPrcpDiv = _data.msmtPrcpDiv === 'KPI' ? '추정':'확정';


							if( _data.msmtDgr == 0) {
								dgrText = 'OPEN/'+ _msmtPrcpDiv;
							}else{
								var dateTxt = _data.sbmCheck === 'Y' ? '제출' : '마감';
								dgrText = _data.msmtDgr+'차/'+ _data.msmtStdMon +"월기준/"+ dateTxt +"일자("+ _data.dlDate + ")/"+ _msmtPrcpDiv;
							}

							msmtDgrData.push({
								value : _data.msmtDgr ,
								text : dgrText,
								tdMon : _data.msmtStdMon,
								msmtPrcpDiv:_data.msmtPrcpDiv
							});
						}
						returnData.push({
							year: index,
							dgr : msmtDgrData,
							dlMsmtPrcpNb : _data.dlMsmtPrcpNb
						});
					});
				}
			});
			return returnData;
		}

		// 차수별 측정월 조회 (TM_MSMTRSLT_M 기준월 기준 차수)
		// msmtCpbdId : 법인, msmtPrcpNb : 연도, companyType : 그룹GR/사별OC , sort : ASC/DESC
		function getMsmtTgtMonList(msmtCpbdId, msmtPrcpNb, companyType , sort ){
			var returnData =[];
			$a.request('biz/report/rptCommon/getMsmtTgtMonList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : msmtCpbdId , msmtPrcpNb : msmtPrcpNb , companyType : companyType},
				success: function(res) {
					$.each(res.data.tgtMonByMsmtDgrList, function (index, data) {
						var monthData = [];
						var dgrText = '';
						var _data = data[0];
						var _msmtPrcpDivTxt = _data.msmtPrcpDiv === 'KPI' ? '추정':'확정';

						if( _data.msmtDgr == 0) {
							dgrText = 'OPEN/'+ _msmtPrcpDivTxt;
						} else {
							var dateTxt = _data.sbmCheck === 'Y' ? '제출' : '마감'
							dgrText = index+'차/'+ _data.msmtStdMon +"월기준/"+ dateTxt +"일자("+ _data.dlDate + ")/"+ _msmtPrcpDivTxt;
						}

						if(sort === 'ASC'){
							for (var i=1; i<13;i++){
								monthData.push({ value : (i<10?'0'+i:i) , text : i+"월" });
							}

						} else if(sort==='DESC'){
							for (var i=12; i>0;i--){
								monthData.push({ value : (i<10?'0'+i:i) , text : i+"월" });
							}
						}

						if ( dgrText !== '' ) {
							returnData.push({
								dgr : index,
								dgrText: dgrText,
								month:monthData,
								msmtPrcpDiv:_data.msmtPrcpDiv,
								stdMon : _data.msmtStdMon
							});
						}
					});
				}
			});
			return returnData;
		}

		// 차수별 측정월 조회 (TM_MSMTRSLT_M 기준월 기준 -- 그룹 총괄표 용)
		function getMsmtTgtMonForSvTotal(msmtCpbdIdList, msmtPrcpNb){
			var returnData =[];
			$a.request('biz/report/rptCommon/getMsmtTgtMonForSvTotal', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdIdList : msmtCpbdIdList , msmtPrcpNb : msmtPrcpNb },
				success: function(res) {
					var _stdMon = Number(res.data);

					for (var i=12; i>0;i--){
						returnData.push({ value : (i<10?'0'+i:i) , text : i+"월" , stdMon : (_stdMon<10?'0'+_stdMon:_stdMon)   });
					}
				}
			});
			return returnData;
		}

		//성과측정단위 Lv1
		function getDataLvList(msmtCpbdId, lwrCpbdId , companyType){
			var data = [];
			$a.request('biz/report/rptCommon/getDataLvList', {
				method: 'post',
			    async: false,
			    data: {onsCpbdId : msmtCpbdId , lwrCpbdId : lwrCpbdId , companyType : companyType },
				success: function(res) {
					for(var i in res.data){
						data.push({value: res.data[i].code, text: res.data[i].codeNm});
					}
				}
			});
			return data;
		}

		//성과측정단위 Level List
		function getDataLvListByCpbdId(msmtCpbdId, msmtPrcpNb){
			var data = [];
			$a.request('biz/report/rptCommon/getDataLvListByCpbdId', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : msmtCpbdId , msmtPrcpNb : msmtPrcpNb },
				success: function(res) {
					for(var i in res.data){
						data.push({value: res.data[i].code, text: res.data[i].codeNm});
					}
				}
			});
			return data;
		}

		//목표성과 연도를 조회한다.
		function getAimYcList(msmtCpbdId){
			var data = [];
			$a.request('biz/report/rptCommon/getAimYcList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : msmtCpbdId},
				success: function(res) {
					for(var i in res.data){
						data.push({value: res.data[i].aimYear, text: res.data[i].aimYear});
					}
				}
			});
			return data;
		}


		//목표성과 - 기준연도, 차수를 조회한다.
		function getStdYcList(msmtCpbdId, aimYear){
			var stdYcList = [];
			$a.request('biz/report/rptCommon/getStdYcList', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : msmtCpbdId, aimYear : aimYear},
				success: function(res) {
					$.each(res.data.stdYcAimDgrList, function(index, data){
						var dgrData = [];
						for (var i in data ) {
							dgrData.push({ value : data[i].aimDgr , text : data[i].aimDgr });
						}
						stdYcList.push({ stdYear: index , dgr :dgrData });
					});
				}
			});
			return stdYcList;
		}

		//목표성과 - Max 기준연도, 차수 & Max 측정차수 를 조회한다.
		function getMaxStdYc(msmtCpbdId, aimYear){
			$a.request('biz/report/rptCommon/getMaxStdYc', {
				method: 'post',
			    async: false,
			    data: {msmtCpbdId : msmtCpbdId, aimYear : aimYear},
				success: function(res) {
					$("#aimText").val(res.data.aimText);
					$("#msmtText").val(res.data.msmtDgr);
					$("#msmtStdMon").val(res.data.msmtStdMon);
					$("#stdYear").val(res.data.stdYear);
					$("#aimDgr").val(res.data.aimDgr);
				}
			});
		}

		// 글로벌 지역명 조회
		function getCntrZoneList(year){
			var data =[];
			$a.request('biz/report/rptCommon/getCntrZoneList', {
				method: 'post',
			    async: false,
				success: function(res) {
					if (res.data.length > 0 ){
						for(var i in res.data){
							data.push({value: res.data[i].code, text: res.data[i].codeNm});
						}
					}
				}
			});
			return data;
		}

		// 지역에 해당되는 국가 리스트 조회
		function getCountryList(){
			var countryList ={};
			$a.request('biz/report/rptCommon/getCountryList', {
				method: 'post',
			    async: false,
				success: function(res) {
					$.each(res.data.countryListByCntr, function(index, data){
						var country = [];
						for (var i in data ) {
							country.push({ value : data[i].code , text : data[i].codeNm });
						}
						countryList[index] = country ;
					});
				}
			});
			return countryList;
		}
		/* 분류체계 popup */
		function popupClassificationCode(year, csstId){
			var strHeader = '';
			$a.popup({
			    url		: "/ui/common/classifyRuleListPopup",
			    title	:"분류체계 조회",
			    width	: 1050,height:685,
			    data	:{showLv5Yn:'Y',msmtPrcpNb: year,selectedCsstId: csstId }, // 분류체계 Lv5까지 선택해야 하는 경우 'Y', 그렇지 않은경우 아무 값이나 상관없지만 가독성을 위해서 가능하면 'N' 설정. 'Y'가 아닌경우 Lv3까지 노출됩니다.
			    callback: function(data){
			        if(data) {
			            // [선택]버튼 클릭시의 후처리
			            $('#csstId').val(data.csstId);
						$('#path').val(data.path);
						$('#l1Id').val(data.hierarchy[0].csstId);
						$('#level').val(data.lvNb);

						for (var i in data.hierarchy ) {
							strHeader += data.hierarchy[i].lv+':'+data.hierarchy[i].csstNm+',';
						}
						strHeader= strHeader.substr(0,strHeader.length-1);
						$('#arrClassifi').val(strHeader);


						inputSearchEmpty(); // input - x button Show/hide design function

			        }
			    }
			});
		}
		// 소속분류체계별·지표별 삭제 - callback 함수
		$('#popupCallLv5').find('.inputEmpty').data('callback',afterPopupCallLv5);
		// 분류체계
		function afterPopupCallLv5(){
        	$('#csstId').val('');
        	$('#path').val('');
        	$('#l1Id').val('');
        	$('#level').val('');
        	$('#arrClassifi').val('');

        	inputSearchEmpty(); // input - x button Show/hide design function
        }

		/* 측정식 popup */
		function popupFormula(obj){
			var strHeader = '';
			$a.popup({
			    url		: "/ui/report/formulaDetailPopup",
			    title	:"측정식",
			    width	: 600,height:213,
			    data	:{ sv : obj },
			});
		}

		function getCurrentMenuNm(){
			var authorityMenus = $sv.getSsnUserInfo('authorityMenu');
			var currentMenuId = $('.gnb-area .navigation a.goMenu.current').data('mid');
			var currentMenuNm = '';
			if(currentMenuId){
				currentMenuNm = authorityMenus.filter(function (m) { return (m.mnuId == currentMenuId)})[0].mnuNm;
			}
			return currentMenuNm;

		}

		// 엑셀 다운로드
		function fileDownload(url, param){
			try {
				if(!param.hasOwnProperty('excelTitle')){
					var authorityMenus = $sv.getSsnUserInfo('authorityMenu');
					var currentMenuNm = getCurrentMenuNm();
					if(currentMenuNm){
						param['excelTitle'] = currentMenuNm;
					}
				}
			} catch(e){
				;  // nothing
			}
		    var downUrl = $sv.getRestApiAddr() + '/' + url;
		    View.showProgress();

		    $.fileDownload(downUrl, {
		    	successCallback: function(url){
		    		View.hideProgress();
		    	},
		    	httpMethod: "POST",
				data: Qs.stringify(param)
			});
		}

		function btnResetClick(e){
			btnResetClick('GR',e);
		}
		// 초기화
		function btnResetClick(type, e){
			if(type==='GR'){
				initSearchCondition();
			}else{
				initSubSearchCondition('mode0');
			}
		}

		// 그룹용 초기화
		function initSearchCondition(){
	   		// 전체 초기화
	   		$('#searchCondition').find('.Dropdownbutton').select(0);
	   		$('#searchCondition').setData(View.preset);

	   		$('input[name=accYn]').parent().attr('class','ImageRadio af-radio-text');
	        $('input[name=accYn]').attr('checked',false);
	        $('input[name=accYn][value='+View.preset.accYn+']').parent().attr('class','ImageRadio af-radio-text Checked');
	        $('input[name=accYn][value='+View.preset.accYn+']').attr('checked',true);
	        $('input[name=accYn][value='+View.preset.accYn+']').setSelected();
	        $('[name=idctMgmtDivList]').setChecked(false);
	        $.each(View.preset.idctMgmtDivList, function(i, value) {
	            $('[name=idctMgmtDivList][value='+value+']').setChecked(true);
	        });
		}


		// 관계사용 초기화
	    function initSubSearchCondition(mode){

	    	if (mode == 'mode0'){
	    		// 전체 초기화
	    		$('#searchCondition').find('.Dropdownbutton').select(0);
	    		$('#searchCondition').setData(View.preset);
	    		$('#year').setEnabled(true);

	    		$('[name=idctMgmtDivList]').setChecked(false);
	            $.each(View.preset.idctMgmtDivList, function(i, value) {
	                $('[name=idctMgmtDivList][value='+value+']').setChecked(true);
	            });

	            $('input[name=msmtWayDiv]').parent().attr('class','ImageRadio af-radio-text');
	            $('input[name=msmtWayDiv]').attr('checked',false);
	            $('input[name=accYn]').parent().attr('class','ImageRadio af-radio-text');
	            $('input[name=accYn]').attr('checked',false);
	            $('input[name=reportType]').parent().attr('class','ImageRadio af-radio-text');
	            $('input[name=reportType]').attr('checked',false);

	            var $msmtWayDivTotal = $('input[name=msmtWayDiv][value=TOTAL]');
	            $msmtWayDivTotal.parent().attr('class','ImageRadio af-radio-text Checked');
	            $msmtWayDivTotal.attr('checked',true);
	            $msmtWayDivTotal.setSelected();

	            var $accYn = $('input[name=accYn][value='+View.preset.accYn+']');
	            $accYn.parent().attr('class','ImageRadio af-radio-text Checked');
	            $accYn.attr('checked',true);
	            $accYn.setSelected();

	            var $reportTypeResult = $('input[name=reportType][value=RESULT]');
	            $reportTypeResult.parent().attr('class','ImageRadio af-radio-text Checked');
	            $reportTypeResult.attr('checked',true);
	            $reportTypeResult.setSelected();

	            $('[name=useExceptIbYn]').setChecked(false);
	    	}
		}


	    function setStyleFooterGrid(cellValue) {
            var rtnVal = 'cellBold cellBg-type5';
            if(parseInt(cellValue.replace(/,/g, '')) < 0) { rtnVal = rtnVal + ' colorPoint-type1';}
            return rtnVal;
        }

		// ------------------------------------------------------------------------------------------


		// 금액 단위
		function getAmtUnitList(){
			var data =[];
			data.push({value: 'amtUnitType1' , text: '원'});
			data.push({value: 'amtUnitType2' , text: '백만원'});
			data.push({value: 'amtUnitType3' , text: '천만원'});
			data.push({value: 'amtUnitType4' , text: '억원'});
			return data;
		}

		// 기간
		function getPeriodList(){
			var data =[];
			data.push({value: 'periodType1' , text: '월'});
			data.push({value: 'periodType2' , text: '분기'});
			data.push({value: 'periodType3' , text: '반기'});
			return data;
		}

		// 기간 (연도별 성과비교)
		function getPeriodListForYearCompare(){
			var data =[];
			data.push({value: 'periodM' , text: '월'});
			data.push({value: 'periodQ' , text: '분기'});
			data.push({value: 'periodH' , text: '반기'});
			data.push({value: 'periodY' , text: '년'});
			return data;
		}


		// 조회조건 (엑셀 다운로드 조회조건 추가)
		function getConditionList(){
			let _conditions = [];
			let _formsName = '';
			let _sameFlag = null;
			const _conditionElem = $('.condition__wrap [data-converted]').not('.option');

			for ( let i = 0, len = _conditionElem.length, count = 0; i < len; i++ ) {
				const _v = _conditionElem[i];
				_sameFlag = false;

				// 검색/초기화 버튼 , hidden INPUT SKIP
				if ( _v.classList.contains('btn__forms') || _v.classList.contains('btn__icon') || _v.getAttribute('type') === 'hidden') continue;

				let _key = $(_v).closest('.condi').length === 0 ? $(_v).closest('li').children('strong').text() :$(_v).closest('.condi').children('strong').text();
				let _value = '';

				// BUTTON, SELECT
				switch(_v.nodeName) {
				   case 'BUTTON' : _value = $(_v).text(); break; // DropdownButton
				   case 'SELECT' : // 멀티셀렉트
					   const _data = $(_v).getData();
					   const _options = $(_v).children('option');
					   let _values = null;
					   for ( list in _data ) {
						   _values = _data[list];
					    }

					   for(let j = 0, jLen = _values.length; j < jLen; j++) {
						   _options.each(function(idx){
							    if ( $(this).val() == _values[j] ) {
							    	_value = _value === '' ? _value + $(this).text() : _value + ' , ' + $(this).text();
							    }
							});
					   }

					   break;

				   case 'INPUT' :
                        const _type = _v.alopextype;
                        if ( _type.indexOf('checkbox') > -1 || _type.indexOf('radio') > -1) { // radio & checkbox
                        	if ( _v.getAttribute('name') === _formsName ) continue;
                        	_formsName = _v.getAttribute('name');
                        	$('input[name='+_formsName+']:checked').closest('label').each(function(idx){
                                _value = idx === 0 ? _value + $(this).text() : _value + ' , ' + $(this).text();
                            });
                        } else if ( _type.indexOf('textinput') > -1 ) {
                        	_value =_v.value;
                        }
                        break;
                }


				if ( _value === 'IB제외' || _value === 'IB 제외' ) {
					 for ( v in _conditions) {
                        if ( _conditions[v].key === '측정방식' ) {
                        	_conditions[v].value = _conditions[v].value + '(IB제외)';
                        }
                     }
                    continue; // IB제외는 측정방식에 포함
				}

				for ( v in _conditions ) {
					if ( _key === _conditions[v].key )  _sameFlag = true;
				}
				if ( !_sameFlag ) _conditions.push({ key: _key, value: _value });
			}
			return _conditions;
		}
