GameApp.controller("GameController",function($scope,GameService,$timeout){
    var storage=window.localStorage;

    $scope.score=0;

    $scope.newGame=function(){
        $('#game-over').removeClass("show");
        $('#game-win').removeClass("show");
        init();
        generateOneNumber();
        generateOneNumber();

    }

    $scope.continueGame=function(){
        $('#game-win').removeClass("show");
    }

    var board = new Array();
    var hasConflicted=new Array();
    var winScore=2048;
    var win=false;
    var documentWidth=window.screen.availWidth;
    var gridContainerWidth=0.92*documentWidth;
    var cellSideLength=0.18*documentWidth;
    var cellSpace=0.04*documentWidth;


    $(document).ready(function(){

        if(!storage.getItem("bestScore"))
            storage.setItem("bestScore",0);

        $scope.bestScore=storage.getItem("bestScore");
        prepareForMobile();
        init();
        generateOneNumber();
        generateOneNumber();

    });

    function prepareForMobile(){

        if(documentWidth>500){
            gridContainerWidth=500;
            cellSpace=20;
            cellSideLength=100;
        }

        $("#grid-container").css("width",gridContainerWidth-2*cellSpace);
        $("#grid-container").css("height",gridContainerWidth-2*cellSpace);
        $("#grid-container").css("padding",cellSpace);
        $("#grid-container").css("border-radius",0.02*gridContainerWidth);

        $(".grid-cell").css("width",cellSideLength);
        $(".grid-cell").css("height",cellSideLength);
        $(".grid-cell").css("border-radius",0.02*cellSideLength);
    }

    function init(){
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 0 ; j < 4 ; j ++ ){

                var gridCell = $('#grid-cell-'+i+"-"+j);
                gridCell.css('top', GameService.getPosTop( i , j ) );
                gridCell.css('left', GameService.getPosLeft( i , j ) );
            }

        for( var i = 0 ; i < 4 ; i ++ ){
            board[i] = new Array();
            hasConflicted[i]=new Array();
            for( var j = 0 ; j < 4 ; j ++ ){
                board[i][j] = 0;
                hasConflicted[i][j]=false;
            }
        }
        updateBoardView();

        $scope.score=0;
        win=false;
    }

    function updateBoardView(){

        $(".number-cell").remove();
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 0 ; j < 4 ; j ++ ){
                $("#grid-container").append( '<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>' );
                var theNumberCell = $('#number-cell-'+i+'-'+j);

                if( board[i][j] == 0 ){
                    theNumberCell.css('width','0px');
                    theNumberCell.css('height','0px');
                    theNumberCell.css('top',GameService.getPosTop(i,j) +cellSideLength/2 );
                    theNumberCell.css('left',GameService.getPosLeft(i,j) + cellSideLength/2  );
                }
                else{
                    theNumberCell.css('width',cellSideLength);
                    theNumberCell.css('height',cellSideLength);
                    theNumberCell.css('top',GameService.getPosTop(i,j));
                    theNumberCell.css('left',GameService.getPosLeft(i,j));
                    theNumberCell.css('background-color',GameService.getNumberBackgroundColor( board[i][j] ) );
                    theNumberCell.css('color',GameService.getNumberColor( board[i][j] ) );
                    theNumberCell.text( board[i][j] );
                }

                hasConflicted[i][j]=false;
            }
    }

    function generateOneNumber(){

        if( GameService.nospace( board ) )
            return false;

        //随机一个位置
        var randx = parseInt( Math.floor( Math.random()  * 4 ) );
        var randy = parseInt( Math.floor( Math.random()  * 4 ) );

        var times=0;
        while( times<50 ){
            if( board[randx][randy] == 0 )
                break;

            randx = parseInt( Math.floor( Math.random()  * 4 ) );
            randy = parseInt( Math.floor( Math.random()  * 4 ) );
            times++;
        }
        if(times==50){
            for(var i=0;i<4;i++){
                for(var j=0;j<4;j++){
                    if(board[i][j]==0){
                        randx=i;
                        randy=j;
                    }
                }
            }
        }

        //随机一个数字
        var randNumber = Math.random() < 0.5 ? 2 : 4;

        //在随机位置显示随机数字
        board[randx][randy] = randNumber;
        showNumberWithAnimation( randx , randy , randNumber );

        return true;
    }

    $(document).keydown( function( event ){
        event.preventDefault();

        switch( event.keyCode ){
            case 37: //left
                if( moveLeft() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
                break;
            case 38: //up
                if( moveUp() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
                break;
            case 39: //right
                if( moveRight() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
                break;
            case 40: //down
                if( moveDown() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
                break;
            default: //default
                break;
        }
    });

    document.addEventListener("touchmove",function(event){
        event.preventDefault();
    });

    document.addEventListener('touchstart',function(event){
        startx = event.touches[0].pageX;
        starty = event.touches[0].pageY;
    });

    document.addEventListener('touchend',function(event){
        endx = event.changedTouches[0].pageX;
        endy = event.changedTouches[0].pageY;

        var deltax = endx - startx;
        var deltay = endy - starty;

        if( Math.abs( deltax ) < 0.3*documentWidth && Math.abs( deltay ) < 0.3*documentWidth )
            return;

        if( Math.abs( deltax ) >= Math.abs( deltay ) ){

            if( deltax > 0 ){
                //move right
                if( moveRight() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
            }
            else{
                //move left
                if( moveLeft() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
            }
        }
        else{
            if( deltay > 0 ){
                //move down
                if( moveDown() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
            }
            else{
                //move up
                if( moveUp() ){
                    generateOneNumber();
                    isgameover();
                    isWin();
                }
            }
        }
    });

    function isgameover(){
        if( GameService.nospace( board ) && GameService.nomove( board ) ){
            gameover();
        }
    }

    function gameover(){
        $('#game-over').addClass("show");
    }

    function moveLeft(){

        if( !GameService.canMoveLeft( board ) )
            return false;

        //moveLeft
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 1 ; j < 4 ; j ++ ){
                if( board[i][j] != 0 ){

                    for( var k = 0 ; k < j ; k ++ ){
                        if( board[i][k] == 0 && GameService.noBlockHorizontal( i , k , j , board ) ){
                            //move
                            showMoveAnimation( i , j , i , k );
                            board[i][k] = board[i][j];
                            board[i][j] = 0;
                            continue;
                        }
                        else if( board[i][k] == board[i][j] && GameService.noBlockHorizontal( i , k , j , board )&&!hasConflicted[i][k]){
                            //move
                            showMoveAnimation( i , j , i , k );
                            //add
                            var score=board[i][k];

                            board[i][k] += board[i][j];
                            board[i][j] = 0;

                            //add score
                            $timeout(function(){
                                $scope.score+=score;
                                if($scope.bestScore<$scope.score)
                                    $scope.bestScore=$scope.score;
                                    storage.setItem("bestScore",$scope.bestScore);
                                });

                            hasConflicted[i][k]=true;

                            continue;
                        }
                    }
                }
            }

      //  window.setInterval(updateBoardView(),200);
        $timeout(function(){
            updateBoardView();
        },200);
        return true;
    }

    function moveRight(){
        if( !GameService.canMoveRight( board ) )
            return false;

        //moveRight
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 2 ; j >= 0 ; j -- ){
                if( board[i][j] != 0 ){
                    for( var k = 3 ; k > j ; k -- ){

                        if( board[i][k] == 0 && GameService.noBlockHorizontal( i , j , k , board ) ){
                            showMoveAnimation( i , j , i , k );
                            board[i][k] = board[i][j];
                            board[i][j] = 0;
                            continue;
                        }
                        else if( board[i][k] == board[i][j] && GameService.noBlockHorizontal( i , j , k , board )&&!hasConflicted[i][k] ){
                            showMoveAnimation( i , j , i , k);

                            var score=board[i][k];

                            board[i][k] *= 2;
                            board[i][j] = 0;

                            //add score
                            $timeout(function(){
                                $scope.score+=score;
                                if($scope.bestScore<$scope.score)
                                    $scope.bestScore=$scope.score;
                                    storage.setItem("bestScore",$scope.bestScore);
                            });

                            hasConflicted[i][k]=true;

                            continue;
                        }
                    }
                }
            }

        $timeout(function(){
            updateBoardView();
        },200);
        return true;
    }

    function moveUp(){

        if( !GameService.canMoveUp( board ) )
            return false;

        //moveUp
        for( var j = 0 ; j < 4 ; j ++ )
            for( var i = 1 ; i < 4 ; i ++ ){
                if( board[i][j] != 0 ){
                    for( var k = 0 ; k < i ; k ++ ){

                        if( board[k][j] == 0 && GameService.noBlockVertical( j , k , i , board ) ){
                            showMoveAnimation( i , j , k , j );
                            board[k][j] = board[i][j];
                            board[i][j] = 0;
                            continue;
                        }
                        else if( board[k][j] == board[i][j] && GameService.noBlockVertical( j , k , i , board )&&!hasConflicted[k][j] ){
                            showMoveAnimation( i , j , k , j );

                            var score=board[k][j];

                            board[k][j] *= 2;
                            board[i][j] = 0;

                            //add score
                            $timeout(function(){
                                $scope.score+=score;
                                if($scope.bestScore<$scope.score)
                                    $scope.bestScore=$scope.score;
                                    storage.setItem("bestScore",$scope.bestScore);
                            });

                            hasConflicted[k][j]=true;

                            continue;
                        }
                    }
                }
            }

        $timeout(function(){
            updateBoardView();
        },200);
        return true;
    }

    function moveDown(){
        if( !GameService.canMoveDown( board ) )
            return false;

        //moveDown
        for( var j = 0 ; j < 4 ; j ++ )
            for( var i = 2 ; i >= 0 ; i -- ){
                if( board[i][j] != 0 ){
                    for( var k = 3 ; k > i ; k -- ){

                        if( board[k][j] == 0 && GameService.noBlockVertical( j , i , k , board ) ){
                            showMoveAnimation( i , j , k , j );
                            board[k][j] = board[i][j];
                            board[i][j] = 0;
                            continue;
                        }
                        else if( board[k][j] == board[i][j] && GameService.noBlockVertical( j , i , k , board )&&!hasConflicted[k][j] ){
                            showMoveAnimation( i , j , k , j );

                            var score=board[k][j];

                            board[k][j] *= 2;
                            board[i][j] = 0;

                            //add score
                            $timeout(function(){
                                 $scope.score+=score;
                                 if($scope.bestScore<$scope.score)
                                     $scope.bestScore=$scope.score;
                                     storage.setItem("bestScore",$scope.bestScore);
                            });

                            hasConflicted[k][j]=true;

                            continue;
                        }
                    }
                }
            }

        $timeout(function(){
            updateBoardView();
        },200);
        return true;
    }

    function showNumberWithAnimation( i , j , randNumber ){

        var numberCell = $('#number-cell-' + i + "-" + j );

        numberCell.css('background-color',GameService.getNumberBackgroundColor( randNumber ) );
        numberCell.css('color',GameService.getNumberColor( randNumber ) );
        numberCell.text( randNumber );

        numberCell.animate({
            width:cellSideLength,
            height:cellSideLength,
            top:GameService.getPosTop( i , j ),
            left:GameService.getPosLeft( i , j )
        },300);
    }

    function showMoveAnimation( fromx , fromy , tox, toy ){

        var numberCell = $('#number-cell-' + fromx + '-' + fromy );
        numberCell.animate({
            top:GameService.getPosTop( tox , toy ),
            left:GameService.getPosLeft( tox , toy )
        },400);
    }

    function isWin(){
        if(win==false){
            for(var i=0;i<4;i++){
                for(var j=0;j<4;j++){
                    if(board[i][j]==winScore){
                        $('#game-win').addClass("show");
                        win=true;
                    }
                }
            }
        }
    }
})