/* ===================================================
 *  jquery-sortable.js v0.9.13
 *  http://johnny.github.com/jquery-sortable/
 * ===================================================
 *  Copyright (c) 2012 Jonas von Andrian
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ========================================================== */

function formulaInit(option){
    !function ( $, window, pluginName, undefined){
        var containerDefaults = {
            // If true, items can be dragged from this container
            drag: true,
            // If true, items can be droped onto this container
            drop: true,
            // Exclude items from being draggable, if the
            // selector matches the item
            exclude: "",
            // If true, search for nested containers within an item.If you nest containers,
            // either the original selector with which you call the plugin must only match the top containers,
            // or you need to specify a group (see the bootstrap nav example)
            nested: true,
            // If true, the items are assumed to be arranged vertically
            vertical: true
        }, // end container defaults

        groupDefaults = {
            // This is executed after the placeholder has been moved.
            // $closestItemOrContainer contains the closest item, the placeholder
            // has been put at or the closest empty Container, the placeholder has
            // been appended to.
            afterMove: function ($placeholder, container, $closestItemOrContainer) {
            },
            // The exact css path between the container and its items, e.g. "> tbody"
            containerPath: "",
            // The css selector of the containers
            containerSelector: "ol, ul",
            // Distance the mouse has to travel to start dragging
            distance: 0,
            // Time in milliseconds after mousedown until dragging should start.
            // This option can be used to prevent unwanted drags when clicking on an element.
            delay: 0,
            // The css selector of the drag handle
            handle: "",
            // The exact css path between the item and its subcontainers.
            // It should only match the immediate items of a container.
            // No item of a subcontainer should be matched. E.g. for ol>div>li the itemPath is "> div"
            itemPath: "",
            // The css selector of the items
            itemSelector: "li",
            // The class given to "body" while an item is being dragged
            bodyClass: "dragging",
            // The class giving to an item while being dragged
            draggedClass: "dragged",
            // Check if the dragged item may be inside the container.
            // Use with care, since the search for a valid container entails a depth first search
            // and may be quite expensive.
            isValidTarget: function ($item, container) {
                return true
            },
            // Executed before onDrop if placeholder is detached.
            // This happens if pullPlaceholder is set to false and the drop occurs outside a container.
            onCancel: function ($item, container, _super, event) {
            },
            // Executed at the beginning of a mouse move event.
            // The Placeholder has not been moved yet.
            onDrag: function ($item, position, _super, event) {

                $item.css(position);
            },
            // Called after the drag has been started,
            // that is the mouse button is being held down and
            // the mouse is moving.
            // The container is the closest initialized container.
            // Therefore it might not be the container, that actually contains the item.
            onDragStart: function ($item, container, _super, event) {
                $item.css({ height: $item.outerHeight(), width: $item.outerWidth() });
                $item.addClass(container.group.options.draggedClass);
                $("body").addClass(container.group.options.bodyClass);
            },
            // Called when the mouse button is being released
            onDrop: function ($item, container, _super, event) {
                $item.removeClass(container.group.options.draggedClass).removeAttr("style");
                $("body").removeClass(container.group.options.bodyClass);

            },
            // Called on mousedown. If falsy value is returned, the dragging will not start.
            // Ignore if element clicked is input, select or textarea
            onMousedown: function ($item, _super, event) {
                if (!event.target.nodeName.match(/^(input|select|textarea)$/i)) {
                    event.preventDefault();
                    return true;
                }
            },

            // The class of the placeholder (must match placeholder option markup)
            placeholderClass: "placeholder",

            // Template for the placeholder. Can be any valid jQuery input
            // e.g. a string, a DOM element.
            // The placeholder must have the class "placeholder"
            placeholder: '<li class="placeholder"></li>',

            // If true, the position of the placeholder is calculated on every mousemove.
            // If false, it is only calculated when the mouse is above a container.
            pullPlaceholder: true,

            // Specifies serialization of the container group.
            // The pair $parent/$children is either container/items or item/subcontainers.
            serialize: function ($parent, $children, parentIsContainer) {
                var result = $.extend({}, $parent.data());

                if(parentIsContainer) {
                    return [$children];
                } else if ($children[0]){
                    result.children = $children;
                }

                delete result.subContainers;
                delete result.sortable;

                return result;
            },

            // Set tolerance while dragging. Positive values decrease sensitivity,
            // negative values increase it.
            tolerance: 0
        }, // end group defaults

        containerGroups = {},
        groupCounter = 0,
        emptyBox = {
            left: 0,
            top: 0,
            bottom: 0,
            right:0
        },
        eventNames = {
            start: "touchstart.sortable mousedown.sortable",
            drop: "touchend.sortable touchcancel.sortable mouseup.sortable",
            drag: "touchmove.sortable mousemove.sortable",
            scroll: "scroll.sortable"
        },
        subContainerKey = "subContainers";

        /*
        * a is Array [left, right, top, bottom]
        * b is array [left, top]
        */
        function d(a,b) {
            var x = Math.max(0, a[0] - b[0], b[0] - a[1]),
                y = Math.max(0, a[2] - b[1], b[1] - a[3]);

            return x+y;
        }

        function setDimensions(array, dimensions, tolerance, useOffset) {
            var i = array.length,
                offsetMethod = useOffset ? "offset" : "position"
                tolerance = tolerance || 0;

            while(i--){
                var el = array[i].el ? array[i].el : $(array[i]),
                    // use fitting method
                    pos = el[offsetMethod]();

                    pos.left += parseInt(el.css('margin-left'), 10);
                    pos.top += parseInt(el.css('margin-top'),10);

                dimensions[i] = [
                    pos.left - tolerance,
                    pos.left + el.outerWidth() + tolerance,
                    pos.top - tolerance,
                    pos.top + el.outerHeight() + tolerance
                ]
            }
        }

        function getRelativePosition(pointer, element) {
            var offset = element.offset();
            return {
                left: pointer.left - offset.left,
                top: pointer.top - offset.top
            }
        }

        function sortByDistanceDesc(dimensions, pointer, lastPointer) {
            pointer = [pointer.left, pointer.top];
            lastPointer = lastPointer && [lastPointer.left, lastPointer.top];

            var dim,
                i = dimensions.length,
                distances = [];

            while(i--){
                dim = dimensions[i]
                distances[i] = [i,d(dim,pointer), lastPointer && d(dim, lastPointer)]
            }

            distances = distances.sort(function  (a,b) {
                return b[1] - a[1] || b[2] - a[2] || b[0] - a[0]
            });

            // last entry is the closest
            return distances;
        }

        function ContainerGroup(options) {
            this.options = $.extend({}, groupDefaults, options);
            this.containers = [];

            if(!this.options.rootGroup){
                this.scrollProxy = $.proxy(this.scroll, this)
                this.dragProxy = $.proxy(this.drag, this)
                this.dropProxy = $.proxy(this.drop, this)
                this.placeholder = $(this.options.placeholder)

                if(!options.isValidTarget) { this.options.isValidTarget = undefined; }
            }
        }

        ContainerGroup.get = function  (options) {
            if(!containerGroups[options.group]) {
                if(options.group === undefined) {
                    options.group = groupCounter ++;
                }

                containerGroups[options.group] = new ContainerGroup(options);
            }

            return containerGroups[options.group];
        }

        ContainerGroup.prototype = {
            dragInit: function  (e, itemContainer) {
                this.$document = $(itemContainer.el[0].ownerDocument);

                // get item to drag
                var closestItem = $(e.target).closest(this.options.itemSelector);

                // using the length of this item, prevents the plugin from being started if there is no handle being clicked on.
                // this may also be helpful in instantiating multidrag.
                if (closestItem.length) {
                    this.item = closestItem;
                    this.itemContainer = itemContainer;

                    if (this.item.is(this.options.exclude) || !this.options.onMousedown(this.item, groupDefaults.onMousedown, e)) {
                        return;
                    }

                    this.setPointer(e);
                    this.toggleListeners('on');
                    this.setupDelayTimer();
                    this.dragInitDone = true;
                }
            },
            drag: function  (e) {

                if(!this.dragging){
                    if(!this.distanceMet(e) || !this.delayMet) {
                        return;
                    }

                    this.options.onDragStart(this.item, this.itemContainer, groupDefaults.onDragStart, e)
                    this.item.before(this.placeholder)
                    this.dragging = true
                }

                this.setPointer(e);

                // place item under the cursor
                this.options.onDrag(this.item,
                                    getRelativePosition(this.pointer, this.item.offsetParent()),
                                    groupDefaults.onDrag,
                                    e);

                var p = this.getPointer(e),
                    box = this.sameResultBox,
                    t = this.options.tolerance;

                if(!box || box.top - t > p.top || box.bottom + t < p.top || box.left - t > p.left || box.right + t < p.left) {
                    if(!this.searchValidTarget()){
                        this.placeholder.detach();
                        this.lastAppendedItem = undefined;
                    }
                }
            },
            drop: function  (e) {
                this.toggleListeners('off');
                this.dragInitDone = false;

                if(this.dragging) {
                    // processing Drop, check if placeholder is detached
                    if(this.placeholder.closest("html")[0]) {
                        this.placeholder.before(this.item).detach();
                    } else {
                        this.options.onCancel(this.item, this.itemContainer, groupDefaults.onCancel, e);
                    }
                    this.options.onDrop(this.item, this.getContainer(this.item), groupDefaults.onDrop, e);

                    // cleanup
                    this.clearDimensions();
                    this.clearOffsetParent();
                    this.lastAppendedItem = this.sameResultBox = undefined;
                    this.dragging = false;
                }
            },
            searchValidTarget: function  (pointer, lastPointer) {

                if(!pointer){
                    pointer = this.relativePointer || this.pointer
                    lastPointer = this.lastRelativePointer || this.lastPointer
                }

                var distances = sortByDistanceDesc(this.getContainerDimensions(), pointer, lastPointer), i = distances.length;

                while(i--){
                    var index = distances[i][0],
                        distance = distances[i][1]

                    if(!distance || this.options.pullPlaceholder){
                        var container = this.containers[index];
                        if(!container.disabled){
                            if(!this.$getOffsetParent()){
                                var offsetParent = container.getItemOffsetParent();
                                pointer = getRelativePosition(pointer, offsetParent);
                                lastPointer = getRelativePosition(lastPointer, offsetParent);
                            }

                            if(container.searchValidTarget(pointer, lastPointer)) {
                                return true;
                            }
                        }
                    }
                }

                if(this.sameResultBox) { this.sameResultBox = undefined }
            },

            movePlaceholder: function  (container, item, method, sameResultBox) {
                var lastAppendedItem = this.lastAppendedItem;

                if(!sameResultBox && lastAppendedItem && lastAppendedItem[0] === item[0]) {
                    return;
                }

                item[method](this.placeholder);
                this.lastAppendedItem = item;
                this.sameResultBox = sameResultBox;
                this.options.afterMove(this.placeholder, container, item);
            },

            getContainerDimensions: function  () {
                if(!this.containerDimensions) {
                    setDimensions(this.containers, this.containerDimensions = [], this.options.tolerance, !this.$getOffsetParent());
                }
                return this.containerDimensions;
            },
            getContainer: function  (element) {
                return element.closest(this.options.containerSelector).data(pluginName);
            },
            $getOffsetParent: function () {
                if(this.offsetParent === undefined){
                    var i = this.containers.length - 1,
                        offsetParent = this.containers[i].getItemOffsetParent();

                    if(!this.options.rootGroup){
                        while(i--){
                            if(offsetParent[0] != this.containers[i].getItemOffsetParent()[0]){
                                // If every container has the same offset parent,
                                // use position() which is relative to this parent,
                                // otherwise use offset()
                                // compare #setDimensions
                                offsetParent = false;
                                break;
                            }
                        }
                    }
                    this.offsetParent = offsetParent;
                }

                return this.offsetParent;
            },
            setPointer: function (e) {
                var pointer = this.getPointer(e)

                if(this.$getOffsetParent()){
                    var relativePointer = getRelativePosition(pointer, this.$getOffsetParent());
                    this.lastRelativePointer = this.relativePointer;
                    this.relativePointer = relativePointer;
                }

                this.lastPointer = this.pointer;
                this.pointer = pointer;
            },
            distanceMet: function (e) {
                var currentPointer = this.getPointer(e);
                return (
                    Math.max(
                        Math.abs(this.pointer.left - currentPointer.left),
                        Math.abs(this.pointer.top - currentPointer.top)
                    ) >= this.options.distance
                );
            },
            getPointer: function(e) {
                var o = e.originalEvent || e.originalEvent.touches && e.originalEvent.touches[0];
                return {
                    left: e.pageX || o.pageX,
                    top: e.pageY || o.pageY
                }
            },
            setupDelayTimer: function () {
                var that = this;

                this.delayMet = !this.options.delay;

                // init delay timer if needed
                if (!this.delayMet) {
                    clearTimeout(this._mouseDelayTimer);
                    this._mouseDelayTimer = setTimeout(function() {
                        that.delayMet = true;
                    }, this.options.delay);
                }
            },
            scroll: function  (e) {
                this.clearDimensions();
                this.clearOffsetParent(); //필요?
            },

            toggleListeners: function (method) {
                var that = this,
                    events = ['drag','drop','scroll'];

                $.each(events,function  (i,event) {
                    that.$document[method](eventNames[event], that[event + 'Proxy'])
                });
            },
            clearOffsetParent: function () {
                this.offsetParent = undefined;
            },

            // Recursively clear container and item dimensions
            clearDimensions: function  () {
                this.traverse(function(object){
                    object._clearDimensions();
                });
            },
            traverse: function(callback) {
                callback(this);
                var i = this.containers.length;
                while(i--){
                    this.containers[i].traverse(callback)
                }
            },
            _clearDimensions: function(){
                this.containerDimensions = undefined;
            },
            _destroy: function () {
                containerGroups[this.options.group] = undefined;
            }
        }

        function Container(element, options) {
        this.el = element;
        this.options = $.extend( {}, containerDefaults, options);

        this.group = ContainerGroup.get(this.options);
        this.rootGroup = this.options.rootGroup || this.group;
        this.handle = this.rootGroup.options.handle || this.rotGroup.options.itemSelector;

        var itemPath = this.rootGroup.options.itemPath;
        this.target = itemPath ? this.el.find(itemPath) : this.el;

        this.target.on(eventNames.start, this.handle, $.proxy(this.dragInit, this));

        if(this.options.drop) { this.group.containers.push(this) }
        }

        Container.prototype = {
            dragInit: function  (e) {
                var rootGroup = this.rootGroup

                if( !this.disabled && !rootGroup.dragInitDone && this.options.drag && this.isValidDrag(e)) {
                    rootGroup.dragInit(e, this);
                }
            },

            isValidDrag: function(e) {
                return e.which == 1 || e.type == "touchstart" && e.originalEvent.touches.length == 1;
            },
            searchValidTarget: function  (pointer, lastPointer) {
                var distances = sortByDistanceDesc(this.getItemDimensions(), pointer, lastPointer),
                    i = distances.length,
                    rootGroup = this.rootGroup,
                    validTarget = !rootGroup.options.isValidTarget || rootGroup.options.isValidTarget(rootGroup.item, this);

                if(!i && validTarget) {
                    rootGroup.movePlaceholder(this, this.target, "append");
                    return true;
                } else {
                    while(i--){
                            var index = distances[i][0],
                            distance = distances[i][1]

                        if(!distance && this.hasChildGroup(index)){
                            var found = this.getContainerGroup(index).searchValidTarget(pointer, lastPointer)
                            if(found) { return true }

                        } else if(validTarget){
                            this.movePlaceholder(index, pointer);
                            return true;
                        }
                    }
                }
            },
            movePlaceholder: function  (index, pointer) {
                var item = $(this.items[index]),
                    dim = this.itemDimensions[index],
                    method = "after",
                    width = item.outerWidth(),
                    height = item.outerHeight(),
                    offset = item.offset(),
                    sameResultBox = {
                        left: offset.left,
                        right: offset.left + width,
                        top: offset.top,
                        bottom: offset.top + height
                    };

                if(this.options.vertical){
                    var yCenter = (dim[2] + dim[3]) / 2,
                        inUpperHalf = pointer.top <= yCenter;

                    if(inUpperHalf){
                        method = "before";
                        sameResultBox.bottom -= height / 2
                    } else {
                        sameResultBox.top += height / 2
                    }
                } else {
                    var xCenter = (dim[0] + dim[1]) / 2,
                        inLeftHalf = pointer.left <= xCenter;
                }

                if(inLeftHalf){
                    method = "before";
                    sameResultBox.right -= width / 2;
                } else {
                    sameResultBox.left += width / 2
                }

                if(this.hasChildGroup(index)) {
                    sameResultBox = emptyBox;
                }

                this.rootGroup.movePlaceholder(this, item, method, sameResultBox);
            },

            getItemDimensions: function  () {
                if(!this.itemDimensions){
                    this.items = this.$getChildren(this.el, "item").filter(
                        ":not(." + this.group.options.placeholderClass + ", ." + this.group.options.draggedClass + ")"
                    ).get();

                    setDimensions(this.items, this.itemDimensions = [], this.options.tolerance);
                }
                return this.itemDimensions;
            },
            getItemOffsetParent: function  () {
                var offsetParent, el = this.el;

                // Since el might be empty we have to check el itself and
                // can not do something like el.children().first().offsetParent()
                if(el.css("position") === "relative" || el.css("position") === "absolute"  || el.css("position") === "fixed") {
                    offsetParent = el
                } else {
                    offsetParent = el.offsetParent();
                }
                return offsetParent;
            },

            hasChildGroup: function (index) {
                return this.options.nested && this.getContainerGroup(index);
            },
            getContainerGroup: function  (index) {
                var childGroup = $.data(this.items[index], subContainerKey);

                if( childGroup === undefined){
                    var childContainers = this.$getChildren(this.items[index], "container")
                        childGroup = false;

                    if(childContainers[0]){
                        var options = $.extend({}, this.options, {
                        rootGroup: this.rootGroup,
                            group: groupCounter ++
                        });
                        childGroup = childContainers[pluginName](options).data(pluginName).group;
                    }
                    $.data(this.items[index], subContainerKey, childGroup);
                }
                return childGroup;
            },
            $getChildren: function (parent, type) {
                var options = this.rootGroup.options,
                    path = options[type + "Path"],
                    selector = options[type + "Selector"];

                parent = $(parent);
                if(path) { parent = parent.find(path)};

                return parent.children(selector)
            },

            _serialize: function (parent, isContainer) {
                var that = this,
                    childType = isContainer ? "item" : "container",

                children = this.$getChildren(parent, childType).not(this.options.exclude).map(function () {
                    return that._serialize($(this), !isContainer);
                }).get();

                return this.rootGroup.options.serialize(parent, children, isContainer);
            },

            traverse: function(callback) {
                $.each(this.items || [], function(item){
                    var group = $.data(this, subContainerKey)
                    if(group) {
                        group.traverse(callback);
                    }
                });

                callback(this);
            },
            _clearDimensions: function  () {
                this.itemDimensions = undefined
            },
            _destroy: function() {
                var that = this;

                this.target.off(eventNames.start, this.handle);
                this.el.removeData(pluginName);

                if(this.options.drop) {
                    this.group.containers = $.grep(this.group.containers, function(val){
                        return val != that;
                    });
                }

                $.each(this.items || [], function(){
                    $.removeData(this, subContainerKey);
                });
            }
        }

        var API = {
            enable: function() {
                this.traverse(function(object){
                    object.disabled = false;
                });
            },
            disable: function (){
                this.traverse(function(object){
                    object.disabled = true;
                });
            },
            serialize: function () {
                return this._serialize(this.el, true)
            },
            refresh: function() {
                this.traverse(function(object){
                    object._clearDimensions();
                });
            },
            destroy: function () {
                this.traverse(function(object){
                    object._destroy();
                });
            }
        }

        $.extend(Container.prototype, API);

        /**
         * jQuery API
         *
         * Parameters are
         *   either options on init
         *   or a method name followed by arguments to pass to the method
         */
        $.fn[pluginName] = function(methodOrOptions) {
            var args = Array.prototype.slice.call(arguments, 1);

            return this.map(function(){
                var $t = $(this),
                    object = $t.data(pluginName);

                if(object && API[methodOrOptions]) {
                    return API[methodOrOptions].apply(object, args) || this;
                } else if(!object && (methodOrOptions === undefined || typeof methodOrOptions === "object")) {
                    $t.data(pluginName, new Container($t, methodOrOptions));
                }

                return this;
            });
        };

    }(jQuery, window, 'sortable');

    $(window).data().formula = true;
    formulaLiveEventBind();
}


