var i =1
setInterval(()=>{
    i++;
    if(i==4){
        i = 1;
    }
    $("body").css("background-image", `url('../assets/bg${i}.jpg')`);
    if(i==3){
        $("#full-name").css("color", "#F05454");
        $("#last-name").css("color", "#F05454");
    }else{
        $("#full-name").css("color", "#DDDDDD");
        $("#last-name").css("color", "#DDDDDD");
    }

    switch(i){
        
        case 1:
            $("#skill").fadeOut(400, function() {
                $(this).html("edit videos.").fadeIn(400);
            });
            break;
        case 2:
            $("#skill").fadeOut(400, function() {
                $(this).html("create.").fadeIn(100);
            });
            break;
        case 3:
            $("#skill").fadeOut(100, function() {
                $(this).html("code.").fadeIn(100);
            });
            
            break;
    }
}, 3000)