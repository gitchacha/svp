(function($) {
	var alertCnt = 0;
	var bizCodeTryCount = 0;
	$sv = {
		BASE_PATH: $(location).attr('protocol') + '//' + $(location).attr('host') + '/ui/v0/api/',
		KEY_USER_INFO: 'USER_INFO',
		KEY_BIZ_CODE: 'BIZ_CODE',
		KEY_COMPANY_CODE: 'COMPANY_CODE',
		GRID_ROW_ADDED: {_state: {added: true, deleted: false}},
		GRID_ROW_UPDATED: {_state: {edited: true, added: false, deleted: false}},
		GRID_ROW_DELETED: {_state: {deleted: true, added: false}},
		CUSTOM_ALERT_ID: '_alertConfirm',
		/* Rest API Address를 조회 */
		getRestApiAddr: function() {
			if($a.session('restApiAddress') === 'undefined') {
				$a.request(this.BASE_PATH + 'restAddr', {
					async: false,
					success: function(res) {
						$a.session('restApiAddress', res);
					}
				});
			}
			return $a.session('restApiAddress');
		},
		getBizCodes: function(bizCodeIds) {
			var param = [];
			var bizCodes = {};
			$.each(bizCodeIds, function (index, bizCodeId) {
				param.push({'cdOwnrId': 'COMMON','cdDiv': bizCodeId});
			});

			$a.request('admin/system/code/getCommonCodeDtlList', {
				method: 'post',
				array: param,
				async: false,
				progress: true,
				alertErrorMessage: false,
				success: function(res) {
					$.each(res.data, function (index, item) {
						bizCodes[item.cdDiv] = item.codeList;
					});
				},
				error: function(errObject) {
					if(bizCodeTryCount > 1) {
						console.log('공통코드 조회 실패');
						return;
					} else {
						++bizCodeTryCount;
						$sv.getBizCodes(bizCodeIds);
					}
				}
			});
			return bizCodes;
		},
		/* URL에 붙어있는 Parameter를 추출 */
		urlParam: function(key) {
			var results = new RegExp('[\?&]' + key + '=([^&#]*)').exec(window.location.href);
			if (results === null) {
				return null;
			}
			return results[1];
		},
		clearStorage: function() {
			sessionStorage.removeItem('alopex');
			View.param = {};
		},
		/* 로그인이후 최초 로딩시 sessionStorage 초기화 */
		setSessionStorage: function() {
			$a.request(this.BASE_PATH + 'setSessionStorage', {
				async: false,
				method: 'get',
				progress: false
			});
		},
		callParentWindow: function(type, arg1, arg2, arg3) {
			window.parent.postMessage({
				'from': 'child',
				'iframeName': $(window.frameElement).attr('name'),
				'type': type,
				'arg1': arg1,
				'arg2': arg2,
				'arg3': arg3
			},'*');
		},
		callFileParentWindow: function(type, arg1, arg2, arg3, arg4) {
			window.parent.postMessage({
				'from': 'child',
				'iframeName': $(window.frameElement).attr('name'),
				'type': type,
				'arg1': arg1,
				'arg2': arg2,
				'arg3': arg3,
				'arg4': arg4
			},'*');
		},
		contentsIsPop: function() {
			var ext = '.popup';
			return (location.pathname.substr(location.pathname.indexOf(ext), ext.length) === ext);
		},
		/* message Alert를 띄움 */
		messageAlert: function(messageId, arg1, arg2, arg3) {
			if(this.isEmptyString(messageId)) {
				return;
			}
			$a.request(this.BASE_PATH + 'message', {
				async: false,
				data: {'messageId' : messageId },
				success: function(res) {
					alert(res);
				}
			});
		},
		/**
		 * Browser session storage에 data 저장
		 * @param key : 저장할 data 구분 key
		 * @param val : 저장할 data
		 * @return 없음
		 */
		setSsn: function(key, val) {
			sessionStorage.setItem(key, val);
		},
		/**
		 * Browser session storage에서 data 조회
		 * @param key : 조회할 data 구분 key
		 * @param defVal : 조회 실패시 return 할 data (optional)
		 * @return data object
		 */
		getSsn: function(key, defVal) {
			var val = sessionStorage.getItem(key);
			if(!val && defVal) {
				val = defVal;
			}
			return val;
		},
		setSsnUserInfo: function() {
			return;
			$a.request(this.BASE_PATH + "getSessionUserInfo", {
				async: false,
				success: function(res) {
					sessionStorage.clear();
					$sv.setSsn($sv.KEY_USER_INFO, JSON.stringify(res));
				},
				fail: function(response) {
					console.log("Error, getSsnUserInfo() : Can not receive data from server.");
				}
			});
		},
		/**
		 * Browser session storage에 data 저장
		 * @param key : 저장할 data 구분 key
		 * @param val : 저장할 data
		 * @return 없음
		 */
		setSsn: function(key, val) {
			sessionStorage.setItem(key, val);
		},
		/**
		 * Browser session storage에서 user data 조회
		 * @param key : 조회할 user data 내 구분 key (optional)
		 * @return user data object (key가 없으면 전체 user data, key가 있으면 user data 중 해당 값)
		 */
		getSsnUserInfo: function(key) {
			var userInfo = $sv.getSsn($sv.KEY_USER_INFO);
			if(this.isEmpty(userInfo)) {
				// get session data from server
				return;
				$a.request(this.BASE_PATH + "getSessionUserInfo", {
					async: false,
					success: function(res) {
						$sv.setSsn($sv.KEY_USER_INFO, JSON.stringify(res));
					},
					fail: function(response) {
						console.log("Error, getSsnUserInfo() : Can not receive data from server.");
					}
				});
				userInfo = $sv.getSsn($sv.KEY_USER_INFO);
			}
			if(this.isEmpty(userInfo)) {
				return null;
			}
			var userInfoObj = JSON.parse(userInfo);
			if(!key) {
				return userInfoObj;
			}
			return userInfoObj[key];
		},
		/**
		 * 입력된 객체가 null 또는 빈값이면 true를 반환
		 * @param o : 점검할 object
		 * @return : 점검 결과 (null 또는 빈값이면 false, 그외 true)
		 */
		isNotEmpty: function(o) {
			if(undefined === o || null === o) {
				return false;
			}
			if($.isArray(o) && o.length < 1) {
				return false;
			}
			if("object" === typeof o && $.isEmptyObject(o)) {
				return false;
			}
			if("string" === typeof o && ("" === o || "undefined" === o || "null" === o )) {
				return false;
			}
			return true;
		},
		isEmpty: function(o) {
			return !$sv.isNotEmpty(o);
		},
		setBizCodes: function(bizCodeIds) {
			var sessionBizCode = $a.session($sv.KEY_BIZ_CODE);
			var param = [];

			$.each(bizCodeIds, function(index, bizCodeId) {
				var has = false;
				if($sv.isNotEmpty(sessionBizCode)) {
					has = sessionBizCode.hasOwnProperty(bizCodeId);
				}
				if(!has) {
					param.push({'cdOwnrId': 'COMMON', 'cdDiv': bizCodeId});
				}
			});

			if(param.length > 0) {
				if($sv.isEmpty(sessionBizCode)) {
					sessionBizCode = {};
				}

				$a.request('admin/system/code/getCommonCodeDtlList', {
					method: 'post',
					array: param,
					async: false,
					progress: false,
					success: function(res) {
						$.each(res.data, function(index, item) {
							sessionBizCode[item.cdDiv] = item.codeList;
						});
						$a.session($sv.KEY_BIZ_CODE, sessionBizCode);
					}
				});
			}
		},
		getBizCode: function(bizCodeId) {
			var bizCode = $a.session($sv.KEY_BIZ_CODE);
			if($sv.isEmpty(bizCode)) {
				bizCode = {};
			} else {
				if(bizCode.hasOwnProperty(bizCodeId)) {
					return bizCode[bizCodeId];
				}
			}
			$a.request('admin/system/code/getCommonCodeDtlList', {
				method: 'post',
				array: [{'cdOwnrId': 'COMMON', 'cdDiv': bizCodeId}],
				async: false,
				progress: false,
				success: function(res) {
					$.each(res.data, function(index, item) {
						bizCode[item.cdDiv] = item.codeList;
					});
					$a.session($sv.KEY_BIZ_CODE, bizCode);
				}
			});
			return bizCode[bizCodeId];
		},
		markInvalidForm: function(id, i) {
			var f = findDataBindItems(id);
			clearInvalidFormTooltip(id);
			clearInvalidFormStyle(f);

			if($sv.isEmpty(i)) {
				return true;
			}
			makeInvalidForm(f, i);
			return false;
		},
		columnResizeEnd: function(e) {
			var grid = AlopexGrid.parseEvent(e).$grid;
			var mapping = AlopexGrid.parseEvent(e).mapping;
			var columns = grid.alopexGrid('columnGet', {hidden:false} );
			var columnTotalWidth = 0;
			var lastCol = (mapping.key === columns[columns.length-1].key);

			if(lastCol) {
				var reversed = columns.reverse();
				columns = reversed;
			}

			$.each(columns, function(index, column) {
				if(columns.length -1 > index || !column.resizing) {
					columnTotalWidth += column.width;
					columnTotalWidth += 0.5;
				} else {
					var yScrollWidth = Number($('#'+$(grid).attr('id')+' .scrollbar.y').css('width').replace('px', ''));
					if(yScrollWidth > 0) {
						yScrollWidth += 1.1;
					}
					var gridWidth = grid.alopexGrid('getGeometry').gridWidth - yScrollWidth;
					var gap = gridWidth - (columnTotalWidth + column.width);

					if(gap > 0) {
						grid.alopexGrid('updateColumn', {width: column.width + gap + 1}, column.key);
					}
				}
			});

			var fitTableWidth = grid.alopexGrid('readOption').fitTableWidth;
			grid.alopexGrid('updateOption',	{ fitTableWidth: fitTableWidth });
		},
		getElementByBind: function(key) {
			var el;
			$('[data-bind]').each(function(index, item) {
				if($.trim(item.bind.split(':')[1]) === key) {
					el = $(item);
					return false;
				}
			});
			return el;
		},
		hasChangedRow: function(grid) {
			var changedRowCnt = grid.alopexGrid('dataGet', this.GRID_ROW_ADDED, this.GRID_ROW_UPDATED, this.GRID_ROW_DELETED).length;
			return (changedRowCnt > 0);
		},
		getGirdRows: function(grid) {
			return {
				added: AlopexGrid.trimData(grid.alopexGrid('dataGet', this.GRID_ROW_ADDED)),
				updated: AlopexGrid.trimData(grid.alopexGrid('dataGet', this.GRID_ROW_UPDATED)),
				deleted: AlopexGrid.trimData(grid.alopexGrid('dataGet', this.GRID_ROW_DELETED))
			};
		},
		getGirdRowsWithEdit: function(grid, param) {
			grid.alopexGrid('dataEdit', param, this.GRID_ROW_ADDED);
			grid.alopexGrid('dataEdit', param, this.GRID_ROW_UPDATED);
			grid.alopexGrid('dataEdit', param, this.GRID_ROW_DELETED);
			return {
				added: AlopexGrid.trimData(grid.alopexGrid('dataGet', this.GRID_ROW_ADDED)),
				updated: AlopexGrid.trimData(grid.alopexGrid('dataGet', this.GRID_ROW_UPDATED)),
				deleted: AlopexGrid.trimData(grid.alopexGrid('dataGet', this.GRID_ROW_DELETED))
			};
		},
		setGridData: function(gId, res, contentsName) {
			var dynamicOption = {};
			var totalCount;
			var sInfo = $('#'+gId).alopexGrid('sortingInfo');			//sortingInfo Info 추출
			if(sInfo.sorted) {
				dynamicOption.sortingKey = sInfo.sortingKey;				//데이터가 정렬된 데이터일 경우 정렬된 칼럼의 key를 명시.
				dynamicOption.sortingDirection = sInfo.sortingDirection;	//데이터가 정렬된 데이터일 경우 오름차순인지 내림차순인지를 "asc" 또는 "desc"로 명시.
			}

			var data = res.data;
			var contents = [];

			if($sv.isNotEmpty(contentsName)) {
				contents = data[contentsName];

				if($sv.isNotEmpty(contents)) {
					dynamicOption.dataLength = contents.length;	//총 데이터의 길이를 명시.
				}
			} else {
				if(data.hasOwnProperty('pageInfo')) {
					dynamicOption.dataLength = data.pageInfo.totalCount;	//총 데이터의 길이를 명시.
					dynamicOption.current = data.pageInfo.pageNumber+1;		//현재 페이지 번호를 명시.
					dynamicOption.perPage = data.pageInfo.pageSize;			//한 페이지에 몇개의 데이터를 보여줄지를 명시. 이 값이 없을 경우 dataList의 길이를 사용.
					dynamicOption.total = data.pageInfo.totalCount;
					totalCount = data.pageInfo.totalCount;
					contents = data.pageInfo.content;
				} else if(data.hasOwnProperty('content')) {
					dynamicOption.dataLength = data.totalCount;		//총 데이터의 길이를 명시.
					dynamicOption.current = data.pageNumber+1;		//현재 페이지 번호를 명시.
					dynamicOption.perPage = data.pageSize;			//한 페이지에 몇개의 데이터를 보여줄지를 명시. 이 값이 없을 경우 dataList의 길이를 사용.
					dynamicOption.total = data.totalCount;
					totalCount = data.totalCount;
					contents = data.content;
				} else {
					dynamicOption.dataLength = data.length;	//총 데이터의 길이를 명시.
					dynamicOption.current = 1;				//현재 페이지 번호를 명시.
					dynamicOption.perPage = data.length;
					dynamicOption.total = data.length;
					totalCount = data.length;
					contents = data;
				}
			}

			$('#'+gId).alopexGrid('dataSet', contents, dynamicOption);
			$('#'+gId).alopexGrid('viewUpdate');
			return totalCount;
		},
		autoDestroyAlert: function(msg, callbackFunc) {
			if(self !== top) {
				//팝업이므로 parent에서 실행 되도록한다.
				$sv.callParentWindow('autoDestroyAlert', msg, callbackFunc);
				return;
			}

			var alertId = $sv.CUSTOM_ALERT_ID + (++alertCnt);
			var option = {
				message: msg,
				id: alertId
			};
			var alertMsg = new CustomAlert(option);
			alertMsg.open();
			setTimeout(function() {
				alertMsg.close();
				if($sv.isNotEmpty(callbackFunc)) {
					alertCallback('ok', callbackFunc);
				};
			}, 1150);
		},
		confirm: function(msg, callbackFunc) {
			if(self !== top) {
				//팝업이므로 parent에서 실행 되도록한다.
				$sv.callParentWindow('confirm', msg, callbackFunc);
				return;
			}

			var alertId = $sv.CUSTOM_ALERT_ID + (++alertCnt);
			var option = {
				message: msg,
				id: alertId,
				controls: [
					{ text: '확인', value: 'ok'},
					{ text: '취소', value: 'cancel'}
				]
			};
			var alertMsg = new CustomAlert(option);
			alertMsg.open();

			if($sv.isNotEmpty(callbackFunc)) {
				$('#'+alertId).on('remove', function(e, btn) {
					alertCallback(btn.value, callbackFunc);
				});
			};
		},
		confirmFile: function(msg, fileId, fileInfo, callbackFunc) {
			if(self !== top) {
				//팝업이므로 parent에서 실행 되도록한다.
				$sv.callFileParentWindow('confirmFile', msg, fileId, fileInfo, callbackFunc);
				return;
			}

			var alertId = $sv.CUSTOM_ALERT_ID + (++alertCnt);
			var option = {
				message: msg,
				id: alertId,
				controls: [
					{ text: '확인', value: 'ok'},
					{ text: '취소', value: 'cancel'}
				]
			};
			var alertMsg = new CustomAlert(option);
			alertMsg.open();

			if($sv.isNotEmpty(callbackFunc)) {
				$('#'+alertId).on('remove', function(e, btn) {
					alertFileCallback(btn.value, fileId, fileInfo, callbackFunc);
				});
			};
		},
		alert: function(msg, callbackFunc) {
			if(self !== top) {
				//팝업이므로 parent에서 실행 되도록한다.
				$sv.callParentWindow('alert', msg, callbackFunc);
				return;
			}

			var alertId = $sv.CUSTOM_ALERT_ID + (++alertCnt);
			var option = {
				message: msg,
				id: alertId,
				controls: [{ text: '확인', value: 'ok'}]
			};
			var alertMsg = new CustomAlert(option);
			alertMsg.open();

			if($sv.isNotEmpty(callbackFunc)) {
				$('#'+alertId).on('remove', function(e, btn) {
					alertCallback(btn.value, callbackFunc);
				});
			};
		},
		alertTextAlignLeft: function(msg, callbackFunc) {
			if(self !== top) {
				//팝업이므로 parent에서 실행 되도록한다.
				$sv.callParentWindow('alert', msg, callbackFunc);
				return;
			}

			var alertId = $sv.CUSTOM_ALERT_ID + (++alertCnt);
			var option = {
				message: msg,
				id: alertId,
				textAlign: 'left',
				controls: [{ text: '확인', value: 'ok'}]
			};
			var alertMsg = new CustomAlert(option);
			alertMsg.open();

			if($sv.isNotEmpty(callbackFunc)) {
				$('#'+alertId).on('remove', function(e, btn) {
					alertCallback(btn.value, callbackFunc);
				});
			};
		},
		optionAlert: function(msg, options, callbackFunc) {
			if(self !== top) {
				//팝업이므로 parent에서 실행 되도록한다.
				$sv.callParentWindow('optionAlert', msg, options, callbackFunc);
				return;
			}

			var alertId = $sv.CUSTOM_ALERT_ID + (++alertCnt);
			var option = {
				message: msg,
				id: alertId,
				controls: options
			};
			var alertMsg = new CustomAlert(option);
			alertMsg.open();

			if($sv.isNotEmpty(callbackFunc)) {
				$('#'+alertId).on('remove', function(e, btn) {
					alertCallback(btn.value, callbackFunc);
				});
			};
		},
		makeInvalidRowByAddRow: function(e) {
			var $tooltip = $('#tooltip');
			$tooltip.close();
			var evtObj = AlopexGrid.parseEvent(e);
			if(!evtObj.hasOwnProperty('datalist')) {
				return;
			}
			var rows = evtObj.datalist;

			$.each(rows, function(rIdx, row) {

				try {
					validation.check(row);
				} catch(e) {
					return false;
				}

				var cols = evtObj.$grid.alopexGrid('rowElementGet', row);
				$.each(cols, function(cidx, col) {
					var colKey = col.dataset.alopexgridKey;
					var colId = colKey+col.dataset.alopexgridDataindex;
					var $col = $('#'+colId).length > 0 ? $('#'+colId)[0] : null;
					if($col) {
						if($col.alopextype[0] === 'daterange') {
							$col._start.removeClass('mandatory');
							$col._end.removeClass('mandatory');
							$col._start.off('focus');
							$col._end.off('focus');
							$col._start.off('blur');
							$col._end.off('blur');
							$.each(row._invalid, function(idx, invalid) {
								if(colKey === invalid.key) {
									$col._start.addClass('mandatory');
									$col._end.addClass('mandatory');
									$col._start.on('focus', function(e) {
										$(col).trigger('invalidTooltip', col);
									});
									$col._start.on('blur', function(e) {
										var $tooltip = $('#tooltip');
										$tooltip.close();
									});
									$col._end.on('focus', function(e) {
										$(col).trigger('invalidTooltip', col);
									});
									$col._end.on('blur', function(e) {
										var $tooltip = $('#tooltip');
										$tooltip.close();
									});
									return false;
								}
							});
						} else {
							$('#'+colId).removeClass('mandatory');
							$('#'+colId).off('focus');
							$('#'+colId).off('blur');
							$.each(row._invalid, function(idx, invalid) {
								if(colKey === invalid.key) {
									$('#'+colId).addClass('mandatory');
									$('#'+colId).on('focus', function(e) {
										$(col).trigger('invalidTooltip', col);
									});
									$('#'+colId).on('blur', function(e) {
										var $tooltip = $('#tooltip');
										$tooltip.close();
									});
									return false;
								}
							});
						}
					}
				});
			});
		},
		makeInvalidRow: function(e) {
			var $tooltip = $('#tooltip');
			$tooltip.close();
			var evtObj = AlopexGrid.parseEvent(e);
			if(!evtObj.hasOwnProperty('data')) {
				return;
			}
			var row = evtObj.data;
			var cols = evtObj.$grid.alopexGrid('rowElementGet', row);
			$.each(cols, function(cidx, col) {
				var colKey = col.dataset.alopexgridKey;
				var colId = colKey+col.dataset.alopexgridDataindex;
				if($('#'+colId).length > 0) {
					if($('#'+colId)[0].alopextype[0] === 'daterange') {
						$('#'+colId)[0]._start.removeClass('mandatory');
						$('#'+colId)[0]._end.removeClass('mandatory');
						$('#'+colId)[0]._start.off('focus');
						$('#'+colId)[0]._end.off('focus');
						$('#'+colId)[0]._start.off('blur');
						$('#'+colId)[0]._end.off('blur');
						$.each(row._invalid, function(idx, invalid) {
							if(colKey === invalid.key) {
								$('#'+colId)[0]._start.addClass('mandatory');
								$('#'+colId)[0]._end.addClass('mandatory');
								$('#'+colId)[0]._start.on('focus', function(e) {
									$(col).trigger('invalidTooltip', col);
								});
								$('#'+colId)[0]._start.on('blur', function(e) {
									var $tooltip = $('#tooltip');
									$tooltip.close();
								});
								$('#'+colId)[0]._end.on('focus', function(e) {
									$(col).trigger('invalidTooltip', col);
								});
								$('#'+colId)[0]._end.on('blur', function(e) {
									var $tooltip = $('#tooltip');
									$tooltip.close();
								});
								return false;
							}
						});
					} else {
						$('#'+colId).removeClass('mandatory');
						$('#'+colId).off('focus');
						$('#'+colId).off('blur');
						$.each(row._invalid, function(idx, invalid) {
							if(colKey === invalid.key) {
								$('#'+colId).addClass('mandatory');
								$('#'+colId).on('focus', function(e) {
									$(col).trigger('invalidTooltip', col);
								});
								$('#'+colId).on('blur', function(e) {
									var $tooltip = $('#tooltip');
									$tooltip.close();
								});
								return false;
							}
						});
					}
				}
			});
		},
		inputNumberValid: function(evtObj) {
			var grid = evtObj.$grid;
			if(evtObj.mapping.hasOwnProperty('editedValueType')) {
				if(evtObj.mapping.editedValueType === 'string') {
					if(String(evtObj.value) !== '-') {
						if(String(evtObj.prevValue).replace(/,/g, '') === String(evtObj.value).replace(/,/g, '')) {
							return false;
						}
						if(isNaN(String(evtObj.value).replace(/,/g, '')) || String(evtObj.value).replace(/,/g, '').indexOf('+') > -1) {
							$sv.undoInputNumberValue(evtObj);
							return false;
						} else {
							var dataset = evtObj.$cell[0].firstChild.dataset;
							var valArr = String(evtObj.value).replace(/,/g, '').split('.');
							var inputVal = String(evtObj.value);
							var newVal;

							if(dataset.inputType === 'number') {
								if(inputVal.length > 17) {
									//전체 17자리 초과
									if(String(Number(valArr[0])).length <= 17) {
										newVal = String(Number(valArr[0]));
										var tail = 17 - String(Number(valArr[0])).length -1;

										if(tail > 0) {
											if(valArr.length > 1) {
												newVal += '.';
												newVal += String(Number(valArr[1])).substr(0, tail);
											}
										}
									}
									$sv.undoInputNumberValue(evtObj, newVal);
									return false;
								}
								if(valArr.length > 1) {
									if(String(Number(valArr[1])).length > 9) {
										//소수점 9자리 초과
										newVal = String(Number(valArr[0]));
										newVal += '.';
										newVal += String(Number(valArr[1])).substr(0, 9);
										$sv.undoInputNumberValue(evtObj, newVal);
										return false;
									}
								}
							} else if(dataset.inputType === 'positiveNumber') {
								if(Number(inputVal) < 0) {
									//음수 입력
									$sv.undoInputNumberValue(evtObj);
									return false;
								}
								if(inputVal.length > 17) {
									//전체 17자리 초과
									if(String(Number(valArr[0])).length <= 17) {
										newVal = String(Number(valArr[0]));
										var tail = 17 - String(Number(valArr[0])).length -1;

										if(tail > 0) {
											if(valArr.length > 1) {
												newVal += '.';
												newVal += String(Number(valArr[1])).substr(0, tail);
											}
										}
									}
									$sv.undoInputNumberValue(evtObj, newVal);
									return false;
								}
							} else if(dataset.inputType === 'positiveInteger') {
								if(Number(inputVal) < 0) {
									//음수 입력
									$sv.undoInputNumberValue(evtObj);
									return false;
								}
								if(inputVal.replace(/,/g, '').indexOf('.') > -1) {
									//소수점 입력
									newVal = String(Number(valArr[0]));
									if(newVal.length <= 17) {
										$sv.undoInputNumberValue(evtObj, newVal);
									} else {
										$sv.undoInputNumberValue(evtObj);
									}
									return false;
								}
								if(inputVal.length > 17) {
									//전체 17자리 초과
									newVal = String(Number(valArr[0]));
									if(newVal.length <= 17) {
										$sv.undoInputNumberValue(evtObj, newVal);
									} else {
										$sv.undoInputNumberValue(evtObj);
									}
									return false;
								}
							} else if(dataset.inputType === 'rate') {
								if(Number(inputVal) < 0) {
									//음수 입력
									$sv.undoInputNumberValue(evtObj);
									return false;
								}
								if(inputVal.length > 17) {
									//전체 17자리 초과
									if(String(Number(valArr[0])).length <= 17) {
										newVal = String(Number(valArr[0]));
										var tail = 17 - String(Number(valArr[0])).length -1;

										if(tail > 0) {
											if(valArr.length > 1) {
												newVal += '.';
												newVal += String(Number(valArr[1])).substr(0, 2);
											}
										}
									}
									$sv.undoInputNumberValue(evtObj, newVal);
									return false;
								}
								if(valArr.length > 1) {
									if(String(Number(valArr[1])).length > 2) {
										//소수점 2자리 초과
										if(String(Number(valArr[0])).length <= 17) {
											newVal = String(Number(valArr[0]));
											var tail = 17 - String(Number(valArr[0])).length -1;

											if(tail > 0) {
												if(valArr.length > 1) {
													newVal += '.';
													newVal += String(Number(valArr[1])).substr(0, 2);
												}
											}
										}
										$sv.undoInputNumberValue(evtObj, newVal);
										return false;
									}
								}
							} else if(dataset.inputType === 'rateMax100') {
								if(Number(inputVal) > 100) {
									//100초과 입력
									$sv.undoInputNumberValue(evtObj);
									return false;
								}
								if(Number(inputVal) < 0) {
									//음수 입력
									$sv.undoInputNumberValue(evtObj);
									return false;
								}
								if(inputVal.length > 17) {
									//전체 17자리 초과
									if(String(Number(valArr[0])).length <= 17) {
										newVal = String(Number(valArr[0]));
										var tail = 17 - String(Number(valArr[0])).length -1;

										if(tail > 0) {
											if(valArr.length > 1) {
												newVal += '.';
												newVal += String(Number(valArr[1])).substr(0, 2);
											}
										}
									}
									$sv.undoInputNumberValue(evtObj, newVal);
									return false;
								}
								if(valArr.length > 1) {
									if(String(Number(valArr[1])).length > 2) {
										//소수점 2자리 초과
										if(String(Number(valArr[0])).length <= 17) {
											newVal = String(Number(valArr[0]));
											var tail = 17 - String(Number(valArr[0])).length -1;

											if(tail > 0) {
												if(valArr.length > 1) {
													newVal += '.';
													newVal += String(Number(valArr[1])).substr(0, 2);
												}
											}
										}
										$sv.undoInputNumberValue(evtObj, newVal);
										return false;
									}
								}
							}
						}
					}
				}
			}
			return true;
		},
		undoInputNumberValue: function(evtObj, newVal) {
			var grid = evtObj.$grid;
			var key = evtObj.mapping.key;
			var focusInfo = grid.alopexGrid('focusInfo');

			if($sv.isNotEmpty(newVal)) {
				grid.alopexGrid('cellEdit', newVal, {_index: {data: evtObj.data._index.data}}, key);
			} else {
				grid.alopexGrid('cellEdit', String(evtObj.prevValue).replace(/,/g, ''), {_index: {data: evtObj.data._index.data}}, key);
			}

			grid.alopexGrid('refreshCell', {_index: {data: evtObj.data._index.data}}, key);
			grid.alopexGrid('focusRestore', focusInfo);
		},
		showGridInvalidTooltip: function(e) {
			var evtObj = AlopexGrid.parseEvent(e);
			var invalid = evtObj.data._invalid;
			var key = evtObj.mapping.key;
			var cell = evtObj.$cell[0];
			var colKey = cell.dataset.alopexgridKey;
			var colId = colKey+cell.dataset.alopexgridDataindex;
			var $tooltip = $('#tooltip');
			var msg = getValidataionMessage(invalid, key);
			$tooltip.html(msg);
			$tooltip.attr('data-base', '#'+colId);
			if($tooltip[0]._currentstate === 'closed') {
				$tooltip.open();
			}
		},
		hideGridInvalidTooltip: function(e) {
			var $tooltip = $('#tooltip');
			$tooltip.close();
		},
		initGirdValidationTooltip: function() {
			$('#tooltip').attr('data-open-trigger', 'focus');
			$('#tooltip').attr('data-close-trigger', 'blur');
			$('#tooltip').convert();
		},
		gridCommaCellRendered: function(e) {
			var evtObj = AlopexGrid.parseEvent(e);
			if(!evtObj.editing) {
				var cellData = evtObj.cell.dataset;
				var childId = cellData.alopexgridKey+ cellData.alopexgridDataindex;
				if($sv.isNotEmpty(evtObj.cell.children[childId])) {
					var ch = $('#'+childId);
					if(ch[0].dataset.hasOwnProperty('type')) {
						$('#'+childId).val('￦'+AlopexGrid.renderUtil.addCommas(evtObj.value));
					}
				}
			}
		},
		getUniqueArray: function(arr) {
			var unique = [];
			$.each(arr, function(e, el) {
				if($.inArray(el, unique) === -1) unique.push(el);
			});
			return unique;
		},

		inputDataTab: function(e, grid) {
			var newFocus = {cellFocus: null, inputFocus: {
				tagName: "INPUT",
				tagOrder: 0
			}};

			var currentFocus = grid.alopexGrid('focusInfo');
			var scrollOffset = grid.alopexGrid('scrollOffset');
			var nextColumn = grid.alopexGrid('columnGet', { columnIndex: currentFocus.inputFocus.columnIndex+1 })[0];
			var scrollColLast = false;

			if($sv.isNotEmpty(nextColumn) && nextColumn.hasOwnProperty('useSubTotal')) {
				//goto next column
				var _curInputFocus = currentFocus.inputFocus;

				newFocus.inputFocus.columnIndex = _curInputFocus.columnIndex+1;
				newFocus.inputFocus.row = _curInputFocus.row;

				var _lastColIdx = ($('#inputGrid').alopexGrid('readOption').columnMapping.length-1);
				var _scrollColKey = _curInputFocus.columnIndex === _lastColIdx ? _lastColIdx : _curInputFocus.columnIndex-1;
				var _colKey = grid.alopexGrid('columnInfo', _scrollColKey).key;

				grid.alopexGrid('dataScroll', {_index:{column:_colKey}});
				var _dataMoveScroll = grid.alopexGrid('scrollOffset');
				if ( grid.alopexGrid('scrollOffset').columnScrollEnd ) {
					var scr = grid.alopexGrid('scrollOffset');
					scr.column = ++scr.column;
					grid.alopexGrid('setScroll', scr);
					scrollColLast = true;
				}
				grid.alopexGrid('focusRestore', newFocus);

			} else {
				//다음 행 확인
				var nextRows = grid.alopexGrid('dataGet', function(data) {
					return data._index.row > currentFocus.inputFocus.row;
				});

				// 다음줄 없으면 return.
				if ( nextRows.length === 0 ) return;

				grid.alopexGrid('dataScroll', {_index:{column:0}});
				var columns = grid.alopexGrid('columnGet', { useSubTotal: true });

				var hasInput = false;

				$.each(nextRows, function(index, item) {

					var scrollRowNum = scrollOffset.row;
					var grdHeight = typeof(grid.alopexGrid('readOption').height) === "function" ?
							$(grid).attr('data-height') : grid.alopexGrid('readOption').height;
					var rowHeight = Number(grdHeight.replace('row', ''));

					if(!isNaN(rowHeight)) {
						if(item._index.row > rowHeight) {
							scrollRowNum = item._index.row - (rowHeight-1);
						}
					}

					if(!hasInput) {
						$.each(columns, function(cIndex, cItem) {

							var checkCell =  grid.alopexGrid('cellElementGet', { _index: {row: item._index.row}}, cItem.columnIndex);
							if($sv.isEmpty(checkCell[0])) {
								grid.alopexGrid('dataScroll', {_index:{row: scrollRowNum, column:0}});
							}

							var nCell = grid.alopexGrid('cellElementGet', { _index: {row: item._index.row}}, cItem.columnIndex);
							if($sv.isNotEmpty(nCell[0])) {

								var _firstElem = $sv.isNotEmpty(nCell[0].firstElementChild) ? nCell[0].firstElementChild : false;
								var _hasInputElem = _firstElem.className === 'cell-content' ? _firstElem.firstChild : _firstElem;
								var _tagName =_hasInputElem.tagName;


								if( _tagName !== undefined && _tagName === 'INPUT' ) {
									if(!$(_hasInputElem).hasClass('Disabled')) {
										newFocus.inputFocus.columnIndex = cItem.columnIndex;
										newFocus.inputFocus.row = item._index.row;
										grid.alopexGrid('focusRestore', newFocus);
										hasInput = true;
										return false;
									}
								}
							}
						});
					}
				});

				if(!hasInput) {
					grid.alopexGrid('dataScroll', {_index:{row: scrollOffset.row, column: currentFocus.inputFocus.columnIndex}});
					grid.alopexGrid('focusRestore', currentFocus);
				}
			}
		},
		inputDataEnter: function(e, grid) {
			var newFocus = {cellFocus: null, inputFocus: {
				tagName: "INPUT",
				tagOrder: 0
			}};

			var currentFocus = grid.alopexGrid('focusInfo');
			var scrollOffset = grid.alopexGrid('scrollOffset');

			var nextRows = grid.alopexGrid('dataGet', function(data) {
				return data._index.row > currentFocus.inputFocus.row;
			});

			var hasInput = false;

			$.each(nextRows, function(index, item) {

				var scrollRowNum = scrollOffset.row;
				var grdHeight = typeof(grid.alopexGrid('readOption').height) === "function" ?
						$(grid).attr('data-height') : grid.alopexGrid('readOption').height;
				var rowHeight = Number(grdHeight.replace('row', ''));


				if(!isNaN(rowHeight)) {
					if(item._index.row > rowHeight) {
						scrollRowNum = item._index.row - (rowHeight-1);
					}
				}

				var checkCell = grid.alopexGrid('cellElementGet', { _index: {row: item._index.row}}, currentFocus.inputFocus.mapping.columnIndex);
				if($sv.isEmpty(checkCell[0])) {
					grid.alopexGrid('dataScroll', {_index:{row: scrollRowNum}});
				}

				if(!hasInput) {
					var nCell = grid.alopexGrid('cellElementGet', { _index: {row: item._index.row}}, currentFocus.inputFocus.mapping.columnIndex);

					if($sv.isNotEmpty(nCell[0])) {
						if($sv.isNotEmpty(nCell[0].firstElementChild) && nCell[0].firstElementChild.tagName !== undefined) {
							if(nCell[0].firstElementChild.tagName === 'INPUT') {
								if(!$(nCell[0].firstElementChild).hasClass('Disabled')) {
									newFocus.inputFocus.columnIndex = currentFocus.inputFocus.mapping.columnIndex;
									newFocus.inputFocus.row = item._index.row;
									grid.alopexGrid('focusRestore', newFocus);
									hasInput = true;
									return false;
								}
							}
						}
					}
				}
			});

			if(!hasInput) {
				grid.alopexGrid('dataScroll', {_index:{row: scrollOffset.row}});
				grid.alopexGrid('focusRestore', currentFocus);
			}
		}
	};

	function alertCallback(value, callbackFunc) {
		if(typeof(callbackFunc) === 'string') {
			var callbackArr = callbackFunc.split('/');
			if(callbackArr.length > 1) {
				$('iframe[name='+callbackArr[1]+']').get(0).contentWindow._page[callbackArr[0]](value);
			} else {
				this._page[callbackFunc](value);
			}
		} else {
			callbackFunc(value);
		}
	}

	function alertFileCallback(value, fileId, fileInfo, callbackFunc) {
		if(typeof(callbackFunc) === 'string') {
			var callbackArr = callbackFunc.split('/');
			if(callbackArr.length > 1) {
				$('iframe[name='+callbackArr[1]+']').get(0).contentWindow.View.fileLoader[fileId][callbackArr[0]](value, fileInfo);
			} else {
				this.View.fileLoader[fileId][callbackFunc](value, fileInfo);
			}
		} else {
			callbackFunc(value);
		}
	}

	/* Scope: private function */
	function clearInvalidFormTooltip(id) {
		//tooltip삭제
		$('#'+id+' .Tooltip.invalid').remove();
	}

	function clearInvalidFormStyle(f) {
		//style삭제 border지우기
		f.forEach(function(comp) {
			$(comp).removeClass('mandatory');
			return false;
		});
	}

	function findDataBindItems(id) {
		var f = [];
		$('#'+id+' [data-bind]').each(function(index, item) {
			if(item.hasAttributes('dataset')) {
				f.push(item);
			}
		});
		return f;
	}

	function makeInvalidForm(f, i) {
		i.forEach(function(invalid) {
			f.forEach(function(comp) {
				var key = $.trim(comp.dataset.bind.split(':')[1]);
				if(key === invalid.key) {
					$(comp).addClass('mandatory');
					var tooltip = makeToolTip(invalid);
					if(tooltip) {
						if(comp.alopextype.indexOf('textarea') > -1) {
							$(tooltip).attr('data-position','top|right');
						}
						$(comp).after(tooltip);
					}
					$a.convert(comp);
					return false;
				}
			});
		});
	}

	function makeToolTip(invalid) {
		if($sv.isEmpty(invalid)) {
			return null;
		}

		var tooltip = document.createElement('div');
		$(tooltip).addClass('Tooltip');
		$(tooltip).addClass('invalid');
		$(tooltip).text(invalid.msg);
		return tooltip;
	}

	function getValidataionMessage(invalids, key) {
		var msg = '';
		$.each(invalids, function(index, item) {
			if(item.key === key) {
				msg = item.msg;
				return false;
			}
		});
		return msg;
	}
})(jQuery);

