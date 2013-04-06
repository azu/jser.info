/**
 * Created by azu.
 * Date: 11/05/25 18:04
 * License: MIT License
 */

$(function (){
    function format0(str, len){
        return ('_' + Math.pow(10, len) + str).slice(-len);
    }
    var calendarPicker = $("#date-picker").calendarPicker({
        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        //useWheel:true,
        //callbackDelay:500,
        //years:1,
        months: 4,
        //days:4,
        showDayArrows: false,
        callback: function (cal){
            var date = cal.currentDate;
            var fileDirPath = date.getFullYear() + '/' + format0((date.getMonth() + 1), 2);
            var JSONFilePath = fileDirPath + "/index.json?" + new Date().getTime();
            JSONArticle.load(JSONFilePath).done(function (data){
                JSONArticle.render(data);
            }).fail(function (err){
                    // JSONがダメならHTMLを試す
                    var HTMLFilePath = fileDirPath + "/index.html?" + new Date().getTime();
                    loadArticleHTML(HTMLFilePath);
                });
        }
    });
    var sortable = (function (){
        // ソートを無効にするボタン
        $('#disable-sortable').button();
        var sortable = {
            enable: enableSortable,
            disable: disableSortable
        };

        function disableSortable(){
            $(".connectedSortable").sortable("disable");
            $(".connectedSortable, .site-genre").enableSelection();
            $("#output").find("> .sites").removeAttr("class");
        }

        function enableSortable(){
            $(".connectedSortable, .site-genre").sortable({
                connectWith: ['.connectedSortable'],
                tolerance: "pointer"
            }).disableSelection();
        }

        $("#disable-sortable").on("click", disableSortable);

        return sortable;
    })();

    var JSONArticle = {
        load: function loadArticleJSON(path){
            var defer = $.Deferred();
            $.ajax({
                url: path,
                dataType: 'json',
                success: defer.resolve,
                error: defer.reject
            });
            return defer.promise();
        },
        render: function render(data){
            var $input = $("#input").empty();
            var list = data["list"];
            var template = this.template();
            var length = list.length - 1;
            for (var i = length; i >= 0; i--) {
                var obj = list[i];
                var html = template(obj);
                $input.append(html);
            }
            sortable.enable();
        },
        template: function (){

            /*
             {
             "title": "Dependent Types for JavaScript",
             "url": "http://www.infoq.com/presentations/Type-System-JavaScript",
             "content": "JavaScript論文 - DJS(Dependent JavaScript) についての発表\nLogicなアプローチ/型コメント\nhttp://cseweb.ucsd.edu/~rchugh/research/nested/djs.pdf\nhttps://github.com/ravichugh/djs",
             "tags": ["javascript", "PDF", "スライド", "動画"],
             "date": "2013-03-24T01:42:24.124Z"
             }
             */
            Handlebars.registerHelper('auto_format', function (text){

                // autolinkTwitter 内でHTMLエスケープされているためHandlebarではしない
                var linkedText = window.autolinkTwitter(text);
                return linkedText.replace(/\n/g, "<br />");
            });
            var source = $("#article-template").html();
            return Handlebars.compile(source);
        }
    }

    function loadArticleHTML(path){
        var input = $("#input").empty();
        input.load(path, function (res, textStatus){
            if (textStatus === "success" || textStatus === "notmodified") {
                $($("blockquote", "#input").get().reverse()).each(function (){
                    var div = $("<div />", {
                        class: "sites"
                    });// コンテナ
                    var that = $(this);
                    var $p = that.next();// p
                    var $ele = that.clone();// blockquote
                    div.append($ele).append($p);
                    that.replaceWith(div);
                });
                sortable.enable();
            } else {
                $.WsGrowl.show({content: 'その月のアーカイブはないです'});
            }
        })
    }
})