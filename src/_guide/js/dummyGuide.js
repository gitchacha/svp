// system > 메뉴조회 dummy data
dummyGuide.guide = {
    "guideMenu": [
        {"name":"화면목록","sectionId":"guideScreen"},
        {"name":"Component","sectionId":"guideComponent"},
        {"name":"Color","sectionId":"guideColor"},
        {"name":"Icon","sectionId":"guideIcon"},
        {"name":"Button","sectionId":"guideButton"},
        {"name":"Tab","sectionId":"guideTab"},
        {"name":"ProcessBar","sectionId":"guideProcessBar"},
        {"name":"Grid","sectionId":"guideGrid"}
    ],
    
    "color": {
        "point":[
            {"className": "backColorPoint-type1", "color":"#DE1C22"},
            {"className": "backColorPoint-type2", "color":"#F86601"}
        ],
        
        "sub":[
            {"className": "backColorSub-type1", "color":"#DE1C22"},
            {"className": "backColorSub-type2", "color":"#555968"},
            {"className": "backColorSub-type3", "color":"#848893"},
            {"className": "backColorSub-type4", "color":"#AEB4BD"}        
        ],

        "chart":[
            {"className": "backColorChart-type1", "color":"#5E8FF2"},
            {"className": "backColorChart-type2", "color":"#6CB8F7"},
            {"className": "backColorChart-type3", "color":"#8595FF"},
            {"className": "backColorChart-type4", "color":"#89C933"},
            {"className": "backColorChart-type5", "color":"#ECD61B"},
            {"className": "backColorChart-type6", "color":"#DA5256"},
            {"className": "backColorChart-type7", "color":"#E27D38"},
            {"className": "backColorChart-type8", "color":"#D16CF4"}
        ],

        "borderPoint":[
            {"className": "borderPoint-type1", "color":"#DE1C22"},
            {"className": "borderPoint-type2", "color":"#F86601"},
            {"className": "borderPoint-type3", "color":"#F78970"}
        ],

        "borderSub":[
            {"className": "borderSub-type1", "color":"#333744"},
            {"className": "borderSub-type2", "color":"#848893"},
            {"className": "borderSub-type3", "color":"#AEB4BD"}
        ],

        "gradient":[
            {"className": "gradient-type1", "color":"#6cb8f7, #8595ff"},
            {"className": "gradient-type2", "color":"#ecd61b, #da5256"},
            {"className": "gradient-type3", "color":"#89c933, #6cb8f7"},
            {"className": "gradient-type4", "color":"#d16cf4, #6cb8f7"},
            {"className": "gradient-type5", "color":"#da5256, #d16cf4"},
            {"className": "gradient-type6", "color":"#d16cf4, #89c933"},
            {"className": "gradient-type7", "color":"#5e8ff2, #da5256"}
        ],
        
        "status":[
            {"className": "backColorStatus-type1", "color":"#89c933"},
            {"className": "backColorStatus-type2", "color":"#6cb8f7"},
            {"className": "backColorStatus-type3", "color":"#8595ff"},
            {"className": "backColorStatus-type4", "color":"#de1c22"},
            {"className": "backColorStatus-type5", "color":"#555968"}
        ]
    },
    
    "icon": [        
        {"className": "header-menu"},
        {"className": "menu-treebelong"},
        {"className": "menu-close"},
        
        {"className": "header-util-badge"},
        {"className": "header-util-help"},
        {"className": "header-util-search"},
        {"className": "lnb-default"},
        {"className": "lnb-overview"},
        {"className": "lnb-star"},
        {"className":"lnb-add"},

        {"className": "calendar"},
        {"className": "delete"},
        {"className": "list"},
        {"className": "overview"},
        {"className": "proxy"},
        {"className": "table"},
        {"className": "upload"},
        {"className":"reset"},
        {"className":"arrow"},
        {"className":"arrow down"},
        {"className":"arrow left"},
        {"className":"arrow up"},
        {"className":"attach"},
        {"className":"chart-graph"},
        {"className":"chart-drill"},
        {"className":"chart-drill up"},
        {"className":"sort-disabled"},
        {"className":"sort"},
        {"className":"sort up"},

        {"className":"input-person"},
        {"className":"input-search"},

        {"className":"chk-all"},
        {"className":"chk-all disabled"},
        {"className":"chk checked"},
        {"className":"chk checked disabled"},

        {"className":"chk"},
        {"className":"chk disabled"},
        {"className":"radio"},
        {"className":"radio disabled"},
        {"className":"radio checked"},
        {"className":"radio checked disabled"},

        {"className":"mymenu-account"},
        {"className":"mymenu-task"},
        {"className":"mymenu-calendar"},
        {"className":"mymenu-clock"},
        {"className":"header-util-bagdeNew"},
        {"className":"grid-rowadd"},        

        {"className": "xls"}
    ],


    "gridData" : [
        {
            "menuName": "시스템 관리자",
            "menuId": "ROLE_SYSTEM_ADMIN",
            "url": "/admin/menu/list",
            "order": "10000",
            "use": "예",
            "parentId": "10000",
            "exp": "메뉴 등록/수정/삭제"
        }, 
        {
            "menuName": "시스템 관리자",
            "menuId": "ROLE_SYSTEM_ADMIN",
            "url": "/admin/menu/list",
            "order": "10000",
            "use": "아니요",
            "parentId": "10000",
            "exp": "메뉴 등록/수정/삭제"
        },
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list1", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list2", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list3", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list4", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list5", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list6", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list7", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list8", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list9", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list10", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list11", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list12", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list13", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list14", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list15", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list16", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list17", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list18", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list19", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list20", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list21", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list22", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list23", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list24", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list25", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list26", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list27", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list28", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list29", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list30", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list31", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list32", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list33", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list34", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" },
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list35", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list36", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list37", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list38", "order": "10000", "use": "예", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }, 
        { "menuName": "시스템 관리자", "menuId": "ROLE_SYSTEM_ADMIN", "url": "/admin/menu/list39", "order": "10000", "use": "아니요", "parentId": "10000", "exp": "메뉴 등록/수정/삭제" }
    ]
};