/* CustomAlert - 커스텀 Alert(Confirm) 생성 */
var CustomAlert = (function() {

	function CustomAlert(option) {
		this.init(option);
	}

	function customAlertButtonClick(el, btn) {
		$(el).trigger('remove', btn);
		$('#'+$(el).attr('id')).remove();
	}

	// Select Dom initialize
	CustomAlert.prototype.init = function(option) {
		this.type = option.type;
		this.textAlign = option.textAlign;
		this.id = option.id;
		this.message = option.message;
		this.controls = option.controls;

		var _type = this.type ? 'type-'+this.type : 'type-default',
			_controls = '';

		var el1 = document.createElement('div');
		var el2 = document.createElement('div');
		var el3 = document.createElement('p');
		var el4 = document.createElement('font');
		var el5 = document.createElement('span');
		var el6 = document.createElement('span');

		$(el1).addClass('dialog__custom');
		$(el1).addClass(_type);
		$(el1).attr('id', this.id);
		$(el1).attr('data-animation', 'fade');
		$(el2).addClass('article');
		$(el3).addClass('msg');

		if(this.textAlign !== undefined) {
			$(el3).css('text-align', 'left');
		}

		$(el4)[0].innerHTML = this.message.replace(/\n/g, '<br>');
		$(el3).append(el4);
		$(el2).append(el3);
		$(el5).addClass('dialog__area-controls');

		$.each(this.controls, function(index, item) {
			var btn = document.createElement('button');
			$(btn).addClass('Button');
			$(btn).addClass('btn__dialog');
			$(btn)[0].innerHTML = item.text;
			$(btn).val(item.value);
			$(btn).on('click', function(e) {
				customAlertButtonClick(el1, btn);
			});
			$(document).on('DOMNodeInserted', btn, function(e) {
				$(document).off('DOMNodeInserted');
				$(btn).focus();
			});
			$(el5).append(btn);
		});

		$(el2).append(el5);
		$(el1).append(el2);
		$(el6).addClass('dim');
		$(el1).append(el6);
		$a.convert(el1);
		return this.initDom = el1;
	};

	// alert open
	CustomAlert.prototype.open = function() {
		if ( $('#'+this.id).is(':visible') ) {return;} // 이미 생성된 동명의 alert 있을경우. return		
		_ui.GLOBAL_DOM_TARGET[_ui.target].append(this.initDom);
	}

	// alert close
	CustomAlert.prototype.close = function() {
		$('#'+this.id).remove();
	}

	return CustomAlert;
})();