function formulaLiveEventBind(){
    $(document).on('click','.formula__result .operator',function(e){

        var $target = $(e.currentTarget);
            $this = $(this),
            $changeList = $this.next('.change');


        if ($changeList.length === 0 || $changeList.is(':visible')) {
            return;
        } else {
            $($target).parent('li').addClass('change_operator');

        }

    }).on('click',function(e){
        // 연산자 변경 목록 close
        if ( $('.change:visible').length > 0 && $(e.target).closest('.change_operator').length === 0 ) {
            $('.change:visible').parent('.change_operator').removeClass('change_operator');
        }
    }).on('click','.formula__result .change button',function(e){
        // 연산자 변경 목록 - 연산자 , 삭제 버튼
        var $this = $(this);
        if ($this.hasClass('delete')) { // 삭제
            var _formula = $this.closest('.result').data().formula;
            $this.closest('.change_operator').remove();
            _formula.domRemove();
            return;
        }

        var _operator = ['plus','minus','multiple','division'], // 연산자 종류
            _key = $this.data().key,  // 변경할 연산자 key
            _keyIdx = _operator.indexOf(_key),
            $changeList = $this.closest('.change');

        $changeList.empty(); // 연산자 목록 비움
        for (var i = 0,len = _operator.length; i < len; i++ ) { // 연산자 변경 목록 생성
            if ( i === _keyIdx ) {continue};
            $changeList.append('<button class="operator '+ _operator[i] +'"><i class="icon i-operator-'+ _operator[i] +'"></i></button>');
        }

        for (var j = 0, jLen = $changeList.children().length; j < jLen; j++ ) {
            var $item = $($changeList.children()[j]);
            $item.data('key',$item.attr('class').split(' ')[1])
        }

        $changeList.append('<button class="delete"><i class="icon i-delete"></i></button>'); // 삭제버튼

        $changeList.prev()
            .attr('class', 'operator '+_key).data('key',_key)
            .children('.icon').attr('class','icon i-operator-'+_key);

        // formula - data 변경
        $changeList.closest('li').data().formula.value = _key;


    }).on('click','.formula__result .Autocomplete-dropdown' ,function(e){

        if (e.offsetY < 32) {
            $a.close();
            if ( $(e.target).closest('li').find('.tit').text() === 'Input Data') {
                $a.navigate('/ui/indicator/oc/inputDataCodeMgmtEdit' , {type: 'add'}, '_blank');
                // console.log('Input Data 신규등록');
            } else {
                $a.navigate('/ui/indicator/oc/ocProxyMgmtEdit' , {type: 'popup',csstNm: View.param.csstNm,csstId: View.param.csstId}, '_blank');
                // console.log('Proxy 신규등록');
            }

        } else { // 삭제 Button
            console.log('Remove');
            var $target = $(e.target),
                $deleteComponent = $target.closest('.result > li'),
                _formula = $deleteComponent.parent().data().formula;


            $deleteComponent.remove();
            _formula.domRemove();
        }

    }).on('mousedown','.constWrap .delete',function(e){
        console.log('Remove delete');

        var $target = $(e.target),
            $deleteComponent = $target.closest('.result > li'),
            _formula = $deleteComponent.parent().data().formula;

            $deleteComponent.remove();
            _formula.domRemove();
    });
}


