<?php
    include "../connect_db.php";
 
    session_start();    //session 가져오기
    //session에 데이터가 없다면 로그인 화면으로 GO
    if (!isset($_SESSION['userID'])) {
        header('Location : http://wamp서버ip주소:80/test/login/login');
    }
 
    // main.php에서 넘어온 글 번호 값
    $index=$_GET['idx'];
    
    // 조회 수 증가
    $increase_sql = "UPDATE board SET views = views+1 WHERE idx ='$index'";
    $increase_result = $db->query($increase_sql);
 
    // 해당 글을 읽어오기 위한 쿼리문..
    $sql = "SELECT * FROM board WHERE idx='$index'";
    $result = $db->query($sql);
    $data = $result->fetch_array(MYSQLI_ASSOC);
?>
<!DOCTYPE html>
<html>
    <head>
        <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
        <script src="/test/js/bootstrap.js"></script>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>글 읽기</title>
        <link rel ="stylesheet" href="/test/css/bootstrap.css">
    </head>
    <!--php의 변수 html로 가져오기-->
    <input type="hidden" id="d1" value="<?=$index?>">
    <!--삭제를 위한 스크립트-->
    <script>
        $(document).ready(function(){
            //삭제 버튼 클릭시
            $('#delete_btn').click(function(){
                $.ajax({
                    type : 'POST',
                    url : 'http://192.168.0.2:80/test/notice_board/delete',
                    data : {
                        idx : $("#d1").val()
                    },
                    success : function(result){
                        if(result=="success"){
                            alert("글 삭제 성공");
                            location.replace('http://wamp서버ip주소:80/test/main');
                        }else if(result=="Fail:delete"){
                            alert("글 삭제 실패...다시 시도 해주세요.");
                        }
                    },
                    error : function(xtr,status,error){
                        alert(xtr +":"+status+":"+error);
                    }
                });
            });
        });
    </script>
    <body>
        <div class ="container">
            <table class ="table table-bordered">
                <thead>
                    <caption>글 읽기</caption>
                </thead>
                <tbody>
                    <tr>
                        <th>제목 : </th>
                        <td><?php echo $data['title'];?></td>
                    </tr>
                    <tr>
                        <th>작성 일자 : </th>
                        <td><?php echo $data['date'];?></td>
                    </tr>
                    <tr>
                        <th>조회수 : </th>
                        <td><?php echo $data['views'];?></td>
                    </tr>
                    <tr>    
                        <th>작성자 : </th>
                        <td><?php echo $data['author'];?></td>
                    </tr>
                    <tr>
                        <th>내용 : </th>
                        <td><?php echo $data['contents'];?></td>
                    </tr>
                </tbody>
            </table>
            <!--본인이 작성한 글이라면 수정,삭제 버튼 보이기-->
            <?php
                if($_SESSION['userNAME']==$data['author']){
            ?>
                    <a class="btn btn-outline-primary" id ="update_btn" href ="/test/notice_board/update_write?idx=<?php echo $index;?>">수정하기</a>
                    <input type ="button" class="btn btn-outline-primary" id ="delete_btn" value="삭제하기">
            <?php } ?>
        </div>
    </body>
</html>