(function($) {
	GridRenderer = {
		amountComma: function(value, round) {
			var el = document.createElement('input');
			$(el).addClass('Textinput');
			$(el).attr('data-keyfilter-rule', 'digits');
			$(el).attr('data-keyfilter', '-,.￦');
			$(el).css('text-align', 'right');
			$(el).val('￦ '+AlopexGrid.renderUtil.addCommas(value.round(round)));
			$a.convert(el);
			return el;
		},
		percentComma: function(value) {
			var el = document.createElement('input');
			$(el).addClass('Textinput');
			$(el).attr('data-keyfilter-rule', 'digits');
			$(el).attr('data-keyfilter', '-,.％');
			$(el).css('text-align', 'right');
			$(el).val(AlopexGrid.renderUtil.addCommas(value)+' ％');
			$a.convert(el);
			return el;
		},
		code: function(code, value) {
			var txt = '';
			$.each(code, function(index, item) {
				if(item.dtlCd === value) {
					txt = item.dtlCdNm;
					return false;
				}
			});
			return txt;
		},
		numberDataRender: function(value) {
			if($sv.isEmpty(value)) {
				value = '0';
			}

			value = new BigNumber(value).toString();
			return AlopexGrid.renderUtil.addCommas(value.round(9));
		},
		rateDataRender: function(value) {
			if($sv.isEmpty(value)) {
				value = '0';
			}

			value = new BigNumber(value).toString();
			return AlopexGrid.renderUtil.addCommas(value.round(2));
		},
		selectMonthRender: function(value) {
			if($sv.isEmpty(value)) {
				return '';
			}
			return Number(value) + '월';
		},
	},
	GridEditor = {
		numberDataInput: function(value, editable) {
			var input = document.createElement('input');
			$(input).addClass('Textinput');
			$(input).addClass('full');
			$(input).attr('data-keyfilter-rule', 'digits');
			$(input).attr('data-keyfilter', '-.');
			$(input).attr('data-type', 'textinput');
			$(input).attr('data-input-type', 'number');
			$(input).css('text-align', 'right');

			if(editable !== undefined && !editable) {
				$(input).addClass('af-disabled');
				$(input).addClass('Disabled');
				$(input).attr('disabled', 'disabled');
				$(input).attr('data-disabled', 'true');
			}

			if($sv.isEmpty(value)) {
				value = '0';
			}

			value = new BigNumber(value).toString();

			$(input).val(AlopexGrid.renderUtil.addCommas(value.replace(/,/g, '')));
			$a.convert(input);
			return input;
		},
		positiveNumberDataInput: function(value, editable) {
			var input = document.createElement('input');
			$(input).addClass('Textinput');
			$(input).addClass('full');
			$(input).attr('data-keyfilter-rule', 'digits');
			$(input).attr('data-keyfilter', '.');
			$(input).attr('data-type', 'textinput');
			$(input).attr('data-input-type', 'positiveNumber');
			$(input).css('text-align', 'right');

			if(editable !== undefined && !editable) {
				$(input).addClass('af-disabled');
				$(input).addClass('Disabled');
				$(input).attr('disabled', 'disabled');
				$(input).attr('data-disabled', 'true');
			}

			if($sv.isEmpty(value)) {
				value = '0';
			}

			value = new BigNumber(value).toString();

			$(input).val(AlopexGrid.renderUtil.addCommas(value.replace(/,/g, '')));
			$a.convert(input);
			return input;
		},
		positiveIntegerDataInput: function(value, editable) {
			//양의 정수
			var input = document.createElement('input');
			$(input).addClass('Textinput');
			$(input).addClass('full');
			$(input).attr('data-keyfilter-rule', 'digits');
			$(input).attr('data-type', 'textinput');
			$(input).css('text-align', 'right');
			$(input).attr('data-input-type', 'positiveInteger');

			if(editable !== undefined && !editable) {
				$(input).addClass('af-disabled');
				$(input).addClass('Disabled');
				$(input).attr('disabled', 'disabled');
				$(input).attr('data-disabled', 'true');
			}

			if($sv.isEmpty(value)) {
				value = '0';
			}

			value = new BigNumber(value).toString();
			$(input).val(AlopexGrid.renderUtil.addCommas(value.replace(/,/g, '')));
			$a.convert(input);
			return input;
		},
		rateDataInput: function(value, editable) {
			var input = document.createElement('input');
			$(input).addClass('Textinput');
			$(input).addClass('full');
			$(input).attr('data-keyfilter-rule', 'digits');
			$(input).attr('data-keyfilter', '.');
			$(input).attr('data-type', 'textinput');
			$(input).attr('data-input-type', 'rate');
			$(input).css('text-align', 'right');

			if(editable !== undefined && !editable) {
				$(input).addClass('af-disabled');
				$(input).addClass('Disabled');
				$(input).attr('disabled', 'disabled');
				$(input).attr('data-disabled', 'true');
			}

			if($sv.isEmpty(value)) {
				value = '0';
			}

			value = new BigNumber(value).toString();
			$(input).val(AlopexGrid.renderUtil.addCommas(value.replace(/,/g, '')));
			$a.convert(input);
			return input;
		},
		rateMax100DataInput: function(value, editable) {
			var input = document.createElement('input');
			$(input).addClass('Textinput');
			$(input).addClass('full');
			$(input).attr('data-keyfilter-rule', 'digits');
			$(input).attr('data-keyfilter', '.');
			$(input).attr('data-type', 'textinput');
			$(input).attr('data-input-type', 'rateMax100');
			$(input).css('text-align', 'right');

			if(editable !== undefined && !editable) {
				$(input).addClass('af-disabled');
				$(input).addClass('Disabled');
				$(input).attr('disabled', 'disabled');
				$(input).attr('data-disabled', 'true');
			}

			if($sv.isEmpty(value)) {
				value = '0';
			}

			value = new BigNumber(value).toString();
			$(input).val(AlopexGrid.renderUtil.addCommas(value.replace(/,/g, '')));
			$a.convert(input);
			return input;
		},
		numberInput: function(value, data, mapping, editable) {
			var comp = { type: 'alopexui-textinput', attr: {'style': 'text-align: right;'} };
			comp.attr['data-keyfilter-rule'] = 'digits';
			comp.attr['data-keyfilter'] = '-.';
			return comp;
		},
		treeColumnTextinput: function(value, data, mapping, editable) {
			var comp = { type: 'alopexui-textinput', attr: { 'style': 'min-width: auto;' } };
			if(editable) {
				$.each(data._invalid, function(index, item) {
					if(item.key === mapping.key) {
						comp.attr = { 'class': 'Textinput mandatory treeColumn', 'style': 'min-width: auto;' };
						return false;
					}
				});
			} else {
				comp.attr = {'class': 'Textinput af-disabled Disabled treeColumn',
							 'data-disabled': 'true',
							 'disabled': 'disabled',
							 'style': 'min-width: auto;'
							};
			}
			return comp;
		},
		inputDataTextInput: function(value, data, key, editable) {
			var comp = { type: 'alopexui-textinput', attr: {} };
			if(editable) {
				$.each(data._invalid, function(index, item) {
					if(item.key === key) {
						comp.attr = { 'class': 'Textinput mandatory' };
						return false;
					}
				});
			} else {
				comp.attr = {'class': 'Textinput af-disabled Disabled',
							 'data-disabled': 'true',
							 'disabled': 'disabled'
							};
			}
			return comp;
		},
		textInput: function(value, data, mapping, editable) {
			var comp = { type: 'alopexui-textinput', attr: {} };
			if(editable) {
				$.each(data._invalid, function(index, item) {
					if(item.key === mapping.key) {
						comp.attr = { 'class': 'Textinput mandatory' };
						return false;
					}
				});
			} else {
				comp.attr = {'class': 'Textinput af-disabled Disabled',
							 'data-disabled': 'true',
							 'disabled': 'disabled'
							};
			}
			return comp;
		},
		select: function(value, data, mapping, rule, editable) {
			var comp = { type: 'alopexui-select', rule: rule, attr: {} };
			if(editable) {
				$.each(data._invalid, function(index, item) {
					if(item.key === mapping.key) {
						comp.attr = {'class': 'Select mandatory',
									 'data-type': 'select',
									 'data-classinit': 'true',
									 'data-disabled': 'false',
									 'data-converted': 'true'
									};
						return false;
					}
				});
			} else {
				comp.attr = {'class': 'Select af-disabled Disabled',
							 'data-type': 'select',
							 'data-classinit': 'true',
							 'data-disabled': 'true',
							 'disabled': 'disabled',
							 'data-converted': 'true'
							};
			}
			return comp;
		},
		selectMonth: function(value, data, mapping, editable) {
			var monthRules = [
				{value: '12', label: '12월'},
				{value: '11', label: '11월'},
				{value: '10', label: '10월'},
				{value: '09', label: '9월'},
				{value: '08', label: '8월'},
				{value: '07', label: '7월'},
				{value: '06', label: '6월'},
				{value: '05', label: '5월'},
				{value: '04', label: '4월'},
				{value: '03', label: '3월'},
				{value: '02', label: '2월'},
				{value: '01', label: '1월'}
			];

			var comp = { type: 'alopexui-select', rule: monthRules, attr: {}, valueKey: 'value', textKey: 'label' };
			if(!editable) {
				return null;
			}
			return comp;
		}
	},

	/* 메뉴(즐겨찾기) 관련 */
	MenuHelper = {
		gnbInit: function(ctxPath, reqURI, param) {
			if(reqURI.indexOf(".") >= 0) {
				reqURI = reqURI.substring(0, reqURI.indexOf("."));
			}

			var authorityMenus = $sv.getSsnUserInfo('authorityMenu');
			if($sv.isEmpty(authorityMenus)) {
				$sv.setSsnUserInfo();
				authorityMenus = $sv.getSsnUserInfo('authorityMenu');
			}
			var curMnuId = null;
			if($sv.isNotEmpty(param) && $sv.isNotEmpty(param.actMenuId)) {
				curMnuId = param.actMenuId;
			}

			var rootList = [];
			var menuRep = {};
			var favItem = null;
			var $favMenuEl = '';
			var $gnb = $('.gnb-area');

			$.each(authorityMenus, function(idx, item) {
				item = $.extend({}, item);
				var $menuEl = null;

				if(item.mnuDiv === 'M') { // Root menu
					$menuEl = $('<li class="menu open"/>');
					$menuEl.append('<a class="root" href="javascript:void(0);">'+ item.mnuNm +'</a>');

					rootList.push($menuEl);
					item.menuDepth = 1;

				} else { // Sub menu
					var uprItem = menuRep[item.uprMnuId];
					if(uprItem == null) {
						console.warn('Not Found UpperMenu :', item.uprMnuId);
						return true; //continue;
					}

					$menuEl = $('<li/>');

					if($sv.isEmpty(item.mnuUri) || item.mnuUri === '/') {
						$menuEl.append('<a href="javascript:void(0);">'+ item.mnuNm +'</a>');
					} else {
						var isCurrent = false,
							currentClass;

						if(curMnuId != null) {
							isCurrent = curMnuId == item.mnuId;
						} else {
							isCurrent = favItem == null && MenuHelper.matchMenuURI(ctxPath, reqURI, item.mnuUri);
						}

						if(isCurrent) {
							favItem = item;
							currentClass = 'current';
						}

						$menuEl.append('<a href="'+ ctxPath + item.mnuUri +'" data-mid="'+ item.mnuId +'" class="goMenu '+currentClass+'">'+ item.mnuNm +'</a>');
					}

					var $ul = uprItem.$ref.children('ul:last');
					if($ul.length === 0) {
						uprItem.$ref.append($('<ul class="depth'+ (uprItem.menuDepth + 1) +'"/>'));
						$ul = uprItem.$ref.children('ul');
					}

					$ul.append($menuEl); // menu DOM append
					item.menuDepth = uprItem.menuDepth + 1;
				}
				item.$ref = $menuEl;
				menuRep[item.mnuId] = item;

				if (item.favoriteYn === 'Y') { // 즐겨찾기 메뉴
					$favMenuEl += '<li><a href="'+ ctxPath + item.mnuUri +'" data-mid="'+ item.mnuId +'" class="goMenu">'+ item.mnuNm +'</a></li>';
				}
			});
			$gnb.find('.navigation').append(rootList); // 메뉴 목록 추가

			if ( $favMenuEl.length > 0 ) {
				$gnb.removeClass('emptyFav');
				$('.gnb__favorite').show().find('.fav-list').append($favMenuEl); // 즐겨찾기 목록 추가
			}
			$gnb.find('.goMenu').on('click', function(e) {
				e.preventDefault();
				$a.navigate(this.href, {actMenuId: $(this).data('mid')});
			});

			if(favItem != null) {
				MenuHelper.setMenuPath(favItem.mnuPath);
				MenuHelper.makeBookmark(favItem)
			} else {
				var $pageTitle = $('.page__title');
				if($sv.isNotEmpty($pageTitle.data('navi'))) {
					MenuHelper.setMenuPath($pageTitle.data('navi'));
				}
			}
			MenuHelper.bindButtonAction(ctxPath);
			MenuHelper.quickMenuOn(ctxPath, reqURI);
		},

		setMenuPath: function(pMnuPath) {
			$('#breadcrumb').text(pMnuPath).show();
		},

		matchMenuURI: function(ctxPath, reqURI, mnuUri) {
			if($sv.isEmpty(mnuUri) || mnuUri == '/') {
				return false;
			}
			if(mnuUri.indexOf(".") >= 0) {
				mnuUri = mnuUri.substring(0, mnuUri.indexOf("."));
			}
			return reqURI == (ctxPath + mnuUri);
		},

		makeBookmark: function(oMenu) {
			var $pageTitle = $('.page__title');
			$pageTitle.html('<button class="btn__page-fav'+ (oMenu.favoriteYn == 'Y'? ' add':'') +'">즐겨찾기 등록</button>' + oMenu.mnuNm);
			$('button', $pageTitle).on('click', function(e) {
				var isOnAdd = $('.btn__page-fav', $pageTitle).hasClass('add');
				var actUrl = isOnAdd ? 'delMyBookmark':'addMyBookmark';
				$a.request('biz/mypage/'+ actUrl, {
					method: 'post',
					data: {mnuId: oMenu.mnuId},
					progress: true,
					alertFailMessage: true,
					success: function(res) {
						if(isOnAdd) {
							$('.btn__page-fav', $pageTitle).removeClass('add');
							$sv.autoDestroyAlert('즐겨찾기 목록에서 삭제되었습니다.');
							MenuHelper.storeFavorite(oMenu.mnuId, false);
						} else {
							$('.btn__page-fav', $pageTitle).addClass('add');
							$sv.autoDestroyAlert('즐겨찾기 목록에 추가되었습니다.');
							MenuHelper.storeFavorite(oMenu.mnuId, true);
						}
					}
				});
			})
		},
		/* 즐겨찾기 정보 sessionStorage 저장 */
		storeFavorite: function(findMnuId, isFavorite) {
			console.log('findMnuId:', findMnuId);
			var ssnUserInfo = $sv.getSsnUserInfo();
			var authorityMenus = ssnUserInfo['authorityMenu'];
			$.each(authorityMenus, function(idx, item) {
				if(findMnuId == item.mnuId) {
					item.favoriteYn = isFavorite ? 'Y':'N';
					$sv.setSsn($sv.KEY_USER_INFO, JSON.stringify(ssnUserInfo));
					return false;
				}
			});
		},

		bindButtonAction: function(ctxPath) {
			var $util = $('.util-area');
			$('button.sitemap', $util).on('click', function(e) {
				$a.navigate(ctxPath + '/siteMap.html');
			});
			$('button.privacy', $util).on('click', function(e) {
				$a.navigate(ctxPath + '/cert/privacy.html');
			});
			$('button.logout', $util).on('click', function(e) {
				$a.navigate(ctxPath + '/ssoLogout');
			});
		},
		/* QuickMenu */
		quickMenuOn: function(ctxPath, reqURI) {
			if(ctxPath + '/' == reqURI || MenuHelper.matchMenuURI(ctxPath, reqURI, '/index')) {
				$('a', '#quickMenuMain').addClass('on');
			} else if(MenuHelper.matchMenuURI(ctxPath, reqURI, '/report/reportGrpSVOverallList')) {
				$('a', '#linkReportGroup').addClass('on');
			} else if(MenuHelper.matchMenuURI(ctxPath, reqURI, '/report/reportSubSvOverallList')) {
				$('a', '#linkReportRel').addClass('on');
			} else if(MenuHelper.matchMenuURI(ctxPath, reqURI, '/mypage/myFavorite')) {
				$('a', '#quickMenuFavorite').addClass('on');
			}
		}
	}

})(jQuery);

