/**
 * sv 업무 공통 js
 */
var ViewBiz = $a.page(function() {
	var progressTot = 0;
	var progressShow = false;
	var callbackFunction = null;

	this.showProgress = function(totCnt, callback) {
		if (totCnt) {
			progressTot = totCnt;
		}

		this.progress = $('body').progress({
			createProgress: this.createBizProgress,
			removeProgress: this.removeBizProgress
		});

		// 콜백 추가
		if ( callback && typeof(callback) === "function") {
			callbackFunction = callback;
		}

		progressShow = true;
	};

	this.callback = function(callbackFunction){
		try {
			callbackFunction();
		} catch(e) {
			throw new Error('Progress - Callback 호출 Error.');
		}
	};

	this.hideProgress = function(callback) {
		if (this.progress) {
			this.progress.remove();
			progressShow = false;

			if ( callback ) { // callback 호출
				this.callback(callbackFunction);
			}
		}

	};
	this.createBizProgress = function() {
		// progress wrapper
		this.progress = document.createElement('div');
		this.progress.className = 'progress__count';

		// progress count
		this.progressMsg = document.createElement('div');
		this.progressMsg.className = 'article';
		this.progressMsg.innerHTML = '<b class="per"><i></i></b><span class="count"><i class="due">0</i><i class="seperator">/</i><i class="max">'+ progressTot +'</i></span>';

		$(this.progress).html(this.progressMsg); // count html append
		$('body').append(this.progress);

		var _this = this;

		this.ptimer = setInterval(function() {
			$a.request('biz/outcome/oc/rlcpSvMsmt/getMsmtWorkCnt', {
				method: 'post',
				success: function(res) {
					if (res && res.data && res.data != 0) {
						var $prg = $(_this.progressMsg);
						var $prgDue = $prg.find('.due').text(res.data);
						$prgDue.text(res.data); // 진행 건수
						$prg.find('.per i').css('width', Math.ceil((res.data / progressTot)*100) + '%' ); // 진행 Bar

						// 진행 건수 100%  + progress Show 상태면 강제 hideProgress
						if ( res.data >= progressTot && progressShow ) {
							ViewBiz.hideProgress(true); // true = callback 호출
						}
					}
				},
			});
		}, 900);
	};

	this.removeBizProgress = function() {
		// var that = this;
		if(this.ptimer) {
			clearInterval(this.ptimer);
			this.ptimer = null;
		}
		$(this.progress).remove();
		this.progress = null;
		progressShow = false;
	};
});