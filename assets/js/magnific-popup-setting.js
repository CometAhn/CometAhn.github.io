$(function(){
    //     이미지 클릭시 해당 이미지 모달
        $("p img").click(function(){
            let img = new Image();
            img.src = $(this).attr("src")
            $('.modalBox').html(img);
            $(".modal").show();
        });
    // 모달 클릭할때 이미지 닫음
        $(".modal").click(function (e) {
        $(".modal").toggle();
      });
    });