/* prototype */
String.prototype.formatDate = function(f) {
	if(isNaN(this) || $sv.isEmpty(this.valueOf())) {
		return '';
	}
	var d;
	if(this.length === 8) {
		d = new Date(this.substr(0,4), this.substr(4,2)-1, this.substr(6,2));
	} else if(this.length === 6) {
		d = new Date(this.substr(0,4), this.substr(4,2)-1, 1);
	}
	return d.format(f);
};

String.prototype.utcToFormatDate = function(f) {
	var val = this.split('.')[0];
	val += 'Z';

	var dt = new Date(val);
	if(isNaN(Date.parse(dt))) {
		return this;
	}
	return dt.format(f);
};

Date.prototype.format = function(f) {
	if(!this.valueOf()) return '';
	var d = this;
	return f.replace(/(yyyy|yy|MM|M|dd|d|hh|mm|ss)/gi, function($1) {
		switch($1) {
			case 'yyyy': return d.getFullYear();
			case 'yy': return (d.getFullYear() % 1000).zf(2);
			case 'MM': return (d.getMonth()+1).zf(2);
			case 'M': return d.getMonth();
			case 'dd': return d.getDate().zf(2);
			case 'd': return d.getDate();
			case 'hh': return d.getHours().zf(2);
			case 'mm': return d.getMinutes().zf(2);
			case 'ss': return d.getSeconds().zf(2);
			default: return $1;
		}
	});
};

