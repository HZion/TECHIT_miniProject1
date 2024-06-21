<개론>
부동산 매매 도매 crud 
게시판 형태

~위치 부동산 얼마에 판매합니다. 

자산관리 도매인 잔액 + - 의 도매인 

잔액 :
금액:
 출금 / 입금

<db>
user : 유저 정보 제공 
board : 게시물
유저
 {
    _id // 자동 배정
    UID:
    PWD:
	propertiasset:
}

게시판
{
 게시물 id // 자동배정
 작성자 uid
 내용
 가격
 작성시간
 // 조회수 
 마커:
 
 }


부동산 매매 도매 사이트 기능|

<기본>

crud
-게시물 추가
-게시물 삭제
-게시물 변경
-게시물 클릭시 상세 내용 출력

 <추가>
  *지도 api 기반 매물 마커* 
 게시물 작성 > 게시판 느낌으로 /trading 창에서 부동산 목록 > 해당 게시물 클릭시 

 1.작성한 사람만 자기 게시물 지울수있음
 2.어드민은 모든게시물 삭제가능
 3.조회수 할수있음 



로그인 기능
<기본>
1.새로운 유저 회원가입z
2.유효성 검사 꼭??






//////////////////////////////////
signup.ejs

25 <form action="/register" method="post">
30 ID 입력 name = inputID
40 password 입력 name =  inputPWD

login.ejs

30 ID 입력 name = inputID
39 password 입력 name =  inputPWD

