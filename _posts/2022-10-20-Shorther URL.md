---
layout: post
title: URL Shorter Project
subtitle: URL Shorter Project
categories: portfolio
tags: [URL Shorter, portfolio, JAVA]
---

# URL Shorter Project

단축 주소 생성 Java 프로젝트입니다.

Java를 공부하던 중 php 언어로 된 단축 주소 생성 웹을 Java로 만들어보자는 생각이 들어 만들었습니다.

php 출처 : [PHP) 단축 URL 서비스 구축하기](https://hi098123.tistory.com/240)



#### 코드
- ##### URL Entity

```java

package shorter.Entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Url {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private String addr;
	private String shorter;
	private String timestampt;
	private String lastUsed;
}
```

- ##### Shorter API

```java

package shorter.DAO;

import org.springframework.stereotype.Component;

@Component
public class Shorter {
        // 단축 주소 생성
	public String makeShorter(int id) {
		id += 10000000;
		return base_convert(Integer.toString(id), 10, 36);
	}

        // n진수로 변경하는 함수
	public static String base_convert(final String inputValue, final int fromBase, final int toBase) {
		if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
			return null;
		}
		String ret = null;
		try {
			ret = Integer.toString(Integer.parseInt(inputValue, fromBase), toBase);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return ret;
	}
}
```

- ##### Controller

```java

package shorter;

import shorter.DAO.*;
import shorter.Entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class URLShorterController {

	final URLShorterDAO dao;

	@Autowired
	Shorter st;

	@Autowired
	public URLShorterController(URLShorterDAO dao) {
		this.dao = dao;
	}

	final String http = "http://localhost/";

	@GetMapping("")
	public String index() {
		return "/index";
	}

	@PostMapping("")
	public String adddata(@RequestParam String input, @RequestParam String custom, Model m) throws Exception {
		Url u = new Url();
		Url r = null;
		List<Url> l = null;
		String randum = null;
		try {
			if (input.equals("")) { // 아무것도 입력 안되어 있으면,
				// 에러 출력 : URL을 입력해주세요.
				m.addAttribute("error", "2");
				return "/index";
			}
			// 데이터 등록 시작
			if (custom.equals("")) { // 커스텀 단축이 아니면,
				// 입력한 주소가 데이터베이스에 있다면,
				l = dao.getDataToInput(input);
				if (l != null) {
					for (Url check : l) {
						// 데이터 추가하지 말고 등록된 값 뿌려주자.
						// todo : 커스텀 주소를 뿌려줄 수도 있는데...
						//          상관은 없으니 일단 둔다.
						m.addAttribute("shorterurl", http + check.getShorter());
						return "/index";
					}
				}
				// php에서 사용하던 방식 그대로 사용하자.
				// 일단 생성
				u.setAddr(input);
				dao.addShorter(u);

				// 그리고 id값으로 Shorter 업데이트
				u.setShorter(st.makeShorter(u.getId()));
				dao.addShorter(u);
			} else { // 커스텀 단축이면
				// 데이터 조회
				r = dao.getDataToShorter(custom);
				// 동일한 값이 db에 있다면
				if (r != null) {
					// 에러 출력 : 이미 존재하는 커스텀 단축 주소입니다.
					m.addAttribute("error", "0");
					return "/index";
				}
				u.setAddr(input);
				u.setShorter(custom);
				//데이터 저장.
				dao.addShorter(u);
			}
		} catch (Exception e) {
			// 에러 출력 : 예기치 않는 오류가 발생했습니다.
			m.addAttribute("error", "3");
			e.printStackTrace();
			return "/index";
		}
		m.addAttribute("shorterurl", http + u.getShorter());
		return "/index";
	}

	@GetMapping("/{shorter}")
	public String gotoadr(@PathVariable String shorter, Model m) throws Exception {
		try {
			Url u = dao.getDataToShorter(shorter);

			if (u != null) {
				m.addAttribute("addr", u.getAddr());
				//데이터 업데이트 : 마지막 사용 시간
				dao.update(u);
			} else {
				// 에러 출력 :  존재하지 않는 단축 주소입니다.
				m.addAttribute("error", "1");
				return "/index";
			}
		} catch (Exception e) {
			// 에러 출력 : 예기치 않는 오류가 발생했습니다.
			m.addAttribute("error", "3");
			e.printStackTrace();
			return "/index";
		}
		return "/Control";
	}
}
```

- ##### index.jsp

```html

<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<html>
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-1N3FJ1ETYL"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-1N3FJ1ETYL');
    </script>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="author" content="url shortener">
	<meta property="og:type" content="website">
	<meta property="og:title" content="단축 주소 생성">
	<meta property="og:url" content="ipi.pw">
	<meta property="og:description" content="단축 주소 생성 웹페이지입니다.">
	<meta property="og:image" content="test.png">
    <title>단축 주소 생성 웹</title>
    <link href="http://localhost/css/main.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
    <script src="/js/loading.js"></script>
    <script type="text/javascript">
    	function loading() {
    	 $('#loading').show();
    	}
    </script>
</head>
<body>
    <div id="loading"><img id="loading-image" src="/images/loading.gif" alt="Loading..." /></div>
    <br>
    <center>
    <h1>단축 URL 생성</h1>

    <%
    String shorterurl = (String) request.getAttribute("shorterurl");

    if (shorterurl != null) {
        %>
        <p class="success"><a id ="a" href="<%=shorterurl%>"><%=shorterurl%></a></p>
        <h3><div id="copyok" class="copyok" style="display:none">복사완료</div></h3>
        <input type="submit" id="btn_div_copy" value="복사" class="submit_copy">
        <%
    }

    String error = (String) request.getAttribute("error");

    if (error != null) {
        if (error.equals("0")) {
            %>
            <p class="alert">이미 존재하는 커스텀 주소입니다.</p>
            <%
        } else if (error.equals("1")) {
            %>
            <p class="alert">존재하지 않는 주소입니다.</p>
           <%
        } else if (error.equals("2")) {
            %>
            <p class="alert">URL을 입력해주세요.</p>
            <%
        } else if (error.equals("3")) {
            %>
            <p class="alert">예기치 않는 오류가 발생했습니다.</p>
            <%
        }
    }
    %>

	<form action="" method="post" onsubmit="return loading()">
        <div class="section group">
            <div class="col span_3_of_3">
                <input type="url" id="input" name="input" autocomplete="off" name="url" class="input" placeholder="Ex)https://www.naver.com" required autofocus>
            </div>
            <div class="col span_1_of_3">
                <input type="text" id="custom" name="custom" autocomplete="off" name="custom" class="input_custom" placeholder="커스텀 주소" readonly>
            </div>
            <div class="col span_2_of_3">
                <div class="onoffswitch">
                    <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch"
                           onclick="toggle()">
                    <label class="onoffswitch-label" for="myonoffswitch"></label>
                </div>
            </div>
        </div>
        <input type="submit" value="Generate" class="submit">
    </form>
    <script>
        function toggle() {
            if (document.getElementById('myonoffswitch').checked) {
                document.getElementById('custom').placeholder = '커스텀 주소를 입력하세요'
                document.getElementById('custom').readOnly = false
                document.getElementById('custom').focus()
            }
            else {
                document.getElementById('custom').value = ''
                document.getElementById('custom').placeholder = '커스텀 주소'
                document.getElementById('custom').readOnly = true
                document.getElementById('custom').blur()
                document.getElementById('input').focus()
            }
        }
        document.getElementById("btn_div_copy").onclick = function () {
            // a 내부 텍스트 취득
            const valOfDIV = document.getElementById("a").innerText;

            // textarea 생성
            const textArea = document.createElement("textarea");

            // textarea 추가
            document.body.appendChild(textArea);

            // textara의 value값으로 div내부 텍스트값 설정
            textArea.value = valOfDIV;

            // textarea 선택 및 복사
            textArea.select();
            document.execCommand("copy");
            //alert("복사완료")
            document.getElementById("copyok").style.display = "block";
            // textarea 제거
            document.body.removeChild(textArea);
        }
    </script>
    </center>
</body>
</html>
```


- ##### index.jsp

```html

<%
    String addr = (String) request.getAttribute("addr");
    response.sendRedirect(addr);
%>
```


프로젝트 git 주소 : [github.com](https://github.com/CometAhn/URLShorter)