String.prototype.lpad = function(c,l) {
	var len = l - this.length;
	var s = '', i = 0;
	while(i++ < len) { s += c; };
	return s + this;
};

String.prototype.round = function(digits) {
	if($sv.isEmpty(digits)) {
		digits =0;
	}

	if(isNaN(this) || $sv.isEmpty(this.valueOf())) {
		return this;
	}

	var val = Number(this);
	if(digits >= 0) {
		return parseFloat(val.toFixed(digits)).toString();
	}

	digits = Math.pow(10, disits);
	var t = Math.round(val * disits);
	return parseFloat(val.toFixed(0)).toString();
};

String.prototype.zf = function(len) {return this.lpad('0',len);};
Number.prototype.zf = function(len) {return this.toString().zf(len);};
String.prototype.camelToSnake = function() {return this.replace(/([A-Z])/g, function($1) {return "_"+$1.toLowerCase();});};

String.prototype.isNotEmpty = function() {if("" === this || "undefined" === this || "null" === this) { return false; } return true;};
String.prototype.isEmpty = function() {return !this.isNotEmpty();};

String.prototype.isAfter = function(dt) {
	if(isNaN(this) || $sv.isEmpty(this.valueOf())) {
		return false;
	}
	var d;
	var compateDt;
	if(this.length === 8) {
		d = new Date(this.substr(0,4), this.substr(4,2)-1, this.substr(6,2));
		compateDt = new Date(dt.substr(0,4), dt.substr(4,2)-1, dt.substr(6,2));
	} else if(this.length === 6) {
		d = new Date(this.substr(0,4), this.substr(4,2)-1, 1);
		compateDt = new Date(dt.substr(0,4), dt.substr(4,2)-1, 1);
	}
	return (compateDt > d);
}

