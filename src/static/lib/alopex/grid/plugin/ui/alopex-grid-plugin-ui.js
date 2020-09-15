/**
 * Alopex Grid Ui Plugin v1.0.3
 * http://grid.alopex.io
 *
 * Copyright (c) 2018 SK Holdings C&C. All rights reserved.
 * 
 * This software is the confidential and proprietary information of SK Holdings C&C.
 * You shall not disclose such confidential information and shall use it only in
 * accordance with the terms of the license agreement you entered into with SK Holdings C&C.
 *
 * Date : 2019-08-23 17:54:07 GMT+0900 (대한민국 표준시)
 **/
(function (window){
	var pluginVersion = "1.0.3";
	var gridConstructor = null;
	if(window.AlopexGrid && window.AlopexGrid.release) {
		gridConstructor = window.AlopexGrid;
	} else if(window[window.__AlopexGridExportName__] && window[window.__AlopexGridExportName__].release) {
		gridConstructor = window[window.__AlopexGridExportName__];
	}

	function createUIDropdown(dropdownRule, flag, attr) {
		var ulTag = document.createElement('ul');

		if(flag == false) {
			ulTag.className = 'Dropdown';
			AlopexGrid.renderUtil.attributeToElement({ 'data-dynamic-dropdown' : 'true' }, ulTag);
			AlopexGrid.renderUtil.attributeToElement(attr, ulTag);
		}

		dropdownRule.forEach(function(item, index) {
			var liTag = document.createElement('li');
			var aTag = document.createElement('a');

			var addTag;

			if(item.tag) {
				addTag = document.createElement(item.tag);
				liTag.appendChild(addTag);
			}

			// dropdown 링크 연결
			if(item.link) {
				aTag.setAttribute("href", item.link);

				if(item.target) {
					aTag.setAttribute("target", item.target);
				}
			}

			if(item.class) liTag.className = item.class;

			if(item.text) {
				aTag.appendChild(document.createTextNode(item.text));
				liTag.appendChild(aTag);
			}

			ulTag.appendChild(liTag);

			if(item.next) {
				var nextUlTag = createUIDropdown(item.next, true);
				liTag.appendChild(nextUlTag);
			}

		});
		return ulTag;
	}

	function rulesKeyEditing(value, data, render, mapping, grid) {
		var ruleObj = {};
		var rules = AlopexGrid.renderUtil.renderRuleToArray(value, data, render, mapping, grid);
		var mergedOption;
		if(rules != null && rules.key) {
			mergedOption = $.extend({}, {valueKey: render.valueKey, textKey: render.textKey}, {valueKey: rules.valueKey, textKey: rules.textKey});
				rules = data[rules.key];
				
		} else {
			mergedOption = { valueKey: render.valueKey, textKey: render.textKey };
		}

		ruleObj.rules = rules;
		ruleObj.mergedOption = mergedOption;
		return ruleObj;
	}

	function rulesOptionEditing(rule, textKey, valueKey) {
		
		var ruleTextStr = rule.text != null ? rule.text.toString() : null;
		var ruleValueStr = rule.text != null ? rule.value.toString() : null; 
		
		var optionText = ruleTextStr ? ruleTextStr :  ( typeof rule != 'object' ? rule : undefined );
		var optionValue = ruleValueStr ? ruleValueStr : ( typeof rule != 'object' ? rule : undefined );

		if(textKey) {
			optionText = rule[textKey];
		}

		if(valueKey) {
			optionValue = rule[valueKey];
		}

		if(!optionText && optionValue) optionText = optionValue;

		return [ optionText, optionValue ];

	}

	function removeExpChar(data) {
		var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
		if(typeof data === 'string') {
			return data.replace(regExp, '');
		} else {
			var fixStrArr = [];
			data.forEach(function(item, index) {
				fixStrArr.push(item.replace(regExp, ''));
			});
			return fixStrArr;
		}
	}

	AlopexGrid.setup({
		renderMapping : {
			"alopexui-autocomplete" : {
				renderer : function(value, data, render, mapping, grid) {
					var uiDiv = document.createElement('div');
					uiDiv.className = 'Autocomplete';

					// Autocomplete data-dynamic-dropdown Default로 설정함
					AlopexGrid.renderUtil.attributeToElement({ 'data-dynamic-dropdown' : 'true' }, uiDiv);

					// rule key, valueKey, textKey 적용
					var rules = AlopexGrid.renderUtil.renderRuleToArray(value, data, render, mapping, grid);
					var autoAttrs = ['data-source', 'data-url', 'data-datatype', 'data-enter-selectfirst',
					'data-filter', 'data-fitwidth', 'data-fixed-width', 'data-max-count',
					'data-maxheight', 'data-maxresult', 'data-method', 'data-minlength', 'data-noresultstr',
					'data-open-button', 'data-paramname', 'data-position', 'data-reset-button', 'data-select-text'];
					var autoAttrObj = {};
					// 해당 버튼에 넘어온 attribute들를 지정함
					if(render.attr) {

						// rule 하위에 key 값 존재할 경우
						if(rules != null) {
							var autoData, textKey, valueKey;
							if(rules.key) {
								autoData = data[rules.key];
								textKey = rules.textKey;
								valueKey = rules.valueKey;
							} else {
								autoData = render.rule;
								textKey = render.textKey;
								valueKey = render.valueKey;
							}

							if(textKey == null && valueKey) {
								textKey = valueKey;
							}

							// rule 하위에 valueKey, textKey 값이 있을 경우
							if(textKey && valueKey) {
								var keyData = [];
								for(var prop in autoData) {
									var attrObj = {};
									var text = autoData[prop][textKey];
									var value = autoData[prop][valueKey];
									if(text !== null || value !== null) {
										// autocomplete는 data-source 에 text가 고정
										attrObj["text"] = text;
										attrObj["value"] = value;
									}
									keyData.push(attrObj);
								}
								if(render.attr['data-source'] !== null) {
									autoAttrs.forEach(function(item, index) {
										autoAttrObj['data-source'] = JSON.stringify(keyData);
									});
								} else {
									autoAttrs.forEach(function(item, index) {
										if(render.attr[item]) {
											autoAttrObj[item] = JSON.stringify(autoData);
										}
									});
								}
							// rule 하위에 valueKey, textKey 값이 없을 경우
							} else {
								if(render.attr['data-source'] !== null) {
									autoAttrs.forEach(function(item, index) {
										autoAttrObj['data-source'] = JSON.stringify(autoData);
									});
								} else {
									autoAttrs.forEach(function(item, index) {
										if(render.attr[item]) {
											autoAttrObj[item] = JSON.stringify(autoData);
										}
									});
								}
							}
							AlopexGrid.renderUtil.attributeToElement(autoAttrObj, uiDiv);
						// 기본 data-source 일 경우
						} else {
							AlopexGrid.renderUtil.attributeToElement(render.attr, uiDiv);
						}
					}
					uiDiv.setAttribute('name', mapping.key);
					uiDiv.id = mapping.key + data._index.data;
					return uiDiv;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $autoDiv = $(cell).find('.Autocomplete');
					$autoDiv.convert();
					$(cell).find('.Autocomplete-textinput').val(value);
				},
				editedValue : function(cell, data, render, mapping, grid) {
					 var editedValue = $('#'+mapping.key + data._index.data).getText();

					 return editedValue ? editedValue : data[mapping.key];
				}
			},
			"alopexui-button" : {
				renderer : function(value, data, render, mapping, grid) {
					// dropdown 처리시 tag 병합
					var fragment = document.createDocumentFragment();

					var uiButton = document.createElement('button');
					uiButton.className = 'Button';

					// name 버튼일경우 key값과 index.data로 설정
					uiButton.name = mapping.key;
					uiButton.id = mapping.key + data._index.data;

					//해당 버튼에 버튼명이 넘어오면 버튼명을 지정하고 아니면 셀의 value 값으로 지정함
					if(render.title) {
						uiButton.appendChild(document.createTextNode(render.title));
					} else {
						uiButton.appendChild(document.createTextNode(value));
					}

					//해당 버튼에 class가 지정되어 있을경우 해당 클래스를 추가함
					if(render.styleclass) {
						var cl = render["styleclass"];
						if(typeof cl === "function") {
							cl = cl.call(grid, value, data, render, mapping, grid) || false;
						}
						if(typeof cl === "string") {
							uiButton.classList.add(cl);
						}
					}

					// 편집 모드가 아닐때는 편집이 안되게끔 처리
					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({ 'data-disabled' : 'true' }, uiButton);
					}

					// 해당 버튼에 attribute 설정
					if(render.attr) {
						AlopexGrid.renderUtil.attributeToElement(render.attr, uiButton);
					}

					fragment.appendChild(uiButton);

					if(render.dropdown != null) {
						var ulTag = createUIDropdown(render.dropdown.rule, false);

						// ul tag에 attribute 설정
						if(render.dropdown.attr) {
								AlopexGrid.renderUtil.attributeToElement(render.dropdown.attr, ulTag);
						}
						fragment.appendChild(ulTag);
					}
					return fragment;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $button = $(cell).find('.Button');
					$button.convert();

					// button toggle Default 구현
					if(render.attr != null && render.attr['data-on'] && render.attr['data-off']) {
						if(render.attr['data-on'] == value) {
								$button.setChecked(true);
						}
					}
					// dropdown 임시 추가
					var $dropdown = $(cell).find('.Dropdown');
					$dropdown.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var editedValue;
					if(render.attr && render.attr['data-on'] && render.attr['data-off']) {
						editedValue = $(cell).find('.Button').html();
					} else {
						editedValue = data[mapping.key];
					}
					return editedValue;
				}
			},
			"alopexui-carousel" : {
				renderer : function(value, data, render, mapping, grid) {
					// Carousel div tag 생성
					var divLvl1 = document.createElement('div');
					divLvl1.className = 'Carousel';

					// Scroller div tag 생성
					var divLvl2 = document.createElement('div');
					divLvl2.className = 'Scroller';

					// Carousel일경우 value 값은 배열로 가져온다.
					value.forEach(function(item, index) {
						// page div tag 생성
						var divLvl3 = document.createElement('div');
						divLvl3.className = 'Page';

						// 그리드에 출력될 img tag
						var img = document.createElement('img');
						img.src = item;

						divLvl3.appendChild(img);
						divLvl2.appendChild(divLvl3);
					});

					divLvl1.appendChild(divLvl2);

					if(render.arrow) {
						var aPrev = document.createElement('a');
						aPrev.className = 'Prev';
						divLvl1.appendChild(aPrev);

						var aNext = document.createElement('a');
						aNext.className = 'Next';
						divLvl1.appendChild(aNext);

						if(render.paging) {
							var pageDiv = document.createElement('div');
							pageDiv.className = 'Paging';
							pageDiv.classList.add('Mobile');

							for(var i = 1; i <= value.length; i++) {
								var linkA = document.createElement('a');
								linkA.className = 'Link';
								pageDiv.appendChild(linkA);
							}
							divLvl1.appendChild(pageDiv);
						}
					}

					// 해당 버튼에 넘어온 attribute들를 지정함
					if(render.attr) {
						AlopexGrid.renderUtil.attributeToElement(render.attr, divLvl1);
					}

					return divLvl1;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					// Carousel Render 처리시 Convert 처리함
					setTimeout(function() {
						var $carousel = $(cell).find('.Carousel');
						$carousel.convert();
					});
				}
			},
			"alopexui-checkbox" : {
				// //Alopex UI 체크 박스 컴포넌트 기능 추가
				renderer : function(value, data, render, mapping, grid) {
					var fragment = document.createDocumentFragment();

					// 해당 체크박스에 적용될 rule정보를 객체로 가져옴
					var ruleObj = rulesKeyEditing(value, data, render, mapping, grid);

					if(ruleObj.rules) {
						ruleObj.rules.forEach(function(item, index) {
							var label = document.createElement('label');
							// ImageCheckbox class를 추가하는 경우 ui 이미지 체크박스로 출력됨.
							if(render.styleClass === 'ImageCheckbox') label.className = 'ImageCheckbox';
							var checkInput = document.createElement('input');

							AlopexGrid.renderUtil.attributeToElement({ 'type' : 'checkbox' }, checkInput);
							checkInput.className = 'Checkbox';

							var optionArr = rulesOptionEditing(item, ruleObj.mergedOption.textKey, ruleObj.mergedOption.valueKey);

							checkInput.value = optionArr[1];
							checkInput.name = mapping.key + data._index.data;

							//해당 셀의 value 값이 체크됨
							if(Array.isArray(value)) {
								value.forEach(function(val, i) {
									if(optionArr[1] === val.toString()) checkInput.checked = true;
								});
							} else {
								if(optionArr[1] === value.toString()) checkInput.checked = true;
							}

							// 편집 모드가 아닐때는 편집이 안되게끔 처리
							if(render.readonly) {
								AlopexGrid.renderUtil.attributeToElement({ 'data-disabled' : 'true' }, checkInput);
							}

							label.appendChild(checkInput);

							label.appendChild(document.createTextNode(optionArr[0]));

							fragment.appendChild(label);
						});
					}
					return fragment;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $checkbox = $(cell).find('.Checkbox');
					$checkbox.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var editedValue = $('[name=' + mapping.key + data._index.data + ']').getValues();

					if(editedValue.length < 2) {
						editedValue = editedValue.join();
					}
					return editedValue;
				}
			},
			"alopexui-combobox" : {
				renderer : function(value, data, render, mapping, grid) {
					var uiCombobox = document.createElement('select');
					uiCombobox.className = 'Combobox';

					AlopexGrid.renderUtil.attributeToElement(render.attr, uiCombobox);

					uiCombobox.name = mapping.key + data._index.data;
					uiCombobox.id = mapping.key + data._index.data;
					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({'data-disabled':'true'}, uiCombobox);
					}

					if(render.styleclass) {
						var cl = render["styleclass"];
						if(typeof cl === "function") {
							cl = cl.call(grid, value, data, render, mapping, grid) || false;
						}

						if(typeof cl === "string") {
							uiCombobox.classList.add(cl);
						}
					}
					// 해당 체크박스에 적용될 rule정보를 객체로 가져옴
					var ruleObj = rulesKeyEditing(value, data, render, mapping, grid);

					if(ruleObj.rules && ruleObj.rules.length) {
						for(var i=0,l=ruleObj.rules.length;i<l;i++){
							var rule = AlopexGrid.renderUtil.normalizeRuleObject(ruleObj.rules[i], grid);
							var option = document.createElement('option');
							var optionArr = rulesOptionEditing(rule, ruleObj.mergedOption.textKey, ruleObj.mergedOption.valueKey);

							option.value = optionArr[1];

							if(rule.hasOwnProperty('html')) {
								option.innerHTML = rule["html"];
							} else {
								var text = document.createTextNode(optionArr[0] || optionArr[1]);
								option.appendChild(text);
							}

							if(optionArr[1] === value) {
								option.selected = true;
							}
							uiCombobox.appendChild(option);
						}
					}
					return uiCombobox;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $comboBox;
					$comboBox = $(cell).find('.Combobox');
					$comboBox.convert();
					$(cell).find('.Combobox-textinput').val(value);
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var selectedValue = $(cell).find('.Combobox-wrapper').find('.Combobox-dropdown li.Selected');
					if(selectedValue) {
						var selectedValues = $(cell).find('.Combobox').getValue();
						return selectedValues;
					} else {
						return data[mapping.key];
					}
				}
			},
			"alopexui-dateinput" : {
				renderer : function(value, data, render, mapping, grid) {
					var uiDiv = document.createElement('div');
					uiDiv.className = "Dateinput";

					var uiInput = document.createElement('input');
					uiInput.id = mapping.key + data._index.data;

					AlopexGrid.renderUtil.attributeToElement(render.attr, uiDiv);

					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({'data-disabled':'true'}, uiDiv);
					}

					uiInput.value = value;
					uiDiv.appendChild(uiInput);

					if(render.calendar) {
						var uiCalendar = document.createElement('div');
						uiCalendar.className = 'Calendar';
						uiDiv.appendChild(uiCalendar);
					}

					return uiDiv;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $dateinput = $(cell).find('.Dateinput');
					$dateinput.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var editedDateValue = $(cell).find('.Dateinput').children('input').val();

					if(render.attr != null && render.attr['data-format']) {
						return editedDateValue;
					}

					editedDateValue = removeExpChar(editedDateValue);
					return editedDateValue;
				}
			},
			"alopexui-daterange" : {
				renderer : function(value, data, render, mapping, grid) {
					var uiDiv = document.createElement('div');
					uiDiv.className = "Daterange";
					uiDiv.setAttribute('name', mapping.key);
					uiDiv.id = mapping.key + data._index.data;
					AlopexGrid.renderUtil.attributeToElement(render.attr, uiDiv);

					var fromDiv = document.createElement('div');
					fromDiv.className = "Startdate";
					fromDiv.classList.add('Dateinput');
					if(render.mandatory) {
						fromDiv.classList.add('mandatory');
					}
					
					if(value === null) {
						if(typeof(mapping.defaultValue) === 'function') {
							value = mapping.defaultValue.apply().split(',');
						}
					} else {
						if(typeof(value) === 'string') {
							value = value.split(',');
						}
					}
					
					var rules = AlopexGrid.renderUtil.renderRuleToArray(value, data, render, mapping, grid);

					var fromDateValue;
					var toDateValue;
					var fromDateId;
					var toDateId;

					if(rules != null && rules.key != null) {
						fromDateValue = data[rules.key];
						toDateValue = value;
					} else {
						fromDateValue = value[0];
						toDateValue = value[1];
					}

					fromDateId = mapping.key + 'From' + data._index.data;
					toDateId = mapping.key + 'To' + data._index.data;

					var fromInput = document.createElement('input');
					fromInput.id = fromDateId;
					fromInput.value = fromDateValue;
					AlopexGrid.renderUtil.attributeToElement({ 'data-keyfilter-rule': 'digits', 'data-keyfilter': '.' }, fromInput);
					
					var toDiv = document.createElement('div');
					toDiv.className = "Enddate";
					toDiv.classList.add('Dateinput');
					if(render.mandatory) {
						toDiv.classList.add('mandatory');
					}
					
					var toInput = document.createElement('input');
					toInput.id = toDateId;
					toInput.value = toDateValue;
					AlopexGrid.renderUtil.attributeToElement({ 'data-keyfilter-rule': 'digits', 'data-keyfilter': '.' }, toInput);
					
					fromDiv.appendChild(fromInput);
					toDiv.appendChild(toInput);

					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({'data-enabled':'false'}, uiDiv);
					}

					uiDiv.appendChild(fromDiv);

					if(render.seperator != null) {
						uiDiv.appendChild(document.createTextNode(render.seperator));
					} else {
						uiDiv.appendChild(document.createTextNode(' ~ '));
					}

					uiDiv.appendChild(toDiv);

					return uiDiv;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $dateRange = $(cell).find('.Daterange');
					$dateRange.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var $dateRange = $(cell).find('.Daterange');
					var $dateRangeValue = $(cell).find('.Daterange').children('.Startdate')[0].value;

					var dateRangeArr = [];

					if(render.attr != null && render.attr['data-pickertype'] === 'weekly' && $dateRangeValue != null) {
						dateRangeArr = $dateRangeValue.split(' ~ ');
					} else {
						dateRangeArr[0] = $("#" + mapping.key + 'From' + data._index.data).val();
						dateRangeArr[1] = $("#" + mapping.key + 'To' + data._index.data).val();
					}
					
					if(render.rule != null && render.rule.key != null) {
						// removeExpChar
						data[render.rule.key] = removeExpChar(dateRangeArr[0]);
						return removeExpChar(dateRangeArr[1]);
					} else {
						if(typeof(data[mapping.key]) === 'string') {
							var arr = removeExpChar(dateRangeArr);
							return arr.join(',');
						}
						return removeExpChar(dateRangeArr);
					}
				}
			},
			"alopexui-dropdownbutton" : {
				renderer : function(value, data, render, mapping, grid) {

					var fragment = document.createDocumentFragment();

					var uiDropdownButton = document.createElement('button');
					uiDropdownButton.className = 'Dropdownbutton';

					uiDropdownButton.name = mapping.key + data._index.data;
					uiDropdownButton.id = mapping.key + data._index.data;

					//해당 버튼에 버튼명이 넘어오면 버튼명을 지정하고 아니면 셀의 value 값으로 지정함
					if(render.title) {
						uiDropdownButton.appendChild(document.createTextNode(render.title));
					} else {
						uiDropdownButton.appendChild(document.createTextNode(value));
					}

					//해당 버튼에 class가 지정되어 있을경우 해당 클래스를 추가함
					if(render.styleclass) {
						var cl = render["styleclass"];
						if(typeof cl === "function") {
							cl = cl.call(grid, value, data, render, mapping, grid) || false;
						}
						if(typeof cl === "string") {
							uiDropdownButton.classList.add(cl);
						}
					}

					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({'data-disabled':'true'}, uiDropdownButton);
					}

					fragment.appendChild(uiDropdownButton);

					if(render.rule != null) {
						var ulTag = createUIDropdown(render.rule, false);
						// 해당 버튼에 넘어온 attribute들를 지정함
						if(render.attr) {
							AlopexGrid.renderUtil.attributeToElement(render.attr, ulTag);
						}
						fragment.appendChild(ulTag);
					}

					return fragment;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					setTimeout(function() {
						var $dropdownbutton = $(cell).find('.Dropdownbutton');
						$dropdownbutton.convert();
					});
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var editedValue = $(cell).find('.Dropdownbutton').val();
					return editedValue ? editedValue : data[mapping.key];
				}
			},
			"alopexui-groupbutton" : {
				renderer : function(value, data, render, mapping, grid) {
					var uiGroupButton, uiButton, uiInput;

					uiGroupButton = document.createElement('div');
					uiGroupButton.className = 'Groupbutton';

					// 해당 체크박스에 적용될 rule정보를 객체로 가져옴
					var ruleObj = rulesKeyEditing(value, data, render, mapping, grid);

					// 셀 name 설정
					var name = mapping.key + data._index.data;

					// rule로 버튼 생성
					if(ruleObj.rules) {
						if(Array.isArray(ruleObj.rules)) {
								ruleObj.rules.forEach(function(val, idx) { createUiButton(val, idx, render.subType); });
						} else {
							 createUiButton(ruleObj.rules, '', render.subType);
						}
					}

					if(render.styleclass) {
						var cl = render["styleclass"];
						if(typeof cl === "function") {
							cl = cl.call(grid, value, data, render, mapping, grid) || false;
						}
						if(typeof cl === "string") {
							uiGroupButton.classList.add(cl);
						}
					}

					return uiGroupButton;

					// ui버튼 생성 및 처리
					function createUiButton(item, index, type) {
						if(type) {
							uiButton = document.createElement('label');
							uiButton.className = 'Button';
							uiInput = document.createElement('input');
							uiInput.className = toCamelCase(type);
							uiInput.name = name;

							var optionArr = rulesOptionEditing(item, ruleObj.mergedOption.textKey, ruleObj.mergedOption.valueKey);
							uiInput.setAttribute('value',optionArr[1]);

							//해당 셀의 value 값이 체크됨
							if(Array.isArray(value)) {
								value.forEach(function(val, i) {
									if(optionArr[1] === val) uiInput.checked = true;
								});
							} else {
								if(optionArr[1] === value) uiInput.checked = true;
							}

							uiButton.appendChild(uiInput);
							uiButton.appendChild(document.createTextNode(optionArr[0]));

						} else {
							uiButton = document.createElement('button');
							uiButton.className = "Button";
							uiButton.name = name;
							uiButton.id = name + '_' + index;
							uiButton.value = item.value ? item.value : item;
							uiButton.innerHTML = item.text ? item.text : item;
						}

						// disable 처리
						if(render.readonly) {
							AlopexGrid.renderUtil.attributeToElement({ 'data-disabled' : 'true' }, uiButton);
						}

						// 해당 버튼에 atttribute 추가 처리
						if(render.attr) {
							AlopexGrid.renderUtil.attributeToElement(render.attr, uiButton);
						}

						uiGroupButton.appendChild(uiButton);
					}

					function toCamelCase(str) {
							return str.toLowerCase().replace(/(?:(^.)|(\s+.))/g, function(match) {
									return match.charAt(match.length-1).toUpperCase();
							});
					}
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $groupButton = $(cell).find('.Groupbutton');
					$groupButton.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					if(render.subType != null && render.subType.toLowerCase() === 'radio') {
						 return $('[name=' + mapping.key + data._index.data + ']').getValue();
					}

					if(render.subType != null && render.subType.toLowerCase() === 'checkbox') {
						var checkedValues = [];

						$('[name=' + mapping.key + data._index.data + ']').each(function() {
							if($(this).prop('checked')) {
								checkedValues.push($(this).val());
							}
						});

						if(checkedValues.length == 1) {
							return checkedValues.join();
						}

						return checkedValues;
					}

					if(render.attr && render.attr['data-on'] && render.attr['data-off']) {
						var btnObj = $(cell).find('.Button');
						var btnArray = [];

						$.each(btnObj, function(index, item) {
							btnArray.push(item.innerHTML);
						});

						return btnArray;
					}

					return data[mapping.key];
				}
			},
			"alopexui-multiselect" : {
				renderer : function(value, data, render, mapping, grid) {
					// select Tag 생성
					var select = document.createElement('select');
					select.className = "Multiselect";
					select.setAttribute('multiple', '');

					// multiselect rule 값 설정
					var ruleObj = rulesKeyEditing(value, data, render, mapping, grid);

					// rule에 입력된 value값과 text값에 따라 option 설정
					ruleObj.rules.forEach(function(item, index) {
						var rule = AlopexGrid.renderUtil.normalizeRuleObject(item, grid);
						var option = document.createElement('option');
						var optionArr = rulesOptionEditing(item, ruleObj.mergedOption.textKey, ruleObj.mergedOption.valueKey);

						option.value = optionArr[1];
						//해당 셀의 value 값이 체크됨
						if(Array.isArray(value)) {
							value.forEach(function(val, i) {
								if(optionArr[1] === val.toString()) option.selected = 'selected';
							});
						} else {
							if(optionArr[1] === value.toString()) option.selected = 'selected';
						}

						option.appendChild(document.createTextNode(optionArr[0]));
						select.appendChild(option);
					});

					// 해당 select태그 attribute 추가 처리
					if(render.attr) {
						AlopexGrid.renderUtil.attributeToElement(render.attr, select);
					}

					return select;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $multiSelect = $(cell).find('.Multiselect');
					$multiSelect.convert();

					$multiSelect.setSelected(value);
				},
				editedValue : function(cell, data, render, mapping, grid) {
					//AGS-673 multiSelect null 처리 수정
					var selectedValues = $(cell).find('select').val() ? $(cell).find('select').val(): "";
					
					if(selectedValues != "" && selectedValues.length < 2) {
							return selectedValues.join();
					}
					
					return selectedValues;
				}
			},
			"alopexui-panel" : {
				renderer : function(value, data, render, mapping, grid) {
					// Panel div tag 생성
					var panel = document.createElement('div');
					panel.className = "Panel"

					AlopexGrid.renderUtil.attributeToElement(render.attr, panel);

					// Panel-header div tag 생성
					var content = document.createElement('div');
					content.className = 'Panel-content';
					content.innerHTML = value;

					// Panel head div tag 생성
					var headPosition = document.createElement('div');

					var rules = AlopexGrid.renderUtil.renderRuleToArray(value, data, render, mapping, grid);

					if(rules != null && rules.key) {
						rules = data[rules.key];
					} else if(rules != null && rules.title) {
						rules = rules.title;
					}

					if(render.position == 'footer') {
						headPosition.className = 'Panel-footer';
						headPosition.appendChild(document.createTextNode(rules));
						panel.appendChild(content);
						panel.appendChild(headPosition);
					} else {
						headPosition.className = 'Panel-header';
						headPosition.appendChild(document.createTextNode(rules));
						panel.appendChild(headPosition);
						panel.appendChild(content);
					}

					return panel;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
						var $panel = $(cell).find('.Panel');
						$panel.convert();
				}
			},
			"alopexui-radio" : {
				// //Alopex UI Radio 컴포넌트 기능 추가
				renderer : function(value, data, render, mapping, grid) {
					var fragment = document.createDocumentFragment();

					var ruleObj = rulesKeyEditing(value, data, render, mapping, grid);

					if(ruleObj.rules) {
						ruleObj.rules.forEach(function(item, index) {
							var label = document.createElement('label');

							// ImageRadio class를 추가하는 경우 ui 이미지 체크박스로 출력됨.
							if(render.styleClass === 'ImageRadio') label.className = 'ImageRadio';
							var input = document.createElement('input');

							AlopexGrid.renderUtil.attributeToElement({ 'type' : 'radio' }, input);
							input.className = 'Radio';

							var name = mapping.key + data._index.data;
							var optionArr = rulesOptionEditing(item, ruleObj.mergedOption.textKey, ruleObj.mergedOption.valueKey);

							input.name = mapping.key + data._index.data;
							input.value = optionArr[1];

							//해당 셀의 value 값이 체크됨
							if(optionArr[1] === value.toString()) input.checked = true;

							// 해당 버튼에 넘어온 attribute들를 지정함
							if(render.attr) {
								AlopexGrid.renderUtil.attributeToElement(render.attr, input);
							}

							// 편집 모드가 아닐때는 편집이 안되게끔 처리
							if(render.readonly) {
								AlopexGrid.renderUtil.attributeToElement({ 'data-disabled' : 'true' }, input);
							}

							label.appendChild(input);
							label.appendChild(document.createTextNode(optionArr[0]));
							fragment.appendChild(label);
						});
					}

					return fragment;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $radio = $(cell).find('.Radio');
					$radio.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var checkedValue = $('[name=' + mapping.key + data._index.data + ']').getValue();
					return checkedValue;
				}
			},
			"alopexui-select" : {
				renderer : function(value, data, render, mapping, grid) {

					var divSelect = document.createElement('div');
					var span = document.createElement('span');
					var uiSelect = document.createElement('select');

					// 해당 체크박스에 적용될 rule정보를 객체로 가져옴
					var ruleObj = rulesKeyEditing(value, data, render, mapping, grid);
					if(ruleObj.rules && ruleObj.rules.length) {
						for(var i = 0, l = ruleObj.rules.length; i < l; i++){
							var rule = AlopexGrid.renderUtil.normalizeRuleObject(ruleObj.rules[i], grid);
							
							var optionArr = rulesOptionEditing(rule, ruleObj.mergedOption.textKey, ruleObj.mergedOption.valueKey);
							
							var option = document.createElement('option');
							option.value = optionArr[1];

							if(rule.hasOwnProperty('html')) {
								option.innerHTML = rule["html"];
							} else {
								var text = document.createTextNode(optionArr[0] || optionArr[1]);
								option.appendChild(text);
							}
							
							if(optionArr[1] === value) {
								option.selected = true;
							}
							uiSelect.appendChild(option);
						}
					}

					if(render.attr && render.attr['divselect']) {
						divSelect.className = 'Divselect';
						AlopexGrid.renderUtil.attributeToElement(render.attr, divSelect);
						divSelect.id = mapping.key + data._index.data;
						if(render.readonly) {
							AlopexGrid.renderUtil.attributeToElement({'data-disabled':'true'}, divSelect);
						}
						if(render.styleclass) {
							var cl = render["styleclass"];
							if(typeof cl === "function") {
								cl = cl.call(grid, value, data, render, mapping, grid) || false;
							}
							if(typeof cl === "string") {
								divSelect.classList.add(cl);
							}
						}
						divSelect.appendChild(uiSelect);
						divSelect.appendChild(span);
						return divSelect;
					} else {
						uiSelect.className = 'Select';
						AlopexGrid.renderUtil.attributeToElement(render.attr, uiSelect);
						uiSelect.name = mapping.key + data._index.data;
						if(render.readonly) {
							AlopexGrid.renderUtil.attributeToElement({'data-disabled':'true'}, uiSelect);
						}
						if(render.styleclass) {
							var cl = render["styleclass"];
							if(typeof cl === "function") {
								cl = cl.call(grid, value, data, render, mapping, grid) || false;
							}
							if(typeof cl === "string") {
								uiSelect.classList.add(cl);
							}
						}
						return uiSelect;
					}
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $selectBox = $(cell).find('.Select');
					$selectBox.convert();
					var $divSelectBox = $(cell).find('.Divselect');
					$divSelectBox.convert();
					if(value === null || value === '') {
						$($selectBox).setSelected(0);
					}
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var selectedValue = $(cell).find('select option:selected')[0].value;
					if(selectedValue) {
						if(render.attr != null && render.attr['data-select-multiple'] === "true") {
							var selectedValueArr = $(cell).find('.Select').getValues();
							if(selectedValueArr.length < 2) {
								return selectedValue;
							} else {
								return $(cell).find('.Select').getValues();
							}
						} else {
							return selectedValue;
						}
					} else {
						return data[mapping.key];
					}
				}
			},
			"alopexui-spinner" : {
				renderer : function(value, data, render, mapping, grid) {
					var div = document.createElement('div');
					div.className = 'Spinner';

					var name = mapping.key + data._index.data;
					div.setAttribute('name', name);

					var aUp = document.createElement('a');
					aUp.className = "Up";

					var aDown = document.createElement('a');
					aDown.className = "Down";

					if(render.styleclass) {
						var cl = render["styleclass"];
						if(typeof cl === "function") {
							cl = cl.call(grid, value, data, render, mapping, grid) || false;
						}

						if(typeof cl === "string") {
							div.classList.add(cl);
						}

						// Spinner - Time
						if(cl === 'Time') {
							// Spinner-Time tag에 추가 되는 attribute 리스트
							var timeTagsAttrs = [ 'data-hour', 'data-seperator', 'data-minute', 'data-seperator', 'data-second', 'data-ampm' ];

							// 구분값을 받아서 적용시킨다. seperator 옵션 추가 default는 ':'
							if(render.seperator != null) attributesToTags(timeTagsAttrs, render.seperator);
							else attributesToTags(timeTagsAttrs, ':');

							// Spinner-Time div tag에 default로 추가되는 attribute 리스트
							var timeDefaultAttrs = { 'data-bind': 'spinner: time',  'data-value-type': 'string', 'data-time-format': 'HHmmss', 'data-pushincrease': 'true' };

							// Spiner - time 처리시 Default로 값 사용자가 바꿀수 있음
							AlopexGrid.renderUtil.attributeToElement(timeDefaultAttrs, div);
						}

						if(cl === 'Date') {
							// Spinner-Date div tag에 default로 추가되는 attribute 리스트
							var dateTagsAttrs = [ 'data-year', 'data-seperator', 'data-month', 'data-seperator', 'data-date' ];

							// 구분값을 받아서 적용시킨다. seperator 옵션 추가 default는 '-'
							if(render.seperator != null) attributesToTags(dateTagsAttrs, render.seperator);
							else attributesToTags(dateTagsAttrs, '-');

							// Spinner-Date div tag에 default로 추가되는 attribute 리스트
							var dateDefaultAttrs = { 'data-bind': 'spinner: date',  'data-value-type': 'string', 'data-pushincrease': 'true', 'data-automation': 'true', 'data-date-format':'yyyyMMdd' };

							// Spiner - time 처리시 Default로 값 사용자가 바꿀수 있음
							AlopexGrid.renderUtil.attributeToElement(dateDefaultAttrs, div);
						}
					}

					// 보통 Spinner 타입 적용 옵션
					if(render.styleclass != 'Time' && render.styleclass != 'Date') {
						input = document.createElement('input');
						input.value = value;
						div.appendChild(input);
					}

					// render 처리시 readonly 처리
					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({ 'data-disabled':'true' }, div);
					}

					// attribute 설정
					if(render.attr) {
						AlopexGrid.renderUtil.attributeToElement(render.attr, div);
					}

					// Spinner Tag에 계수기 추가
					div.appendChild(aUp);
					div.appendChild(aDown);

					return div;

					// Spinner-Time 또는 Spinner-Date의 Element를 추가하고 필요한 Attribute를 설정한다.
					function attributesToTags(attrs, seperator) {
						attrs.forEach(function(item, index) {
								var element;
								if(item === 'data-seperator') {
									element = document.createElement('span');
									element.appendChild(document.createTextNode(seperator));
								} else {
									element = document.createElement('input');
								}
								element.setAttribute(item, '');
								div.appendChild(element);
						});
					}
				},
				postRender : function (cell, value, data, render, mapping, grid) {

					var $spinner = $(cell).find('.Spinner');
					$spinner.convert();

					$spinner.on('dblclick', function(e) {
						if(e.target.tagName === 'A') {
							return false;
						}
					});

					// Spinner-Time과 Spinner-Date를 구분한다.
					var subType = render.styleclass;

					if(render.styleclass == 'Time' )
					{
						// Spinner-Time 그리드 값으로 시간 세팅처리
						$spinner.setData({ time: value.toString() });
					}

					if(render.styleclass == 'Date') {
						// Spinner-Date 그리드 값으로 날짜 세팅처리
						$spinner.setData({ date: value.toString() });
					}
				},
				editedValue : function(cell, data, render, mapping, grid) {
					// Spinner는 무조건 기본값을 반환함
					return $(cell).find('.Spinner').getValue();
				}
			},
			"alopexui-table" : {
				renderer : function(value, data, render, mapping, grid) {

					// Table Tag생성
					var table = document.createElement('table');
					table.className = "Table";
					table.setAttribute("name", mapping.key + data._index.data);
					// table.name = render.name + data._index.data;

					AlopexGrid.renderUtil.attributeToElement(render.attr, table);

					// Table colgroup 생성
					var colGroup = document.createElement('colgroup');

					// Table Head 생성 처리
					var thead = document.createElement('thead');
					var headRow = document.createElement('tr');

					thead.appendChild(headRow);

					// th 생성
					render.header.forEach(function(item, index) {
						// 칼럼수 만큼 Col 생성
						var col = document.createElement('col');
						colGroup.appendChild(col);

						var th = document.createElement('th');
						th.appendChild(document.createTextNode(item));

						if(render.sorting != null && render.sorting[item] != null) {
							AlopexGrid.renderUtil.attributeToElement({ 'data-sortable': render.sorting[item] }, th);
						}
						headRow.appendChild(th);
					});

					table.appendChild(thead);

					// Table body 부분 처리
					var tbody = document.createElement('tbody');

					value.forEach(function(row, rowIdx) {
						var bodyRow = document.createElement('tr');

						row.forEach(function(col, colIdx) {
							var column = document.createElement('td');
							column.appendChild(document.createTextNode(col));

							if(!render.readonly) {
								AlopexGrid.renderUtil.attributeToElement({'data-editable':'true'}, column);
							}
							bodyRow.appendChild(column);
						});
						tbody.appendChild(bodyRow);
					});

					table.appendChild(tbody);
					return table;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $table = $(cell).find('.Table');
					$table.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					var $tableRows = $(cell).find('.Table').children('tbody').children('tr');
					var rowsLength = $tableRows.length;

					for(var i = 0; i < rowsLength; i++) {
						var $tableCols = $tableRows.eq(i).children('td');
						var colsLength = $tableCols.length;

						for(var j = 0; j < colsLength; j++) {
							if($tableCols.eq(j).attr('class').indexOf('Editing') > 0) {
										data[mapping.key][i][j] = $tableCols.eq(j).children('input').val();
							}
						}
					}
					var editedValue = data[mapping.key];
					return editedValue;
				}
			},
			"alopexui-textinput" : {
				renderer : function(value, data, render, mapping, grid) {
					// dropdown 처리시 tag 병합
					var fragment = document.createDocumentFragment();

					var uiTextInput = document.createElement('input');
					uiTextInput.className = "Textinput";

					// 해당 버튼에 넘어온 attribute들를 지정함
					if(render.attr) {
						AlopexGrid.renderUtil.attributeToElement(render.attr, uiTextInput);
					}

					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({'data-disabled':'true'}, uiTextInput);
					}

					uiTextInput.id = mapping.key + data._index.data;

					if(render.styleclass) {
						var cl = render["styleclass"];
						if(typeof cl === "function") {
							cl = cl.call(grid, value, data, render, mapping, grid) || false;
						}

					}

					uiTextInput.value = value;

					fragment.appendChild(uiTextInput);

					if(render.dropdown != null) {
						var ulTag = createUIDropdown(render.dropdown.rule, false);

						if(render.dropdown.attr) {
							AlopexGrid.renderUtil.attributeToElement(render.dropdown.attr, ulTag);
						}
						fragment.appendChild(ulTag);
					}

					return fragment;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $textInput = $(cell).find('.Textinput');
					$textInput.convert();

					// dropdown 임시 추가
					var $dropdown = $(cell).find('.Dropdown');
					$dropdown.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					return $(cell).find('.Textinput').val();
				}
			},
			"alopexui-textarea" : {
				renderer : function(value, data, render, mapping, grid) {
					var uiTextArea = document.createElement('textarea');
					uiTextArea.className = "Textarea";

					AlopexGrid.renderUtil.attributeToElement(render.attr, uiTextArea);

					uiTextArea.id = mapping.key + data._index.data;

					if(render.readonly) {
						AlopexGrid.renderUtil.attributeToElement({'data-disabled':'true'}, uiTextArea);
					}

					if(render.styleclass) {
						var cl = render["styleclass"];
						if(typeof cl === "function") {
							cl = cl.call(grid, value, data, render, mapping, grid) || false;
						}

						if(typeof cl === "string") {
							uiTextArea.classList.add(cl);
						}
					}

					uiTextArea.value = value;
					return uiTextArea;
				},
				postRender : function (cell, value, data, render, mapping, grid) {
					var $textArea = $(cell).find('.Textarea');
					$textArea.convert();
				},
				editedValue : function(cell, data, render, mapping, grid) {
					return $(cell).find('.Textarea').val();
				}
			}
		}
	});

})(window);
