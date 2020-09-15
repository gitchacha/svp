$a.data.control('value', {
	render: function(element, key, value, data, rule) {
		var valueType = ['textinput', 'textarea'];
		if(element.hasOwnProperty('alopextype')) {
			if (valueType.indexOf(element.alopextype[0]) > -1) {
				$(element).val(value);
			} else if(element.alopextype.indexOf('dropdownbutton') > -1) {
				var dsArr = $(element).getDataSource();
				
				if($sv.isEmpty(value)) {
					if(element.dataset.defaultOption === 'select') {
						value = "SELECT__";
					}
					if(element.dataset.defaultOption === 'all') {
						value = "ALL__";
					}
				}
				
				if(typeof(dsArr) !== "object") {
					element.dataset.value = element.id+ '__' +value;
					return;
				}
				
				$.each(dsArr, function(idx, ds) {
					if(ds.id === element.id + '__' + value) {
						$(element).select({id: ds.id});
						matched = true;
						return false;
					}
				});
			} else {
				$(element).text(value);
			}
		} else {
			if(element.parentElement.hasOwnProperty('alopextype')) {
				if(element.parentElement.alopextype[0] === 'dateinput') {
					$(element).val(__CONTROL.setDateInputData(element, value, element.parentElement.format));
				}
			} else {
				$(element).text(value);
			}
		}
	},
	data: function(element) {
		var valueType = ['textinput', 'textarea'];
		var data;
		if(element.hasOwnProperty('alopextype')) {
			if (valueType.indexOf(element.alopextype[0]) > -1) {
				data = $(element).val();
			} else if(element.alopextype.indexOf('dropdownbutton') > -1) {
				var val = element.dataset.value;
				if($sv.isEmpty(val)) {
					data = '';
				} else {
					if(val === element.id+'__SELECT__' || val === element.id+'__ALL__') {
						data = '';
					} else {
						data = element.dataset.value.replace(element.id+'__', '');
					}
				}
			} else {
				data = $(element).text();
			}
		} else {
			if(element.parentElement.hasOwnProperty('alopextype')) {
				if(element.parentElement.alopextype[0] === 'dateinput') {
					data = __CONTROL.getDateInputData(element);
				}
			} else {
				data = $(element).text();
			}
		}
		return data;
	}
});

$a.data.control('checked', {
	render: function(element, key, value, data, rule) {
		if(element.hasOwnProperty('alopextype')) {
			if (element.alopextype.indexOf('radio') > -1) {
				element.checked = false;
				$(element.parentElement).removeClass('Checked');
				if(element.value === String(value)) {
					element.checked = (element.value === String(value));
					$(element.parentElement).addClass('Checked');
				}
			} else if (element.alopextype.indexOf('checkbox') > -1) {
				$.each(value, function(idx, val) {
					if(element.value === val) {
						element.checked = true;
						$(element).attr('checked', 'checked');
						$(element.parentElement).addClass('Checked');
						return false;
					}
				});
			}
		}
	},
	data: function(element) {
		var data;
		if(element.hasOwnProperty('alopextype')) {
			if (element.alopextype.indexOf('radio') > -1) {
				if(element.checked) {
					var type = 'string';
					var value = $(element).val();
					if(element.hasOwnProperty('valuetype')) {
						type = element.valuetype.toLowerCase();
					}
					data = __CONTROL.getValueWithType(type, value);
				}
			} else if (element.alopextype.indexOf('checkbox') > -1) {
				data = [];
				var type = 'string';
				if(element.hasOwnProperty('valuetype')) {
					type = element.valuetype.toLowerCase();
				}
				$('input.Checkbox[name='+element.name+']:checked').each(function(idx, el) {
					var value = $(el).val();
					data.push(__CONTROL.getValueWithType(type, value));
				});
			}
		}
		return data;
	}
});

$a.data.control('formatDate', {
	render: function(element, key, value, data, rule) {
		
		var val = value.split('.')[0];
		val += 'Z';
		
		var dt = new Date(val);
		if(isNaN(Date.parse(dt))) {
			return $(element).text('');
		} else {
			var f = element.dataset.dateFormat;
			
			if($sv.isEmpty(f)) {
				return $(element).text('');
			} else {
				$(element).text(dt.format(f));
			}
		}
	},
	data: function(element) {
		return $(element).text();
	}
});

$a.data.control('code', {
	render: function(element, key, options, data, rule) {
		var dataSource = [];
		var bindOption = element.dataset.bindOption.replace(/\s/g, '').split(':');
		var defaultOption = element.dataset.defaultOption;
		
		if($sv.isNotEmpty(defaultOption)) {
			var defaultOptionObj = __CONTROL.getUseCodeDefault(element.id, defaultOption);
			if($sv.isNotEmpty(defaultOptionObj)) {
				dataSource.push($.extend({}, defaultOptionObj));
			}
		}
		
		$.each(options, function(idx, option) {
			var kId = bindOption[0];
			var kLabel = bindOption[1];
			var source = { id: element.id+'__'+option[kId], text: option[kLabel], origin: option };
			dataSource.push($.extend({}, source));
		});
		$(element).setDataSource(dataSource);
		
		if($sv.isEmpty(dataSource)) {
			element.dataset.previousValue = null;
			element.dataset.value = null;
			$(element).text(null);
		}
		
		if(element.dropdown.callback.length < 2) {
			$(element).addHandler(function(e) {
				element.dataset.previousValue = element.dataset.value;
				element.dataset.value = e.currentTarget.id;
				$(e.target).trigger('mouseleave');
			});
		}
		
		if($sv.isNotEmpty(element.dataset.value)) {
			$(element).select({id: element.dataset.value});
		} else {
			$(element).select(0);
		}
	},
	data: function(element) {
		return null;
	}
});

(function($) {
	__CONTROL = {
		setDateInputData: function(element, value, format) {
			return value.formatDate(format);
		},
		getDateInputData: function(element) {
			var val = $(element).val();
			return $(element).val().replace(/([^0-9])/g, '');
		},
		getValueWithType: function(type, value) {
			return {
				'number': Number(value),
				'boolean': Boolean(value),
				'string': value,
				default: value
			}[type];
		},
		getUseCodeDefault: function(eId, defaultOption) {
			return {
				'select': { id: eId+'__SELECT__', text: '선택' },
				'all': { id: eId+'__ALL__', text: '전체' },
				'none': null,
				default: null
			}[defaultOption];
		}
	}
})(jQuery);