String.prototype.isNowAndAfter = function(dt) {
	if(isNaN(this) || $sv.isEmpty(this.valueOf())) {
		return false;
	}
	var d;
	var compateDt;
	if(this.length === 8) {
		d = new Date(this.substr(0,4), this.substr(4,2)-1, this.substr(6,2));
		compateDt = new Date(dt.substr(0,4), dt.substr(4,2)-1, dt.substr(6,2));
	} else if(this.length === 6) {
		d = new Date(this.substr(0,4), this.substr(4,2)-1, 1);
		compateDt = new Date(dt.substr(0,4), dt.substr(4,2)-1, 1);
	}
	return (compateDt >= d);
}

Number.prototype.formatComma = function() {
	if(this === 0) return 0;
	var reg = /(^[+-]?\d+)(\d{3})/;
	var n = (this + '');
	while (reg.test(n)) n=n.replace(reg, '$1'+','+'$2')
	return n;
};

$.fn.selectedOption = function() {
	var el = $(this)[0];
	if(el.alopextype.indexOf('dropdownbutton') > -1) {
		var bindArr = el.dataset.bind.replace(/\s/g, '').split(',');
		var bindKey = '';
		$.each(bindArr, function(index, item) {
			if(item.split(':')[0] === 'value') {
				bindKey = item.split(':')[1];
				return false;
			}
		});
		var sVal = this.getData()[bindKey];
		var selectedOption = {};
		$.each(this.getDataSource(), function(index, item) {
			if(item.hasOwnProperty('origin')) {

				if(sVal === null) {
					sVal = 'null';
				}

				if(item.id === el.id+'__'+sVal) {
					selectedOption = $.extend({}, item.origin);
					return false;
				}
			}
		});
		return selectedOption;
	}
};