dummyGuide.guideScreenList = [
    {
        "group" : "공통",
        "l1": "-",
        "l2": "-",
        "l3": "Proxy 조회",
        "l4": "-",
        "screen": "Proxy 조회",
        "menuFolder": "common",
        "fileName": "proxyMgmtListPopup.html",
        "pageType": { w:1200, h:870 },
        "dueDate":"",
        "latestDate": "",
        "desc": "완료"
    },

    {
        "group" : "SV 추진체계",
        "l1": "메인",
        "l2": "-",
        "l3": "-",
        "l4": "-",
        "screen": "메인",
        "menuFolder": "index",
        "fileName": "index.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },    
    {
        "group" : "SV 추진체계",
        "l1": "1.1 SV 추진 개요",
        "l2": "1.1.1 SV 추진체계",
        "l3": "추진체계 개요 조회",
        "l4": "-",
        "screen": "추진체계 개요 조회",
        "menuFolder": "summary",
        "fileName": "svSummary.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.1 SV 추진 개요",
        "l2": "1.1.2 ESG 분류체계",
        "l3": "분류체계 개요 조회",
        "l4": "-",
        "screen": "분류체계 개요 조회",
        "menuFolder": "summary",
        "fileName": "csstSummary.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.2 SK DBL BM",
        "l2": "1.2.1 DBL BM",
        "l3": "SK BM 개요 조회",
        "l4": "-",
        "screen": "SK BM 개요 조회",
        "menuFolder": "summary",
        "fileName": "bmSummary.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.2 SK DBL BM",
        "l2": "1.2.2 DBL BM 사례",
        "l3": "SK BM 사례",
        "l4": "-",
        "screen": "SK BM 사례",
        "menuFolder": "bm",
        "fileName": "bmList.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.4 DB/자료실",
        "l2": "1.4.2 SK News",
        "l3": "SK 최신소식",
        "l4": "-",
        "screen": "SK 최신소식",
        "menuFolder": "board",
        "fileName": "newsList.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.4 DB/자료실",
        "l2": "1.4.3 언론보도 자료",
        "l3": "언론보도 자료",
        "l4": "-",
        "screen": "언론보도 자료",
        "menuFolder": "board",
        "fileName": "mediaReportList.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.3 사회적가치 성과",
        "l2": "1.3.1 사회성과 대외공표",
        "l3": "그룹 성과 대외공표",
        "l4": "-",
        "screen": "그룹 성과 대외공표",
        "menuFolder": "result",
        "fileName": "publicGroupResult.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "html",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.3 사회적가치 성과",
        "l2": "1.3.2 성과측정 지표",
        "l3": "SK그룹 측정 지표 소개",
        "l4": "-",
        "screen": "SK그룹 측정 지표 소개",
        "menuFolder": "result",
        "fileName": "indicatorIntroduce.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "html",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.3 사회적가치 성과",
        "l2": "1.3.2 성과측정 지표",
        "l3": "SK그룹 측정 지표 소개 > 지표상세",
        "l4": "-",
        "screen": "SK그룹 측정 지표 소개 > 지표상세",
        "menuFolder": "result",
        "fileName": "indicatorView.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "html",
        "desc": ""
    },
    {
        "group" : "SV 추진체계",
        "l1": "1.4 DB/자료실",
        "l2": "1.4.1 Reference DB",
        "l3": "Reference DB 조회",
        "l4": "-",
        "screen": "SK그룹 측정 지표 소개 > 지표상세",
        "menuFolder": "board",
        "fileName": "refDbList.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },

    //--------------------------------평가모델----------------------------------
    
    {
        "group" : "SV 평가모델",
        "l1": "2.1 평가 시작하기",
        "l2": "2.1.1 Login",
        "l3": "-",
        "l4": "-",
        "screen": "Login",
        "menuFolder": "common",
        "fileName": "login.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": "완료"
    },
    {
        "group" : "SV 평가모델",
        "l1": "2.1 평가 시작하기",
        "l2": "2.1.2 평가 기본정보 등록",
        "l3": "-",
        "l4": "-",
        "screen": "평가 기본정보 등록",
        "menuFolder": "assessment",
        "fileName": "asmtRegister.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": "완료"
    },
    {
        "group" : "SV 평가모델",
        "l1": "2.1 평가 시작하기",
        "l2": "2.1.3 평가 Dashboard",
        "l3": "평가 Dashboard",
        "l4": "-",
        "screen": "평가 Dashboard",
        "menuFolder": "assessment",
        "fileName": "asmtBoard.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": "완료"
    },


    {
        "group" : "SV 평가모델",
        "l1": "2.1 평가 시작하기",
        "l2": "2.1.3 평가 Dashboard",
        "l3": "2.1.3.2 평가 요약(Intro)",
        "l4": "-",
        "screen": "평가 시작하기 첫화면",
        "menuFolder": "assessment",
        "fileName": "asmtSurveyIntro.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": "완료"
    },    
    {
        "group" : "SV 평가모델",
        "l1": "2.2 평가 등록하기",
        "l2": "2.2.1 Self-Assessment 작성",
        "l3": "-",
        "l4": "-",
        "screen": "Self-Assessment 작성",
        "menuFolder": "assessment",
        "fileName": "asmtSurveyForm.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": "완료"
    },

    {
        "group" : "SV 평가모델",
        "l1": "2.2 평가 등록하기",
        "l2": "2.2.2 제품/서비스 지표 등록",
        "l3": "신규 지표 등록 및 수정",
        "l4": "-",
        "screen": "신규 지표 등록 및 수정",
        "menuFolder": "indicator",
        "fileName": "indicatorEdit.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": "완료 / 등록된 지표 목록 조회(Li) 포함"
    },

    {
        "group" : "SV 평가모델",
        "l1": "2.3 Reporting",
        "l2": "2.3.1 성과 Report",
        "l3": "-",
        "l4": "-",
        "screen": "성과 Report",
        "menuFolder": "report",
        "fileName": "reportResult.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": "완료"
    },

    {
        "group" : "SV 평가모델",
        "l1": "2.3 Reporting",
        "l2": "2.3.2 상세 분석 Report",
        "l3": "-",
        "l4": "-",
        "screen": "상세 분석 Report",
        "menuFolder": "report",
        "fileName": "reportDetail.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 평가모델",
        "l1": "2.3 Reporting",
        "l2": "2.3.3 비교 분석 Report",
        "l3": "-",
        "l4": "-",
        "screen": "비교 분석 Report",
        "menuFolder": "report",
        "fileName": "reportCompare.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },


    {
        "group" : "SV 평가모델",
        "l1": "2.4 SV 평가관리(관리자)",
        "l2": "2.4.1 분류체계 관리",
        "l3": "-",
        "l4": "-",
        "screen": "분류체계 관리",
        "menuFolder": "admin",
        "fileName": "csstMgmt.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 평가모델",
        "l1": "2.4 SV 평가관리(관리자)",
        "l2": "2.4.2 Self-Assessment 설문 관리",
        "l3": "-",
        "l4": "-",
        "screen": "Self-Assessment 설문 관리",
        "menuFolder": "admin",
        "fileName": "assessmentMgmt.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 평가모델",
        "l1": "2.4 SV 평가관리(관리자)",
        "l2": "2.4.3 SV 평가 대상 결과 관리",
        "l3": "-",
        "l4": "-",
        "screen": "SV 평가 대상 결과 관리",
        "menuFolder": "admin",
        "fileName": "asmtResultMgmt.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    {
        "group" : "SV 평가모델",
        "l1": "2.4 SV 평가관리(관리자)",
        "l2": "2.4.4 부정적 영향 Check List",
        "l3": "-",
        "l4": "-",
        "screen": "SV 평가 대상 결과 관리",
        "menuFolder": "admin",
        "fileName": "negativePointMgmt.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },

    {
        "group" : "SV 추진체계",
        "l1": "3.1",
        "l2": "3.1.1 Main",
        "l3": "-",
        "l4": "-",
        "screen": "Main",
        "menuFolder": "common",
        "fileName": "portal.html",
        "pageType": "M",
        "dueDate":"",
        "latestDate": "",
        "desc": ""
    },
    
    ] 