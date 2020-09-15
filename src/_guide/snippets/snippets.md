## snippets json 파일 import 경로
* C:\Users\Administrator\.vscode\extensions\abusaidm.html-snippets-0.2.1

## 위 경로의 package.json - "contributes" 항목 아래처럼 수정
"contributes": {
    "snippets": [
        {
            "language": "html",
            "path": "./snippets/snippets.json"
        },
        {
            "language": "scss",
            "path": "./snippets/snippetsCss.json"
        },
        {
            "language": "javascript",
            "path": "./snippets/snippetsJs.json"
        }
    ]
},