$.fn.initFileLoader = function(_atcFlOwnrDiv, _atcFlOwnrDtlDiv, _atcFlGrpId, _readOnly, _callbackFunc, _deleteCallbackFunc) {
	var _id = $(this).attr('id');
	var _option = {
		atcFlOwnrDiv: _atcFlOwnrDiv,
		atcFlOwnrDtlDiv: _atcFlOwnrDtlDiv,
		atcFlGrpId: _atcFlGrpId,
		readOnly: _readOnly,
		success: _callbackFunc,
		deleteSuccess: _deleteCallbackFunc
	}
	View.fileLoader[_id] = new FileComponent(_id, _option);
	$a.convert('#'+_id);
};

$.fn.setFileLoaderTitle = function(title) {
	var _id = $(this).attr('id');
	View.fileLoader[_id].setTitle(title);
};

$.fn.uploadFile = function() {
	var _id = $(this).attr('id');
	View.fileLoader[_id].upload();
};

$.fn.downloadFile = function(fileInfo) {
	var _id = $(this).attr('id');
	View.fileLoader[_id].downloadFile(fileInfo);
};

$.fn.getFileInfo = function() {
	var _id = $(this).attr('id');
	var flist = View.fileLoader[_id].getFileList();
	var grpId = View.fileLoader[_id].getGrpId();
	var nCnt = 0;
	$.each(flist, function(ind, item) {
		if(item.uploaded === true) {
			nCnt++;
		}
	});

	var info = {};
	info.files = flist;
	info.groupId = grpId;
	info.uploadedCount = nCnt;
	return info;
};

$.fn.setFileGroupId = function(groupId) {
	var _id = $(this).attr('id');
	View.fileLoader[_id].changeGrpId(groupId);
};

$.fn.readOnlyFile = function(readOnly) {
	var _id = $(this).attr('id');
	View.fileLoader[_id].changeReadOnly(readOnly);
};