/* Formula - 측정식 Edit , View 생성자 */
var Formula = (function(){

	function Formula(option) {
        // 기본 property 초기화
        this.data = option.data;
        this.viewtype = option.viewtype === 'readonly'? false:true;
        this.append = option.append === undefined ? $('body'):$('#'+option.append);
        this.callback = option.callback;
        this.sequence = 0,
        this.dragStartTarget = '',
        this.selectId = '',
        this.operator = ['plus','minus','multiple','division'];
        
        
        this.E_utilBtns = this.append.find('.util_bar ul li');
        this.E_result = this.append.find('.formula__result .result');
        this.E_resultItem = this.append.find('.formula__result .result > li');
        this.E_totalSearch = this.append.find('.Autocomplete.totalSearch');
        
        this.optionDirTop = Math.ceil(this.E_result.outerHeight() / 1.3); // Autocomplete - option open 기준점
        

        if (!$(window).data().formula) formulaInit();
        this.utilInit(option);
    }


    /** utilInit
     * @desc 유틸바 영역 init
    */
    Formula.prototype.utilInit = function(option){
        this.E_utilBtns.attr('draggable',this.viewtype);

        if ( this.viewtype ) {
            this.utilDragEvent(); // 상단 유틸영역 Event bind (Edit 모드일때만 bind)
        }
        this.domCreate(option, this, 'onload');
        this.totalSearchSelected(); // Total search Event bind

        this.E_result.data().formula = this;
    };



    /** readonly
     * @desc View mode 설정 (readonly T/F)
    */
    Formula.prototype.readonly = function(){
        // 상단 유틸 Button, total search Disabled 처리
        this.E_utilBtns.attr('data-disabled',true);
        this.E_totalSearch.setEnabled(false);

        // 결과부 영역 Disabled 처리
        this.E_resultItem.attr('data-disabled',true);
        this.E_resultItem.each(function(idx,data){
            var $target =$(data),
                _data = $target.data().formula;

            switch(_data.type) {
                case "BIZD" :
                case "PROXY" :
                case "CONST" :
                    $target.find('.Textinput').setEnabled(false);
                    break;


                default :  // Operator
                    $target.find('button').prop('disabled',true);
                break;

            }
        })
    }

    /** domCreate
     * @desc 연산자 Item Dom 생성
    */
    Formula.prototype.domCreate = function(option, thisArg, eventType){

        var $fragment, $childElement, key;

        if (  option.data.length === 0 ) {
            // 생성할 Data 없는 경우
            this.E_result.parent('.formula__result').append('<p class="placeholder">성과측정식을 작성해 주세요</p>');
            return;
        }

        option.data.forEach(function(data,idx){
            $fragment = $('<li />');
            $childElement = [];

            switch(data.type) {
                case 'PROXY':
                    key = 'proxy';
                    if( data.label === undefined ) {
                        data.label = 'Proxy';
                    }
                    break;

                case 'BIZD':
                    key = 'inputdata';
                    if( data.label === undefined ) {
                        data.label = 'Input Data';
                    }
                    break;

                case 'CONST':
                    key = 'constant';
                    if( data.label === undefined ) {
                        data.label = 'Number'
                    }
                    break;

                default : key = 'operator'; break;
            }

            var _this = thisArg,
            _id = !data.id ? key + (thisArg.sequence) : key + data.id + (thisArg.sequence), // 중복되는 InputData 들어갈 수 있음. ID에 시퀀스 포함
            _value = !data.value.value ? "": data.value.value,
            _bracket = data.reverse === true ? true : false;
            // _bracket = data.reverse === true ? "close" : "" ;


	        thisArg.selectId = !data.id ? "" : data.id;
	        $fragment.data('formula', { type: data.type, value: data.value, id: _id, reverse: _bracket });


            switch (key) {
                case 'proxy':
                case 'inputdata':
                    var $title ='<b class="tit">'+ data.label +'</b><i class="handle"></i>',
                        $indicator = '<span class="indicator">'+ data.value.indicator +'</span>',
                        $autocomplete = $('<div class="Autocomplete formula-result type--select" id="'+ _id +'" />'), // autoComplete
                        $input = $('<input class="Textinput number" value="1" id="'+ _id +'-val" />').convert(); // value input

                    $autocomplete.attr({ 'data-bind' : 'source: data', }).convert();
                    $childElement.unshift($title,$indicator,$autocomplete,$input);
                    break;

                case 'constant': // Number (Constant)
                    var $title ='<b class="tit const">'+ data.label +'</b><i class="handle"></i>',
                        $input = $('<input class="Textinput number const" id="'+ _id +'" value="'+ data.value +'" />').convert(), // Number, ID, Proxy 공통
                        $indicator = '<span class="indicator">'+ data.value +'</span>';
                    
                    $childElement.push($title,$input,$indicator);
                    break;


                default: // 연산자
                var _bracket = '';                                        
                if ( data.reverse !== undefined ) {
                    _bracket = data.reverse === true ? 'data-bracket="close"': 'data-bracket="open"';
                }

                var $operator = $('<i class="handle"></i><button class="operator '+ data.value + '" id="'+ _id +'" '+ _bracket +'><i class="icon i-operator-'+ data.value +'"></i></button>'),
                        $changeList = $('<span class="change" />');

                    if ( data.value !== 'bracket' ) {
                        var _thisIdx = _this.operator.indexOf(data.value);
                        $($operator[1]).data('key',data.value); // 생성된 연산자 key 생성

                        for (var i = 0,len = _this.operator.length; i < len; i++ ) { // 연산자 변경 목록 생성
                            if ( i === _thisIdx ) {continue};
                            $changeList.append('<button class="operator '+ _this.operator[i] +'"><i class="icon i-operator-'+ _this.operator[i] +'"></i></button>');
                        }

                        for (var j = 0, jLen = $changeList.children().length; j < jLen; j++ ) {
                            var $item = $($changeList.children()[j]);
                            $item.data('key',$item.attr('class').split(' ')[1])
                        }

                    } else { // bracket
                        var _reverse = data.reverse === true ? true: false;
                        $fragment.data('formula', {
                            type: data.type,
                            value: data.value,
                            id: _id,
                            reverse: _reverse
                        });
                    }

                    $changeList.append('<button class="delete"><i class="icon i-delete"></i></button>'); //삭제 버튼
                    $childElement.push($operator,$changeList);
                    break;
            }

            $fragment.append($childElement);
            

            if ( key === 'constant' ) { // Constant 인 경우 wrap DIV 생성
                $fragment.find('.Textinput').wrapAll('<div class="constWrap" />');
                $fragment.find('.constWrap').append('<button class="delete"><i class="icon i-delete"></i></button>');
            }

            thisArg.E_result.append($fragment).addClass('hasChild');
            
            if ( key === 'proxy' || key === 'inputdata' ) { // option list - top으로 변경할지 여부
                var $lastLi = thisArg.E_result.children('li:eq(-1)');
                if ( $lastLi.offset().top > thisArg.optionDirTop) {                    
                    $lastLi.children('.Autocomplete').setOptions({ "position" : "top"}).addClass('option-top');
                }

            }
            thisArg.sequence++; // id로 지정할 후치증식
        });


        // callback event 수행
        switch (eventType) {
            case 'onload':
                this.E_resultItem = $('.formula__result .result > li'); // 갱신
                var option = [];

                this.E_resultItem.each(function(idx,data) {
                    option.push($(data).data().formula);
                });

                if ( this.callback.onLoad ) { this.callback.onLoad(option) };
                break;


            case 'onselect':
            case 'ondrop':
                // ondrop event - ondrop : 데이타 셋 (onload 랑 동일함. 단, 전체 data를 넘길 필요가 없음)
                var option = $('.formula__result .result > li:eq(-1)').data().formula;
                if ( eventType === 'onselect' ) { option.select = this.selectId }
                if ( this.callback.onDrop ) { this.callback.onDrop(option) };
                break;
        }


        if ( !this.viewtype ) {
            this.readonly();
            return;
        }


        // drag trigger
        $(".formula__result .result").sortable({
            nested: false,
            vertical: false,
            handle: 'i.handle',
        });
    }


    /** domRemove
     * @desc 연산자 Item Dom 삭제
    */
    Formula.prototype.domRemove = function(){
        // console.log('li갯수: ',this.E_result.children('li').length);
        if ( this.E_result.children('li').length === 0 ) this.E_result.removeClass('hasChild');

    }

    Formula.prototype.utilDragEvent = function() {
        // Util button event bind (dragstart)
        for (var i = 0, len = this.E_utilBtns.length; i < len; i++) {

            $(this.E_utilBtns[i]).on('dragstart', { thisArg : this }, function(e){
                var target = e.target;
                var _utilKey = $(target).data('util-key'), //data 세팅                
                    _bracketDir = $(target).data('bracket') === "close" ? true : false; // 괄호 Open/Close Key

                e.data.thisArg.dragStartTarget = _utilKey;

                if( _utilKey === 'OPERATOR' ){
                    e.data.thisArg.dragStartTarget = $(target).data('operator');
                    e.data.thisArg.bracketDirection = _bracketDir;
                }
            });
        }


        // Result 영역 Event bind (drop, dragover )
        this.E_result.on({
            'drop' : function(e){
                if(e.preventDefault) e.preventDefault();
                if (e.stopPropagation) e.stopPropagation();
                else e.cancelBubble = true;
                var type = e.data.thisArg.dragStartTarget,
                // var type = event.dataTransfer.getData("Text"),
                    bracket = e.data.thisArg.bracketDirection, 
                    option = { data: [], };

                switch (type) {
                    case 'BIZD':
                    option.data.push({
                        type:type,
                        value:{indicator:'', value:''},
                        label: 'Input Data'
                    });
                    break;

                    case 'PROXY':
                    option.data.push({
                        type:type,
                        value:{indicator:'', value:'', code:''},
                        label: 'Proxy'
                    });
                    break;

                    case 'CONST':
                    option.data.push({type:type, value:0, label: 'Number'});
                    break;

                    default:
                            option.data.push({type:'OPERATOR', value:type, label:'', reverse:bracket});
                    break;
                }

                // 연산자 Dom create
                e.data.thisArg.domCreate(option, e.data.thisArg, 'ondrop');
            },

            'dragover' : function(e){
                if(e.preventDefault) e.preventDefault();
                if (e.stopPropagation) e.stopPropagation();
                    else e.cancelBubble = true;
                    return false;
                }

        }, { thisArg : this } );
    }


    /** Formula Event
     * @desc onDrop event (Item drop)
    */
    Formula.prototype.onDrop = function(e){
        if(e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        else e.cancelBubble = true;

        var _type = this.dragStartTarget,
        // var _type = event.dataTransfer.getData("Text"),
            option = {};

        switch(_type){
            case 'BIZD':
                option.data = { ondrop: { label : 'Input Data', type : _type,  }};
                break;
            case 'PROXY':
                option.data = { ondrop: { label : 'Proxy', type : _type, }};
                break;
            case 'CONST':
                option.data = { ondrop: { type : _type, }};
                break;

            default :
                option.data = { ondrop: { type : "OPERATOR", value: _type, }};
            break;
        }

        // this.itemMake(option);
        return false;
    };


    /** Formula Event
     * @desc dragOver event (연산 Item drag 끝났을 시)
    */
    Formula.prototype.onDragOver = function(e){
        if(e.preventDefault) event.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        else e.cancelBubble = true;
        return false;
    };


    /** Formula Total search -
     * @desc 전체검색 연산자 adding 기능
    */
    Formula.prototype.totalSearchSelected = function(){

        var expression = {
            minus : ['빼기','마이너스','-','minus'],  // 연산자 - Minus [0-3]
            plus : ['더하기','플러스', '+', 'plus'], // 연산자 - Plus [4-7]
            multiple : ['곱하기', 'x', '*', 'multiply'], // 연산자 - Multiply [8-11]
            division : ['나누기','/','division'],        // 연산자 - Division [12-14]
            const: ['숫자','상수','number'],   // 상수 - Cons tant [15-18]
            bracket : ['(',')','괄호'],                 // 괄호 - [19-21]
        };

        var isNumber =  /^[-]?\d+(?:[.]\d+)?$/;

        $('.totalSearch .Autocomplete-textinput').on({
            'change' : function(e){ // change - 사용자가 키워드 검색하여 매칭된 키워드로 자동완성 한 경우 Fire
                var inputValue = $(this).val();

                if ( inputValue.indexOf('[InputData]') === 0 || inputValue.indexOf('[Proxy]') === 0) {
                    var _typeData = inputValue.indexOf('[InputData]') === 0 ? 'BIZD' : 'PROXY',
                        _replaceTxt = _typeData === 'BIZD' ? '[InputData] ' : '[Proxy] ',
                        selected = e.data.thisArg.E_totalSearch.getSelectedData();

                    var option = {
                        data: [{
                            type:_typeData,
                            value:{
                                indicator:selected.text.replace(_replaceTxt,''),
                                value:selected.value
                            },
                            id: selected.id
                        }]
                    }
                    e.data.thisArg.domCreate(option, e.data.thisArg, 'onselect');
                    e.data.thisArg.E_totalSearch.clear(); // 값 비우고 초기화
                } 
            },

            'keydown' : function(e){
                if ( e.which === 13 ) {
                    var _value = $(this).val();
                    
                    if(isNumber.test(_value) && _value !== ""){  // 사용자가 숫자에 유효한 값 입력했는지 검색
                        var option = {
                            data: [ { type:'CONST', value:_value, }]
                        }
                        e.data.thisArg.domCreate(option, e.data.thisArg, 'onselect');
                        e.data.thisArg.E_totalSearch.clear(); // 값 비우고 초기화    
                        return;

                    } else { // 연산자
                        for (props in expression) {
                            if (expression[props].indexOf(_value) > -1){ // 매칭되는 연산자 - Dom Create 연계
                                var _key = props,
                                    _bracket = false;

                                if ( props === 'bracket' ) {
                                    // _bracket = inputValue === ")" ? true:false;
                                    var _bracket = _value === ")" ? true:false;
                                }

                                var option = {
                                    data: [ { type:'OPERATOR', value:_key, reverse:_bracket }]
                                }

                                
                                e.data.thisArg.domCreate(option, e.data.thisArg, 'onselect');
                                e.data.thisArg.E_totalSearch.clear(); // 값 비우고 초기화
                            }
                        }
                    }
                }
            }
        }, { thisArg : this } );
    }


    /** getData
     * @desc 측정식 get data (Object 형식으로 Return)
    */
    Formula.prototype.getData = function(){
        var returnData = [];
        this.E_resultItem = $('.formula__result .result > li'); // 갱신

        this.E_resultItem.each(function(idx,data){
            var $this = $(this),
                data = $this.data().formula;


            switch(data.type){
                case 'PROXY':
                case 'BIZD':
                    var $autocomplete = $('#'+ data.id );
                    var value = $autocomplete.getSelectedData(),
                        text = value !== null ? value.text : null,
                        id = value !== null ? value.id : null,
                        inputVal = $this.find('.Textinput.number').val();

                    var _returnData = {
                        type : data.type,
                        value: {
                            indicator : text,
                            value: inputVal,
                            code: id,
                        }
                    }
                    break;


                case 'CONST':
                    var value = $('#'+ data.id ).val();
                    var _returnData = {
                        type : 'CONST',
                        value: value
                    }
                    break;


                default :  // 연산자
                    var _returnData = $this.data().formula;
                break;

            }
            returnData.push(_returnData);

        });

        return returnData;
    }


    return Formula;
})();